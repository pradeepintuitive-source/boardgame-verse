import {
  BOARD_SIZE,
  CLUB_PARTY_FEE,
  COLOR_GROUPS,
  COLOR_SET_FOR_DOUBLE_RENT,
  CITIES,
  DOUBLES_TO_JAIL,
  MAX_STARTING_CAPITAL,
  MIN_STARTING_CAPITAL,
  START_SALARY,
  UTILITIES,
  WEALTH_TAX_CAP,
  WEALTH_TAX_PER_HOTEL,
  WEALTH_TAX_PER_HOUSE,
  cardForRoll,
  colorGroupOf,
  getCard,
  getCity,
  getUtility,
  isDeed,
  mortgageValueOf,
  propertyName,
  purchasePriceOf,
  spaceAt,
  getSpace,
} from "../data/catalog";
import { assertRupees, formatInr } from "../money";
import type {
  CreateGameInput,
  EngineResult,
  GameEvent,
  InstructionCard,
  LedgerEntry,
  NetWorth,
  Ownership,
  PendingAction,
  PhysicalGame,
  PlayerState,
} from "../types";
import { SCHEMA_VERSION } from "../types";

export const BANK_ID = "bank";

export class EngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineError";
  }
}

function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes);
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.getRandomValues) cryptoApi.getRandomValues(buffer);
  else {
    for (let index = 0; index < buffer.length; index += 1) buffer[index] = Math.floor(Math.random() * 256);
  }
  return [...buffer].map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function createGameId(): string {
  return `LOCAL-BB-${randomHex(3)}`;
}

function uid(prefix: string): string {
  return `${prefix}-${randomHex(4)}`;
}

function now(): number {
  return Date.now();
}

export function playerById(game: PhysicalGame, id: string): PlayerState {
  const player = game.players.find((entry) => entry.id === id);
  if (!player) throw new EngineError("That player is not in this game.");
  return player;
}

export function currentPlayer(game: PhysicalGame): PlayerState {
  const player = game.players[game.currentPlayerIndex];
  if (!player) throw new EngineError("No player is on turn.");
  return player;
}

function activePlayers(game: PhysicalGame): PlayerState[] {
  return game.players.filter((player) => player.status === "active");
}

function requireActiveGame(game: PhysicalGame): void {
  if (game.status !== "active") throw new EngineError("This game is already finished.");
}

function pushEvent(game: PhysicalGame, type: string, message: string, playerId?: string): void {
  const event: GameEvent = {
    id: uid("evt"),
    gameId: game.id,
    timestamp: now(),
    type,
    message,
    playerId,
  };
  game.events.push(event);
}

function pay(game: PhysicalGame, fromId: string, toId: string, amount: number, type: string, description: string, propertyId?: string): void {
  const rupees = assertRupees(amount, "Amount");
  if (rupees < 0) throw new EngineError("Amount cannot be negative.");
  if (rupees === 0 || fromId === toId) return;
  if (fromId === BANK_ID) {
    game.bankLedger -= rupees;
  } else {
    const payer = playerById(game, fromId);
    if (payer.status !== "active") throw new EngineError(`${payer.name} is not active.`);
    if (payer.cash < rupees) {
      throw new EngineError(`Unable to complete transaction because ${payer.name} has only ${formatInr(payer.cash)}.`);
    }
    payer.cash -= rupees;
  }
  if (toId === BANK_ID) game.bankLedger += rupees;
  else playerById(game, toId).cash += rupees;
  const entry: LedgerEntry = {
    id: uid("txn"),
    gameId: game.id,
    timestamp: now(),
    type,
    fromId,
    toId,
    amount: rupees,
    propertyId,
    description,
  };
  game.transactions.push(entry);
}

function run(game: PhysicalGame, description: string, mutate: (draft: PhysicalGame) => void): EngineResult {
  try {
    const draft = structuredClone(game);
    const noticeBefore = draft.notice;
    mutate(draft);
    const prior = structuredClone(game);
    prior.undoStack = [];
    draft.undoStack = [...game.undoStack, { description, state: prior }].slice(-30);
    draft.audit.push({ id: uid("aud"), timestamp: now(), message: description });
    if (draft.notice === noticeBefore) draft.notice = description;
    draft.updatedAt = now();
    return { ok: true, state: draft };
  } catch (error) {
    if (error instanceof EngineError) return { ok: false, error: error.message };
    if (error instanceof Error && error.message.includes("whole number")) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}

function ownershipOf(game: PhysicalGame, propertyId: string): Ownership {
  const ownership = game.ownership[propertyId];
  if (!ownership) throw new EngineError(`${propertyName(propertyId)} is not on this board.`);
  return ownership;
}

function ownedInColor(game: PhysicalGame, ownerId: string, propertyId: string): number {
  const group = colorGroupOf(propertyId);
  if (!group) return 0;
  return COLOR_GROUPS[group].propertyIds.filter((id) => game.ownership[id]?.ownerId === ownerId).length;
}

function ownsCompleteGroup(game: PhysicalGame, ownerId: string, propertyId: string): boolean {
  const group = colorGroupOf(propertyId);
  if (!group) return false;
  return COLOR_GROUPS[group].propertyIds.every((id) => game.ownership[id]?.ownerId === ownerId);
}

export function wealthTaxAmount(game: PhysicalGame, playerId: string): { amount: number; houses: number; hotels: number; capped: boolean } {
  let houses = 0;
  let hotels = 0;
  for (const ownership of Object.values(game.ownership)) {
    if (ownership.ownerId !== playerId) continue;
    houses += ownership.houses;
    if (ownership.hotel) hotels += 1;
  }
  const raw = houses * WEALTH_TAX_PER_HOUSE + hotels * WEALTH_TAX_PER_HOTEL;
  const capped = raw > WEALTH_TAX_CAP;
  return { amount: Math.min(WEALTH_TAX_CAP, raw), houses, hotels, capped };
}

export function calculateRent(game: PhysicalGame, propertyId: string, diceTotal: number): { amount: number; breakdown: string; exempt: boolean } {
  const ownership = ownershipOf(game, propertyId);
  if (!ownership.ownerId) return { amount: 0, breakdown: "Unowned", exempt: true };
  if (ownership.mortgaged) return { amount: 0, breakdown: "Mortgaged — no rent is due.", exempt: true };
  const city = getCity(propertyId);
  if (city) {
    if (ownership.hotel) {
      return { amount: city.rent.hotel, breakdown: `Hotel rent ${formatInr(city.rent.hotel)}`, exempt: false };
    }
    if (ownership.houses === 1) return { amount: city.rent.house1, breakdown: `1 house · ${formatInr(city.rent.house1)}`, exempt: false };
    if (ownership.houses === 2) return { amount: city.rent.house2, breakdown: `2 houses · ${formatInr(city.rent.house2)}`, exempt: false };
    if (ownership.houses >= 3) return { amount: city.rent.house3, breakdown: `3 houses · ${formatInr(city.rent.house3)}`, exempt: false };
    const owned = ownedInColor(game, ownership.ownerId, propertyId);
    const doubled = owned >= COLOR_SET_FOR_DOUBLE_RENT;
    const amount = doubled ? city.rent.site * 2 : city.rent.site;
    const breakdown = doubled
      ? `Site rent doubled (${owned} ${city.colorGroup} sites) · ${formatInr(amount)}`
      : `Site rent ${formatInr(amount)}`;
    return { amount, breakdown, exempt: false };
  }
  const utility = getUtility(propertyId);
  if (!utility) return { amount: 0, breakdown: "No rent", exempt: true };
  const pairOwned = game.ownership[utility.pairWith]?.ownerId === ownership.ownerId;
  if (utility.rentKind === "dice") {
    const multiplier = pairOwned ? utility.pairMultiplier ?? utility.multiplier ?? 0 : utility.multiplier ?? 0;
    const amount = multiplier * diceTotal;
    const pairName = propertyName(utility.pairWith);
    const breakdown = pairOwned
      ? `${multiplier} × dice ${diceTotal} because ${pairName} is also owned · ${formatInr(amount)}`
      : `${multiplier} × dice ${diceTotal} · ${formatInr(amount)}`;
    return { amount, breakdown, exempt: false };
  }
  const amount = pairOwned ? utility.pairRent ?? utility.rent ?? 0 : utility.rent ?? 0;
  const breakdown = pairOwned
    ? `Paired with ${propertyName(utility.pairWith)} · ${formatInr(amount)}`
    : `Rent ${formatInr(amount)}`;
  return { amount, breakdown, exempt: false };
}

function collectStart(game: PhysicalGame, player: PlayerState): void {
  pay(game, BANK_ID, player.id, START_SALARY, "START_SALARY", `Passed Start · ${formatInr(START_SALARY)}`);
  game.passedStartAmount += START_SALARY;
  pushEvent(game, "PASSED_START", `${player.name} collects ${formatInr(START_SALARY)} for Start.`, player.id);
}

function moveBy(game: PhysicalGame, player: PlayerState, steps: number): void {
  if (!Number.isInteger(steps) || steps < 0) throw new EngineError("Movement must be a whole number of spaces.");
  if (steps === 0) return;
  const from = player.position;
  const laps = Math.floor((from + steps) / BOARD_SIZE);
  player.position = (from + steps) % BOARD_SIZE;
  for (let lap = 0; lap < laps; lap += 1) collectStart(game, player);
  pushEvent(game, "PLAYER_MOVED", `${player.name} moves to ${spaceAt(player.position).name}.`, player.id);
}

function sendToJail(game: PhysicalGame, player: PlayerState, reason: string): void {
  player.position = getSpace("JAIL").position;
  player.inPrison = true;
  player.prisonTurns = 0;
  player.consecutiveDoubles = 0;
  pushEvent(game, "PLAYER_SENT_TO_PRISON", `${player.name} goes to Jail. ${reason}`, player.id);
}

function advanceToNext(game: PhysicalGame): void {
  const count = game.players.length;
  let index = game.currentPlayerIndex;
  for (let step = 0; step < count * 2; step += 1) {
    index = (index + 1) % count;
    const player = game.players[index];
    if (!player || player.status !== "active") continue;
    if (player.skipNextTurn) {
      player.skipNextTurn = false;
      pushEvent(game, "TURN_SKIPPED", `${player.name} misses this turn.`, player.id);
      continue;
    }
    game.currentPlayerIndex = index;
    game.turnNumber += 1;
    game.phase = "roll";
    game.pending = null;
    game.lastDice = null;
    game.passedStartAmount = 0;
    player.consecutiveDoubles = 0;
    pushEvent(game, "TURN_STARTED", `${player.name}'s turn.`, player.id);
    maybeFinish(game);
    return;
  }
  maybeFinish(game);
}

function maybeFinish(game: PhysicalGame): void {
  const active = activePlayers(game);
  if (active.length <= 1 && game.status === "active") {
    const winner = active[0];
    game.status = "finished";
    game.phase = "finished";
    game.finishedAt = now();
    game.pending = null;
    if (winner) {
      winner.status = "winner";
      game.winnerId = winner.id;
      pushEvent(game, "GAME_FINISHED", `${winner.name} wins. Everyone else is out.`, winner.id);
    } else {
      pushEvent(game, "GAME_FINISHED", "The game is over.");
    }
  }
}

function settle(game: PhysicalGame): void {
  if (game.status !== "active") return;
  const player = currentPlayer(game);
  if (player.inPrison || player.status !== "active") {
    advanceToNext(game);
    return;
  }
  if (game.phase === "extra-roll") {
    game.phase = "roll";
    game.pending = null;
    game.notice = `${player.name} rolled doubles and rolls again.`;
    return;
  }
  advanceToNext(game);
}

function resolveSpace(game: PhysicalGame, player: PlayerState): void {
  const space = spaceAt(player.position);
  const diceTotal = (game.lastDice?.die1 ?? 0) + (game.lastDice?.die2 ?? 0);
  if (space.type === "PROPERTY" || space.type === "UTILITY") {
    const propertyId = space.propertyId;
    if (!propertyId) throw new EngineError("This space has no deed.");
    const ownership = ownershipOf(game, propertyId);
    if (!ownership.ownerId) {
      game.pending = { kind: "buy", spaceId: space.id, price: purchasePriceOf(propertyId) };
      game.phase = game.phase === "extra-roll" ? "extra-roll" : "resolve";
      return;
    }
    if (ownership.ownerId === player.id) {
      game.pending = {
        kind: "info",
        title: space.name,
        detail: `${player.name} already owns ${space.name}.`,
      };
      return;
    }
    const rent = calculateRent(game, propertyId, diceTotal);
    if (rent.exempt || rent.amount === 0) {
      game.pending = { kind: "info", title: space.name, detail: rent.breakdown };
      return;
    }
    game.pending = {
      kind: "rent",
      spaceId: space.id,
      amount: rent.amount,
      payerId: player.id,
      ownerId: ownership.ownerId,
      breakdown: rent.breakdown,
    };
    return;
  }
  if (space.type === "TAX" && space.tax === "wealth") {
    const tax = wealthTaxAmount(game, player.id);
    const detail = `${tax.houses} houses × ${formatInr(WEALTH_TAX_PER_HOUSE)} + ${tax.hotels} hotels × ${formatInr(WEALTH_TAX_PER_HOTEL)}${tax.capped ? ` (capped at ${formatInr(WEALTH_TAX_CAP)})` : ""}.`;
    game.pending = { kind: "tax", tax: "wealth", amount: tax.amount, editable: false, detail };
    return;
  }
  if (space.type === "TAX" && space.tax === "income") {
    game.pending = {
      kind: "tax",
      tax: "income",
      amount: 0,
      editable: true,
      detail: "The photographed rule sheet stops before the Income Tax formula. Enter the amount your table is using, or record ₹0.",
    };
    return;
  }
  if (space.type === "CHANCE" || space.type === "COMMUNITY_CHEST") {
    if (diceTotal < 2) throw new EngineError("Chance and Community Chest follow the dice total. Enter the dice first.");
    const deck = space.type === "CHANCE" ? "chance" : "community";
    const card = cardForRoll(deck, diceTotal);
    game.pending = { kind: "card", cardId: card.id, passedStart: game.passedStartAmount };
    return;
  }
  if (space.type === "REST_HOUSE") {
    game.pending = { kind: "info", title: "Rest House", detail: `${player.name} rests. No fee is printed on this space.` };
    return;
  }
  if (space.type === "CLUB") {
    game.pending = {
      kind: "info",
      title: "Club",
      detail: `${player.name} visits the Club. No fee is printed on the space. The ${formatInr(CLUB_PARTY_FEE)} party charge applies only when Chance sends a player here.`,
    };
    return;
  }
  if (space.type === "JAIL") {
    game.pending = {
      kind: "info",
      title: "Jail",
      detail: player.inPrison
        ? `${player.name} is in Jail.`
        : `${player.name} is just visiting Jail. The sheet sends a player to prison only on a third double or the Community Chest jail line.`,
    };
    return;
  }
  if (space.type === "START") {
    game.pending = { kind: "info", title: "Start", detail: `${player.name} is on Start. Salary for passing or landing is ${formatInr(START_SALARY)}.` };
    return;
  }
}

function repairBill(game: PhysicalGame, playerId: string, perHouse: number, perHotel: number): number {
  let houses = 0;
  let hotels = 0;
  for (const ownership of Object.values(game.ownership)) {
    if (ownership.ownerId !== playerId) continue;
    houses += ownership.houses;
    if (ownership.hotel) hotels += 1;
  }
  return houses * perHouse + hotels * perHotel;
}

function applyCardEffect(game: PhysicalGame, player: PlayerState, card: InstructionCard, amountOverride?: number): void {
  const effect = card.effect;
  const override = amountOverride === undefined ? undefined : assertRupees(amountOverride, "Card amount");
  if (override !== undefined && override < 0) throw new EngineError("Card amount cannot be negative.");
  if (effect.type === "pay-bank") {
    const amount = override ?? effect.amount;
    pay(game, player.id, BANK_ID, amount, "CHANCE_OR_CHEST", card.text, undefined);
  } else if (effect.type === "collect-bank") {
    const amount = override ?? effect.amount;
    pay(game, BANK_ID, player.id, amount, "CHANCE_OR_CHEST", card.text);
  } else if (effect.type === "pay-each") {
    const amount = override ?? effect.amount;
    for (const other of activePlayers(game)) {
      if (other.id === player.id) continue;
      pay(game, player.id, other.id, amount, "CHANCE_OR_CHEST", `${card.title} · ${player.name} pays ${other.name}`);
    }
  } else if (effect.type === "collect-each") {
    const amount = override ?? effect.amount;
    for (const other of activePlayers(game)) {
      if (other.id === player.id) continue;
      pay(game, other.id, player.id, amount, "CHANCE_OR_CHEST", `${card.title} · ${other.name} pays ${player.name}`);
    }
  } else if (effect.type === "advance") {
    const target = getSpace(effect.spaceId).position;
    if (effect.collectStart) {
      const steps = (target - player.position + BOARD_SIZE) % BOARD_SIZE;
      moveBy(game, player, steps);
    } else {
      player.position = target;
      pushEvent(game, "PLAYER_MOVED", `${player.name} goes to ${getSpace(effect.spaceId).name}.`, player.id);
    }
    if (effect.thenPayBank) {
      const amount = override ?? effect.thenPayBank;
      pay(game, player.id, BANK_ID, amount, "CHANCE_OR_CHEST", card.text);
    }
  } else if (effect.type === "go-to-jail") {
    sendToJail(game, player, "Community Chest.");
  } else if (effect.type === "skip-turn") {
    player.skipNextTurn = true;
    pushEvent(game, "TURN_SKIPPED", `${player.name} will miss the next turn.`, player.id);
  } else if (effect.type === "repairs") {
    const computed = repairBill(game, player.id, effect.perHouse, effect.perHotel);
    const amount = override ?? computed;
    pay(game, player.id, BANK_ID, amount, "REPAIRS", card.text);
  }
  pushEvent(
    game,
    card.deck === "chance" ? "CHANCE_DRAWN" : "COMMUNITY_CHEST_DRAWN",
    `${player.name}: ${card.text}`,
    player.id,
  );
}

function clearBuildings(ownership: Ownership): void {
  ownership.houses = 0;
  ownership.hotel = false;
}

export function netWorthOf(game: PhysicalGame, playerId: string): NetWorth {
  const player = playerById(game, playerId);
  let propertyCount = 0;
  let houses = 0;
  let hotels = 0;
  let mortgageDebt = 0;
  let assetValue = 0;
  for (const ownership of Object.values(game.ownership)) {
    if (ownership.ownerId !== playerId) continue;
    propertyCount += 1;
    houses += ownership.houses;
    if (ownership.hotel) hotels += 1;
    const city = getCity(ownership.propertyId);
    const price = purchasePriceOf(ownership.propertyId);
    if (ownership.mortgaged) {
      mortgageDebt += mortgageValueOf(ownership.propertyId);
    } else {
      assetValue += price;
    }
    if (city) {
      assetValue += ownership.houses * city.houseCost;
      if (ownership.hotel) assetValue += city.hotelCost;
    }
  }
  return {
    cash: player.cash,
    propertyCount,
    houses,
    hotels,
    mortgageDebt,
    assetValue,
    netWorth: player.cash + assetValue - mortgageDebt,
  };
}

export function leaderboard(game: PhysicalGame): { player: PlayerState; worth: NetWorth }[] {
  return [...game.players]
    .map((player) => ({ player, worth: netWorthOf(game, player.id) }))
    .sort((left, right) => right.worth.netWorth - left.worth.netWorth);
}

export function createGame(input: CreateGameInput): EngineResult {
  const name = input.name.trim();
  if (name.length < 1 || name.length > 40) return { ok: false, error: "Give the game a name of up to 40 characters." };
  if (!Number.isInteger(input.startingCapital) || input.startingCapital < MIN_STARTING_CAPITAL || input.startingCapital > MAX_STARTING_CAPITAL) {
    return { ok: false, error: `Starting capital must be a whole number from ${formatInr(MIN_STARTING_CAPITAL)} to ${formatInr(MAX_STARTING_CAPITAL)}.` };
  }
  if (input.players.length < 2 || input.players.length > 6) return { ok: false, error: "Use 2 to 6 players." };
  const names = new Set<string>();
  const colors = new Set<string>();
  for (const player of input.players) {
    const playerName = player.name.trim();
    if (playerName.length < 1 || playerName.length > 24) return { ok: false, error: "Each player needs a name of up to 24 characters." };
    const key = playerName.toLocaleLowerCase();
    if (names.has(key)) return { ok: false, error: "Player names must be different." };
    names.add(key);
    if (colors.has(player.color)) return { ok: false, error: "Each player needs a different colour." };
    colors.add(player.color);
  }
  if (!Number.isInteger(input.firstPlayerIndex) || input.firstPlayerIndex < 0 || input.firstPlayerIndex >= input.players.length) {
    return { ok: false, error: "Choose who rolled the highest and starts." };
  }
  const timestamp = now();
  const id = createGameId();
  const ownership: Record<string, Ownership> = {};
  for (const deed of [...CITIES, ...UTILITIES]) {
    ownership[deed.id] = { propertyId: deed.id, ownerId: null, houses: 0, hotel: false, mortgaged: false };
  }
  const game: PhysicalGame = {
    schemaVersion: SCHEMA_VERSION,
    id,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
    startedAt: timestamp,
    finishedAt: null,
    status: "active",
    startingCapital: input.startingCapital,
    mortgageInterestPercent: 0,
    bankLedger: 0,
    players: input.players.map((player) => ({
      id: uid("p"),
      name: player.name.trim(),
      color: player.color,
      cash: 0,
      position: 0,
      inPrison: false,
      prisonTurns: 0,
      skipNextTurn: false,
      status: "active",
      consecutiveDoubles: 0,
    })),
    ownership,
    currentPlayerIndex: input.firstPlayerIndex,
    turnNumber: 1,
    phase: "roll",
    pending: null,
    lastDice: null,
    passedStartAmount: 0,
    transactions: [],
    voidedTransactions: [],
    events: [],
    voidedEvents: [],
    audit: [],
    undoStack: [],
    winnerId: null,
    notice: null,
  };
  pushEvent(game, "GAME_STARTED", `${name} starts. Each player receives ${formatInr(input.startingCapital)}.`);
  for (const player of game.players) {
    pushEvent(game, "PLAYER_ADDED", `${player.name} joins.`, player.id);
    pay(game, BANK_ID, player.id, input.startingCapital, "STARTING_CAPITAL", `Starting capital for ${player.name}`);
  }
  const starter = game.players[input.firstPlayerIndex];
  if (starter) pushEvent(game, "TURN_STARTED", `${starter.name} starts.`, starter.id);
  game.notice = starter ? `${starter.name} to roll.` : null;
  return { ok: true, state: game };
}

export function confirmDice(game: PhysicalGame, die1: number, die2: number): EngineResult {
  return run(game, `Dice ${die1} + ${die2}`, (draft) => {
    requireActiveGame(draft);
    if (draft.pending) throw new EngineError("Finish the current landing before the next roll.");
    if (draft.phase !== "roll" && draft.phase !== "extra-roll") throw new EngineError("It is not time to enter dice.");
    if (!Number.isInteger(die1) || !Number.isInteger(die2) || die1 < 1 || die1 > 6 || die2 < 1 || die2 > 6) {
      throw new EngineError("Enter each die as a number from 1 to 6.");
    }
    const player = currentPlayer(draft);
    if (player.status !== "active") throw new EngineError(`${player.name} is not active.`);
    draft.lastDice = { die1, die2 };
    draft.passedStartAmount = 0;
    const doubles = die1 === die2;
    const total = die1 + die2;
    pushEvent(draft, "DICE_ROLLED", `${player.name} rolls ${die1} and ${die2} (${total}${doubles ? ", doubles" : ""}).`, player.id);
    if (player.inPrison) {
      player.prisonTurns += 1;
      if (!doubles) {
        pushEvent(draft, "PRISON_STAY", `${player.name} stays in Jail (${player.prisonTurns} failed turn${player.prisonTurns === 1 ? "" : "s"}).`, player.id);
        advanceToNext(draft);
        return;
      }
      player.inPrison = false;
      player.prisonTurns = 0;
      player.consecutiveDoubles = 0;
      pushEvent(draft, "PLAYER_RELEASED", `${player.name} rolls doubles and leaves Jail.`, player.id);
      moveBy(draft, player, total);
      draft.phase = "resolve";
      resolveSpace(draft, player);
      return;
    }
    if (doubles) {
      player.consecutiveDoubles += 1;
      if (player.consecutiveDoubles >= DOUBLES_TO_JAIL) {
        sendToJail(draft, player, "Third double in a row. The token does not move.");
        advanceToNext(draft);
        return;
      }
      draft.phase = "extra-roll";
    } else {
      player.consecutiveDoubles = 0;
      draft.phase = "resolve";
    }
    moveBy(draft, player, total);
    resolveSpace(draft, player);
  });
}

export function processLanding(game: PhysicalGame, spaceId: string, dice?: { die1: number; die2: number }): EngineResult {
  return run(game, `Landing on ${getSpace(spaceId).name}`, (draft) => {
    requireActiveGame(draft);
    if (draft.pending) throw new EngineError("Finish the current landing first.");
    const player = currentPlayer(draft);
    const space = getSpace(spaceId);
    if (dice) {
      if (!Number.isInteger(dice.die1) || !Number.isInteger(dice.die2) || dice.die1 < 1 || dice.die1 > 6 || dice.die2 < 1 || dice.die2 > 6) {
        throw new EngineError("Enter each die as a number from 1 to 6.");
      }
      draft.lastDice = { die1: dice.die1, die2: dice.die2 };
    }
    player.position = space.position;
    draft.passedStartAmount = 0;
    draft.phase = "resolve";
    pushEvent(draft, "PLAYER_MOVED", `${player.name} is placed on ${space.name}. Passing Start is not added by the landing assistant.`, player.id);
    if ((space.type === "CHANCE" || space.type === "COMMUNITY_CHEST") && !draft.lastDice) {
      throw new EngineError("Enter the dice that landed on this space before drawing the chart.");
    }
    resolveSpace(draft, player);
  });
}

export function buyProperty(game: PhysicalGame): EngineResult {
  return run(game, "Buy property", (draft) => {
    requireActiveGame(draft);
    const pending = draft.pending;
    if (!pending || pending.kind !== "buy") throw new EngineError("There is no unowned property to buy.");
    const player = currentPlayer(draft);
    const space = getSpace(pending.spaceId);
    const propertyId = space.propertyId;
    if (!propertyId) throw new EngineError("This space cannot be bought.");
    const ownership = ownershipOf(draft, propertyId);
    if (ownership.ownerId) throw new EngineError(`${space.name} is already owned.`);
    if (player.position !== space.position) throw new EngineError(`${player.name} is not on ${space.name}.`);
    pay(draft, player.id, BANK_ID, pending.price, "PROPERTY_PURCHASE", `Bought ${space.name}`, propertyId);
    ownership.ownerId = player.id;
    pushEvent(draft, "PROPERTY_PURCHASED", `${player.name} buys ${space.name} for ${formatInr(pending.price)}.`, player.id);
    draft.pending = null;
    draft.notice = `${player.name} bought ${space.name}.`;
    settle(draft);
  });
}

export function declineToAuction(game: PhysicalGame): EngineResult {
  return run(game, "Start auction", (draft) => {
    requireActiveGame(draft);
    const pending = draft.pending;
    if (!pending || pending.kind !== "buy") throw new EngineError("There is no property to auction.");
    const space = getSpace(pending.spaceId);
    draft.pending = { kind: "auction", spaceId: space.id, bids: [] };
    pushEvent(draft, "AUCTION_STARTED", `The bank auctions ${space.name}.`, currentPlayer(draft).id);
  });
}

export function placeBid(game: PhysicalGame, playerId: string, amount: number): EngineResult {
  return run(game, "Place bid", (draft) => {
    requireActiveGame(draft);
    const pending = draft.pending;
    if (!pending || pending.kind !== "auction") throw new EngineError("There is no auction in progress.");
    const bidder = playerById(draft, playerId);
    if (bidder.status !== "active") throw new EngineError(`${bidder.name} cannot bid.`);
    const rupees = assertRupees(amount, "Bid");
    if (rupees <= 0) throw new EngineError("A bid must be at least ₹1.");
    const high = pending.bids.reduce((best, bid) => Math.max(best, bid.amount), 0);
    if (rupees <= high) throw new EngineError(`The bid must be higher than ${formatInr(high)}.`);
    if (bidder.cash < rupees) throw new EngineError(`Unable to complete transaction because ${bidder.name} has only ${formatInr(bidder.cash)}.`);
    pending.bids = [...pending.bids.filter((bid) => bid.playerId !== playerId), { playerId, amount: rupees }];
  });
}

export function endAuction(game: PhysicalGame): EngineResult {
  return run(game, "End auction", (draft) => {
    requireActiveGame(draft);
    const pending = draft.pending;
    if (!pending || pending.kind !== "auction") throw new EngineError("There is no auction to close.");
    const space = getSpace(pending.spaceId);
    const propertyId = space.propertyId;
    if (!propertyId) throw new EngineError("This space cannot be sold.");
    const ownership = ownershipOf(draft, propertyId);
    if (ownership.ownerId) throw new EngineError(`${space.name} is already owned.`);
    const winning = [...pending.bids].sort((left, right) => right.amount - left.amount)[0];
    if (!winning) {
      draft.pending = null;
      pushEvent(draft, "AUCTION_COMPLETED", `No bids for ${space.name}. It stays with the bank.`);
      settle(draft);
      return;
    }
    const winner = playerById(draft, winning.playerId);
    pay(draft, winner.id, BANK_ID, winning.amount, "AUCTION", `Auction · ${space.name}`, propertyId);
    ownership.ownerId = winner.id;
    pushEvent(draft, "AUCTION_COMPLETED", `${winner.name} wins ${space.name} for ${formatInr(winning.amount)}.`, winner.id);
    draft.pending = null;
    settle(draft);
  });
}

export function payRent(game: PhysicalGame): EngineResult {
  return run(game, "Pay rent", (draft) => {
    requireActiveGame(draft);
    const pending = draft.pending;
    if (!pending || pending.kind !== "rent") throw new EngineError("There is no rent to pay.");
    const space = getSpace(pending.spaceId);
    const propertyId = space.propertyId;
    if (!propertyId) throw new EngineError("This space has no rent.");
    const ownership = ownershipOf(draft, propertyId);
    if (ownership.mortgaged) throw new EngineError(`${space.name} is mortgaged, so no rent is due.`);
    if (ownership.ownerId !== pending.ownerId) throw new EngineError("The owner changed. Undo and land again.");
    const payer = playerById(draft, pending.payerId);
    const owner = playerById(draft, pending.ownerId);
    pay(draft, payer.id, owner.id, pending.amount, "RENT_PAID", `Rent · ${space.name}`, propertyId);
    pushEvent(draft, "RENT_PAID", `${payer.name} pays ${owner.name} ${formatInr(pending.amount)} rent for ${space.name}.`, payer.id);
    draft.pending = null;
    settle(draft);
  });
}

export function payTax(game: PhysicalGame, amount?: number): EngineResult {
  return run(game, "Pay tax", (draft) => {
    requireActiveGame(draft);
    const pending = draft.pending;
    if (!pending || pending.kind !== "tax") throw new EngineError("There is no tax to pay.");
    const player = currentPlayer(draft);
    const due = pending.editable ? assertRupees(amount ?? 0, "Tax") : pending.amount;
    if (due < 0) throw new EngineError("Tax cannot be negative.");
    if (!pending.editable && amount !== undefined && amount !== pending.amount) {
      throw new EngineError(`Wealth tax is ${formatInr(pending.amount)}.`);
    }
    pay(draft, player.id, BANK_ID, due, "TAX_PAID", pending.tax === "wealth" ? "Wealth tax" : "Income tax");
    pushEvent(draft, "TAX_PAID", `${player.name} pays ${formatInr(due)} ${pending.tax === "wealth" ? "wealth" : "income"} tax.`, player.id);
    draft.pending = null;
    settle(draft);
  });
}

export function applyPendingCard(game: PhysicalGame, amountOverride?: number): EngineResult {
  return run(game, "Apply card", (draft) => {
    requireActiveGame(draft);
    const pending = draft.pending;
    if (!pending || pending.kind !== "card") throw new EngineError("There is no card to apply.");
    const player = currentPlayer(draft);
    const card = getCard(pending.cardId);
    applyCardEffect(draft, player, card, amountOverride);
    draft.pending = null;
    if (card.effect.type === "advance" && !player.inPrison) {
      const stop = card.effect.spaceId === "CLUB" || card.effect.spaceId === "REST_HOUSE" || card.effect.spaceId === "START";
      if (!stop) {
        resolveSpace(draft, player);
        if (draft.pending) return;
      }
    }
    settle(draft);
  });
}

export function dismissInfo(game: PhysicalGame): EngineResult {
  return run(game, "Continue", (draft) => {
    requireActiveGame(draft);
    if (!draft.pending || draft.pending.kind !== "info") throw new EngineError("There is nothing to continue.");
    draft.pending = null;
    settle(draft);
  });
}

function assertCanDevelop(game: PhysicalGame, playerId: string, propertyId: string): Ownership {
  const player = playerById(game, playerId);
  if (player.status !== "active") throw new EngineError(`${player.name} is not active.`);
  const city = getCity(propertyId);
  if (!city) throw new EngineError("Houses are built on city sites only.");
  const ownership = ownershipOf(game, propertyId);
  if (ownership.ownerId !== playerId) throw new EngineError(`${player.name} does not own ${city.name}.`);
  if (ownership.mortgaged) throw new EngineError(`${city.name} is mortgaged.`);
  if (!ownsCompleteGroup(game, playerId, propertyId)) {
    throw new EngineError(`${player.name} needs the complete ${city.colorGroup} colour group before building.`);
  }
  const group = COLOR_GROUPS[city.colorGroup].propertyIds;
  if (group.some((id) => game.ownership[id]?.mortgaged)) {
    throw new EngineError("Release every mortgage in the colour group before building.");
  }
  return ownership;
}

export function buildHouse(game: PhysicalGame, playerId: string, propertyId: string): EngineResult {
  const cityName = propertyName(propertyId);
  return run(game, `House on ${cityName}`, (draft) => {
    requireActiveGame(draft);
    const ownership = assertCanDevelop(draft, playerId, propertyId);
    const city = getCity(propertyId);
    if (!city) throw new EngineError("Houses are built on city sites only.");
    if (ownership.hotel) throw new EngineError(`${city.name} already has a hotel.`);
    if (ownership.houses >= 3) throw new EngineError(`${city.name} already has three houses. A hotel is next.`);
    const player = playerById(draft, playerId);
    pay(draft, player.id, BANK_ID, city.houseCost, "HOUSE_BUILT", `House on ${city.name}`, propertyId);
    ownership.houses += 1;
    pushEvent(draft, "HOUSE_BUILT", `${player.name} builds a house on ${city.name} (${ownership.houses}).`, player.id);
  });
}

export function buildHotel(game: PhysicalGame, playerId: string, propertyId: string): EngineResult {
  const cityName = propertyName(propertyId);
  return run(game, `Hotel on ${cityName}`, (draft) => {
    requireActiveGame(draft);
    const ownership = assertCanDevelop(draft, playerId, propertyId);
    const city = getCity(propertyId);
    if (!city) throw new EngineError("Hotels are built on city sites only.");
    if (ownership.hotel) throw new EngineError(`${city.name} already has a hotel.`);
    if (ownership.houses < 3) throw new EngineError(`${city.name} needs three houses before a hotel.`);
    const group = COLOR_GROUPS[city.colorGroup].propertyIds;
    for (const id of group) {
      const site = ownershipOf(draft, id);
      if (site.hotel) continue;
      if (site.houses < 3) throw new EngineError(`Every site in the ${city.colorGroup} group needs three houses before a hotel.`);
    }
    const player = playerById(draft, playerId);
    pay(draft, player.id, BANK_ID, city.hotelCost, "HOTEL_BUILT", `Hotel on ${city.name}`, propertyId);
    ownership.houses = 0;
    ownership.hotel = true;
    pushEvent(draft, "HOTEL_BUILT", `${player.name} builds a hotel on ${city.name} and returns three houses to the bank.`, player.id);
  });
}

export function mortgageProperty(game: PhysicalGame, playerId: string, propertyId: string): EngineResult {
  return run(game, `Mortgage ${propertyName(propertyId)}`, (draft) => {
    requireActiveGame(draft);
    if (!isDeed(propertyId)) throw new EngineError("That site cannot be mortgaged.");
    const player = playerById(draft, playerId);
    const ownership = ownershipOf(draft, propertyId);
    if (ownership.ownerId !== playerId) throw new EngineError(`${player.name} does not own ${propertyName(propertyId)}.`);
    if (ownership.mortgaged) throw new EngineError(`${propertyName(propertyId)} is already mortgaged.`);
    if (ownership.houses > 0 || ownership.hotel) throw new EngineError("Remove houses and the hotel before mortgaging this site.");
    const value = mortgageValueOf(propertyId);
    pay(draft, BANK_ID, player.id, value, "PROPERTY_MORTGAGED", `Mortgage · ${propertyName(propertyId)}`, propertyId);
    ownership.mortgaged = true;
    pushEvent(draft, "PROPERTY_MORTGAGED", `${player.name} mortgages ${propertyName(propertyId)} for ${formatInr(value)}.`, player.id);
  });
}

export function unmortgageProperty(game: PhysicalGame, playerId: string, propertyId: string): EngineResult {
  return run(game, `Release mortgage on ${propertyName(propertyId)}`, (draft) => {
    requireActiveGame(draft);
    const player = playerById(draft, playerId);
    const ownership = ownershipOf(draft, propertyId);
    if (ownership.ownerId !== playerId) throw new EngineError(`${player.name} does not own ${propertyName(propertyId)}.`);
    if (!ownership.mortgaged) throw new EngineError(`${propertyName(propertyId)} is not mortgaged.`);
    const principal = mortgageValueOf(propertyId);
    const interest = Math.floor((principal * draft.mortgageInterestPercent) / 100);
    const due = principal + interest;
    pay(draft, player.id, BANK_ID, due, "MORTGAGE_RELEASED", `Mortgage released · ${propertyName(propertyId)}`, propertyId);
    ownership.mortgaged = false;
    pushEvent(
      draft,
      "MORTGAGE_RELEASED",
      `${player.name} releases ${propertyName(propertyId)} for ${formatInr(due)}${interest ? ` including ${formatInr(interest)} interest` : ""}.`,
      player.id,
    );
  });
}

export function setMortgageInterest(game: PhysicalGame, percent: number): EngineResult {
  return run(game, "Update mortgage interest", (draft) => {
    if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
      throw new EngineError("Mortgage interest must be a whole percent from 0 to 100.");
    }
    draft.mortgageInterestPercent = percent;
  });
}

export function quickTransfer(game: PhysicalGame, fromId: string, toId: string, amount: number, reason: string): EngineResult {
  return run(game, "Quick transfer", (draft) => {
    requireActiveGame(draft);
    const rupees = assertRupees(amount, "Amount");
    if (rupees <= 0) throw new EngineError("Enter an amount greater than zero.");
    if (fromId === toId) throw new EngineError("Choose two different sides of the transfer.");
    const cleanReason = reason.trim().slice(0, 80) || "Adjustment";
    pay(draft, fromId, toId, rupees, "QUICK_TRANSFER", cleanReason);
    pushEvent(draft, "QUICK_TRANSFER", `${labelOf(draft, fromId)} pays ${labelOf(draft, toId)} ${formatInr(rupees)} · ${cleanReason}.`);
  });
}

function labelOf(game: PhysicalGame, id: string): string {
  if (id === BANK_ID) return "Bank";
  return playerById(game, id).name;
}

export function tradeProperties(
  game: PhysicalGame,
  fromId: string,
  toId: string,
  propertyIds: string[],
  cashToReceiver: number,
): EngineResult {
  return run(game, "Trade", (draft) => {
    requireActiveGame(draft);
    if (fromId === toId) throw new EngineError("Choose two different players.");
    const from = playerById(draft, fromId);
    const to = playerById(draft, toId);
    if (from.status !== "active" || to.status !== "active") throw new EngineError("Both players must be active.");
    if (propertyIds.length === 0 && cashToReceiver <= 0) throw new EngineError("Add a property or some cash to the trade.");
    const cash = assertRupees(cashToReceiver, "Trade cash");
    if (cash < 0) throw new EngineError("Trade cash cannot be negative.");
    for (const propertyId of propertyIds) {
      const ownership = ownershipOf(draft, propertyId);
      if (ownership.ownerId !== fromId) throw new EngineError(`${from.name} does not own ${propertyName(propertyId)}.`);
    }
    if (cash > 0) pay(draft, fromId, toId, cash, "PROPERTY_TRADED", `Trade cash to ${to.name}`);
    for (const propertyId of propertyIds) {
      ownershipOf(draft, propertyId).ownerId = toId;
      pushEvent(draft, "PROPERTY_TRADED", `${from.name} gives ${propertyName(propertyId)} to ${to.name}.`, from.id);
    }
    if (propertyIds.length === 0) {
      pushEvent(draft, "PROPERTY_TRADED", `${from.name} pays ${to.name} ${formatInr(cash)}.`, from.id);
    }
  });
}

export function declareBankrupt(game: PhysicalGame, playerId: string, creditorId: string): EngineResult {
  return run(game, "Bankruptcy", (draft) => {
    requireActiveGame(draft);
    const player = playerById(draft, playerId);
    if (player.status !== "active") throw new EngineError(`${player.name} is already out.`);
    if (creditorId === playerId) throw new EngineError("Choose the bank or another player as the creditor.");
    if (creditorId !== BANK_ID) {
      const creditor = playerById(draft, creditorId);
      if (creditor.status !== "active") throw new EngineError("The creditor must be active, or choose the bank.");
    }
    if (player.cash > 0) {
      pay(draft, player.id, creditorId, player.cash, "BANKRUPTCY", `${player.name} turns remaining cash over`);
    }
    for (const ownership of Object.values(draft.ownership)) {
      if (ownership.ownerId !== player.id) continue;
      clearBuildings(ownership);
      ownership.mortgaged = false;
      ownership.ownerId = null;
    }
    player.cash = 0;
    player.status = "bankrupt";
    player.inPrison = false;
    pushEvent(draft, "PLAYER_BANKRUPT", `${player.name} is bankrupt. Sites return to the bank.`, player.id);
    draft.pending = null;
    if (currentPlayer(draft).id === player.id || currentPlayer(draft).status !== "active") {
      advanceToNext(draft);
    }
    maybeFinish(draft);
  });
}

export function retirePlayer(game: PhysicalGame, playerId: string): EngineResult {
  return run(game, "Retire player", (draft) => {
    requireActiveGame(draft);
    const player = playerById(draft, playerId);
    if (player.status !== "active") throw new EngineError(`${player.name} is already out.`);
    if (activePlayers(draft).length <= 1) throw new EngineError("The last player should end the game instead.");
    if (player.cash > 0) pay(draft, player.id, BANK_ID, player.cash, "RETIRED", `${player.name} returns cash to the bank`);
    for (const ownership of Object.values(draft.ownership)) {
      if (ownership.ownerId !== player.id) continue;
      clearBuildings(ownership);
      ownership.mortgaged = false;
      ownership.ownerId = null;
    }
    player.cash = 0;
    player.status = "retired";
    pushEvent(draft, "PLAYER_RETIRED", `${player.name} retires. Sites return to the bank.`, player.id);
    if (currentPlayer(draft).id === player.id) advanceToNext(draft);
    maybeFinish(draft);
  });
}

export function finishGame(game: PhysicalGame): EngineResult {
  return run(game, "Finish game", (draft) => {
    if (draft.status === "finished") throw new EngineError("This game is already finished.");
    const ranked = leaderboard(draft);
    const winner = ranked.find((entry) => entry.player.status === "active") ?? ranked[0];
    draft.status = "finished";
    draft.phase = "finished";
    draft.finishedAt = now();
    draft.pending = null;
    if (winner) {
      if (winner.player.status === "active") winner.player.status = "winner";
      draft.winnerId = winner.player.id;
      pushEvent(draft, "GAME_FINISHED", `${winner.player.name} finishes with the highest net worth.`, winner.player.id);
    }
  });
}

export function undo(game: PhysicalGame): EngineResult {
  const frame = game.undoStack[game.undoStack.length - 1];
  if (!frame) return { ok: false, error: "Nothing to undo." };
  const restored = structuredClone(frame.state);
  const keptTransactions = new Set(restored.transactions.map((entry) => entry.id));
  const keptEvents = new Set(restored.events.map((entry) => entry.id));
  const removedTransactions = game.transactions.filter((entry) => !keptTransactions.has(entry.id)).map((entry) => ({ ...entry, voided: true }));
  const removedEvents = game.events.filter((entry) => !keptEvents.has(entry.id)).map((entry) => ({ ...entry, voided: true }));
  restored.undoStack = game.undoStack.slice(0, -1);
  restored.voidedTransactions = [...game.voidedTransactions, ...removedTransactions];
  restored.voidedEvents = [...game.voidedEvents, ...removedEvents];
  restored.audit = [
    ...game.audit,
    { id: uid("aud"), timestamp: now(), message: `Reversed: ${frame.description}` },
  ];
  restored.events = [
    ...restored.events,
    {
      id: uid("evt"),
      gameId: restored.id,
      timestamp: now(),
      type: "UNDO",
      message: `Reversed: ${frame.description}`,
    },
  ];
  restored.notice = `Undid: ${frame.description}`;
  restored.updatedAt = now();
  return { ok: true, state: restored };
}

export function previewBalances(game: PhysicalGame, fromId: string, toId: string, amount: number): { fromBefore: number; fromAfter: number; toBefore: number; toAfter: number } | null {
  if (!Number.isInteger(amount)) return null;
  const balance = (id: string) => (id === BANK_ID ? game.bankLedger : playerById(game, id).cash);
  return {
    fromBefore: balance(fromId),
    fromAfter: balance(fromId) - amount,
    toBefore: balance(toId),
    toAfter: balance(toId) + amount,
  };
}

export function releaseCost(game: PhysicalGame, propertyId: string): number {
  const principal = mortgageValueOf(propertyId);
  const interest = Math.floor((principal * game.mortgageInterestPercent) / 100);
  return principal + interest;
}
