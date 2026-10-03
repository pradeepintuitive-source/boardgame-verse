import type { Tile } from "../models/monopoly";

/** India edition board: 40 tiles following the Bharat Empire layout. */
export const BOARD: Tile[] = [
  { index: 0, name: "GO", type: "go" },
  {
    index: 1,
    name: "Manglore",
    type: "property",
    group: "brown",
    price: 600,
    rent: [20, 100, 300, 900, 1600, 2500],
    housePrice: 500,
  },
  { index: 2, name: "Community Chest", shortName: "Chest", type: "chest" },
  {
    index: 3,
    name: "Ranchi",
    type: "property",
    group: "brown",
    price: 600,
    rent: [40, 200, 600, 1800, 3200, 4500],
    housePrice: 500,
  },
  { index: 4, name: "Income Tax", type: "tax", taxAmount: 2000 },
  { index: 5, name: "Indian Railways", shortName: "IR", type: "railroad", price: 2000 },
  {
    index: 6,
    name: "Varanasi",
    type: "property",
    group: "lightblue",
    price: 1000,
    rent: [60, 300, 900, 2700, 4000, 5500],
    housePrice: 500,
  },
  { index: 7, name: "Chance", type: "chance" },
  {
    index: 8,
    name: "Amritsar",
    type: "property",
    group: "lightblue",
    price: 1000,
    rent: [60, 300, 900, 2700, 4000, 5500],
    housePrice: 500,
  },
  {
    index: 9,
    name: "Udaipur",
    type: "property",
    group: "lightblue",
    price: 1200,
    rent: [80, 400, 1000, 3000, 4500, 6000],
    housePrice: 500,
  },
  { index: 10, name: "Jail", type: "jail" },
  {
    index: 11,
    name: "Jaipur",
    type: "property",
    group: "pink",
    price: 1400,
    rent: [100, 500, 1500, 4500, 6250, 7500],
    housePrice: 1000,
  },
  { index: 12, name: "Electricity Board", shortName: "Power", type: "utility", price: 1500 },
  {
    index: 13,
    name: "Lucknow",
    type: "property",
    group: "pink",
    price: 1400,
    rent: [100, 500, 1500, 4500, 6250, 7500],
    housePrice: 1000,
  },
  {
    index: 14,
    name: "Bhopal",
    type: "property",
    group: "pink",
    price: 1600,
    rent: [120, 600, 1800, 5000, 7000, 9000],
    housePrice: 1000,
  },
  { index: 15, name: "Southern Railway", shortName: "S. Rail", type: "railroad", price: 2000 },
  {
    index: 16,
    name: "Surat",
    type: "property",
    group: "orange",
    price: 1800,
    rent: [140, 700, 2000, 5500, 7500, 9500],
    housePrice: 1000,
  },
  { index: 17, name: "Community Chest", shortName: "Chest", type: "chest" },
  {
    index: 18,
    name: "Coimbatore",
    type: "property",
    group: "orange",
    price: 1800,
    rent: [140, 700, 2000, 5500, 7500, 9500],
    housePrice: 1000,
  },
  {
    index: 19,
    name: "Indore",
    type: "property",
    group: "orange",
    price: 2000,
    rent: [160, 800, 2200, 6000, 8000, 10000],
    housePrice: 1000,
  },
  { index: 20, name: "Free Parking", shortName: "Events", type: "free-parking" },
  {
    index: 21,
    name: "Kolkata",
    type: "property",
    group: "red",
    price: 2200,
    rent: [180, 900, 2500, 7000, 8750, 10500],
    housePrice: 1500,
  },
  { index: 22, name: "Chance", type: "chance" },
  {
    index: 23,
    name: "Hyderabad",
    type: "property",
    group: "red",
    price: 2200,
    rent: [180, 900, 2500, 7000, 8750, 10500],
    housePrice: 1500,
  },
  {
    index: 24,
    name: "Bengaluru",
    type: "property",
    group: "red",
    price: 2400,
    rent: [200, 1000, 3000, 7500, 9250, 11000],
    housePrice: 1500,
  },
  { index: 25, name: "Western Railway", shortName: "W. Rail", type: "railroad", price: 2000 },
  {
    index: 26,
    name: "Chennai",
    type: "property",
    group: "yellow",
    price: 2600,
    rent: [220, 1100, 3300, 8000, 9750, 11500],
    housePrice: 1500,
  },
  {
    index: 27,
    name: "Kochi",
    type: "property",
    group: "yellow",
    price: 2600,
    rent: [220, 1100, 3300, 8000, 9750, 11500],
    housePrice: 1500,
  },
  { index: 28, name: "Water Board", shortName: "Water", type: "utility", price: 1500 },
  {
    index: 29,
    name: "Panaji (Goa)",
    shortName: "Panaji",
    type: "property",
    group: "yellow",
    price: 2800,
    rent: [240, 1200, 3600, 8500, 10250, 12000],
    housePrice: 1500,
  },
  { index: 30, name: "Go To Jail", shortName: "To Jail", type: "go-to-jail" },
  {
    index: 31,
    name: "Gurugram",
    type: "property",
    group: "green",
    price: 3000,
    rent: [260, 1300, 3900, 9000, 11000, 12750],
    housePrice: 2000,
  },
  {
    index: 32,
    name: "Noida",
    type: "property",
    group: "green",
    price: 3000,
    rent: [260, 1300, 3900, 9000, 11000, 12750],
    housePrice: 2000,
  },
  { index: 33, name: "Community Chest", shortName: "Chest", type: "chest" },
  {
    index: 34,
    name: "Whitefield",
    type: "property",
    group: "green",
    price: 3200,
    rent: [280, 1500, 4500, 10000, 12000, 14000],
    housePrice: 2000,
  },
  { index: 35, name: "Northern Railway", shortName: "N. Rail", type: "railroad", price: 2000 },
  { index: 36, name: "Chance", type: "chance" },
  {
    index: 37,
    name: "Connaught Place",
    shortName: "C. Place",
    type: "property",
    group: "darkblue",
    price: 3500,
    rent: [350, 1750, 5000, 11000, 13000, 15000],
    housePrice: 2000,
  },
  { index: 38, name: "GST", type: "tax", taxAmount: 1000 },
  {
    index: 39,
    name: "Nariman Point",
    shortName: "Nariman",
    type: "property",
    group: "darkblue",
    price: 4000,
    rent: [500, 2000, 6000, 14000, 17000, 20000],
    housePrice: 2000,
  },
];

export const GROUP_COLORS: Record<string, string> = {
  brown: "#8b4513",
  lightblue: "#87ceeb",
  pink: "#ff69b4",
  orange: "#ff8c00",
  red: "#dc143c",
  yellow: "#facc15",
  green: "#22c55e",
  darkblue: "#1e3a8a",
};

export const GROUP_SIZE: Record<string, number> = {
  brown: 2,
  lightblue: 3,
  pink: 3,
  orange: 3,
  red: 3,
  yellow: 3,
  green: 3,
  darkblue: 2,
};

/** Tile indices grouped by color. */
export const GROUP_TILES: Record<string, number[]> = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [37, 39],
};

export const RAILROAD_TILES = [5, 15, 25, 35];
export const UTILITY_TILES = [12, 28];

/** Rent by number of railways owned (1–4). Scaled for Bharat economy. */
export const RAILROAD_RENT = [250, 500, 1000, 2000];

/** Empty=0 … Metro=4, Smart City=5 (hotel). */
export const DEVELOPMENT_LABELS = [
  "Empty Land",
  "Village",
  "Town",
  "City",
  "Metro",
  "Smart City",
] as const;

export function developmentLabel(houses: number): string {
  if (houses >= 5) return DEVELOPMENT_LABELS[5];
  if (houses <= 0) return DEVELOPMENT_LABELS[0];
  return DEVELOPMENT_LABELS[houses];
}

export function shortTileName(tile: { name: string; shortName?: string }): string {
  if (tile.shortName) return tile.shortName;
  if (tile.name.length <= 10) return tile.name;
  return `${tile.name.slice(0, 9)}…`;
}

export const TOKEN_COLORS = ["#00f2ff", "#ff00e5", "#facc15", "#4ade80", "#fb923c", "#a78bfa"];
