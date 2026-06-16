import type { Player } from "../models";
import type {
  Auction,
  DiceRoll,
  MonopolyLog,
  MonopolyPhase,
  MonopolyPlayer,
  MonopolyState,
  PropertyState,
  TradeOffer,
} from "../models/monopoly";
import {
  BOARD,
  GROUP_SIZE,
  GROUP_TILES,
  RAILROAD_RENT,
  RAILROAD_TILES,
  TOKEN_COLORS,
  UTILITY_TILES,
} from "../data/monopolyBoard";
import { CHANCE_CARDS, CHEST_CARDS } from "../data/monopolyCards";
import { uid } from "./ids";

const STARTING_CASH = 1500;
const GO_BONUS = 200;
const JAIL_FEE = 50;

function log(state: MonopolyState, text: string, kind: MonopolyLog["kind"] = "info") {
  state.log = [...state.log, { id: uid("ml"), text, ts: Date.now(), kind }].slice(-200);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function initMonopolyGame(gameId: string, players: Player[]): MonopolyState {
  const mp: MonopolyPlayer[] = players.map((p, i) => ({
    id: p.id,
    username: p.username,
    avatarColor: TOKEN_COLORS[i % TOKEN_COLORS.length],
    isAI: p.isAI,
    position: 0,
    cash: STARTING_CASH,
    inJail: false,
    jailTurns: 0,
    jailCards: 0,
    bankrupt: false,
  }));
  const properties: Record<number, PropertyState> = {};
  BOARD.forEach((t) => {
    if (t.type === "property" || t.type === "railroad" || t.type === "utility") {
      properties[t.index] = { ownerId: null, houses: 0, mortgaged: false };
    }
  });
  const state: MonopolyState = {
    gameId,
    players: mp,
    currentPlayerIndex: 0,
    phase: "rolling",
    lastRoll: null,
    consecutiveDoubles: 0,
    properties,
    chanceDeck: shuffle(CHANCE_CARDS.map((_, i) => i)),
    chestDeck: shuffle(CHEST_CARDS.map((_, i) => i)),
    pendingPurchaseTile: null,
    pendingCard: null,
    auction: null,
    trade: null,
    log: [{ id: uid("ml"), text: "Match begins. Roll the dice!", ts: Date.now(), kind: "event" }],
    winnerId: null,
  };
  return state;
}

export const currentPlayer = (s: MonopolyState) => s.players[s.currentPlayerIndex];

/** Count how many properties of a given group the player owns. */
function groupOwnedCount(s: MonopolyState, group: string, playerId: string): number {
  return (GROUP_TILES[group] ?? []).filter((i) => s.properties[i]?.ownerId === playerId).length;
}
export function ownsFullGroup(s: MonopolyState, group: string, playerId: string): boolean {
  return groupOwnedCount(s, group, playerId) === GROUP_SIZE[group];
}
function railroadsOwned(s: MonopolyState, playerId: string): number {
  return RAILROAD_TILES.filter((i) => s.properties[i]?.ownerId === playerId).length;
}
function utilitiesOwned(s: MonopolyState, playerId: string): number {
  return UTILITY_TILES.filter((i) => s.properties[i]?.ownerId === playerId).length;
}

export function rentFor(s: MonopolyState, tileIndex: number, diceTotal: number): number {
  const tile = BOARD[tileIndex];
  const prop = s.properties[tileIndex];
  if (!prop || !prop.ownerId || prop.mortgaged) return 0;
  if (tile.type === "property" && tile.rent) {
    let r = tile.rent[prop.houses] ?? tile.rent[0];
    if (prop.houses === 0 && ownsFullGroup(s, tile.group!, prop.ownerId)) r *= 2;
    return r;
  }
  if (tile.type === "railroad") {
    return RAILROAD_RENT[railroadsOwned(s, prop.ownerId) - 1] ?? 0;
  }
  if (tile.type === "utility") {
    const mult = utilitiesOwned(s, prop.ownerId) === 2 ? 10 : 4;
    return mult * diceTotal;
  }
  return 0;
}

/* ---------- Money / bankruptcy ---------- */

function pay(state: MonopolyState, payerId: string, amount: number, payeeId?: string | "bank"): MonopolyState {
  const players = state.players.map((p) => ({ ...p }));
  const payer = players.find((p) => p.id === payerId)!;
  const actualPay = Math.min(payer.cash, amount);
  payer.cash -= actualPay;
  if (payeeId && payeeId !== "bank") {
    const payee = players.find((p) => p.id === payeeId);
    if (payee) payee.cash += actualPay;
  }
  let next: MonopolyState = { ...state, players };
  if (payer.cash < amount - actualPay || payer.cash <= 0 && amount > actualPay) {
    // Bankrupt — only if owes more than has and can't pay
  }
  // Bankruptcy if still owing
  if (amount > actualPay) {
    log(next, `${payer.username} cannot pay $${amount} and is bankrupt!`, "event");
    next = bankrupt(next, payerId, payeeId === "bank" ? null : payeeId ?? null);
  }
  return next;
}

function bankrupt(state: MonopolyState, playerId: string, creditorId: string | null): MonopolyState {
  const players = state.players.map((p) => ({ ...p }));
  const p = players.find((x) => x.id === playerId)!;
  const properties = { ...state.properties };
  Object.entries(properties).forEach(([k, ps]) => {
    if (ps.ownerId === playerId) {
      properties[+k] = { ownerId: creditorId, houses: 0, mortgaged: ps.mortgaged };
    }
  });
  if (creditorId) {
    const c = players.find((x) => x.id === creditorId);
    if (c) {
      c.cash += p.cash;
      c.jailCards += p.jailCards;
    }
  }
  p.cash = 0;
  p.jailCards = 0;
  p.bankrupt = true;
  let next: MonopolyState = { ...state, players, properties };
  const remaining = players.filter((x) => !x.bankrupt);
  if (remaining.length === 1) {
    next = { ...next, phase: "ended", winnerId: remaining[0].id };
    log(next, `🏆 ${remaining[0].username} wins the game!`, "event");
  }
  return next;
}

/* ---------- Dice / movement ---------- */

export function rollDice(state: MonopolyState): MonopolyState {
  if (state.phase !== "rolling") return state;
  const d1 = 1 + Math.floor(Math.random() * 6);
  const d2 = 1 + Math.floor(Math.random() * 6);
  const isDouble = d1 === d2;
  const roll: DiceRoll = { d1, d2, isDouble, rolledAt: Date.now() };
  const player = currentPlayer(state);
  let next: MonopolyState = { ...state, lastRoll: roll };

  if (player.inJail) {
    if (isDouble) {
      next = updatePlayer(next, player.id, { inJail: false, jailTurns: 0 });
      log(next, `${player.username} rolled doubles and leaves jail.`, "event");
    } else {
      const turns = player.jailTurns + 1;
      if (turns >= 3) {
        // forced pay
        next = updatePlayer(next, player.id, { inJail: false, jailTurns: 0 });
        next = pay(next, player.id, JAIL_FEE, "bank");
        log(next, `${player.username} paid $${JAIL_FEE} after 3 turns in jail.`, "money");
      } else {
        next = updatePlayer(next, player.id, { jailTurns: turns });
        log(next, `${player.username} rolled ${d1}+${d2}, still in jail.`, "info");
        return { ...next, phase: "landed" }; // end-of-turn handled by endTurn
      }
    }
  }

  const consec = isDouble ? state.consecutiveDoubles + 1 : 0;
  if (consec === 3) {
    log(next, `${player.username} rolled three doubles — go to jail!`, "event");
    next = sendToJail(next, player.id);
    return { ...next, consecutiveDoubles: 0, phase: "landed" };
  }
  next = { ...next, consecutiveDoubles: consec };
  return advancePlayer(next, player.id, d1 + d2);
}

function updatePlayer(s: MonopolyState, id: string, patch: Partial<MonopolyPlayer>): MonopolyState {
  return { ...s, players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}

function sendToJail(s: MonopolyState, id: string): MonopolyState {
  return updatePlayer(s, id, { position: 10, inJail: true, jailTurns: 0 });
}

function advancePlayer(state: MonopolyState, id: string, steps: number, collectGo = true): MonopolyState {
  const p = state.players.find((x) => x.id === id)!;
  const newPos = ((p.position + steps) % 40 + 40) % 40;
  let next = updatePlayer(state, id, { position: newPos });
  if (collectGo && p.position + steps >= 40) {
    next = updatePlayer(next, id, { cash: (next.players.find((x) => x.id === id)!.cash) + GO_BONUS });
    log(next, `${p.username} passed GO. +$${GO_BONUS}`, "money");
  }
  next = { ...next, phase: "moving" };
  return resolveLanding(next, id);
}

function resolveLanding(state: MonopolyState, id: string): MonopolyState {
  const p = state.players.find((x) => x.id === id)!;
  const tile = BOARD[p.position];
  let next: MonopolyState = { ...state, phase: "landed" };
  log(next, `${p.username} landed on ${tile.name}.`);

  if (tile.type === "go-to-jail") {
    next = sendToJail(next, id);
    log(next, `${p.username} goes to jail!`, "event");
    return next;
  }
  if (tile.type === "tax") {
    next = pay(next, id, tile.taxAmount!, "bank");
    log(next, `${p.username} paid $${tile.taxAmount} tax.`, "money");
    return next;
  }
  if (tile.type === "chance" || tile.type === "chest") {
    return drawCard(next, id, tile.type === "chance" ? "chance" : "chest");
  }
  if (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") {
    const prop = next.properties[p.position];
    if (!prop.ownerId) {
      next = { ...next, pendingPurchaseTile: p.position };
      return next;
    }
    if (prop.ownerId !== id && !prop.mortgaged) {
      const rent = rentFor(next, p.position, (next.lastRoll?.d1 ?? 0) + (next.lastRoll?.d2 ?? 0));
      if (rent > 0) {
        next = pay(next, id, rent, prop.ownerId);
        log(next, `${p.username} paid $${rent} rent to ${next.players.find((x) => x.id === prop.ownerId)!.username}.`, "money");
      }
    }
  }
  return next;
}

/* ---------- Cards ---------- */

function drawCard(state: MonopolyState, id: string, deck: "chance" | "chest"): MonopolyState {
  const deckArr = deck === "chance" ? state.chanceDeck : state.chestDeck;
  const source = deck === "chance" ? CHANCE_CARDS : CHEST_CARDS;
  let arr = [...deckArr];
  if (arr.length === 0) arr = shuffle(source.map((_, i) => i));
  const cardIdx = arr.shift()!;
  const card = source[cardIdx];
  const next: MonopolyState = {
    ...state,
    [deck === "chance" ? "chanceDeck" : "chestDeck"]: arr,
    pendingCard: { deck, index: cardIdx },
  } as MonopolyState;
  log(next, `Card: ${card.text}`, "event");
  return applyCard(next, id, deck, cardIdx);
}

function applyCard(state: MonopolyState, id: string, deck: "chance" | "chest", index: number): MonopolyState {
  const card = (deck === "chance" ? CHANCE_CARDS : CHEST_CARDS)[index];
  const p = state.players.find((x) => x.id === id)!;
  let next = state;
  switch (card.action.kind) {
    case "money":
      if (card.action.amount >= 0) {
        next = updatePlayer(next, id, { cash: p.cash + card.action.amount });
      } else {
        next = pay(next, id, -card.action.amount, "bank");
      }
      break;
    case "moneyFromEach": {
      const amt = card.action.amount;
      next.players.forEach((other) => {
        if (other.id === id || other.bankrupt) return;
        if (amt >= 0) {
          next = updatePlayer(next, id, { cash: next.players.find((x) => x.id === id)!.cash + amt });
          next = updatePlayer(next, other.id, { cash: other.cash - amt });
        } else {
          next = pay(next, id, -amt, other.id);
        }
      });
      break;
    }
    case "move": {
      const cur = next.players.find((x) => x.id === id)!;
      const steps = ((card.action.to - cur.position) % 40 + 40) % 40;
      next = advancePlayer(next, id, steps, !!card.action.collectGoIfPass);
      break;
    }
    case "moveRel":
      next = advancePlayer(next, id, card.action.steps, false);
      break;
    case "jail":
      next = sendToJail(next, id);
      break;
    case "getOutCard":
      next = updatePlayer(next, id, { jailCards: p.jailCards + 1 });
      break;
    case "nearest": {
      const targets = card.action.kind2 === "railroad" ? RAILROAD_TILES : UTILITY_TILES;
      let steps = 40;
      for (const t of targets) {
        const s = ((t - p.position) % 40 + 40) % 40;
        if (s > 0 && s < steps) steps = s;
      }
      next = advancePlayer(next, id, steps, true);
      break;
    }
    case "repairs": {
      let total = 0;
      const act = card.action;
      Object.values(next.properties).forEach((pr) => {
        if (pr.ownerId === id) {
          if (pr.houses === 5) total += act.perHotel;
          else total += pr.houses * act.perHouse;
        }
      });
      if (total > 0) next = pay(next, id, total, "bank");
      break;
    }
  }
  return { ...next, pendingCard: null };
}

/* ---------- Purchase / auction ---------- */

export function buyPending(state: MonopolyState): MonopolyState {
  if (state.pendingPurchaseTile == null) return state;
  const tileIdx = state.pendingPurchaseTile;
  const tile = BOARD[tileIdx];
  const buyer = currentPlayer(state);
  if (buyer.cash < (tile.price ?? 0)) return state;
  let next = updatePlayer(state, buyer.id, { cash: buyer.cash - (tile.price ?? 0) });
  next = {
    ...next,
    properties: { ...next.properties, [tileIdx]: { ownerId: buyer.id, houses: 0, mortgaged: false } },
    pendingPurchaseTile: null,
  };
  log(next, `${buyer.username} bought ${tile.name} for $${tile.price}.`, "money");
  return next;
}

export function startAuction(state: MonopolyState): MonopolyState {
  if (state.pendingPurchaseTile == null) return state;
  const tileIdx = state.pendingPurchaseTile;
  const tile = BOARD[tileIdx];
  const active = state.players.filter((p) => !p.bankrupt).map((p) => p.id);
  const auction: Auction = {
    tileIndex: tileIdx,
    bids: [],
    currentBidderIndex: 0,
    activePlayerIds: active,
    highestBid: 0,
    highestBidderId: null,
    startedAt: Date.now(),
  };
  const next: MonopolyState = { ...state, pendingPurchaseTile: null, auction, phase: "auction" };
  log(next, `Auction started for ${tile.name}.`, "event");
  return next;
}

export function placeBid(state: MonopolyState, playerId: string, amount: number): MonopolyState {
  if (!state.auction) return state;
  const p = state.players.find((x) => x.id === playerId);
  if (!p || p.cash < amount || amount <= state.auction.highestBid) return state;
  const auction: Auction = {
    ...state.auction,
    bids: [...state.auction.bids, { playerId, amount }],
    highestBid: amount,
    highestBidderId: playerId,
  };
  return { ...state, auction: advanceAuctionTurn({ ...state, auction }) };
}

function advanceAuctionTurn(state: MonopolyState): Auction {
  const a = state.auction!;
  let idx = (a.currentBidderIndex + 1) % a.activePlayerIds.length;
  return { ...a, currentBidderIndex: idx };
}

export function passBid(state: MonopolyState, playerId: string): MonopolyState {
  if (!state.auction) return state;
  const a = state.auction;
  const active = a.activePlayerIds.filter((id) => id !== playerId);
  if (active.length <= 1) {
    return settleAuction({ ...state, auction: { ...a, activePlayerIds: active } });
  }
  const removedIdx = a.activePlayerIds.indexOf(playerId);
  let nextIdx = a.currentBidderIndex;
  if (removedIdx <= a.currentBidderIndex) nextIdx = Math.max(0, nextIdx - 1);
  nextIdx = nextIdx % active.length;
  return { ...state, auction: { ...a, activePlayerIds: active, currentBidderIndex: nextIdx } };
}

export function settleAuction(state: MonopolyState): MonopolyState {
  if (!state.auction) return state;
  const a = state.auction;
  const tile = BOARD[a.tileIndex];
  let next: MonopolyState = { ...state, auction: null, phase: "landed" };
  if (a.highestBidderId && a.highestBid > 0) {
    const buyer = next.players.find((p) => p.id === a.highestBidderId)!;
    next = updatePlayer(next, buyer.id, { cash: buyer.cash - a.highestBid });
    next = {
      ...next,
      properties: { ...next.properties, [a.tileIndex]: { ownerId: buyer.id, houses: 0, mortgaged: false } },
    };
    log(next, `${buyer.username} won the auction for ${tile.name} at $${a.highestBid}.`, "money");
  } else {
    log(next, `Auction for ${tile.name} ended with no bids.`, "event");
  }
  return next;
}

/* ---------- Build / mortgage ---------- */

export function buildHouse(state: MonopolyState, tileIdx: number): MonopolyState {
  const tile = BOARD[tileIdx];
  const prop = state.properties[tileIdx];
  if (!tile.group || !prop.ownerId) return state;
  if (prop.houses >= 5 || prop.mortgaged) return state;
  if (!ownsFullGroup(state, tile.group, prop.ownerId)) return state;
  // Even building rule
  const groupHouses = GROUP_TILES[tile.group].map((i) => state.properties[i].houses);
  if (prop.houses > Math.min(...groupHouses)) return state;
  const owner = state.players.find((p) => p.id === prop.ownerId)!;
  const cost = tile.housePrice!;
  if (owner.cash < cost) return state;
  let next = updatePlayer(state, owner.id, { cash: owner.cash - cost });
  next = { ...next, properties: { ...next.properties, [tileIdx]: { ...prop, houses: prop.houses + 1 } } };
  log(next, `${owner.username} built on ${tile.name}.`, "money");
  return next;
}

export function sellHouse(state: MonopolyState, tileIdx: number): MonopolyState {
  const tile = BOARD[tileIdx];
  const prop = state.properties[tileIdx];
  if (!tile.group || !prop.ownerId || prop.houses === 0) return state;
  const groupHouses = GROUP_TILES[tile.group].map((i) => state.properties[i].houses);
  if (prop.houses < Math.max(...groupHouses)) return state;
  const owner = state.players.find((p) => p.id === prop.ownerId)!;
  const refund = Math.floor((tile.housePrice ?? 0) / 2);
  let next = updatePlayer(state, owner.id, { cash: owner.cash + refund });
  next = { ...next, properties: { ...next.properties, [tileIdx]: { ...prop, houses: prop.houses - 1 } } };
  log(next, `${owner.username} sold a house on ${tile.name} for $${refund}.`, "money");
  return next;
}

export function toggleMortgage(state: MonopolyState, tileIdx: number): MonopolyState {
  const tile = BOARD[tileIdx];
  const prop = state.properties[tileIdx];
  if (!prop.ownerId || prop.houses > 0) return state;
  const owner = state.players.find((p) => p.id === prop.ownerId)!;
  const mortgageValue = Math.floor((tile.price ?? 0) / 2);
  if (prop.mortgaged) {
    const cost = Math.ceil(mortgageValue * 1.1);
    if (owner.cash < cost) return state;
    let next = updatePlayer(state, owner.id, { cash: owner.cash - cost });
    next = { ...next, properties: { ...next.properties, [tileIdx]: { ...prop, mortgaged: false } } };
    log(next, `${owner.username} unmortgaged ${tile.name}.`, "money");
    return next;
  }
  let next = updatePlayer(state, owner.id, { cash: owner.cash + mortgageValue });
  next = { ...next, properties: { ...next.properties, [tileIdx]: { ...prop, mortgaged: true } } };
  log(next, `${owner.username} mortgaged ${tile.name} for $${mortgageValue}.`, "money");
  return next;
}

/* ---------- Jail ---------- */

export function payJailFee(state: MonopolyState): MonopolyState {
  const p = currentPlayer(state);
  if (!p.inJail || p.cash < JAIL_FEE) return state;
  let next = updatePlayer(state, p.id, { inJail: false, jailTurns: 0, cash: p.cash - JAIL_FEE });
  log(next, `${p.username} paid $${JAIL_FEE} to leave jail.`, "money");
  return next;
}
export function useJailCard(state: MonopolyState): MonopolyState {
  const p = currentPlayer(state);
  if (!p.inJail || p.jailCards < 1) return state;
  let next = updatePlayer(state, p.id, { inJail: false, jailTurns: 0, jailCards: p.jailCards - 1 });
  log(next, `${p.username} used a Get Out of Jail Free card.`, "event");
  return next;
}

/* ---------- Bank Manager (manual overrides for pass-and-play) ---------- */

export function bankAdjust(state: MonopolyState, playerId: string, delta: number): MonopolyState {
  const p = state.players.find((x) => x.id === playerId);
  if (!p) return state;
  const newCash = Math.max(0, p.cash + delta);
  const next = updatePlayer(state, playerId, { cash: newCash });
  log(
    next,
    delta >= 0
      ? `Bank paid ${p.username} $${delta}.`
      : `${p.username} paid bank $${-delta}.`,
    "money",
  );
  return next;
}

export function bankTransfer(
  state: MonopolyState,
  fromId: string,
  toId: string,
  amount: number,
): MonopolyState {
  if (amount <= 0 || fromId === toId) return state;
  const from = state.players.find((x) => x.id === fromId);
  const to = state.players.find((x) => x.id === toId);
  if (!from || !to || from.cash < amount) return state;
  let next = updatePlayer(state, fromId, { cash: from.cash - amount });
  next = updatePlayer(next, toId, { cash: to.cash + amount });
  log(next, `${from.username} transferred $${amount} to ${to.username}.`, "money");
  return next;
}

/* ---------- Turn ---------- */

export function endTurn(state: MonopolyState): MonopolyState {
  if (state.phase === "ended") return state;
  // If just rolled doubles (not in jail), same player rolls again
  const justDoubled = state.lastRoll?.isDouble && state.consecutiveDoubles > 0 &&
    !state.players[state.currentPlayerIndex].inJail;
  if (justDoubled) {
    return { ...state, phase: "rolling", pendingPurchaseTile: null, lastRoll: null };
  }
  let idx = state.currentPlayerIndex;
  for (let i = 0; i < state.players.length; i++) {
    idx = (idx + 1) % state.players.length;
    if (!state.players[idx].bankrupt) break;
  }
  return {
    ...state,
    currentPlayerIndex: idx,
    phase: "rolling",
    pendingPurchaseTile: null,
    consecutiveDoubles: 0,
    lastRoll: null,
  };
}

/* ---------- Trade ---------- */

export function proposeTrade(state: MonopolyState, offer: Omit<TradeOffer, "id" | "status">): MonopolyState {
  const trade: TradeOffer = { ...offer, id: uid("trade"), status: "pending" };
  return { ...state, trade, phase: "trade" };
}

export function resolveTrade(state: MonopolyState, accepted: boolean): MonopolyState {
  if (!state.trade) return state;
  const t = state.trade;
  if (!accepted) {
    let next = { ...state, trade: null, phase: "landed" as MonopolyPhase };
    log(next, `Trade declined.`, "trade");
    return next;
  }
  // Validate
  const from = state.players.find((p) => p.id === t.fromId)!;
  const to = state.players.find((p) => p.id === t.toId)!;
  if (from.cash < t.fromCash || to.cash < t.toCash) return state;
  if (from.jailCards < t.fromJailCards || to.jailCards < t.toJailCards) return state;
  for (const i of t.fromProps) if (state.properties[i]?.ownerId !== from.id) return state;
  for (const i of t.toProps) if (state.properties[i]?.ownerId !== to.id) return state;

  let next: MonopolyState = { ...state };
  next = updatePlayer(next, from.id, {
    cash: from.cash - t.fromCash + t.toCash,
    jailCards: from.jailCards - t.fromJailCards + t.toJailCards,
  });
  next = updatePlayer(next, to.id, {
    cash: to.cash - t.toCash + t.fromCash,
    jailCards: to.jailCards - t.toJailCards + t.fromJailCards,
  });
  const properties = { ...next.properties };
  t.fromProps.forEach((i) => (properties[i] = { ...properties[i], ownerId: to.id }));
  t.toProps.forEach((i) => (properties[i] = { ...properties[i], ownerId: from.id }));
  next = { ...next, properties, trade: null, phase: "landed" };
  log(next, `Trade accepted between ${from.username} and ${to.username}.`, "trade");
  return next;
}

/* ---------- AI ---------- */

function valueOfTile(s: MonopolyState, idx: number, playerId: string): number {
  const tile = BOARD[idx];
  const base = tile.price ?? 0;
  if (tile.group) {
    const owned = groupOwnedCount(s, tile.group, playerId);
    const bonus = owned === GROUP_SIZE[tile.group] - 1 ? 1.5 : 1 + owned * 0.15;
    return Math.round(base * bonus);
  }
  return base;
}

/** Make a single AI decision for the current phase. Returns new state. */
export function aiStep(state: MonopolyState): MonopolyState {
  const p = currentPlayer(state);
  if (!p.isAI || state.phase === "ended") return state;

  if (state.phase === "rolling") {
    if (p.inJail && p.jailCards > 0) return useJailCard(state);
    if (p.inJail && p.cash > 200 && Math.random() < 0.5) return payJailFee(state);
    return rollDice(state);
  }
  if (state.phase === "landed") {
    if (state.pendingPurchaseTile != null) {
      const tile = BOARD[state.pendingPurchaseTile];
      const value = valueOfTile(state, state.pendingPurchaseTile, p.id);
      if (p.cash >= (tile.price ?? 0) + 100 && value >= (tile.price ?? 0)) {
        return buyPending(state);
      }
      return startAuction(state);
    }
    return endTurn(state);
  }
  return state;
}

/** AI bidding logic; returns new state with bid or pass. */
export function aiAuctionStep(state: MonopolyState): MonopolyState {
  if (!state.auction) return state;
  const a = state.auction;
  const bidderId = a.activePlayerIds[a.currentBidderIndex];
  const p = state.players.find((x) => x.id === bidderId);
  if (!p || !p.isAI) return state;
  const tile = BOARD[a.tileIndex];
  const max = Math.min(p.cash - 50, Math.round((tile.price ?? 0) * (0.7 + Math.random() * 0.5)));
  const nextBid = a.highestBid + Math.max(10, Math.round((tile.price ?? 0) * 0.05));
  if (nextBid <= max) return placeBid(state, bidderId, nextBid);
  return passBid(state, bidderId);
}