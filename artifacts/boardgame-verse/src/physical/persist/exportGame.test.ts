import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { localGameRepository } from "../db/physicalDb";
import { createGame, confirmDice, buyProperty } from "../engine/engine";
import { exportGame, parseImportedGame, serializeGame } from "../persist/exportGame";
import type { EngineResult, PhysicalGame } from "../types";

function must(result: EngineResult): PhysicalGame {
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

describe("physical save and export", () => {
  it("saves and reloads a game from IndexedDB", async () => {
    let game = must(
      createGame({
        name: "Reload",
        startingCapital: 30000,
        firstPlayerIndex: 0,
        players: [
          { name: "Pradeep", color: "green" },
          { name: "Rahul", color: "blue" },
        ],
      }),
    );
    game = must(confirmDice(game, 4, 2));
    game = must(buyProperty(game));
    await localGameRepository.save(game);
    const loaded = await localGameRepository.load(game.id);
    expect(loaded?.ownership.BANGALORE?.ownerId).toBe(game.players[0]?.id);
    expect(loaded?.players[0]?.cash).toBe(25000);
    const listed = await localGameRepository.list();
    expect(listed.some((entry) => entry.id === game.id)).toBe(true);
  });

  it("round-trips export and import without executing code", () => {
    const game = must(
      createGame({
        name: "Backup",
        startingCapital: 35000,
        firstPlayerIndex: 1,
        players: [
          { name: "Pradeep", color: "green" },
          { name: "Rahul", color: "blue" },
        ],
      }),
    );
    const file = exportGame(game);
    const restored = parseImportedGame(JSON.parse(serializeGame(game)));
    expect(restored.id).toBe(file.game.id);
    expect(restored.players[1]?.cash).toBe(35000);
    expect(() => parseImportedGame({ schemaVersion: 1, game: { name: "<script>" } })).toThrow();
  });
});
