export type TileType =
  | "go"
  | "property"
  | "railroad"
  | "utility"
  | "tax"
  | "chance"
  | "chest"
  | "jail"
  | "go-to-jail"
  | "free-parking";

export type ColorGroup =
  | "brown"
  | "lightblue"
  | "pink"
  | "orange"
  | "red"
  | "yellow"
  | "green"
  | "darkblue";

export interface Tile {
  index: number; // 0..39
  name: string;
  type: TileType;
  price?: number;
  rent?: number[]; // [base, 1h, 2h, 3h, 4h, hotel] (properties)
  housePrice?: number;
  group?: ColorGroup;
  taxAmount?: number;
}

export interface PropertyState {
  ownerId: string | null;
  houses: number; // 0..4, 5 = hotel
  mortgaged: boolean;
}

export interface MonopolyPlayer {
  id: string;
  userId?: string;
  username: string;
  avatarColor: string;
  isAI: boolean;
  position: number;
  cash: number;
  inJail: boolean;
  jailTurns: number;
  jailCards: number;
  bankrupt: boolean;
}

export interface DiceRoll {
  d1: number;
  d2: number;
  isDouble: boolean;
  rolledAt: number;
}

export interface Auction {
  tileIndex: number;
  bids: { playerId: string; amount: number }[];
  currentBidderIndex: number; // index into activePlayerIds
  activePlayerIds: string[];
  highestBid: number;
  highestBidderId: string | null;
  startedAt: number;
}

export interface TradeOffer {
  id: string;
  fromId: string;
  toId: string;
  fromProps: number[];
  fromCash: number;
  fromJailCards: number;
  toProps: number[];
  toCash: number;
  toJailCards: number;
  status: "pending" | "accepted" | "declined";
}

export type MonopolyPhase =
  | "rolling"
  | "moving"
  | "landed" // awaiting action on landed tile
  | "auction"
  | "trade"
  | "ended";

export interface MonopolyLog {
  id: string;
  text: string;
  ts: number;
  kind: "info" | "money" | "event" | "trade";
}

export interface MonopolyState {
  gameId: string;
  players: MonopolyPlayer[];
  currentPlayerIndex: number;
  phase: MonopolyPhase;
  lastRoll: DiceRoll | null;
  consecutiveDoubles: number;
  properties: Record<number, PropertyState>;
  chanceDeck: number[];
  chestDeck: number[];
  pendingPurchaseTile: number | null;
  pendingCard: { deck: "chance" | "chest"; index: number } | null;
  auction: Auction | null;
  trade: TradeOffer | null;
  log: MonopolyLog[];
  winnerId: string | null;
}
