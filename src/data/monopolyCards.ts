export interface DeckCard {
  text: string;
  action:
    | { kind: "move"; to: number; collectGoIfPass?: boolean }
    | { kind: "moveRel"; steps: number }
    | { kind: "money"; amount: number } // positive = gain, negative = pay
    | { kind: "moneyFromEach"; amount: number } // collect from each player
    | { kind: "jail" }
    | { kind: "getOutCard" }
    | { kind: "repairs"; perHouse: number; perHotel: number }
    | { kind: "nearest"; kind2: "railroad" | "utility" };
}

export const CHANCE_CARDS: DeckCard[] = [
  { text: "Advance to GO. Collect $200.", action: { kind: "move", to: 0, collectGoIfPass: true } },
  { text: "Advance to Illinois Ave.", action: { kind: "move", to: 24, collectGoIfPass: true } },
  {
    text: "Advance to St. Charles Place.",
    action: { kind: "move", to: 11, collectGoIfPass: true },
  },
  { text: "Advance to Boardwalk.", action: { kind: "move", to: 39 } },
  { text: "Advance to nearest Railroad.", action: { kind: "nearest", kind2: "railroad" } },
  { text: "Advance to nearest Utility.", action: { kind: "nearest", kind2: "utility" } },
  { text: "Bank pays you dividend of $50.", action: { kind: "money", amount: 50 } },
  { text: "Get Out of Jail Free.", action: { kind: "getOutCard" } },
  { text: "Go back 3 spaces.", action: { kind: "moveRel", steps: -3 } },
  { text: "Go directly to Jail.", action: { kind: "jail" } },
  {
    text: "Make general repairs: $25 per house, $100 per hotel.",
    action: { kind: "repairs", perHouse: 25, perHotel: 100 },
  },
  { text: "Speeding fine $15.", action: { kind: "money", amount: -15 } },
  {
    text: "Take a trip to Reading Railroad.",
    action: { kind: "move", to: 5, collectGoIfPass: true },
  },
  {
    text: "Elected Chairman — pay each player $50.",
    action: { kind: "moneyFromEach", amount: -50 },
  },
  { text: "Building loan matures. Collect $150.", action: { kind: "money", amount: 150 } },
  { text: "Crossword competition. Collect $100.", action: { kind: "money", amount: 100 } },
];

export const CHEST_CARDS: DeckCard[] = [
  { text: "Advance to GO. Collect $200.", action: { kind: "move", to: 0, collectGoIfPass: true } },
  { text: "Bank error in your favor. Collect $200.", action: { kind: "money", amount: 200 } },
  { text: "Doctor's fees. Pay $50.", action: { kind: "money", amount: -50 } },
  { text: "From sale of stock you get $50.", action: { kind: "money", amount: 50 } },
  { text: "Get Out of Jail Free.", action: { kind: "getOutCard" } },
  { text: "Go directly to Jail.", action: { kind: "jail" } },
  { text: "Holiday fund matures. Collect $100.", action: { kind: "money", amount: 100 } },
  { text: "Income tax refund. Collect $20.", action: { kind: "money", amount: 20 } },
  {
    text: "It's your birthday — collect $10 from each player.",
    action: { kind: "moneyFromEach", amount: 10 },
  },
  { text: "Life insurance matures. Collect $100.", action: { kind: "money", amount: 100 } },
  { text: "Pay hospital fees of $100.", action: { kind: "money", amount: -100 } },
  { text: "Pay school fees of $50.", action: { kind: "money", amount: -50 } },
  { text: "Receive $25 consultancy fee.", action: { kind: "money", amount: 25 } },
  {
    text: "Street repairs: $40 per house, $115 per hotel.",
    action: { kind: "repairs", perHouse: 40, perHotel: 115 },
  },
  { text: "You inherit $100.", action: { kind: "money", amount: 100 } },
  {
    text: "You won second prize in a beauty contest. Collect $10.",
    action: { kind: "money", amount: 10 },
  },
];
