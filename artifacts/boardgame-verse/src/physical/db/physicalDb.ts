import Dexie, { type Table } from "dexie";
import type { PhysicalGame } from "../types";
import { DB_VERSION } from "../types";

export interface GameRecord {
  id: string;
  name: string;
  status: PhysicalGame["status"];
  updatedAt: number;
  turnNumber: number;
  playerCount: number;
  currentPlayerName: string;
  payload: PhysicalGame;
}

export interface GameSummary {
  id: string;
  name: string;
  status: PhysicalGame["status"];
  updatedAt: number;
  turnNumber: number;
  playerCount: number;
  currentPlayerName: string;
}

class PhysicalDatabase extends Dexie {
  games!: Table<GameRecord, string>;

  constructor() {
    super("bharat-business-physical");
    this.version(DB_VERSION).stores({
      games: "id, status, updatedAt, name",
    });
  }
}

let database: PhysicalDatabase | null = null;

export function getPhysicalDatabase(): PhysicalDatabase {
  if (!database) database = new PhysicalDatabase();
  return database;
}

function toRecord(game: PhysicalGame): GameRecord {
  const current = game.players[game.currentPlayerIndex];
  return {
    id: game.id,
    name: game.name,
    status: game.status,
    updatedAt: game.updatedAt,
    turnNumber: game.turnNumber,
    playerCount: game.players.length,
    currentPlayerName: current?.name ?? "",
    payload: game,
  };
}

export const localGameRepository = {
  async save(game: PhysicalGame): Promise<void> {
    await getPhysicalDatabase().games.put(toRecord(game));
  },
  async load(id: string): Promise<PhysicalGame | null> {
    const record = await getPhysicalDatabase().games.get(id);
    return record?.payload ?? null;
  },
  async list(): Promise<GameSummary[]> {
    const records = await getPhysicalDatabase().games.orderBy("updatedAt").reverse().toArray();
    return records.map(({ payload: _payload, ...summary }) => summary);
  },
  async remove(id: string): Promise<void> {
    await getPhysicalDatabase().games.delete(id);
  },
};
