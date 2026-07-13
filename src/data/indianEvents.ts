export interface IndianEventDef {
  id: string;
  title: string;
  description: string;
}

export interface ActiveIndianEvent extends IndianEventDef {
  expiresOnTurn: number;
}

export const INDIAN_EVENTS: IndianEventDef[] = [
  {
    id: "BUDGET_ANNOUNCEMENT",
    title: "Budget Announcement",
    description: "GO salary becomes ₹3,000. Income Tax is ₹3,000 flat.",
  },
  {
    id: "ELECTION_RESULTS",
    title: "Election Results",
    description: "Politics dominate the table — trades stay open; watch your rivals.",
  },
  {
    id: "ECONOMIC_BOOM",
    title: "Economic Boom",
    description: "All colour-property rents +50%.",
  },
  {
    id: "ECONOMIC_RECESSION",
    title: "Economic Recession",
    description: "All colour-property rents −50%. Upgrade costs +25%.",
  },
  {
    id: "FESTIVAL_SEASON",
    title: "Festival Season",
    description: "Railway rents double. Collect ₹500 extra when you pass GO.",
  },
  {
    id: "TOURISM_SEASON",
    title: "Tourism Season",
    description: "Light Blue & Yellow rents double.",
  },
  {
    id: "FLOODS",
    title: "Floods",
    description: "Yellow coastal properties charge no rent. Owners get ₹200 insurance per Yellow owned.",
  },
  {
    id: "CYCLONE",
    title: "Cyclone",
    description: "Yellow properties charge no rent. Utilities use ×2 only.",
  },
  {
    id: "METRO_EXPANSION",
    title: "Metro Expansion",
    description: "Red & Green upgrade costs −50%.",
  },
  {
    id: "REAL_ESTATE_BOOM",
    title: "Real Estate Boom",
    description: "Unmortgage with 0% interest.",
  },
  {
    id: "STARTUP_WAVE",
    title: "Startup Wave",
    description: "Bengaluru & Whitefield charge +100% rent.",
  },
  {
    id: "IPL_SEASON",
    title: "IPL Season",
    description: "Jail fee drops to ₹250.",
  },
];

export function drawIndianEvent(excludeId?: string | null): IndianEventDef {
  const pool = excludeId ? INDIAN_EVENTS.filter((e) => e.id !== excludeId) : INDIAN_EVENTS;
  const list = pool.length ? pool : INDIAN_EVENTS;
  return list[Math.floor(Math.random() * list.length)]!;
}
