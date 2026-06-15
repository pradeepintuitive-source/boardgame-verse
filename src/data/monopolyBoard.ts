import type { Tile } from "../models/monopoly";

/** Classic US Monopoly board: 40 tiles. */
export const BOARD: Tile[] = [
  { index: 0, name: "GO", type: "go" },
  { index: 1, name: "Mediterranean Ave", type: "property", group: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50 },
  { index: 2, name: "Community Chest", type: "chest" },
  { index: 3, name: "Baltic Ave", type: "property", group: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50 },
  { index: 4, name: "Income Tax", type: "tax", taxAmount: 200 },
  { index: 5, name: "Reading Railroad", type: "railroad", price: 200 },
  { index: 6, name: "Oriental Ave", type: "property", group: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
  { index: 7, name: "Chance", type: "chance" },
  { index: 8, name: "Vermont Ave", type: "property", group: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
  { index: 9, name: "Connecticut Ave", type: "property", group: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50 },
  { index: 10, name: "Jail", type: "jail" },
  { index: 11, name: "St. Charles Place", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
  { index: 12, name: "Electric Company", type: "utility", price: 150 },
  { index: 13, name: "States Ave", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
  { index: 14, name: "Virginia Ave", type: "property", group: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100 },
  { index: 15, name: "Pennsylvania RR", type: "railroad", price: 200 },
  { index: 16, name: "St. James Place", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
  { index: 17, name: "Community Chest", type: "chest" },
  { index: 18, name: "Tennessee Ave", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
  { index: 19, name: "New York Ave", type: "property", group: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100 },
  { index: 20, name: "Free Parking", type: "free-parking" },
  { index: 21, name: "Kentucky Ave", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
  { index: 22, name: "Chance", type: "chance" },
  { index: 23, name: "Indiana Ave", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
  { index: 24, name: "Illinois Ave", type: "property", group: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150 },
  { index: 25, name: "B. & O. Railroad", type: "railroad", price: 200 },
  { index: 26, name: "Atlantic Ave", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
  { index: 27, name: "Ventnor Ave", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
  { index: 28, name: "Water Works", type: "utility", price: 150 },
  { index: 29, name: "Marvin Gardens", type: "property", group: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150 },
  { index: 30, name: "Go To Jail", type: "go-to-jail" },
  { index: 31, name: "Pacific Ave", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
  { index: 32, name: "North Carolina Ave", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
  { index: 33, name: "Community Chest", type: "chest" },
  { index: 34, name: "Pennsylvania Ave", type: "property", group: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200 },
  { index: 35, name: "Short Line", type: "railroad", price: 200 },
  { index: 36, name: "Chance", type: "chance" },
  { index: 37, name: "Park Place", type: "property", group: "darkblue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200 },
  { index: 38, name: "Luxury Tax", type: "tax", taxAmount: 100 },
  { index: 39, name: "Boardwalk", type: "property", group: "darkblue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200 },
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
  brown: 2, lightblue: 3, pink: 3, orange: 3,
  red: 3, yellow: 3, green: 3, darkblue: 2,
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

export const RAILROAD_RENT = [25, 50, 100, 200];

export const TOKEN_COLORS = [
  "#00f2ff", "#ff00e5", "#facc15", "#4ade80", "#fb923c", "#a78bfa",
];