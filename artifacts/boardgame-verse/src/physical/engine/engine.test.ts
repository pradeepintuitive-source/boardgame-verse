import { describe, expect, it } from "vitest";
import { getCard, mortgageValueOf } from "../data/catalog";
import {
  applyPendingCard,
  buildHotel,
  buildHouse,
  buyProperty,
  calculateRent,
  confirmDice,
  createGame,
  currentPlayer,
  declareBankrupt,
  declineToAuction,
  dismissInfo,
  endAuction,
  finishGame,
  mortgageProperty,
  netWorthOf,
  payRent,
  payTax,
  placeBid,
  processLanding,
  setMortgageInterest,
  undo,
  unmortgageProperty,
  wealthTaxAmount,
} from "../engine/engine";
import type { EngineResult, PhysicalGame } from "../types";

function must(result: EngineResult): PhysicalGame {
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

function newGame(): PhysicalGame {
  return must(
    createGame({
      name: "Saturday Game",
      startingCapital: 30000,
      firstPlayerIndex: 0,
      players: [
        { name: "Pradeep", color: "green" },
        { name: "Rahul", color: "blue" },
        { name: "Archana", color: "red" },
      ],
    }),
  );
}

function give(game: PhysicalGame, propertyId: string, ownerName: string, patch?: Partial<PhysicalGame["ownership"][string]>): PhysicalGame {
  const owner = game.players.find((player) => player.name === ownerName);
  if (!owner) throw new Error(ownerName);
  const ownership = game.ownership[propertyId];
  if (!ownership) throw new Error(propertyId);
  ownership.ownerId = owner.id;
  Object.assign(ownership, patch);
  return game;
}

describe("physical game engine", () => {
  it("pays the photographed starting capital", () => {
    const game = newGame();
    expect(game.players.every((player) => player.cash === 30000)).toBe(true);
    expect(game.bankLedger).toBe(-90000);
    expect(game.id.startsWith("LOCAL-BB-")).toBe(true);
  });

  it("moves by the dice total", () => {
    const game = must(confirmDice(newGame(), 4, 2));
    expect(currentPlayer(game).name).toBe("Pradeep");
    expect(game.players[0]?.position).toBe(6);
    expect(game.pending?.kind).toBe("buy");
  });

  it("pays salary when a move passes Start", () => {
    const game = newGame();
    const pradeep = game.players[0];
    if (!pradeep) throw new Error("missing");
    pradeep.position = 30;
    const moved = must(confirmDice(game, 5, 6));
    expect(moved.players[0]?.position).toBe(5);
    expect(moved.players[0]?.cash).toBe(31500);
    expect(moved.transactions.some((entry) => entry.type === "START_SALARY")).toBe(true);
  });

  it("buys a property from the bank", () => {
    let game = must(confirmDice(newGame(), 4, 2));
    game = must(buyProperty(game));
    expect(game.ownership.BANGALORE?.ownerId).toBe(game.players[0]?.id);
    expect(game.players[0]?.cash).toBe(25000);
    expect(game.bankLedger).toBe(-85000);
    expect(game.transactions.some((entry) => entry.type === "PROPERTY_PURCHASE")).toBe(true);
  });

  it("charges site rent to the owner", () => {
    let game = must(confirmDice(newGame(), 4, 2));
    game = must(buyProperty(game));
    expect(currentPlayer(game).name).toBe("Rahul");
    game = must(confirmDice(game, 4, 2));
    expect(game.pending?.kind).toBe("rent");
    if (game.pending?.kind !== "rent") throw new Error("rent");
    expect(game.pending.amount).toBe(900);
    game = must(payRent(game));
    expect(game.players[1]?.cash).toBe(29100);
    expect(game.players[0]?.cash).toBe(25900);
  });

  it("doubles unimproved rent after three sites of a colour", () => {
    const game = newGame();
    give(game, "BANGALORE", "Pradeep");
    give(game, "CHENNAI", "Pradeep");
    expect(calculateRent(game, "BANGALORE", 7).amount).toBe(900);
    give(game, "HYDERABAD", "Pradeep");
    expect(calculateRent(game, "BANGALORE", 7).amount).toBe(1800);
  });

  it("builds houses only on a complete colour group", () => {
    const game = newGame();
    give(game, "BANGALORE", "Pradeep");
    const blocked = buildHouse(game, game.players[0]?.id ?? "", "BANGALORE");
    expect(blocked.ok).toBe(false);
    for (const id of ["CHENNAI", "HYDERABAD", "GOA", "AMRITSAR"]) give(game, id, "Pradeep");
    const built = must(buildHouse(game, game.players[0]?.id ?? "", "BANGALORE"));
    expect(built.ownership.BANGALORE?.houses).toBe(1);
    expect(built.players[0]?.cash).toBe(30000 - 6500);
    expect(calculateRent(built, "BANGALORE", 4).amount).toBe(3500);
  });

  it("replaces three houses with one hotel", () => {
    const game = newGame();
    const id = game.players[0]?.id ?? "";
    for (const propertyId of ["BANGALORE", "CHENNAI", "HYDERABAD", "GOA", "AMRITSAR"]) {
      give(game, propertyId, "Pradeep", { houses: 3 });
    }
    const hotel = must(buildHotel(game, id, "BANGALORE"));
    expect(hotel.ownership.BANGALORE?.hotel).toBe(true);
    expect(hotel.ownership.BANGALORE?.houses).toBe(0);
    expect(hotel.players[0]?.cash).toBe(30000 - 6500);
    expect(calculateRent(hotel, "BANGALORE", 4).amount).toBe(8500);
  });

  it("mortgages and releases with integer interest", () => {
    const game = newGame();
    const id = game.players[0]?.id ?? "";
    give(game, "MUMBAI", "Pradeep");
    const mortgaged = must(mortgageProperty(game, id, "MUMBAI"));
    expect(mortgaged.ownership.MUMBAI?.mortgaged).toBe(true);
    expect(mortgaged.players[0]?.cash).toBe(30000 + mortgageValueOf("MUMBAI"));
    expect(calculateRent(mortgaged, "MUMBAI", 8).exempt).toBe(true);
    const rated = must(setMortgageInterest(mortgaged, 10));
    const released = must(unmortgageProperty(rated, id, "MUMBAI"));
    const interest = Math.floor((5500 * 10) / 100);
    expect(released.players[0]?.cash).toBe(30000 + 5500 - 5500 - interest);
    expect(released.ownership.MUMBAI?.mortgaged).toBe(false);
  });

  it("caps wealth tax at ₹500", () => {
    const game = newGame();
    const id = game.players[0]?.id ?? "";
    give(game, "MUMBAI", "Pradeep", { houses: 3 });
    give(game, "KOLKATA", "Pradeep", { hotel: true });
    expect(wealthTaxAmount(game, id).amount).toBe(250);
    give(game, "PUNE", "Pradeep", { houses: 3, hotel: true });
    give(game, "DELHI", "Pradeep", { houses: 3 });
    expect(wealthTaxAmount(game, id).amount).toBe(500);
    game.players[0]!.position = 5;
    const landed = must(processLanding(game, "WEALTH_TAX"));
    expect(landed.pending?.kind).toBe("tax");
    const paid = must(payTax(landed));
    expect(paid.players[0]?.cash).toBe(29500);
  });

  it("applies the Chance line for the dice total", () => {
    const game = newGame();
    const landed = must(processLanding(game, "CHANCE_RIGHT", { die1: 3, die2: 4 }));
    expect(landed.pending?.kind).toBe("card");
    if (landed.pending?.kind !== "card") throw new Error("card");
    expect(getCard(landed.pending.cardId).title).toBe("Jackpot");
    const applied = must(applyPendingCard(landed));
    expect(applied.players[0]?.cash).toBe(34000);
  });

  it("applies Community Chest and can send a player to Jail", () => {
    const game = newGame();
    const landed = must(processLanding(game, "CHEST_BOTTOM", { die1: 2, die2: 3 }));
    const applied = must(applyPendingCard(landed));
    expect(applied.players[0]?.inPrison).toBe(true);
    expect(applied.players[0]?.position).toBe(27);
    expect(applied.players[0]?.cash).toBe(30000);
    expect(currentPlayer(applied).name).toBe("Rahul");
  });

  it("grants another roll on doubles and jails on the third", () => {
    let game = must(confirmDice(newGame(), 1, 1));
    expect(game.phase === "extra-roll" || game.pending).toBeTruthy();
    game = must(declineToAuction(game));
    game = must(endAuction(game));
    expect(currentPlayer(game).name).toBe("Pradeep");
    expect(game.players[0]?.consecutiveDoubles).toBe(1);
    game = must(confirmDice(game, 2, 2));
    game = must(declineToAuction(game));
    game = must(endAuction(game));
    expect(game.players[0]?.consecutiveDoubles).toBe(2);
    const positionBeforeThird = game.players[0]?.position;
    game = must(confirmDice(game, 3, 3));
    expect(game.players[0]?.inPrison).toBe(true);
    expect(game.players[0]?.position).toBe(27);
    expect(game.players[0]?.position).not.toBe((positionBeforeThird ?? 0) + 6);
    expect(currentPlayer(game).name).toBe("Rahul");
  });

  it("leaves Jail only on doubles", () => {
    let game = newGame();
    game.players[0]!.inPrison = true;
    game = must(confirmDice(game, 2, 3));
    expect(game.players[0]?.inPrison).toBe(true);
    expect(currentPlayer(game).name).toBe("Rahul");
    game.currentPlayerIndex = 0;
    game.phase = "roll";
    game.pending = null;
    game = must(confirmDice(game, 4, 4));
    expect(game.players[0]?.inPrison).toBe(false);
    expect(game.players[0]?.position).toBe(8);
  });

  it("sells an auction to the highest bidder and pays the bank", () => {
    let game = must(confirmDice(newGame(), 4, 2));
    game = must(declineToAuction(game));
    const rahul = game.players[1]?.id ?? "";
    const archana = game.players[2]?.id ?? "";
    game = must(placeBid(game, rahul, 5000));
    game = must(placeBid(game, archana, 6000));
    game = must(endAuction(game));
    expect(game.ownership.BANGALORE?.ownerId).toBe(archana);
    expect(game.players[2]?.cash).toBe(24000);
    expect(game.bankLedger).toBe(-84000);
  });

  it("bankrupts a player and crowns the last one standing", () => {
    let game = newGame();
    give(game, "MUMBAI", "Rahul");
    game = must(declareBankrupt(game, game.players[0]?.id ?? "", "bank"));
    expect(game.players[0]?.status).toBe("bankrupt");
    expect(game.ownership.MUMBAI?.ownerId).toBe(game.players[1]?.id);
    game = must(declareBankrupt(game, game.players[1]?.id ?? "", "bank"));
    expect(game.status).toBe("finished");
    expect(game.winnerId).toBe(game.players[2]?.id);
    expect(netWorthOf(game, game.players[2]?.id ?? "").cash).toBe(30000);
  });

  it("ranks a banker-finished game", () => {
    const game = must(finishGame(newGame()));
    expect(game.status).toBe("finished");
    expect(game.winnerId).toBeTruthy();
  });

  it("reverses the last financial action and keeps a voided copy", () => {
    let game = must(confirmDice(newGame(), 4, 2));
    game = must(buyProperty(game));
    const undone = must(undo(game));
    expect(undone.ownership.BANGALORE?.ownerId).toBeNull();
    expect(undone.players[0]?.cash).toBe(30000);
    expect(undone.voidedTransactions.some((entry) => entry.type === "PROPERTY_PURCHASE")).toBe(true);
    expect(undone.events.some((event) => event.type === "UNDO")).toBe(true);
  });

  it("charges utility rent from the deed, not a Monopoly formula", () => {
    const game = newGame();
    give(game, "WATERWAYS", "Rahul");
    expect(calculateRent(game, "WATERWAYS", 7).amount).toBe(210);
    give(game, "ELECTRICITY", "Rahul");
    expect(calculateRent(game, "WATERWAYS", 7).amount).toBe(525);
    expect(calculateRent(game, "ELECTRICITY", 7).amount).toBe(280);
    give(game, "RAILWAYS", "Rahul");
    expect(calculateRent(game, "RAILWAYS", 7).amount).toBe(1200);
    give(game, "ROADWAYS", "Rahul");
    expect(calculateRent(game, "RAILWAYS", 7).amount).toBe(2000);
    expect(calculateRent(game, "ROADWAYS", 7).amount).toBe(1600);
  });
});
