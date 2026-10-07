import { BOARD_SIZE, CITIES, UTILITIES, isDeed } from "../data/catalog";
import type { PhysicalGame } from "../types";
import { SCHEMA_VERSION } from "../types";

export interface ExportFile {
  schemaVersion: typeof SCHEMA_VERSION;
  exportedAt: number;
  game: PhysicalGame;
}

export function exportGame(game: PhysicalGame): ExportFile {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    game: structuredClone(game),
  };
}

export function serializeGame(game: PhysicalGame): string {
  return JSON.stringify(exportFileSafe(exportGame(game)));
}

function exportFileSafe(file: ExportFile): ExportFile {
  return JSON.parse(JSON.stringify(file)) as ExportFile;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function bad(message: string): never {
  throw new Error(message);
}

function asString(value: unknown, label: string, max: number): string {
  if (typeof value !== "string") bad(`${label} must be text.`);
  const clean = value.replace(/[\u0000-\u001f]/g, "").trim();
  if (clean.length < 1 || clean.length > max) bad(`${label} is missing or too long.`);
  if (/[<>]/.test(clean)) bad(`${label} contains characters that are not allowed.`);
  return clean;
}

function asInt(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) bad(`${label} must be a whole number.`);
  return value;
}

/** Accept only a structured game file. Never evaluates imported text. */
export function parseImportedGame(raw: unknown): PhysicalGame {
  if (!isRecord(raw)) bad("The file is not a game backup.");
  const game = isRecord(raw.game) ? raw.game : raw;
  if (game.schemaVersion !== SCHEMA_VERSION) bad("This backup was made by a different version of the physical game.");
  if (!Array.isArray(game.players) || game.players.length < 2 || game.players.length > 6) bad("The backup has an invalid player list.");
  if (!isRecord(game.ownership)) bad("The backup is missing property ownership.");
  for (const deed of [...CITIES, ...UTILITIES]) {
    const ownership = game.ownership[deed.id];
    if (!isRecord(ownership)) bad(`Ownership for ${deed.name} is missing.`);
    if (ownership.propertyId !== deed.id) bad(`Ownership for ${deed.name} does not match.`);
    const houses = asInt(ownership.houses, `${deed.name} houses`);
    if (houses < 0 || houses > 3) bad(`${deed.name} has an invalid house count.`);
    if (typeof ownership.hotel !== "boolean" || typeof ownership.mortgaged !== "boolean") bad(`${deed.name} has invalid development.`);
    if (ownership.ownerId !== null && typeof ownership.ownerId !== "string") bad(`${deed.name} has an invalid owner.`);
  }
  for (const key of Object.keys(game.ownership)) {
    if (!isDeed(key)) bad("The backup contains a property that is not on this board.");
  }
  const playerIds = new Set<string>();
  for (const player of game.players) {
    if (!isRecord(player)) bad("A player record is invalid.");
    asString(player.name, "Player name", 24);
    asString(player.color, "Player colour", 20);
    asInt(player.cash, `${String(player.name)} cash`);
    const position = asInt(player.position, `${String(player.name)} position`);
    if (position < 0 || position >= BOARD_SIZE) bad(`${String(player.name)} is off the board.`);
    if (typeof player.id !== "string" || playerIds.has(player.id)) bad("Player ids must be unique.");
    playerIds.add(player.id);
  }
  const index = asInt(game.currentPlayerIndex, "Current player");
  if (index < 0 || index >= game.players.length) bad("The current player is invalid.");
  asInt(game.turnNumber, "Turn");
  asInt(game.startingCapital, "Starting capital");
  asInt(game.bankLedger, "Bank ledger");
  asInt(game.mortgageInterestPercent, "Mortgage interest");
  asString(game.name, "Game name", 40);
  asString(game.id, "Game id", 40);
  if (!Array.isArray(game.transactions) || !Array.isArray(game.events)) bad("The backup is missing its history.");
  const clone = structuredClone(game) as unknown as PhysicalGame;
  clone.undoStack = Array.isArray(clone.undoStack) ? clone.undoStack.slice(-30) : [];
  clone.voidedTransactions = Array.isArray(clone.voidedTransactions) ? clone.voidedTransactions : [];
  clone.voidedEvents = Array.isArray(clone.voidedEvents) ? clone.voidedEvents : [];
  clone.audit = Array.isArray(clone.audit) ? clone.audit : [];
  return clone;
}

export function downloadName(game: PhysicalGame): string {
  const short = game.id.replace("LOCAL-BB-", "");
  return `business-game-LOCAL-${short}.json`;
}
