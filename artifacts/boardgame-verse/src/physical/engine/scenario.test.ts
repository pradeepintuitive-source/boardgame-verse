import { describe, expect, it } from "vitest";
import {
  applyPendingCard,
  buildHotel,
  buildHouse,
  buyProperty,
  confirmDice,
  createGame,
  declareBankrupt,
  declineToAuction,
  dismissInfo,
  endAuction,
  mortgageProperty,
  payRent,
  payTax,
  placeBid,
  processLanding,
  setMortgageInterest,
  unmortgageProperty,
} from "../engine/engine";
import type { EngineResult, PhysicalGame } from "../types";

function must(result: EngineResult): PhysicalGame {
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

function clearPending(game: PhysicalGame): PhysicalGame {
  const pending = game.pending;
  if (!pending) return game;
  if (pending.kind === "buy") return must(endAuction(must(declineToAuction(game))));
  if (pending.kind === "info") return must(dismissInfo(game));
  if (pending.kind === "rent") return must(payRent(game));
  if (pending.kind === "tax") return must(payTax(game, pending.editable ? 0 : undefined));
  if (pending.kind === "card") return must(applyPendingCard(game));
  if (pending.kind === "auction") return must(endAuction(game));
  return game;
}

describe("one sitting of Bharat Business", () => {
  it("runs capital, buy, rent, development, mortgage, cards, jail, auction, bankruptcy, and a winner", () => {
    let game = must(
      createGame({
        name: "Full sitting",
        startingCapital: 30000,
        firstPlayerIndex: 0,
        players: [
          { name: "Pradeep", color: "green" },
          { name: "Rahul", color: "blue" },
          { name: "Archana", color: "red" },
        ],
      }),
    );

    game = must(confirmDice(game, 4, 2));
    game = must(buyProperty(game));
    expect(game.ownership.BANGALORE?.ownerId).toBe(game.players[0]?.id);

    game = must(confirmDice(game, 5, 1));
    game = must(payRent(game));
    expect(game.players[0]?.cash).toBe(25900);
    expect(game.players[1]?.cash).toBe(29100);

    const pradeep = game.players[0]?.id ?? "";
    game.players[0]!.cash = 100000;
    for (const id of ["CHENNAI", "HYDERABAD", "GOA", "AMRITSAR"]) game.ownership[id]!.ownerId = pradeep;
    game = must(buildHouse(game, pradeep, "BANGALORE"));
    game = must(buildHouse(game, pradeep, "BANGALORE"));
    game = must(buildHouse(game, pradeep, "BANGALORE"));
    for (const id of ["CHENNAI", "HYDERABAD", "GOA", "AMRITSAR"]) game.ownership[id]!.houses = 3;
    game = must(buildHotel(game, pradeep, "BANGALORE"));
    expect(game.ownership.BANGALORE?.hotel).toBe(true);

    game.ownership.MUMBAI!.ownerId = pradeep;
    game = must(mortgageProperty(game, pradeep, "MUMBAI"));
    game = must(setMortgageInterest(game, 10));
    const beforeRelease = game.players[0]?.cash ?? 0;
    game = must(unmortgageProperty(game, pradeep, "MUMBAI"));
    expect((game.players[0]?.cash ?? 0) + 6050).toBe(beforeRelease);

    game.currentPlayerIndex = 0;
    game.phase = "roll";
    game.pending = null;
    game.players[0]!.inPrison = false;
    game.players[0]!.consecutiveDoubles = 0;
    game = must(processLanding(game, "CHANCE_RIGHT", { die1: 3, die2: 4 }));
    game = must(applyPendingCard(game));
    expect(game.transactions.some((entry) => entry.amount === 4000)).toBe(true);

    game.currentPlayerIndex = 0;
    game.phase = "roll";
    game.pending = null;
    game.players[0]!.inPrison = false;
    game.players[0]!.consecutiveDoubles = 0;
    game.players[0]!.position = 0;
    game = must(confirmDice(game, 1, 1));
    game = clearPending(game);
    expect(game.players[0]?.consecutiveDoubles).toBe(1);
    game = must(confirmDice(game, 2, 2));
    game = clearPending(game);
    expect(game.players[0]?.consecutiveDoubles).toBe(2);
    const stopped = game.players[0]?.position;
    game = must(confirmDice(game, 3, 3));
    expect(game.players[0]?.inPrison).toBe(true);
    expect(game.players[0]?.position).toBe(27);
    expect(game.players[0]?.position).not.toBe((stopped ?? 0) + 6);

    const rahul = game.players[1];
    if (!rahul) throw new Error("rahul");
    game.currentPlayerIndex = 1;
    game.phase = "roll";
    game.pending = null;
    rahul.inPrison = false;
    game = must(processLanding(game, "KOLKATA", { die1: 1, die2: 2 }));
    expect(game.pending?.kind).toBe("buy");
    game = must(declineToAuction(game));
    game = must(placeBid(game, game.players[2]?.id ?? "", 4500));
    game = must(endAuction(game));
    expect(game.ownership.KOLKATA?.ownerId).toBe(game.players[2]?.id);
    expect(game.players[2]?.cash).toBe(25500);

    game = must(declareBankrupt(game, game.players[1]?.id ?? "", "bank"));
    game = must(declareBankrupt(game, game.players[2]?.id ?? "", "bank"));
    expect(game.status).toBe("finished");
    expect(game.winnerId).toBe(pradeep);
    expect(game.ownership.KOLKATA?.ownerId).toBeNull();
  });
});
