export const uid = (prefix = "id") =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;

export const roomCode = () =>
  Array.from({ length: 5 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)],
  ).join("");

const palette = [
  "#00f2ff", "#ff00e5", "#facc15", "#4ade80", "#a78bfa",
  "#fb7185", "#38bdf8", "#fb923c", "#34d399", "#f472b6",
];
export const pickAvatarColor = (seed?: string) => {
  if (!seed) return palette[Math.floor(Math.random() * palette.length)];
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();