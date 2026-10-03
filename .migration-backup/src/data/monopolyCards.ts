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
  { text: "Advance to GO. Collect ₹2,000.", action: { kind: "move", to: 0, collectGoIfPass: true } },
  { text: "Advance to Bengaluru.", action: { kind: "move", to: 24, collectGoIfPass: true } },
  { text: "Advance to Jaipur.", action: { kind: "move", to: 11, collectGoIfPass: true } },
  { text: "Advance to Nariman Point.", action: { kind: "move", to: 39 } },
  { text: "Advance to nearest Railway.", action: { kind: "nearest", kind2: "railroad" } },
  { text: "Advance to nearest Utility.", action: { kind: "nearest", kind2: "utility" } },
  { text: "Bank pays you dividend of ₹500.", action: { kind: "money", amount: 500 } },
  { text: "Get Out of Jail Free.", action: { kind: "getOutCard" } },
  { text: "Go back 3 spaces.", action: { kind: "moveRel", steps: -3 } },
  { text: "Go directly to Jail.", action: { kind: "jail" } },
  {
    text: "Festival repairs: ₹250 per Village/Town/City/Metro, ₹1,000 per Smart City.",
    action: { kind: "repairs", perHouse: 250, perHotel: 1000 },
  },
  { text: "Traffic fine ₹150.", action: { kind: "money", amount: -150 } },
  { text: "Take a trip to Indian Railways.", action: { kind: "move", to: 5, collectGoIfPass: true } },
  { text: "Elected city chair — pay each player ₹500.", action: { kind: "moneyFromEach", amount: -500 } },
  { text: "Startup grant matures. Collect ₹1,500.", action: { kind: "money", amount: 1500 } },
  { text: "Festival contest prize. Collect ₹1,000.", action: { kind: "money", amount: 1000 } },
];

export const CHEST_CARDS: DeckCard[] = [
  { text: "Advance to GO. Collect ₹2,000.", action: { kind: "move", to: 0, collectGoIfPass: true } },
  { text: "Bank error in your favor. Collect ₹2,000.", action: { kind: "money", amount: 2000 } },
  { text: "Doctor's fees. Pay ₹500.", action: { kind: "money", amount: -500 } },
  { text: "From sale of stock you get ₹500.", action: { kind: "money", amount: 500 } },
  { text: "Get Out of Jail Free.", action: { kind: "getOutCard" } },
  { text: "Go directly to Jail.", action: { kind: "jail" } },
  { text: "Holiday fund matures. Collect ₹1,000.", action: { kind: "money", amount: 1000 } },
  { text: "Tax refund. Collect ₹200.", action: { kind: "money", amount: 200 } },
  { text: "It's your birthday — collect ₹100 from each player.", action: { kind: "moneyFromEach", amount: 100 } },
  { text: "Insurance payout. Collect ₹1,000.", action: { kind: "money", amount: 1000 } },
  { text: "Pay hospital fees of ₹1,000.", action: { kind: "money", amount: -1000 } },
  { text: "Pay school fees of ₹500.", action: { kind: "money", amount: -500 } },
  { text: "Receive ₹250 consultancy fee.", action: { kind: "money", amount: 250 } },
  {
    text: "Street repairs: ₹400 per Village–Metro, ₹1,150 per Smart City.",
    action: { kind: "repairs", perHouse: 400, perHotel: 1150 },
  },
  { text: "You inherit ₹1,000.", action: { kind: "money", amount: 1000 } },
  { text: "You won a cultural fest prize. Collect ₹100.", action: { kind: "money", amount: 100 } },
];
