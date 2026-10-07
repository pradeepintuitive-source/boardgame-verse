export const SCHEMA_VERSION = 1 as const;
export const DB_VERSION = 1 as const;

export type SpaceType =
  | "START"
  | "PROPERTY"
  | "UTILITY"
  | "TAX"
  | "CHANCE"
  | "COMMUNITY_CHEST"
  | "REST_HOUSE"
  | "CLUB"
  | "JAIL";

export type ColorGroupId = "green" | "yellow" | "red" | "blue";

export type PlayerStatus = "active" | "bankrupt" | "retired" | "winner";

export type GameStatus = "active" | "finished";

export type Phase = "roll" | "resolve" | "extra-roll" | "finished";

export interface CityRent {
  site: number;
  house1: number;
  house2: number;
  house3: number;
  hotel: number;
}

export interface CityDef {
  id: string;
  name: string;
  colorGroup: ColorGroupId;
  purchasePrice: number;
  rent: CityRent;
  houseCost: number;
  hotelCost: number;
  mortgageValue: number;
}

export interface UtilityDef {
  id: string;
  name: string;
  purchasePrice: number;
  mortgageValue: number;
  /** Dice-multiple utilities (Waterways, Electricity) or fixed-rent utilities. */
  rentKind: "dice" | "fixed";
  multiplier?: number;
  pairMultiplier?: number;
  rent?: number;
  pairRent?: number;
  pairWith: string;
  note?: string;
}

export interface SpaceDef {
  id: string;
  position: number;
  name: string;
  type: SpaceType;
  propertyId?: string;
  colorGroup?: ColorGroupId;
  tax?: "wealth" | "income";
}

export type CardEffect =
  | { type: "pay-bank"; amount: number }
  | { type: "collect-bank"; amount: number }
  | { type: "pay-each"; amount: number }
  | { type: "collect-each"; amount: number }
  | { type: "advance"; spaceId: string; collectStart: boolean; thenPayBank?: number }
  | { type: "go-to-jail" }
  | { type: "skip-turn" }
  | { type: "repairs"; perHouse: number; perHotel: number };

export interface InstructionCard {
  id: string;
  deck: "chance" | "community";
  diceTotal: number;
  title: string;
  text: string;
  effect: CardEffect;
  /** Photo was partly covered or the amount was hard to read. */
  uncertain: boolean;
}

export interface Ownership {
  propertyId: string;
  ownerId: string | null;
  houses: number;
  hotel: boolean;
  mortgaged: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  color: string;
  cash: number;
  position: number;
  inPrison: boolean;
  prisonTurns: number;
  skipNextTurn: boolean;
  status: PlayerStatus;
  consecutiveDoubles: number;
}

export interface LedgerEntry {
  id: string;
  gameId: string;
  timestamp: number;
  type: string;
  fromId: string;
  toId: string;
  amount: number;
  propertyId?: string;
  description: string;
  voided?: boolean;
}

export interface GameEvent {
  id: string;
  gameId: string;
  timestamp: number;
  type: string;
  message: string;
  playerId?: string;
  voided?: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  message: string;
}

export interface Bid {
  playerId: string;
  amount: number;
}

export type PendingAction =
  | { kind: "buy"; spaceId: string; price: number }
  | {
      kind: "rent";
      spaceId: string;
      amount: number;
      payerId: string;
      ownerId: string;
      breakdown: string;
    }
  | {
      kind: "tax";
      tax: "wealth" | "income";
      amount: number;
      editable: boolean;
      detail: string;
    }
  | { kind: "card"; cardId: string; passedStart: number }
  | { kind: "auction"; spaceId: string; bids: Bid[] }
  | { kind: "info"; title: string; detail: string };

export interface UndoFrame {
  description: string;
  state: PhysicalGame;
}

export interface PhysicalGame {
  schemaVersion: typeof SCHEMA_VERSION;
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  startedAt: number;
  finishedAt: number | null;
  status: GameStatus;
  startingCapital: number;
  /** Interest added when a mortgage is released. 0 until a rule is supplied. */
  mortgageInterestPercent: number;
  /** Net cash the bank has received minus cash it has paid. May be negative: the rule sheet says money starts flowing even if the bank begins empty. */
  bankLedger: number;
  players: PlayerState[];
  ownership: Record<string, Ownership>;
  currentPlayerIndex: number;
  turnNumber: number;
  phase: Phase;
  pending: PendingAction | null;
  lastDice: { die1: number; die2: number } | null;
  /** Salary collected while resolving the current move, for the banker to see. */
  passedStartAmount: number;
  transactions: LedgerEntry[];
  voidedTransactions: LedgerEntry[];
  events: GameEvent[];
  voidedEvents: GameEvent[];
  audit: AuditEntry[];
  undoStack: UndoFrame[];
  winnerId: string | null;
  notice: string | null;
}

export interface EngineSuccess {
  ok: true;
  state: PhysicalGame;
}

export interface EngineFailure {
  ok: false;
  error: string;
}

export type EngineResult = EngineSuccess | EngineFailure;

export interface CreateGameInput {
  name: string;
  startingCapital: number;
  firstPlayerIndex: number;
  players: { name: string; color: string }[];
}

export interface NetWorth {
  cash: number;
  propertyCount: number;
  houses: number;
  hotels: number;
  mortgageDebt: number;
  assetValue: number;
  netWorth: number;
}
