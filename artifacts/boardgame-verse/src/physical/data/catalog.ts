import type { CityDef, ColorGroupId, InstructionCard, SpaceDef, UtilityDef } from "../types";

/**
 * Single source of truth for the physical BUSINESS board in the reference photos.
 * Movement is clockwise from Start (bottom-left of the photo): right along the
 * bottom, up the right side, left along the top, down the left side.
 * 10 spaces per side, corners shared → 36 spaces.
 */

export const START_SALARY = 1500;
export const DEFAULT_STARTING_CAPITAL = 30000;
export const MIN_STARTING_CAPITAL = 30000;
export const MAX_STARTING_CAPITAL = 50000;
export const WEALTH_TAX_PER_HOUSE = 50;
export const WEALTH_TAX_PER_HOTEL = 100;
export const WEALTH_TAX_CAP = 500;
export const DOUBLES_TO_JAIL = 3;
/** Unimproved rent doubles once a player owns this many sites of the colour. */
export const COLOR_SET_FOR_DOUBLE_RENT = 3;

export const COLOR_GROUPS: Record<ColorGroupId, { label: string; hex: string; propertyIds: string[] }> = {
  green: {
    label: "Green",
    hex: "#1f8a4c",
    propertyIds: ["MUMBAI", "KOLKATA", "PUNE", "AHMEDABAD", "DELHI"],
  },
  yellow: {
    label: "Yellow",
    hex: "#e6b325",
    propertyIds: ["BANGALORE", "CHENNAI", "HYDERABAD", "GOA", "AMRITSAR"],
  },
  red: {
    label: "Red",
    hex: "#c0392b",
    propertyIds: ["SHIMLA", "LADAKH", "DARJEELING", "CHANDIGARH", "COCHIN"],
  },
  blue: {
    label: "Blue",
    hex: "#2e86c1",
    propertyIds: ["PATNA", "KANPUR", "AGRA", "JAIPUR", "INDORE"],
  },
};

export const PLAYER_COLOR_OPTIONS = [
  { id: "green", label: "Green", hex: "#1f9d55" },
  { id: "blue", label: "Blue", hex: "#2563eb" },
  { id: "red", label: "Red", hex: "#dc2626" },
  { id: "yellow", label: "Yellow", hex: "#ca8a04" },
  { id: "orange", label: "Orange", hex: "#ea580c" },
  { id: "purple", label: "Purple", hex: "#7c3aed" },
] as const;

function city(
  id: string,
  name: string,
  colorGroup: ColorGroupId,
  purchasePrice: number,
  rent: [number, number, number, number, number],
  houseCost: number,
  hotelCost: number,
  mortgageValue: number,
): CityDef {
  return {
    id,
    name,
    colorGroup,
    purchasePrice,
    rent: { site: rent[0], house1: rent[1], house2: rent[2], house3: rent[3], hotel: rent[4] },
    houseCost,
    hotelCost,
    mortgageValue,
  };
}

/** Rents, house costs, and mortgages read from the title-deed photograph. */
export const CITIES: CityDef[] = [
  city("MUMBAI", "Mumbai", "green", 9000, [900, 3500, 5000, 7000, 8500], 5000, 5000, 5500),
  city("KOLKATA", "Kolkata", "green", 4000, [400, 1500, 3000, 4200, 5000], 3500, 3500, 2200),
  city("PUNE", "Pune", "green", 3000, [200, 900, 1600, 2500, 3500], 3000, 3000, 1250),
  city("AHMEDABAD", "Ahmedabad", "green", 3500, [200, 1000, 2500, 3500, 4500], 3000, 3000, 1750),
  city("DELHI", "Delhi", "green", 6000, [300, 1500, 2700, 4000, 5500], 4000, 4000, 3000),
  city("BANGALORE", "Bangalore", "yellow", 5000, [900, 3500, 5000, 7000, 8500], 6500, 6500, 3000),
  city("CHENNAI", "Chennai", "yellow", 7000, [400, 1500, 3000, 4500, 5500], 4500, 4500, 4000),
  city("HYDERABAD", "Hyderabad", "yellow", 3500, [200, 1200, 2600, 3500, 5000], 3000, 3000, 1750),
  city("GOA", "Goa", "yellow", 4000, [700, 3000, 4300, 5500, 7500], 5000, 5000, 2500),
  city("AMRITSAR", "Amritsar", "yellow", 4500, [300, 1400, 2800, 4000, 5000], 4500, 4500, 2250),
  city("SHIMLA", "Shimla", "red", 3500, [500, 1200, 2700, 4500, 6000], 3000, 3000, 1750),
  city("LADAKH", "Ladakh", "red", 6500, [800, 3200, 4500, 6500, 8000], 6000, 6000, 4000),
  city("DARJEELING", "Darjeeling", "red", 2500, [1200, 4000, 5500, 7500, 9000], 7500, 7500, 1250),
  city("CHANDIGARH", "Chandigarh", "red", 4000, [300, 1200, 3000, 4500, 6000], 5000, 5000, 2000),
  city("COCHIN", "Cochin", "red", 3000, [400, 2200, 3500, 5000, 6500], 4500, 4500, 1500),
  city("PATNA", "Patna", "blue", 2000, [200, 900, 1600, 2500, 3500], 3000, 3000, 1000),
  city("KANPUR", "Kanpur", "blue", 4000, [400, 1500, 3000, 4500, 4500], 4500, 4500, 2000),
  city("AGRA", "Agra", "blue", 6500, [100, 600, 1500, 2500, 3500], 2000, 2000, 4000),
  city("JAIPUR", "Jaipur", "blue", 3000, [200, 800, 1600, 2300, 4500], 2500, 2500, 1500),
  city("INDORE", "Indore", "blue", 1500, [200, 1500, 2700, 4000, 5500], 4000, 4000, 750),
];

export const UTILITIES: UtilityDef[] = [
  {
    id: "WATERWAYS",
    name: "Waterways",
    purchasePrice: 3000,
    mortgageValue: 1500,
    rentKind: "dice",
    multiplier: 30,
    pairMultiplier: 75,
    pairWith: "ELECTRICITY",
  },
  {
    id: "ELECTRICITY",
    name: "Electricity",
    purchasePrice: 3500,
    mortgageValue: 1750,
    rentKind: "dice",
    multiplier: 20,
    pairMultiplier: 40,
    pairWith: "WATERWAYS",
  },
  {
    id: "AIRWAYS",
    name: "Airways",
    purchasePrice: 11000,
    mortgageValue: 5500,
    rentKind: "fixed",
    rent: 1500,
    pairRent: 2200,
    pairWith: "INTERNET",
  },
  {
    id: "INTERNET",
    name: "Internet",
    purchasePrice: 6000,
    mortgageValue: 4000,
    rentKind: "fixed",
    rent: 600,
    pairRent: 1500,
    pairWith: "AIRWAYS",
  },
  {
    id: "RAILWAYS",
    name: "Railways",
    purchasePrice: 9500,
    mortgageValue: 5000,
    rentKind: "fixed",
    rent: 1200,
    pairRent: 2000,
    pairWith: "ROADWAYS",
  },
  {
    id: "ROADWAYS",
    name: "Roadways",
    purchasePrice: 9500,
    mortgageValue: 5500,
    rentKind: "fixed",
    rent: 800,
    pairRent: 1600,
    pairWith: "RAILWAYS",
    note: "The board space reads ₹9,500. A close crop of the Roadways deed also looked like ₹3,500, with rent ₹800 or ₹1,600 if Railways is owned. Board price is used. Mortgage ₹5,500 is from the deed sheet and should be checked on the card.",
  },
];

export const SPACES: SpaceDef[] = [
  { id: "START", position: 0, name: "Start", type: "START" },
  { id: "MUMBAI", position: 1, name: "Mumbai", type: "PROPERTY", propertyId: "MUMBAI", colorGroup: "green" },
  { id: "WATERWAYS", position: 2, name: "Waterways", type: "UTILITY", propertyId: "WATERWAYS" },
  { id: "KOLKATA", position: 3, name: "Kolkata", type: "PROPERTY", propertyId: "KOLKATA", colorGroup: "green" },
  { id: "PUNE", position: 4, name: "Pune", type: "PROPERTY", propertyId: "PUNE", colorGroup: "green" },
  { id: "WEALTH_TAX", position: 5, name: "Wealth Tax", type: "TAX", tax: "wealth" },
  { id: "BANGALORE", position: 6, name: "Bangalore", type: "PROPERTY", propertyId: "BANGALORE", colorGroup: "yellow" },
  { id: "CHEST_BOTTOM", position: 7, name: "Community Chest", type: "COMMUNITY_CHEST" },
  { id: "CHENNAI", position: 8, name: "Chennai", type: "PROPERTY", propertyId: "CHENNAI", colorGroup: "yellow" },
  { id: "REST_HOUSE", position: 9, name: "Rest House", type: "REST_HOUSE" },
  { id: "SHIMLA", position: 10, name: "Shimla", type: "PROPERTY", propertyId: "SHIMLA", colorGroup: "red" },
  { id: "LADAKH", position: 11, name: "Ladakh", type: "PROPERTY", propertyId: "LADAKH", colorGroup: "red" },
  { id: "AIRWAYS", position: 12, name: "Airways", type: "UTILITY", propertyId: "AIRWAYS" },
  { id: "DARJEELING", position: 13, name: "Darjeeling", type: "PROPERTY", propertyId: "DARJEELING", colorGroup: "red" },
  { id: "PATNA", position: 14, name: "Patna", type: "PROPERTY", propertyId: "PATNA", colorGroup: "blue" },
  { id: "CHANCE_RIGHT", position: 15, name: "Chance", type: "CHANCE" },
  { id: "KANPUR", position: 16, name: "Kanpur", type: "PROPERTY", propertyId: "KANPUR", colorGroup: "blue" },
  { id: "AGRA", position: 17, name: "Agra", type: "PROPERTY", propertyId: "AGRA", colorGroup: "blue" },
  { id: "CLUB", position: 18, name: "Club", type: "CLUB" },
  { id: "HYDERABAD", position: 19, name: "Hyderabad", type: "PROPERTY", propertyId: "HYDERABAD", colorGroup: "yellow" },
  { id: "CHEST_TOP", position: 20, name: "Community Chest", type: "COMMUNITY_CHEST" },
  { id: "GOA", position: 21, name: "Goa", type: "PROPERTY", propertyId: "GOA", colorGroup: "yellow" },
  { id: "AMRITSAR", position: 22, name: "Amritsar", type: "PROPERTY", propertyId: "AMRITSAR", colorGroup: "yellow" },
  { id: "ROADWAYS", position: 23, name: "Roadways", type: "UTILITY", propertyId: "ROADWAYS" },
  { id: "ELECTRICITY", position: 24, name: "Electricity", type: "UTILITY", propertyId: "ELECTRICITY" },
  { id: "AHMEDABAD", position: 25, name: "Ahmedabad", type: "PROPERTY", propertyId: "AHMEDABAD", colorGroup: "green" },
  { id: "DELHI", position: 26, name: "Delhi", type: "PROPERTY", propertyId: "DELHI", colorGroup: "green" },
  { id: "JAIL", position: 27, name: "Jail", type: "JAIL" },
  { id: "JAIPUR", position: 28, name: "Jaipur", type: "PROPERTY", propertyId: "JAIPUR", colorGroup: "blue" },
  { id: "CHANCE_LEFT", position: 29, name: "Chance", type: "CHANCE" },
  { id: "INDORE", position: 30, name: "Indore", type: "PROPERTY", propertyId: "INDORE", colorGroup: "blue" },
  { id: "INCOME_TAX", position: 31, name: "Income Tax", type: "TAX", tax: "income" },
  { id: "CHANDIGARH", position: 32, name: "Chandigarh", type: "PROPERTY", propertyId: "CHANDIGARH", colorGroup: "red" },
  { id: "RAILWAYS", position: 33, name: "Railways", type: "UTILITY", propertyId: "RAILWAYS" },
  { id: "INTERNET", position: 34, name: "Internet", type: "UTILITY", propertyId: "INTERNET" },
  { id: "COCHIN", position: 35, name: "Cochin", type: "PROPERTY", propertyId: "COCHIN", colorGroup: "red" },
];

export const BOARD_SIZE = SPACES.length;

/** Chance line 11: party fee paid to the bank on arriving at Club. */
export const CLUB_PARTY_FEE = 1500;

/**
 * Chance and Community Chest are printed charts on the board, not a shuffled deck.
 * The dice total that landed the player selects the numbered line.
 * Odd totals use one chart, even totals the other.
 * Lines marked uncertain were partly hidden by the ribbon or the centre fold.
 */
export const CARDS: InstructionCard[] = [
  {
    id: "chance-2",
    deck: "chance",
    diceTotal: 2,
    title: "Crossword competition",
    text: "You have won a crossword competition. Collect ₹1,000 from the Bank.",
    effect: { type: "collect-bank", amount: 1000 },
    uncertain: false,
  },
  {
    id: "chance-3",
    deck: "chance",
    diceTotal: 3,
    title: "Diwali gift",
    text: "Diwali gift. Pay each player ₹500.",
    effect: { type: "pay-each", amount: 500 },
    uncertain: false,
  },
  {
    id: "chance-4",
    deck: "chance",
    diceTotal: 4,
    title: "Go to Rest House",
    text: "Go to Rest House.",
    effect: { type: "advance", spaceId: "REST_HOUSE", collectStart: true },
    uncertain: false,
  },
  {
    id: "chance-5",
    deck: "chance",
    diceTotal: 5,
    title: "Life insurance matures",
    text: "Life insurance matures. Collect ₹2,000 from the Bank.",
    effect: { type: "collect-bank", amount: 2000 },
    uncertain: false,
  },
  {
    id: "chance-6",
    deck: "chance",
    diceTotal: 6,
    title: "Miss a turn",
    text: "You cannot play next turn.",
    effect: { type: "skip-turn" },
    uncertain: true,
  },
  {
    id: "chance-7",
    deck: "chance",
    diceTotal: 7,
    title: "Jackpot",
    text: "You have won a jackpot. Collect ₹4,000 from the Bank.",
    effect: { type: "collect-bank", amount: 4000 },
    uncertain: false,
  },
  {
    id: "chance-8",
    deck: "chance",
    diceTotal: 8,
    title: "Fire in the godown",
    text: "Loss due to fire in the godown. Pay ₹1,500 to the Bank.",
    effect: { type: "pay-bank", amount: 1500 },
    uncertain: true,
  },
  {
    id: "chance-9",
    deck: "chance",
    diceTotal: 9,
    title: "Insurance premium",
    text: "Pay insurance premium ₹2,000 to the Bank.",
    effect: { type: "pay-bank", amount: 2000 },
    uncertain: false,
  },
  {
    id: "chance-10",
    deck: "chance",
    diceTotal: 10,
    title: "Advance to Start",
    text: "Advance to Start and collect ₹1,500.",
    effect: { type: "advance", spaceId: "START", collectStart: true },
    uncertain: true,
  },
  {
    id: "chance-11",
    deck: "chance",
    diceTotal: 11,
    title: "Go to Club",
    text: "Go to Club. Pay ₹1,500 for the party.",
    effect: { type: "advance", spaceId: "CLUB", collectStart: true, thenPayBank: CLUB_PARTY_FEE },
    uncertain: false,
  },
  {
    id: "chance-12",
    deck: "chance",
    diceTotal: 12,
    title: "Stock market loss",
    text: "Loss in the stock market. Pay ₹2,000 to the Bank.",
    effect: { type: "pay-bank", amount: 2000 },
    uncertain: true,
  },
  {
    id: "chest-2",
    deck: "community",
    diceTotal: 2,
    title: "Birthday",
    text: "It's your birthday. Collect ₹500 from each player.",
    effect: { type: "collect-each", amount: 500 },
    uncertain: false,
  },
  {
    id: "chest-3",
    deck: "community",
    diceTotal: 3,
    title: "Interest on shares",
    text: "Received interest on shares. Collect ₹2,000 from the Bank.",
    effect: { type: "collect-bank", amount: 2000 },
    uncertain: false,
  },
  {
    id: "chest-4",
    deck: "community",
    diceTotal: 4,
    title: "Building loan matures",
    text: "Your building loan matures. Collect ₹1,500 from the Bank.",
    effect: { type: "collect-bank", amount: 1500 },
    uncertain: false,
  },
  {
    id: "chest-5",
    deck: "community",
    diceTotal: 5,
    title: "Go to Jail",
    text: "Go to Jail. Do not pass Start.",
    effect: { type: "go-to-jail" },
    uncertain: false,
  },
  {
    id: "chest-6",
    deck: "community",
    diceTotal: 6,
    title: "Swachh Bharat award",
    text: "Swachh Bharat Abhiyan cleanliness award. Collect ₹2,000 from the Bank.",
    effect: { type: "collect-bank", amount: 2000 },
    uncertain: false,
  },
  {
    id: "chest-7",
    deck: "community",
    diceTotal: 7,
    title: "Income tax refund",
    text: "Income tax refund. Collect ₹1,500 from the Bank.",
    effect: { type: "collect-bank", amount: 1500 },
    uncertain: true,
  },
  {
    id: "chest-8",
    deck: "community",
    diceTotal: 8,
    title: "Poor tax",
    text: "Pay poor tax ₹3,000 to the Bank.",
    effect: { type: "pay-bank", amount: 3000 },
    uncertain: false,
  },
  {
    id: "chest-9",
    deck: "community",
    diceTotal: 9,
    title: "Marriage celebration",
    text: "Marriage celebration. Pay ₹2,000 to the Bank.",
    effect: { type: "pay-bank", amount: 2000 },
    uncertain: true,
  },
  {
    id: "chest-10",
    deck: "community",
    diceTotal: 10,
    title: "School and medical fees",
    text: "Pay school and medical fees ₹1,500 to the Bank.",
    effect: { type: "pay-bank", amount: 1500 },
    uncertain: false,
  },
  {
    id: "chest-11",
    deck: "community",
    diceTotal: 11,
    title: "General repairs",
    text: "Make general repairs on all your properties. Pay ₹100 for each house and ₹150 for each hotel to the Bank.",
    effect: { type: "repairs", perHouse: 100, perHotel: 150 },
    uncertain: true,
  },
  {
    id: "chest-12",
    deck: "community",
    diceTotal: 12,
    title: "Dividend",
    text: "Bank pays you a dividend of ₹3,000.",
    effect: { type: "collect-bank", amount: 3000 },
    uncertain: false,
  },
];

export const RULES_SUMMARY: { heading: string; body: string }[] = [
  {
    heading: "Capital",
    body: "Each player starts with the same amount, from ₹30,000 to ₹50,000, agreed before the game. Default is ₹30,000. If the bank has no cash at the start, money still flows as the game proceeds.",
  },
  {
    heading: "Start and doubles",
    body: "Highest opening roll starts. Start pays ₹1,500 when you pass or land on it. A double counts, the player takes the space, then rolls again. A third double in a row sends the player to Jail immediately, without moving.",
  },
  {
    heading: "Buying, rent, and auction",
    body: "The bank sells a site only to the player who landed on it, at the printed price. Players may trade with each other freely. Rent is the title-deed rent. If the player declines or cannot buy, the bank auctions the site.",
  },
  {
    heading: "Colour groups",
    body: "Owning three sites of a colour doubles rent on unimproved sites of that colour. Houses and a hotel need the complete colour group. At most three houses on a site. A hotel replaces those three houses: pay the hotel cost and return the three houses. Only one hotel per site.",
  },
  {
    heading: "Chance and Community Chest",
    body: "The charts are printed on the board. The dice total that landed you there selects the line. Odd totals use the odd chart. Even totals use the even chart.",
  },
  {
    heading: "Wealth tax",
    body: "On Wealth Tax pay ₹50 for each house and ₹100 for each hotel. The tax cannot exceed ₹500.",
  },
  {
    heading: "Rest House, Club, and Jail",
    body: "Rest House and Club have no fee printed on the space. Club charges ₹1,500 only when the Chance line sends you there for a party. Jail is entered on a third double or the Community Chest line that says go to Jail without passing Start.",
  },
];

const cityById = new Map(CITIES.map((city) => [city.id, city]));
const utilityById = new Map(UTILITIES.map((utility) => [utility.id, utility]));
const spaceById = new Map(SPACES.map((space) => [space.id, space]));
const cardById = new Map(CARDS.map((card) => [card.id, card]));

export function getCity(id: string): CityDef | undefined {
  return cityById.get(id);
}

export function getUtility(id: string): UtilityDef | undefined {
  return utilityById.get(id);
}

export function getSpace(id: string): SpaceDef {
  const space = spaceById.get(id);
  if (!space) throw new Error(`Unknown space ${id}`);
  return space;
}

export function spaceAt(position: number): SpaceDef {
  const space = SPACES[position];
  if (!space) throw new Error(`Position ${position} is off the board`);
  return space;
}

export function getCard(id: string): InstructionCard {
  const card = cardById.get(id);
  if (!card) throw new Error(`Unknown card ${id}`);
  return card;
}

export function cardForRoll(deck: "chance" | "community", diceTotal: number): InstructionCard {
  const card = CARDS.find((entry) => entry.deck === deck && entry.diceTotal === diceTotal);
  if (!card) throw new Error(`No ${deck} line for a roll of ${diceTotal}`);
  return card;
}

export function purchasePriceOf(propertyId: string): number {
  return getCity(propertyId)?.purchasePrice ?? getUtility(propertyId)?.purchasePrice ?? 0;
}

export function mortgageValueOf(propertyId: string): number {
  return getCity(propertyId)?.mortgageValue ?? getUtility(propertyId)?.mortgageValue ?? 0;
}

export function propertyName(propertyId: string): string {
  return getCity(propertyId)?.name ?? getUtility(propertyId)?.name ?? propertyId;
}

export function isDeed(propertyId: string): boolean {
  return cityById.has(propertyId) || utilityById.has(propertyId);
}

export function colorGroupOf(propertyId: string): ColorGroupId | null {
  return getCity(propertyId)?.colorGroup ?? null;
}
