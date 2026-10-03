import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-DseihURL.mjs";
import { N as NeonButton } from "./NeonButton-BCHVhL-w.mjs";
import { u as useStompSubscription, C as ChatDrawer } from "./ChatDrawer-Bg0ZO6e8.mjs";
import { c as create, p as persist } from "../_libs/zustand.mjs";
import { d as Route$2, e as useConnectionStore, b as useAuthStore, T as Topics, p as pickAvatarColor, c as api, s as stomp, f as useWebsocketRequestStore } from "./router-CrXfqMs4.mjs";
import { u as useQueryClient, b as useQuery, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { gamesApi } from "./games-J_Q9zvha.mjs";
import { b as useRoom, c as useLeaveRoom, d as useReconnectRoom } from "./useRooms-LWPZnYcI.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/sockjs-client.mjs";
import { P as Pause, B as BookOpen, a as Banknote, b as Trophy, c as Play, S as Sparkles, d as Bot, L as Lock, D as Dice5, e as Ticket, f as ShoppingBag, G as Gavel, A as ArrowRight, g as ScrollText, h as ChevronUp, i as ChevronDown, j as Boxes, X, k as Search, l as ArrowLeftRight } from "../_libs/lucide-react.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";

import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/unenv.mjs";


import "../_libs/seroval-plugins.mjs";


import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/axios.mjs";
import "../_libs/form-data.mjs";





import "../_libs/combined-stream.mjs";

import "../_libs/delayed-stream.mjs";

import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";



import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "../_libs/supports-color.mjs";

import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";


import "../_libs/follow-redirects.mjs";

import "../_libs/stomp__stompjs.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const BOARD = [
  { index: 0, name: "GO", type: "go" },
  {
    index: 1,
    name: "Manglore",
    type: "property",
    group: "brown",
    price: 600,
    rent: [20, 100, 300, 900, 1600, 2500],
    housePrice: 500
  },
  { index: 2, name: "Community Chest", shortName: "Chest", type: "chest" },
  {
    index: 3,
    name: "Ranchi",
    type: "property",
    group: "brown",
    price: 600,
    rent: [40, 200, 600, 1800, 3200, 4500],
    housePrice: 500
  },
  { index: 4, name: "Income Tax", type: "tax", taxAmount: 2e3 },
  { index: 5, name: "Indian Railways", shortName: "IR", type: "railroad", price: 2e3 },
  {
    index: 6,
    name: "Varanasi",
    type: "property",
    group: "lightblue",
    price: 1e3,
    rent: [60, 300, 900, 2700, 4e3, 5500],
    housePrice: 500
  },
  { index: 7, name: "Chance", type: "chance" },
  {
    index: 8,
    name: "Amritsar",
    type: "property",
    group: "lightblue",
    price: 1e3,
    rent: [60, 300, 900, 2700, 4e3, 5500],
    housePrice: 500
  },
  {
    index: 9,
    name: "Udaipur",
    type: "property",
    group: "lightblue",
    price: 1200,
    rent: [80, 400, 1e3, 3e3, 4500, 6e3],
    housePrice: 500
  },
  { index: 10, name: "Jail", type: "jail" },
  {
    index: 11,
    name: "Jaipur",
    type: "property",
    group: "pink",
    price: 1400,
    rent: [100, 500, 1500, 4500, 6250, 7500],
    housePrice: 1e3
  },
  { index: 12, name: "Electricity Board", shortName: "Power", type: "utility", price: 1500 },
  {
    index: 13,
    name: "Lucknow",
    type: "property",
    group: "pink",
    price: 1400,
    rent: [100, 500, 1500, 4500, 6250, 7500],
    housePrice: 1e3
  },
  {
    index: 14,
    name: "Bhopal",
    type: "property",
    group: "pink",
    price: 1600,
    rent: [120, 600, 1800, 5e3, 7e3, 9e3],
    housePrice: 1e3
  },
  { index: 15, name: "Southern Railway", shortName: "S. Rail", type: "railroad", price: 2e3 },
  {
    index: 16,
    name: "Surat",
    type: "property",
    group: "orange",
    price: 1800,
    rent: [140, 700, 2e3, 5500, 7500, 9500],
    housePrice: 1e3
  },
  { index: 17, name: "Community Chest", shortName: "Chest", type: "chest" },
  {
    index: 18,
    name: "Coimbatore",
    type: "property",
    group: "orange",
    price: 1800,
    rent: [140, 700, 2e3, 5500, 7500, 9500],
    housePrice: 1e3
  },
  {
    index: 19,
    name: "Indore",
    type: "property",
    group: "orange",
    price: 2e3,
    rent: [160, 800, 2200, 6e3, 8e3, 1e4],
    housePrice: 1e3
  },
  { index: 20, name: "Free Parking", shortName: "Events", type: "free-parking" },
  {
    index: 21,
    name: "Kolkata",
    type: "property",
    group: "red",
    price: 2200,
    rent: [180, 900, 2500, 7e3, 8750, 10500],
    housePrice: 1500
  },
  { index: 22, name: "Chance", type: "chance" },
  {
    index: 23,
    name: "Hyderabad",
    type: "property",
    group: "red",
    price: 2200,
    rent: [180, 900, 2500, 7e3, 8750, 10500],
    housePrice: 1500
  },
  {
    index: 24,
    name: "Bengaluru",
    type: "property",
    group: "red",
    price: 2400,
    rent: [200, 1e3, 3e3, 7500, 9250, 11e3],
    housePrice: 1500
  },
  { index: 25, name: "Western Railway", shortName: "W. Rail", type: "railroad", price: 2e3 },
  {
    index: 26,
    name: "Chennai",
    type: "property",
    group: "yellow",
    price: 2600,
    rent: [220, 1100, 3300, 8e3, 9750, 11500],
    housePrice: 1500
  },
  {
    index: 27,
    name: "Kochi",
    type: "property",
    group: "yellow",
    price: 2600,
    rent: [220, 1100, 3300, 8e3, 9750, 11500],
    housePrice: 1500
  },
  { index: 28, name: "Water Board", shortName: "Water", type: "utility", price: 1500 },
  {
    index: 29,
    name: "Panaji (Goa)",
    shortName: "Panaji",
    type: "property",
    group: "yellow",
    price: 2800,
    rent: [240, 1200, 3600, 8500, 10250, 12e3],
    housePrice: 1500
  },
  { index: 30, name: "Go To Jail", shortName: "To Jail", type: "go-to-jail" },
  {
    index: 31,
    name: "Gurugram",
    type: "property",
    group: "green",
    price: 3e3,
    rent: [260, 1300, 3900, 9e3, 11e3, 12750],
    housePrice: 2e3
  },
  {
    index: 32,
    name: "Noida",
    type: "property",
    group: "green",
    price: 3e3,
    rent: [260, 1300, 3900, 9e3, 11e3, 12750],
    housePrice: 2e3
  },
  { index: 33, name: "Community Chest", shortName: "Chest", type: "chest" },
  {
    index: 34,
    name: "Whitefield",
    type: "property",
    group: "green",
    price: 3200,
    rent: [280, 1500, 4500, 1e4, 12e3, 14e3],
    housePrice: 2e3
  },
  { index: 35, name: "Northern Railway", shortName: "N. Rail", type: "railroad", price: 2e3 },
  { index: 36, name: "Chance", type: "chance" },
  {
    index: 37,
    name: "Connaught Place",
    shortName: "C. Place",
    type: "property",
    group: "darkblue",
    price: 3500,
    rent: [350, 1750, 5e3, 11e3, 13e3, 15e3],
    housePrice: 2e3
  },
  { index: 38, name: "GST", type: "tax", taxAmount: 1e3 },
  {
    index: 39,
    name: "Nariman Point",
    shortName: "Nariman",
    type: "property",
    group: "darkblue",
    price: 4e3,
    rent: [500, 2e3, 6e3, 14e3, 17e3, 2e4],
    housePrice: 2e3
  }
];
const GROUP_COLORS = {
  brown: "#8b4513",
  lightblue: "#87ceeb",
  pink: "#ff69b4",
  orange: "#ff8c00",
  red: "#dc143c",
  yellow: "#facc15",
  green: "#22c55e",
  darkblue: "#1e3a8a"
};
const GROUP_TILES = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [37, 39]
};
const RAILROAD_RENT = [250, 500, 1e3, 2e3];
const DEVELOPMENT_LABELS = [
  "Empty Land",
  "Village",
  "Town",
  "City",
  "Metro",
  "Smart City"
];
function developmentLabel(houses) {
  if (houses >= 5) return DEVELOPMENT_LABELS[5];
  if (houses <= 0) return DEVELOPMENT_LABELS[0];
  return DEVELOPMENT_LABELS[houses];
}
function shortTileName(tile) {
  if (tile.shortName) return tile.shortName;
  if (tile.name.length <= 10) return tile.name;
  return `${tile.name.slice(0, 9)}…`;
}
const CHANCE_CARDS = [
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
    action: { kind: "repairs", perHouse: 250, perHotel: 1e3 }
  },
  { text: "Traffic fine ₹150.", action: { kind: "money", amount: -150 } },
  { text: "Take a trip to Indian Railways.", action: { kind: "move", to: 5, collectGoIfPass: true } },
  { text: "Elected city chair — pay each player ₹500.", action: { kind: "moneyFromEach", amount: -500 } },
  { text: "Startup grant matures. Collect ₹1,500.", action: { kind: "money", amount: 1500 } },
  { text: "Festival contest prize. Collect ₹1,000.", action: { kind: "money", amount: 1e3 } }
];
const CHEST_CARDS = [
  { text: "Advance to GO. Collect ₹2,000.", action: { kind: "move", to: 0, collectGoIfPass: true } },
  { text: "Bank error in your favor. Collect ₹2,000.", action: { kind: "money", amount: 2e3 } },
  { text: "Doctor's fees. Pay ₹500.", action: { kind: "money", amount: -500 } },
  { text: "From sale of stock you get ₹500.", action: { kind: "money", amount: 500 } },
  { text: "Get Out of Jail Free.", action: { kind: "getOutCard" } },
  { text: "Go directly to Jail.", action: { kind: "jail" } },
  { text: "Holiday fund matures. Collect ₹1,000.", action: { kind: "money", amount: 1e3 } },
  { text: "Tax refund. Collect ₹200.", action: { kind: "money", amount: 200 } },
  { text: "It's your birthday — collect ₹100 from each player.", action: { kind: "moneyFromEach", amount: 100 } },
  { text: "Insurance payout. Collect ₹1,000.", action: { kind: "money", amount: 1e3 } },
  { text: "Pay hospital fees of ₹1,000.", action: { kind: "money", amount: -1e3 } },
  { text: "Pay school fees of ₹500.", action: { kind: "money", amount: -500 } },
  { text: "Receive ₹250 consultancy fee.", action: { kind: "money", amount: 250 } },
  {
    text: "Street repairs: ₹400 per Village–Metro, ₹1,150 per Smart City.",
    action: { kind: "repairs", perHouse: 400, perHotel: 1150 }
  },
  { text: "You inherit ₹1,000.", action: { kind: "money", amount: 1e3 } },
  { text: "You won a cultural fest prize. Collect ₹100.", action: { kind: "money", amount: 100 } }
];
const JAIL_FEE = 500;
function formatInr(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}
function effectiveJailFee(s) {
  return s.activeEvent?.id === "IPL_SEASON" ? 250 : JAIL_FEE;
}
function Tile({
  tile,
  prop,
  ownerColor,
  orientation,
  onClick,
  children,
  highlight,
  focusOwned,
  focusPosition,
  focusColor = "#00f2ff"
}) {
  const isCorner = orientation === "corner";
  const groupBar = tile.group ? GROUP_COLORS[tile.group] : null;
  const barPos = orientation === "top" ? "bottom" : orientation === "bottom" ? "top" : orientation === "left" ? "right" : "left";
  const isVerticalBar = orientation === "left" || orientation === "right";
  const label = shortTileName(tile);
  const ringClass = focusPosition ? "ring-2 ring-offset-1 ring-offset-transparent" : focusOwned ? "ring-2" : highlight ? "ring-2 ring-accent-cyan" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      title: tile.name,
      onClick,
      className: `relative w-full h-full glass-panel border border-white/10 p-1 text-left flex flex-col overflow-hidden hover:border-accent-cyan/60 transition-colors ${prop?.mortgaged ? "grayscale opacity-60" : ""} ${ringClass}`,
      style: focusOwned || focusPosition ? {
        boxShadow: focusPosition ? `0 0 0 2px ${focusColor}, 0 0 18px ${focusColor}` : `0 0 0 2px ${focusColor}, inset 0 0 24px ${focusColor}44`,
        borderColor: `${focusColor}aa`
      } : ownerColor ? { borderColor: `${ownerColor}aa`, boxShadow: `inset 0 0 0 1px ${ownerColor}33` } : void 0,
      children: [
        groupBar && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `absolute ${barPos === "top" ? "top-0 left-0 right-0 h-2" : barPos === "bottom" ? "bottom-0 left-0 right-0 h-2" : barPos === "left" ? "top-0 bottom-0 left-0 w-2" : "top-0 bottom-0 right-0 w-2"}`,
            style: { background: groupBar }
          }
        ),
        ownerColor && !groupBar && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-1", style: { background: ownerColor } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `relative z-10 flex-1 flex flex-col ${isCorner ? "items-center justify-center text-center" : isVerticalBar ? "items-center justify-center text-center px-0.5" : "items-center justify-end text-center px-0.5 pb-1"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `font-mono uppercase tracking-tight leading-tight line-clamp-2 ${isCorner ? "text-[11px]" : "text-[10px]"} text-white/90`,
                  children: label
                }
              ),
              tile.price != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-mono text-accent-cyan/80 mt-0.5", children: formatInr(tile.price ?? 0) }),
              prop?.mortgaged && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-mono text-destructive", children: "MTG" }),
              prop && prop.houses > 0 && prop.houses < 5 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5 mt-0.5", children: Array.from({ length: prop.houses }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-1.5 bg-accent-amber rounded-sm" }, i)) }),
              prop?.houses === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 bg-destructive rounded-sm mt-0.5" }),
              ownerColor && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "size-1.5 rounded-full mt-0.5",
                  style: { background: ownerColor, boxShadow: `0 0 6px ${ownerColor}` }
                }
              )
            ]
          }
        ),
        children
      ]
    }
  );
}
const OFFSETS = [
  { x: 0, y: 0 },
  { x: 7, y: -4 },
  { x: -7, y: -4 },
  { x: 0, y: -10 },
  { x: 10, y: 2 },
  { x: -10, y: 2 }
];
function Token({
  color,
  label,
  stackIndex = 0,
  emphasized = false,
  seatNumber
}) {
  const offset = OFFSETS[stackIndex % OFFSETS.length] ?? OFFSETS[0];
  const initial = label.trim().slice(0, 1).toUpperCase() || "?";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      layout: true,
      transition: { type: "spring", stiffness: 260, damping: 26 },
      className: `relative rounded-full grid place-items-center font-mono font-bold border-2 border-white/90 shadow-lg ${emphasized ? "size-7 text-[10px] z-20 ring-2 ring-white" : "size-5 text-[8px] z-10"}`,
      style: {
        background: color,
        color: "#050507",
        boxShadow: emphasized ? `0 0 16px ${color}, 0 0 4px #fff` : `0 0 10px ${color}`,
        marginLeft: offset.x,
        marginTop: offset.y
      },
      "aria-label": label,
      title: seatNumber != null ? `${label} (#${seatNumber})` : label,
      children: [
        initial,
        seatNumber != null ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "absolute -top-1 -right-1 size-3 rounded-full bg-black text-white grid place-items-center text-[7px] font-mono border border-white/50",
            style: { color: "#fff" },
            children: seatNumber
          }
        ) : null
      ]
    }
  );
}
function gridPosition(index) {
  if (index === 0) return { row: 11, col: 11, orientation: "corner" };
  if (index === 10) return { row: 11, col: 1, orientation: "corner" };
  if (index === 20) return { row: 1, col: 1, orientation: "corner" };
  if (index === 30) return { row: 1, col: 11, orientation: "corner" };
  if (index >= 1 && index <= 9) return { row: 11, col: 11 - index, orientation: "bottom" };
  if (index >= 11 && index <= 19) return { row: 11 - (index - 10), col: 1, orientation: "left" };
  if (index >= 21 && index <= 29) return { row: 1, col: 1 + (index - 20), orientation: "top" };
  return { row: 1 + (index - 30), col: 11, orientation: "right" };
}
function Board({
  state,
  onTileClick,
  highlightTile,
  focusPlayerId
}) {
  const players = state.players;
  const properties = state.properties;
  const tokensByTile = reactExports.useMemo(() => {
    const m = {};
    players.filter((p) => !p.bankrupt).forEach((p) => {
      (m[p.position] ||= []).push(p);
    });
    return m;
  }, [players]);
  const seatById = reactExports.useMemo(() => {
    const map = {};
    players.forEach((p, i) => {
      map[p.id] = i + 1;
    });
    return map;
  }, [players]);
  const turnPlayer = state.players[state.currentPlayerIndex] ?? null;
  const focusPlayer = focusPlayerId ? state.players.find((p) => p.id === focusPlayerId) : null;
  const focusColor = focusPlayer?.avatarColor ?? turnPlayer?.avatarColor ?? "#00f2ff";
  const focusOwned = reactExports.useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    if (!focusPlayerId) return set;
    Object.entries(properties).forEach(([idx, prop]) => {
      if (prop.ownerId === focusPlayerId) set.add(Number(idx));
    });
    return set;
  }, [focusPlayerId, properties]);
  const focusPosition = focusPlayer && !focusPlayer.bankrupt ? focusPlayer.position : null;
  const turnPosition = turnPlayer && !turnPlayer.bankrupt ? turnPlayer.position : null;
  const turnTile = turnPlayer ? BOARD[turnPlayer.position] : null;
  const turnOwnedCount = turnPlayer ? Object.values(properties).filter((property) => property.ownerId === turnPlayer.id).length : 0;
  const phaseLabel = state.phase === "rolling" ? "Ready to roll" : state.phase === "moving" ? "Moving" : state.phase === "landed" ? "Resolve landing" : state.phase === "auction" ? "Auction" : state.phase === "trade" ? "Trade pending" : state.phase === "paused" ? "Game paused" : "Match over";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-square h-full max-h-full w-auto max-w-full mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "grid h-full w-full gap-px p-px bg-black/40 border border-white/10",
      style: { gridTemplateColumns: "repeat(11, 1fr)", gridTemplateRows: "repeat(11, 1fr)" },
      children: [
        BOARD.map((tile) => {
          const pos = gridPosition(tile.index);
          const prop = state.properties[tile.index];
          const ownerColor = prop?.ownerId ? state.players.find((p) => p.id === prop.ownerId)?.avatarColor : null;
          const tokens = tokensByTile[tile.index] ?? [];
          const ownedByFocus = focusOwned.has(tile.index);
          const isFocusPosition = focusPosition === tile.index;
          const isTurnPosition = !focusPlayerId && turnPosition === tile.index;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              style: { gridRow: pos.row, gridColumn: pos.col },
              className: "relative",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Tile,
                  {
                    tile,
                    prop,
                    ownerColor: ownerColor ?? null,
                    orientation: pos.orientation,
                    onClick: () => onTileClick?.(tile.index),
                    highlight: highlightTile === tile.index,
                    focusOwned: ownedByFocus,
                    focusPosition: isFocusPosition || isTurnPosition,
                    focusColor: isFocusPosition || ownedByFocus ? focusColor : turnPlayer?.avatarColor ?? focusColor
                  }
                ),
                tokens.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none flex flex-wrap items-end justify-center p-1 gap-0.5", children: tokens.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Token,
                  {
                    color: p.avatarColor,
                    label: p.username,
                    stackIndex: i,
                    seatNumber: seatById[p.id],
                    emphasized: focusPlayerId === p.id || !focusPlayerId && turnPlayer?.id === p.id
                  },
                  p.id
                )) })
              ]
            },
            tile.index
          );
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            style: { gridRow: "2 / span 9", gridColumn: "2 / span 9" },
            className: "relative grid place-items-center pointer-events-none",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xl px-2 sm:px-5", children: [
              turnPlayer && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "border bg-black/85 p-3 sm:p-4",
                  style: {
                    borderColor: `${turnPlayer.avatarColor}bb`,
                    boxShadow: `0 0 24px ${turnPlayer.avatarColor}35, inset 0 0 28px ${turnPlayer.avatarColor}12`
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "size-11 sm:size-13 shrink-0 grid place-items-center rounded-full border-2 font-display text-xl text-black",
                          style: {
                            backgroundColor: turnPlayer.avatarColor,
                            borderColor: `${turnPlayer.avatarColor}aa`,
                            boxShadow: `0 0 16px ${turnPlayer.avatarColor}88`
                          },
                          children: turnPlayer.username.slice(0, 1).toUpperCase()
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "text-[9px] font-mono uppercase tracking-[0.25em]",
                            style: { color: turnPlayer.avatarColor },
                            children: [
                              phaseLabel,
                              " · Current turn"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base sm:text-lg font-bold truncate text-white", children: [
                          turnPlayer.username,
                          turnPlayer.isAI && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-[9px] font-mono text-white/45", children: "AI" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-mono uppercase tracking-widest text-white/45", children: "Cash" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm sm:text-base font-mono font-bold text-accent-amber tabular-nums", children: [
                          "₹",
                          turnPlayer.cash.toLocaleString("en-IN")
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3", children: [
                      { label: "Position", value: turnTile?.name ?? `Tile ${turnPlayer.position}` },
                      { label: "Properties", value: String(turnOwnedCount) },
                      { label: "Jail cards", value: String(turnPlayer.jailCards) },
                      {
                        label: "Status",
                        value: turnPlayer.bankrupt ? "Bankrupt" : turnPlayer.inJail ? "In jail" : "Active"
                      }
                    ].map((detail) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 border-l-2 border-white/15 pl-2 py-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[7px] sm:text-[8px] font-mono uppercase tracking-widest text-white/40", children: detail.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] sm:text-[10px] font-mono text-white/85 truncate", title: detail.value, children: detail.value })
                    ] }, detail.label)) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-2xl sm:text-3xl italic uppercase neon-text-glow", children: "MONOPOLY" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-mono uppercase tracking-[0.35em] text-accent-cyan mt-0.5", children: "GameHub Edition" })
              ] }),
              focusPlayer ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "mt-3 text-[10px] font-mono uppercase tracking-widest px-3 py-1 border inline-block",
                  style: {
                    color: focusColor,
                    borderColor: `${focusColor}80`,
                    background: `${focusColor}18`
                  },
                  children: [
                    "Focusing ",
                    focusPlayer.username
                  ]
                }
              ) : null
            ] })
          }
        )
      ]
    }
  ) });
}
function Pip({ on }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `size-1.5 rounded-full ${on ? "bg-black" : "bg-transparent"}` });
}
const PIP_MAP = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true]
};
function Die({
  value,
  spinning,
  compact
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      animate: spinning ? { rotate: [0, 360], scale: [0.65, 1.05, 1] } : { rotate: 0, scale: 1 },
      transition: spinning ? { duration: 0.55, ease: "easeOut" } : { duration: 0 },
      className: `${compact ? "size-6" : "size-8 sm:size-9"} bg-white rounded-md grid grid-cols-3 grid-rows-3 ${compact ? "p-1 gap-px" : "p-1.5 gap-0.5"} shadow-[0_0_16px_rgba(0,242,255,0.45)]`,
      children: (PIP_MAP[value] ?? PIP_MAP[1]).map((on, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Pip, { on }, i))
    }
  );
}
function Dice({ roll, compact = false }) {
  const prevRolledAt = reactExports.useRef(null);
  const [spinning, setSpinning] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!roll) {
      prevRolledAt.current = null;
      setSpinning(false);
      return;
    }
    if (prevRolledAt.current !== roll.rolledAt) {
      prevRolledAt.current = roll.rolledAt;
      setSpinning(true);
      const t = window.setTimeout(() => setSpinning(false), 600);
      return () => window.clearTimeout(t);
    }
  }, [roll?.rolledAt, roll]);
  if (!roll) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex ${compact ? "gap-1" : "gap-2"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `${compact ? "size-6" : "size-8 sm:size-9"} border-2 border-dashed border-white/20 rounded-md`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `${compact ? "size-6" : "size-8 sm:size-9"} border-2 border-dashed border-white/20 rounded-md`
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex ${compact ? "gap-1" : "gap-2"} items-center`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Die, { value: roll.d1, spinning, compact }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Die, { value: roll.d2, spinning, compact }),
    roll.isDouble && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `${compact ? "text-[7px]" : "text-[9px]"} font-mono uppercase tracking-widest text-accent-amber`,
        children: "DOUBLE!"
      }
    )
  ] });
}
function PlayerPanel({
  state,
  player,
  isCurrent,
  isMe,
  seatNumber,
  selected,
  onSelectPlayer,
  onSelectTile,
  onProposeTrade,
  turnActions,
  compact = false
}) {
  const props = Object.entries(state.properties).filter(([, p]) => p.ownerId === player.id).map(([i]) => +i);
  const tileName = BOARD[player.position]?.name ?? `Tile ${player.position}`;
  const pending = state.pendingPurchaseTile;
  const pendingTile = pending != null ? BOARD[pending] : null;
  const price = pendingTile?.price ?? 0;
  const showTurn = Boolean(isCurrent && turnActions);
  const myTurn = Boolean(turnActions?.isMyTurn);
  const phaseHint = state.phase === "rolling" ? "Rolling" : state.phase === "landed" ? pending != null ? "Decide" : "Continue" : state.phase === "auction" ? "Auction" : state.phase === "paused" ? "Paused" : "Turn";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      role: "button",
      tabIndex: 0,
      onClick: () => onSelectPlayer?.(),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelectPlayer?.();
        }
      },
      className: `relative overflow-hidden rounded-sm border cursor-pointer transition-all duration-200 ${compact ? "p-2" : "p-3"} ${player.bankrupt ? "opacity-40" : ""} ${isCurrent ? "bg-white/[0.04]" : selected ? "bg-white/[0.03]" : "bg-black/30 hover:bg-white/[0.03]"}`,
      style: isCurrent ? {
        borderColor: `${player.avatarColor}cc`,
        boxShadow: `inset 0 0 0 1px ${player.avatarColor}33, 0 0 18px ${player.avatarColor}40`
      } : selected ? {
        borderColor: `${player.avatarColor}99`,
        boxShadow: `0 0 12px ${player.avatarColor}35`
      } : { borderColor: "rgba(255,255,255,0.1)" },
      children: [
        isCurrent ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute left-0 top-0 bottom-0 w-0.5",
            style: { background: player.avatarColor, boxShadow: `0 0 8px ${player.avatarColor}` }
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `${compact ? "size-7" : "size-8"} rounded-full grid place-items-center font-mono text-[11px] font-bold text-black ring-2 ring-black/40`,
                style: {
                  background: player.avatarColor,
                  boxShadow: isCurrent ? `0 0 12px ${player.avatarColor}aa` : `0 0 6px ${player.avatarColor}66`
                },
                children: player.username.slice(0, 1).toUpperCase()
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-[#0a0a0c] border border-white/25 grid place-items-center text-[7px] font-mono text-white/80", children: seatNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-semibold truncate leading-tight", children: player.username }),
              player.isAI && /* @__PURE__ */ jsxRuntimeExports.jsx(Bot, { className: "size-3 text-accent-cyan shrink-0" }),
              isMe && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-mono uppercase tracking-wider text-accent-cyan shrink-0", children: "You" }),
              isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "ml-auto text-[7px] font-mono uppercase tracking-[0.2em] font-bold shrink-0 px-1.5 py-0.5 rounded-sm",
                  style: {
                    color: player.avatarColor,
                    background: `${player.avatarColor}22`,
                    border: `1px solid ${player.avatarColor}55`
                  },
                  children: phaseHint
                }
              ),
              player.inJail && /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3 text-destructive shrink-0" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2 mt-0.5 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] font-mono font-bold text-accent-amber tabular-nums", children: formatInr(player.cash) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-mono text-white/35 truncate", title: tileName, children: tileName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "text-[8px] font-mono text-accent-cyan shrink-0",
                  title: "Get Out of Jail Free cards",
                  children: [
                    player.jailCards,
                    " jail card",
                    player.jailCards === 1 ? "" : "s"
                  ]
                }
              )
            ] })
          ] }),
          showTurn ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "shrink-0 self-start",
              onClick: (e) => e.stopPropagation(),
              onKeyDown: (e) => e.stopPropagation(),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dice, { roll: state.lastRoll, compact: true })
            }
          ) : null
        ] }),
        props.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-1.5 flex flex-wrap gap-1 ${showTurn ? "max-h-11" : "max-h-14"} overflow-y-auto`, children: props.map((i) => {
          const tile = BOARD[i];
          const prop = state.properties[i];
          const color = tile.group ? GROUP_COLORS[tile.group] : "#888";
          const houses = prop?.houses ?? 0;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.stopPropagation();
                onSelectTile?.(i);
              },
              className: "inline-flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded-sm border border-white/10 hover:border-white/30 transition-colors",
              style: { background: `${color}22`, color },
              title: tile.name,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full shrink-0", style: { background: color } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[4.5rem]", children: shortTileName(tile) }),
                prop?.mortgaged ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "M" }) : houses >= 5 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive", children: "H" }) : houses > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent-amber", children: houses }) : null
              ]
            },
            i
          );
        }) }),
        showTurn && turnActions ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "mt-2 pt-2 border-t border-white/10 flex flex-col gap-1.5",
            onClick: (e) => e.stopPropagation(),
            onKeyDown: (e) => e.stopPropagation(),
            children: [
              !myTurn && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] font-mono uppercase tracking-[0.18em] text-white/35 text-center", children: [
                "Waiting for ",
                player.username,
                "…"
              ] }),
              state.phase === "rolling" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  NeonButton,
                  {
                    variant: "cyan",
                    size: "sm",
                    onClick: turnActions.onRoll,
                    disabled: !myTurn,
                    className: "flex-1 min-w-0 !text-[9px] !py-1 !px-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Dice5, { className: "inline size-3 mr-1" }),
                      player.inJail ? "Roll Doubles" : "Roll Dice"
                    ]
                  }
                ),
                myTurn && player.inJail && player.cash >= effectiveJailFee(state) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  NeonButton,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: turnActions.onPayJail,
                    className: "!text-[9px] !py-1 !px-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "inline size-3 mr-1" }),
                      " Pay ",
                      formatInr(effectiveJailFee(state))
                    ]
                  }
                ),
                myTurn && player.inJail && player.jailCards > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  NeonButton,
                  {
                    variant: "ghost",
                    size: "sm",
                    onClick: turnActions.onJailCard,
                    className: "!text-[9px] !py-1 !px-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Ticket, { className: "inline size-3 mr-1" }),
                      " Card"
                    ]
                  }
                )
              ] }),
              myTurn && state.phase === "landed" && pending != null && pendingTile && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] mb-1 leading-snug text-white/80", children: [
                  "Buy ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white", children: pendingTile.name }),
                  " for",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-accent-amber font-mono", children: formatInr(price) }),
                  "?"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    NeonButton,
                    {
                      variant: "cyan",
                      size: "sm",
                      onClick: turnActions.onBuy,
                      disabled: player.cash < price,
                      className: "flex-1 !text-[9px] !py-1 !px-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "inline size-3 mr-1" }),
                        " Buy"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    NeonButton,
                    {
                      variant: "pink",
                      size: "sm",
                      onClick: turnActions.onAuction,
                      className: "flex-1 !text-[9px] !py-1 !px-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "inline size-3 mr-1" }),
                        " Decline"
                      ]
                    }
                  )
                ] })
              ] }),
              myTurn && state.phase === "landed" && pending == null && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                NeonButton,
                {
                  size: "sm",
                  onClick: turnActions.onEnd,
                  className: "w-full !text-[9px] !py-1 !px-2",
                  children: [
                    "Continue ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "inline size-3 ml-1" })
                  ]
                }
              )
            ]
          }
        ) : null,
        onProposeTrade && !isMe && !player.bankrupt && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.stopPropagation();
              onProposeTrade();
            },
            className: "mt-1.5 w-full text-[8px] font-mono uppercase tracking-[0.2em] border border-white/15 text-white/55 py-1 rounded-sm hover:border-accent-pink/60 hover:text-accent-pink transition-colors",
            children: "Propose Trade"
          }
        )
      ]
    }
  );
}
function PropertyCard({
  state,
  tileIndex,
  isMyTurn,
  meId,
  onClose,
  onBuild,
  onSell,
  onMortgage
}) {
  const tile = BOARD[tileIndex];
  const prop = state.properties[tileIndex];
  if (!tile) return null;
  const owner = prop?.ownerId ? state.players.find((p) => p.id === prop.ownerId) : null;
  const me = state.players.find((p) => p.id === meId);
  const bar = tile.group ? GROUP_COLORS[tile.group] : "#444";
  const isOwner = prop?.ownerId === meId;
  const isColorProperty = tile.type === "property";
  const houseCost = tile.housePrice ?? 0;
  const mortgageValue = Math.floor((tile.price ?? 0) / 2);
  const unmortgageCost = Math.ceil(mortgageValue * 1.1);
  const houses = prop?.houses ?? 0;
  const hasDev = houses > 0;
  const groupTiles = tile.group ? GROUP_TILES[tile.group] ?? [] : [];
  const ownsFullGroup = groupTiles.length > 0 && groupTiles.every((index) => state.properties[index]?.ownerId === meId);
  const fewestGroupHouses = groupTiles.length ? Math.min(...groupTiles.map((index) => state.properties[index]?.houses ?? 0)) : 0;
  let buildDisabledReason = null;
  if (!isMyTurn) buildDisabledReason = "Not your turn";
  else if (!isColorProperty) buildDisabledReason = "Only color properties can be upgraded";
  else if (!ownsFullGroup) buildDisabledReason = "Own the full color group first";
  else if (prop?.mortgaged) buildDisabledReason = "Unmortgage before upgrading";
  else if (houses >= 5) buildDisabledReason = "Fully developed";
  else if (houses > fewestGroupHouses) buildDisabledReason = "Build evenly across the color group";
  else if ((me?.cash ?? 0) < houseCost) buildDisabledReason = "Need more cash";
  let sellDisabledReason = null;
  if (!isMyTurn) sellDisabledReason = "Not your turn";
  else if (!isColorProperty || !hasDev) sellDisabledReason = "Nothing to sell";
  let mortgageDisabledReason = null;
  if (!isMyTurn) mortgageDisabledReason = "Not your turn";
  else if (prop?.mortgaged && (me?.cash ?? 0) < unmortgageCost) {
    mortgageDisabledReason = "Need more cash to unmortgage";
  } else if (!prop?.mortgaged && hasDev) {
    mortgageDisabledReason = "Sell developments first";
  }
  const showActions = isOwner && (onBuild || onSell || onMortgage);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      onClick: onClose,
      className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.85, y: 20 },
          animate: { scale: 1, y: 0 },
          onClick: (e) => e.stopPropagation(),
          className: "relative w-full max-w-sm glass-panel border border-white/15 p-0 overflow-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "absolute top-2 right-2 z-10 size-7 grid place-items-center hover:text-accent-pink",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 grid place-items-center", style: { background: bar }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-black/80", children: "Title Deed" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-3xl italic uppercase mb-1", children: tile.name }),
              tile.price != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-4", children: [
                "Price ",
                formatInr(tile.price ?? 0)
              ] }),
              tile.type === "property" && tile.rent && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs font-mono space-y-1 mb-4", children: [
                [
                  { label: "Rent (Empty Land)", level: 0 },
                  { label: "With Village", level: 1 },
                  { label: "With Town", level: 2 },
                  { label: "With City", level: 3 },
                  { label: "With Metro", level: 4 },
                  { label: "With Smart City", level: 5 }
                ].map((row) => {
                  const active = houses === row.level;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "li",
                    {
                      className: `flex justify-between px-2 py-1 rounded-sm ${active ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold" : "text-white/70"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          row.label,
                          active ? " · current" : ""
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatInr(tile.rent[row.level]) })
                      ]
                    },
                    row.level
                  );
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-white/40 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upgrade cost" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatInr(houseCost) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-white/40", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mortgage value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatInr(mortgageValue) })
                ] })
              ] }),
              tile.type === "railroad" && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs font-mono space-y-1 mb-4", children: [
                RAILROAD_RENT.map((r, i) => {
                  const ownedCount = owner ? Object.entries(state.properties).filter(([idx, p]) => {
                    const t = BOARD[Number(idx)];
                    return p.ownerId === owner.id && t?.type === "railroad";
                  }).length : 0;
                  const active = ownedCount === i + 1;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "li",
                    {
                      className: `flex justify-between px-2 py-1 rounded-sm ${active ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold" : "text-white/70"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          i + 1,
                          " Railway Owned",
                          active ? " · current" : ""
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatInr(r) })
                      ]
                    },
                    i
                  );
                }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-white/40 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mortgage value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatInr(mortgageValue) })
                ] })
              ] }),
              tile.type === "utility" && /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs font-mono space-y-1 mb-4", children: [
                (() => {
                  const ownedUtils = owner ? Object.entries(state.properties).filter(([idx, p]) => {
                    const t = BOARD[Number(idx)];
                    return p.ownerId === owner.id && t?.type === "utility";
                  }).length : 0;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "li",
                      {
                        className: `flex justify-between px-2 py-1 rounded-sm ${ownedUtils === 1 ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold" : "text-white/70"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                            "1 Utility",
                            ownedUtils === 1 ? " · current" : ""
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "4× dice" })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "li",
                      {
                        className: `flex justify-between px-2 py-1 rounded-sm ${ownedUtils >= 2 ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold" : "text-white/70"}`,
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                            "2 Utilities",
                            ownedUtils >= 2 ? " · current" : ""
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "10× dice" })
                        ]
                      }
                    )
                  ] });
                })(),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex justify-between text-white/40 pt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Mortgage value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatInr(mortgageValue) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-widest mb-2", children: [
                "Owner:",
                " ",
                owner ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: owner.avatarColor }, children: owner.username }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/40", children: "Bank" }),
                prop && houses > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-accent-amber", children: developmentLabel(houses) }) : null,
                prop?.mortgaged && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-destructive", children: "MORTGAGED" })
              ] }),
              showActions ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-mono text-white/40 mb-3", children: "Mortgage / Upgrade on your turn before Continue." }) : null,
              showActions ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  isColorProperty && onBuild ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    NeonButton,
                    {
                      variant: "cyan",
                      size: "sm",
                      disabled: !!buildDisabledReason,
                      onClick: onBuild,
                      title: buildDisabledReason ?? void 0,
                      children: "Upgrade"
                    }
                  ) : null,
                  isColorProperty && onSell ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    NeonButton,
                    {
                      variant: "ghost",
                      size: "sm",
                      disabled: !!sellDisabledReason,
                      onClick: onSell,
                      title: sellDisabledReason ?? void 0,
                      children: "Sell Development"
                    }
                  ) : null,
                  onMortgage ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    NeonButton,
                    {
                      variant: "ghost",
                      size: "sm",
                      disabled: !!mortgageDisabledReason,
                      onClick: onMortgage,
                      title: mortgageDisabledReason ?? void 0,
                      children: prop?.mortgaged ? "Unmortgage" : "Mortgage"
                    }
                  ) : null
                ] }),
                (buildDisabledReason || sellDisabledReason || mortgageDisabledReason) && isMyTurn === false ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono text-accent-amber/80", children: "Not your turn" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono text-white/35 space-y-0.5", children: [
                  isColorProperty && buildDisabledReason ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: buildDisabledReason }) : null,
                  isColorProperty && sellDisabledReason && hasDev ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: sellDisabledReason }) : null,
                  mortgageDisabledReason ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: mortgageDisabledReason }) : null
                ] })
              ] }) : null
            ] })
          ]
        }
      )
    }
  );
}
const BID_CHIPS = [50, 100, 200, 500, 1e3];
function samePlayer(playerId, me) {
  if (!playerId || !me) return false;
  return String(playerId) === String(me.id) || me.userId != null && String(playerId) === String(me.userId);
}
function AuctionPanel({
  state,
  meId,
  onBid,
  onPass
}) {
  const a = state.auction;
  const minBid = a ? a.highestBid + 10 : 10;
  const me = state.players.find((p) => p.id === meId) ?? state.players.find((p) => p.userId === meId) ?? state.players[0];
  const cash = me?.cash ?? 0;
  const maxBid = cash;
  const [amount, setAmount] = reactExports.useState(minBid);
  const currentBidderId = a?.activePlayerIds[a.currentBidderIndex] ?? a?.activePlayerIds[0];
  const inAuction = Boolean(
    a && me && a.activePlayerIds.some((id) => samePlayer(id, me))
  );
  const isMyBid = Boolean(a && samePlayer(currentBidderId, me) && me && !me.bankrupt && inAuction);
  reactExports.useEffect(() => {
    if (!a) return;
    setAmount(Math.min(Math.max(minBid, 0), maxBid));
  }, [a, isMyBid, minBid, maxBid, a?.currentBidderIndex, a?.highestBid]);
  if (!a) return null;
  const tile = BOARD[a.tileIndex];
  const clamped = Math.min(Math.max(amount || minBid, minBid), maxBid);
  const canBid = isMyBid && maxBid >= minBid && clamped >= minBid && clamped <= maxBid;
  const bidder = state.players.find((p) => samePlayer(currentBidderId, p)) ?? state.players.find((p) => String(p.id) === String(currentBidderId));
  const bidderName = bidder?.username ?? "Waiting for bids";
  const highest = a.highestBidderId != null ? state.players.find((p) => samePlayer(a.highestBidderId, p)) : null;
  const groupColor = tile?.group ? GROUP_COLORS[tile.group] : "#ff00e5";
  const addChip = (chip) => {
    setAmount((prev) => Math.min(maxBid, Math.max(minBid, (prev || minBid) + chip)));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.85 },
          animate: { scale: 1 },
          className: "glass-panel border border-accent-pink/40 p-8 max-w-md w-full text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full mb-4 rounded-sm", style: { background: groupColor } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Gavel, { className: "size-10 text-accent-pink mx-auto mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-pink mb-2", children: "Live Auction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl italic uppercase mb-1", children: tile?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-white/40 mb-6", children: [
              "List ",
              formatInr(tile?.price ?? 0)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40", children: "Highest Bid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-5xl italic text-accent-amber mb-2", children: formatInr(a.highestBid) }),
            highest ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono mb-4", children: [
              "by ",
              highest.username
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono mb-4 text-white/40", children: "No bids yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-4", children: isMyBid ? "Your turn to bid" : `Bidding: ${bidderName}` }),
            isMyBid ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
              maxBid < minBid ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-destructive", children: [
                "Not enough cash to bid (need ",
                formatInr(minBid),
                "). Pass instead."
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 justify-center", children: BID_CHIPS.map((chip) => {
                  const next = Math.min(maxBid, Math.max(minBid, (amount || minBid) + chip));
                  const disabled = (amount || minBid) >= maxBid || next === (amount || minBid);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      disabled,
                      onClick: () => addChip(chip),
                      className: "px-2 py-1 border border-accent-amber/40 text-accent-amber font-mono text-[10px] disabled:opacity-30 hover:bg-accent-amber/15",
                      children: [
                        "+",
                        formatInr(chip)
                      ]
                    },
                    chip
                  );
                }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: minBid,
                      max: maxBid,
                      value: clamped,
                      onChange: (e) => {
                        const raw = Number(e.target.value);
                        if (!Number.isFinite(raw)) return;
                        setAmount(Math.min(maxBid, Math.max(0, raw)));
                      },
                      onBlur: () => setAmount(clamped),
                      className: "flex-1 bg-black/40 border border-white/20 px-3 py-2 font-mono text-accent-amber"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "cyan", disabled: !canBid, onClick: () => onBid(clamped), children: "Bid" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono text-white/45", children: [
                  "Your cash: ",
                  formatInr(cash),
                  " · Max bid ",
                  formatInr(maxBid),
                  " · Min",
                  " ",
                  formatInr(minBid)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "ghost", size: "sm", onClick: onPass, children: "Pass" })
            ] }) : inAuction ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-white/50 animate-pulse", children: [
              "Waiting for ",
              bidderName,
              " to bid or pass…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-mono text-white/50", children: "You are out of this auction." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pt-4 border-t border-white/10 text-[10px] font-mono text-white/40", children: [
              "Remaining:",
              " ",
              a.activePlayerIds.map((id) => state.players.find((p) => samePlayer(id, p))?.username ?? "—").join(" · ")
            ] })
          ]
        }
      )
    }
  );
}
function PropPicker({
  state,
  playerId,
  selected,
  onSelect
}) {
  const tiles = Object.entries(state.properties).filter(([, p]) => p.ownerId === playerId).map(([i]) => +i);
  if (tiles.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono text-white/30", children: "No properties." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 max-h-40 overflow-y-auto", children: tiles.map((i) => {
    const t = BOARD[i];
    const color = t.group ? GROUP_COLORS[t.group] : "#666";
    const on = selected === i;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onSelect(on ? null : i),
        className: "text-[10px] font-mono px-2 py-1",
        style: {
          background: on ? color : `${color}20`,
          color: on ? "#000" : color,
          border: `1px solid ${color}`
        },
        title: t.name,
        children: shortTileName(t)
      },
      i
    );
  }) });
}
function TradePanel({ state, meId, partnerId, onClose, onPropose }) {
  const me = state.players.find((p) => p.id === meId);
  const partner = state.players.find((p) => p.id === partnerId);
  const [myProp, setMyProp] = reactExports.useState(null);
  const [theirProp, setTheirProp] = reactExports.useState(null);
  const [myCash, setMyCash] = reactExports.useState(0);
  const canConfirm = myProp != null && theirProp != null && myCash >= 0 && myCash <= me.cash;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.9 },
          animate: { scale: 1 },
          onClick: (e) => e.stopPropagation(),
          className: "glass-panel border border-accent-cyan/40 p-6 max-w-2xl w-full",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-2xl italic uppercase", children: [
                "Trade ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeftRight, { className: "inline size-5 mx-2" }),
                " ",
                partner.username
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-mono text-white/45 mb-4", children: "Swap one property each way and optionally add cash. The recipient must review the offer." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-2", children: [
                  "You give (",
                  me.username,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(PropPicker, { state, playerId: meId, selected: myProp, onSelect: setMyProp }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block mt-3 text-[10px] font-mono uppercase", children: "Cash you pay (₹)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    min: 0,
                    max: me.cash,
                    value: myCash,
                    onChange: (e) => setMyCash(Math.max(0, Math.min(me.cash, +e.target.value || 0))),
                    className: "w-full bg-black/40 border border-white/20 px-2 py-1 font-mono text-accent-amber"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono text-white/40 mt-1", children: [
                  "Your cash ",
                  formatInr(me.cash)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-pink mb-2", children: [
                  "You get (",
                  partner.username,
                  ")"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PropPicker,
                  {
                    state,
                    playerId: partnerId,
                    selected: theirProp,
                    onSelect: setTheirProp
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-6 justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "ghost", size: "sm", onClick: onClose, children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                NeonButton,
                {
                  variant: "cyan",
                  disabled: !canConfirm,
                  onClick: () => onPropose?.({
                    fromId: meId,
                    toId: partnerId,
                    fromProps: myProp != null ? [myProp] : [],
                    toProps: theirProp != null ? [theirProp] : [],
                    fromCash: myCash,
                    toCash: 0,
                    fromJailCards: 0,
                    toJailCards: 0
                  }),
                  children: "Confirm Trade"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
function TradeReviewPanel({
  state,
  trade,
  meId,
  onResolve
}) {
  const from = state.players.find((player) => player.id === trade.fromId);
  const to = state.players.find((player) => player.id === trade.toId);
  const isRecipient = trade.toId === meId;
  const propertyNames = (positions) => positions.map((position) => BOARD[position]?.name ?? `Tile ${position}`).join(", ") || "None";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.9 },
          animate: { scale: 1 },
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "trade-review-title",
          className: "glass-panel border border-accent-cyan/40 p-6 max-w-xl w-full",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.35em] text-accent-cyan mb-2", children: "Trade Offer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { id: "trade-review-title", className: "font-display text-2xl italic uppercase mb-4", children: [
              from?.username ?? "Player",
              " → ",
              to?.username ?? "Player"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3 text-xs font-mono", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border border-white/10 bg-black/25 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-accent-cyan uppercase mb-2", children: [
                  from?.username ?? "Offer",
                  " gives"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Properties: ",
                  propertyNames(trade.fromProps)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Cash: ",
                  formatInr(trade.fromCash)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Jail cards: ",
                  trade.fromJailCards
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "border border-white/10 bg-black/25 p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-accent-pink uppercase mb-2", children: [
                  to?.username ?? "Recipient",
                  " gives"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Properties: ",
                  propertyNames(trade.toProps)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Cash: ",
                  formatInr(trade.toCash)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  "Jail cards: ",
                  trade.toJailCards
                ] })
              ] })
            ] }),
            isRecipient ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 mt-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "pink", size: "sm", onClick: () => onResolve(false), children: "Reject" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "cyan", size: "sm", onClick: () => onResolve(true), children: "Accept" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-5 text-xs font-mono text-white/50", children: [
              "Waiting for ",
              to?.username ?? "the recipient",
              " to respond."
            ] })
          ]
        }
      )
    }
  );
}
const COLLAPSED_COUNT = 3;
function lineColor(kind) {
  switch (kind) {
    case "money":
      return "text-accent-amber";
    case "event":
      return "text-accent-pink";
    case "trade":
      return "text-accent-cyan";
    default:
      return "text-white/55";
  }
}
function EventLog({ log, compact = false }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  const visible = reactExports.useMemo(() => {
    if (expanded || log.length <= COLLAPSED_COUNT) return log;
    return log.slice(-COLLAPSED_COUNT);
  }, [expanded, log]);
  const hiddenCount = Math.max(0, log.length - COLLAPSED_COUNT);
  reactExports.useEffect(() => {
    if (!expanded) return;
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [log.length, expanded]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `rounded-sm border border-white/10 bg-black/35 ${compact ? "p-1.5" : "p-2.5"} flex flex-col ${expanded ? "min-h-0 flex-1" : "shrink-0"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mb-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-[8px] font-mono uppercase tracking-[0.28em] text-white/45", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "size-3 text-accent-cyan" }),
            "Log"
          ] }),
          log.length > COLLAPSED_COUNT ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setExpanded((v) => !v),
              className: "text-[8px] font-mono uppercase tracking-widest text-white/40 hover:text-accent-cyan flex items-center gap-0.5 transition-colors",
              children: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Less ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "size-3" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "+",
                hiddenCount,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3" })
              ] })
            }
          ) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ref,
            className: `space-y-0.5 text-[9px] font-mono leading-snug pr-0.5 ${expanded ? "overflow-y-auto min-h-0 flex-1 max-h-40" : "overflow-hidden max-h-[3.6rem]"}`,
            children: visible.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-white/25 text-[9px]", children: "No events yet." }) : visible.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `truncate ${lineColor(l.kind)}`, title: l.text, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white/25 mr-1", children: "›" }),
              l.text
            ] }, l.id))
          }
        )
      ]
    }
  );
}
const QUICK = [50, 100, 200, 500];
function BankManager({ state, canEdit, onClose, onAdjust, onTransfer }) {
  const players = state.players.filter((p) => !p.bankrupt);
  const [fromId, setFromId] = reactExports.useState(players[0]?.id ?? "");
  const [toId, setToId] = reactExports.useState(players[1]?.id ?? players[0]?.id ?? "");
  const [amount, setAmount] = reactExports.useState(100);
  const [customDelta, setCustomDelta] = reactExports.useState({});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.9, y: 20 },
          animate: { scale: 1, y: 0 },
          className: "glass-panel border border-accent-amber/40 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "size-6 text-accent-amber" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-amber", children: "Bank Manager" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl italic uppercase", children: "Cash Control" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: onClose,
                  className: "size-8 grid place-items-center hover:text-accent-pink",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-mono text-white/50 mb-4 leading-relaxed", children: canEdit ? "Pay players from the bank (+), collect to the bank (−), or transfer between players. Host-only house rules and corrections." : "Balances only — ask the room host to adjust cash." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 mb-6", children: players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "bg-black/30 border border-white/10 p-4 space-y-3",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm", style: { color: p.avatarColor }, children: p.username }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-2xl italic text-accent-amber tabular-nums", children: formatInr(p.cash) })
                  ] }) }),
                  canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1", children: [
                      QUICK.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => onAdjust(p.id, -q),
                          disabled: p.cash < q,
                          className: "px-2 py-1 border border-accent-pink/40 hover:bg-accent-pink/20 font-mono text-[10px] text-accent-pink disabled:opacity-30",
                          children: [
                            "−",
                            formatInr(q)
                          ]
                        },
                        `m${q}`
                      )),
                      QUICK.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "button",
                        {
                          type: "button",
                          onClick: () => onAdjust(p.id, q),
                          className: "px-2 py-1 border border-accent-cyan/40 hover:bg-accent-cyan/20 font-mono text-[10px] text-accent-cyan",
                          children: [
                            "+",
                            formatInr(q)
                          ]
                        },
                        `p${q}`
                      ))
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "number",
                          value: customDelta[p.id] ?? "",
                          placeholder: "Custom ± amt",
                          onChange: (e) => setCustomDelta({ ...customDelta, [p.id]: +e.target.value }),
                          className: "flex-1 bg-black/40 border border-white/20 px-2 py-1.5 font-mono text-xs"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            const v = customDelta[p.id] || 0;
                            if (v) onAdjust(p.id, v);
                          },
                          className: "px-3 py-1.5 border border-white/30 hover:border-accent-amber font-mono text-[10px]",
                          children: "Apply"
                        }
                      )
                    ] })
                  ] }) : null
                ]
              },
              p.id
            )) }),
            canEdit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-white/10 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-3", children: "Player → Player Transfer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: fromId,
                    onChange: (e) => setFromId(e.target.value),
                    className: "bg-black/40 border border-white/20 px-2 py-2 font-mono text-xs",
                    children: players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: p.id, children: [
                      p.username,
                      " (",
                      formatInr(p.cash),
                      ")"
                    ] }, p.id))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4 text-white/40 justify-self-center hidden sm:block" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: toId,
                    onChange: (e) => setToId(e.target.value),
                    className: "bg-black/40 border border-white/20 px-2 py-2 font-mono text-xs",
                    children: players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p.id, children: p.username }, p.id))
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    min: 1,
                    value: amount,
                    onChange: (e) => setAmount(+e.target.value),
                    className: "flex-1 bg-black/40 border border-white/20 px-2 py-2 font-mono text-xs"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  NeonButton,
                  {
                    size: "sm",
                    variant: "cyan",
                    onClick: () => {
                      if (amount > 0 && fromId && toId) onTransfer(fromId, toId, amount);
                    },
                    children: "Send"
                  }
                )
              ] })
            ] }) : null
          ]
        }
      )
    }
  );
}
function IndianEventBanner({ event, inline = true }) {
  if (!event) return null;
  if (inline) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "min-w-0 max-w-md flex items-center gap-1.5 rounded-sm border border-accent-amber/35 bg-accent-amber/10 px-2 py-0.5",
        title: event.description,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-accent-amber shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono uppercase tracking-[0.18em] text-accent-amber font-bold shrink-0", children: event.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono text-white/45 truncate", children: event.description })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center gap-2 border border-accent-amber/30 bg-accent-amber/[0.07] px-2.5 py-1 shrink-0 rounded-sm",
      title: event.description,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-accent-amber shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono uppercase tracking-[0.2em] text-accent-amber font-bold shrink-0", children: event.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-mono text-white/50 truncate", children: event.description })
      ]
    }
  );
}
const EFFECT_FILTERS = [
  { id: "all", label: "All" },
  { id: "cash", label: "Cash" },
  { id: "movement", label: "Movement" },
  { id: "jail", label: "Jail" },
  { id: "repairs", label: "Repairs" }
];
const ALL_CARDS = [...CHANCE_CARDS, ...CHEST_CARDS];
function effectCategory(action) {
  switch (action.kind) {
    case "money":
    case "moneyFromEach":
      return "cash";
    case "move":
    case "moveRel":
    case "nearest":
      return "movement";
    case "jail":
    case "getOutCard":
      return "jail";
    case "repairs":
      return "repairs";
  }
}
function effectDescription(action) {
  switch (action.kind) {
    case "money":
      return action.amount >= 0 ? `Collect ₹${action.amount.toLocaleString("en-IN")} from the bank.` : `Pay ₹${Math.abs(action.amount).toLocaleString("en-IN")} to the bank.`;
    case "moneyFromEach":
      return action.amount >= 0 ? `Collect ₹${action.amount.toLocaleString("en-IN")} from each other player.` : `Pay ₹${Math.abs(action.amount).toLocaleString("en-IN")} to each other player.`;
    case "move": {
      const destination = BOARD[action.to]?.name ?? `tile ${action.to}`;
      return `Move to ${destination}${action.collectGoIfPass ? ". Collect the GO bonus if you pass GO." : "."}`;
    }
    case "moveRel":
      return `Move ${Math.abs(action.steps)} spaces ${action.steps < 0 ? "backward" : "forward"}.`;
    case "nearest":
      return `Move to the nearest ${action.kind2 === "railroad" ? "Railway" : "Utility"}; landing effects apply.`;
    case "jail":
      return "Move directly to Jail.";
    case "getOutCard":
      return "Keep this card to leave Jail without paying bail.";
    case "repairs":
      return `Pay ₹${action.perHouse.toLocaleString("en-IN")} per house and ₹${action.perHotel.toLocaleString("en-IN")} per hotel you own.`;
  }
}
function isPositiveOutcome(action) {
  if (action.kind === "money" || action.kind === "moneyFromEach") return action.amount > 0;
  if (action.kind === "getOutCard") return true;
  return action.kind === "move" && action.collectGoIfPass === true;
}
function CardCatalogModal({ onClose }) {
  const [deck, setDeck] = reactExports.useState("chance");
  const [filter, setFilter] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const [expandedCard, setExpandedCard] = reactExports.useState(null);
  const isChance = deck === "chance";
  const cards = isChance ? CHANCE_CARDS : CHEST_CARDS;
  const visibleCards = cards.map((card, index) => ({ card, index })).filter(({ card }) => filter === "all" || effectCategory(card.action) === filter).filter(({ card }) => card.text.toLowerCase().includes(search.trim().toLowerCase()));
  const rewardCount = ALL_CARDS.filter(({ action }) => isPositiveOutcome(action)).length;
  const movementCount = ALL_CARDS.filter(({ action }) => effectCategory(action) === "movement").length;
  const jailCardCount = ALL_CARDS.filter(({ action }) => action.kind === "getOutCard").length;
  const costCount = ALL_CARDS.filter(
    ({ action }) => (action.kind === "money" || action.kind === "moneyFromEach") && action.amount < 0
  ).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4",
      onClick: onClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.95, y: 12 },
          animate: { scale: 1, y: 0 },
          role: "dialog",
          "aria-modal": "true",
          "aria-labelledby": "card-catalog-title",
          className: "glass-panel border border-white/15 w-full max-w-2xl max-h-[85vh] p-5 sm:p-6 flex flex-col",
          onClick: (event) => event.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                isChance ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-5 text-accent-pink shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "size-5 text-accent-cyan shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-mono uppercase tracking-[0.3em] text-white/45", children: "Card Decks" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "card-catalog-title", className: "font-display text-2xl italic uppercase", children: "Available Cards" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: onClose,
                  "aria-label": "Close card catalog",
                  className: "size-8 grid place-items-center border border-white/15 hover:border-accent-pink/60 hover:text-accent-pink shrink-0",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-1.5 mb-4", role: "tablist", "aria-label": "Card deck", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  role: "tab",
                  "aria-selected": isChance,
                  onClick: () => setDeck("chance"),
                  className: `border px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${isChance ? "border-accent-pink/70 bg-accent-pink/15 text-accent-pink" : "border-white/15 text-white/50 hover:text-white"}`,
                  children: [
                    "Chance (",
                    CHANCE_CARDS.length,
                    ")"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  role: "tab",
                  "aria-selected": !isChance,
                  onClick: () => setDeck("chest"),
                  className: `border px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${!isChance ? "border-accent-cyan/70 bg-accent-cyan/15 text-accent-cyan" : "border-white/15 text-white/50 hover:text-white"}`,
                  children: [
                    "Community Chest (",
                    CHEST_CARDS.length,
                    ")"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-y border-white/10 py-2.5 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] font-mono uppercase tracking-[0.25em] text-white/40 mb-2", children: [
                "Combined deck effects · ",
                ALL_CARDS.length,
                " cards"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-accent-amber", children: [
                  rewardCount,
                  " reward outcomes"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-accent-cyan", children: [
                  movementCount,
                  " movement cards"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-accent-amber", children: [
                  jailCardCount,
                  " Get Out of Jail cards"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-accent-pink", children: [
                  costCount,
                  " direct cash penalties"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/40" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "search",
                  value: search,
                  onChange: (event) => setSearch(event.target.value),
                  placeholder: "Search card text",
                  className: "w-full bg-black/35 border border-white/15 py-2 pl-8 pr-3 text-xs font-mono placeholder:text-white/30 focus:border-accent-cyan/60 outline-none"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 overflow-x-auto pb-2 mb-1", "aria-label": "Filter cards by effect", children: [
              EFFECT_FILTERS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "aria-pressed": filter === option.id,
                  onClick: () => setFilter(option.id),
                  className: `shrink-0 border px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${filter === option.id ? "border-white/60 bg-white/10 text-white" : "border-white/10 text-white/45 hover:text-white/80"}`,
                  children: option.label
                },
                option.id
              )),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto self-center shrink-0 text-[9px] font-mono text-white/35", children: [
                visibleCards.length,
                " shown"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "min-h-0 overflow-y-auto divide-y divide-white/10 border-y border-white/10", children: visibleCards.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "py-8 text-center text-xs font-mono text-white/40", children: "No cards match these filters." }) : visibleCards.map(({ card, index }) => {
              const expanded = expandedCard === index;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "aria-expanded": expanded,
                    onClick: () => setExpandedCard(expanded ? null : index),
                    className: "w-full flex items-center gap-3 py-3 px-1 text-left hover:bg-white/[0.04] transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "span",
                        {
                          className: `font-mono text-[10px] tabular-nums shrink-0 ${isChance ? "text-accent-pink" : "text-accent-cyan"}`,
                          children: String(index + 1).padStart(2, "0")
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 min-w-0 text-xs sm:text-sm font-mono text-white/85 leading-relaxed", children: card.text }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline shrink-0 border border-white/15 px-1.5 py-0.5 text-[8px] font-mono uppercase text-white/45", children: effectCategory(card.action) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ChevronDown,
                        {
                          className: `size-4 shrink-0 text-white/45 transition-transform ${expanded ? "rotate-180" : ""}`
                        }
                      )
                    ]
                  }
                ),
                expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "ml-7 mr-2 mb-3 border-l-2 pl-3 py-1 text-[10px] sm:text-xs font-mono text-white/60",
                    style: { borderColor: isChance ? "var(--accent-pink)" : "var(--accent-cyan)" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-widest text-white/40 mr-2", children: "Effect" }),
                      effectDescription(card.action)
                    ]
                  }
                )
              ] }, `${deck}-${index}`);
            }) })
          ]
        }
      )
    }
  );
}
function CardRevealModal({
  card,
  onContinue
}) {
  const isChance = card.deck === "chance";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm grid place-items-center p-4",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { scale: 0.9, y: 16 },
          animate: { scale: 1, y: 0 },
          className: `glass-panel border p-8 max-w-md w-full text-center ${isChance ? "border-accent-pink/50" : "border-accent-cyan/50"}`,
          children: [
            isChance ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-10 text-accent-pink mx-auto mb-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Boxes, { className: "size-10 text-accent-cyan mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `text-[10px] font-mono uppercase tracking-[0.4em] mb-2 ${isChance ? "text-accent-pink" : "text-accent-cyan"}`,
                children: isChance ? "Chance" : "Community Chest"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl italic uppercase mb-4", children: "Card Drawn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono text-white/80 leading-relaxed mb-6", children: card.text }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "cyan", className: "w-full", onClick: onContinue, children: "Continue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-[10px] font-mono text-white/40 leading-relaxed", children: "Cards are drawn at random when you land on Chance or Community Chest and apply at once." })
          ]
        }
      )
    }
  );
}
function parseCardLogLine(text) {
  const match = text.match(/^Card\s*\((CHANCE|CHEST)\)\s*:\s*(.+)$/i);
  if (!match) return null;
  return {
    deck: match[1].toUpperCase() === "CHANCE" ? "chance" : "chest",
    text: match[2].trim()
  };
}
const useMonopolyStore = create()(
  persist(
    (set) => ({
      games: {},
      setGame: (id, s) => set((st) => ({ games: { ...st.games, [id]: s } })),
      patch: (id, fn) => set((st) => {
        const cur = st.games[id];
        if (!cur) return st;
        return { games: { ...st.games, [id]: fn(cur) } };
      }),
      clear: (id) => set((st) => {
        const { [id]: _drop, ...rest } = st.games;
        return { games: rest };
      })
    }),
    { name: "gh-monopoly" }
  )
);
function useGameSnapshot(gameId) {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: () => gamesApi.snapshot(gameId),
    enabled: !!gameId
  });
}
function usePauseGame() {
  return useMutation({ mutationFn: (gameId) => gamesApi.pause(gameId) });
}
function useResumeGame() {
  return useMutation({ mutationFn: (gameId) => gamesApi.resume(gameId) });
}
const monopolyApi = {
  action: async (sessionId, body) => {
    const { data } = await api.post(`monopoly/${sessionId}/action`, body);
    return data;
  },
  getState: async (sessionId) => {
    const { data } = await api.get(`monopoly/${sessionId}`);
    return data;
  }
};
function mapPhase(phase) {
  switch ((phase ?? "").toString()) {
    case "WAITING_FOR_ROLL":
      return "rolling";
    case "WAITING_FOR_DECISION":
      return "landed";
    case "WAITING_FOR_TRADE":
      return "trade";
    case "WAITING_FOR_AUCTION":
      return "auction";
    case "PAUSED":
      return "paused";
    case "ENDED":
      return "ended";
    default:
      return "rolling";
  }
}
function resolveRoomPlayerId(rawPlayerId, roomPlayers) {
  if (!rawPlayerId) return null;
  const match = roomPlayers.find((player) => String(player.id ?? "") === String(rawPlayerId) || String(player.userId ?? "") === String(rawPlayerId));
  return match?.id ? String(match.id) : String(rawPlayerId);
}
function normalizeMetadata(metadata) {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)]));
}
function normalizeAuctionState(auction, roomPlayers) {
  if (!auction) return null;
  return {
    tileIndex: auction.tilePosition ?? auction.tileIndex ?? 0,
    bids: Array.isArray(auction.bids) ? auction.bids.map((bid) => ({
      playerId: resolveRoomPlayerId(String(bid.playerId ?? bid.bidderId ?? ""), roomPlayers) ?? String(bid.playerId ?? bid.bidderId ?? ""),
      amount: Number(bid.amount ?? 0)
    })) : [],
    currentBidderIndex: auction.currentBidderIndex ?? 0,
    activePlayerIds: Array.isArray(auction.activePlayerIds) ? auction.activePlayerIds.map((playerId) => resolveRoomPlayerId(String(playerId), roomPlayers) ?? String(playerId)) : [],
    highestBid: auction.highestBid ?? 0,
    highestBidderId: auction.highestBidder != null ? resolveRoomPlayerId(String(auction.highestBidder), roomPlayers) ?? String(auction.highestBidder) : auction.highestBidderId != null ? resolveRoomPlayerId(String(auction.highestBidderId), roomPlayers) ?? String(auction.highestBidderId) : null,
    startedAt: auction.startedAt ?? 0
  };
}
function normalizeTradeState(trade, roomPlayers) {
  if (!trade) return null;
  return {
    ...trade,
    fromId: resolveRoomPlayerId(trade.fromId, roomPlayers) ?? trade.fromId,
    toId: resolveRoomPlayerId(trade.toId, roomPlayers) ?? trade.toId,
    status: String(trade.status).toLowerCase()
  };
}
function parseRentTransferLogLine(text, players) {
  const match = text.match(/^(.+?) paid (₹[\d,]+) rent to (.+?)[.]?$/i);
  if (!match) return null;
  const payerName = match[1].trim().toLowerCase();
  const recipientName = match[3].trim().toLowerCase();
  const payer = players.find((player) => player.username.toLowerCase() === payerName);
  const recipient = players.find((player) => player.username.toLowerCase() === recipientName);
  if (!payer || !recipient) return null;
  return {
    payer,
    recipient,
    amount: match[2]
  };
}
function buildMonopolyActionRequest(type, payload, state) {
  const p = payload;
  let actionType = null;
  switch (type) {
    case "ROLL":
      actionType = "ROLL_DICE";
      break;
    case "BUY":
      actionType = "BUY_PROPERTY";
      break;
    case "END_TURN":
      actionType = "END_TURN";
      break;
    case "PAY_JAIL":
      actionType = "PAY_JAIL";
      break;
    case "USE_JAIL_CARD":
      actionType = "USE_JAIL_CARD";
      break;
    case "BUILD_HOUSE":
      actionType = "BUILD_HOUSE";
      break;
    case "BUILD_HOTEL":
      actionType = "BUILD_HOTEL";
      break;
    case "SELL_HOUSE":
      actionType = "SELL_HOUSE";
      break;
    case "TOGGLE_MORTGAGE": {
      const tileIndex = Number(p.tileIndex);
      const property = Number.isFinite(tileIndex) ? state.properties[tileIndex] : void 0;
      actionType = property?.mortgaged ? "UNMORTGAGE" : "MORTGAGE";
      break;
    }
    case "PROPOSE_TRADE":
      actionType = "TRADE";
      break;
    case "RESPOND_TRADE":
      actionType = "TRADE";
      break;
    case "BANK_ADJUST":
      actionType = "BANK_ADJUST";
      break;
    case "BANK_TRANSFER":
      actionType = "BANK_TRANSFER";
      break;
    default:
      return null;
  }
  const requestBody = {
    type: actionType
  };
  if (p.tileIndex != null) requestBody.tilePosition = Number(p.tileIndex);
  if (p.amount != null) requestBody.amount = Number(p.amount);
  if (p.targetPlayerId != null) requestBody.targetPlayerId = String(p.targetPlayerId);
  if (p.playerId != null && type === "BANK_ADJUST") {
    requestBody.targetPlayerId = String(p.playerId);
    if (p.delta != null) requestBody.amount = Number(p.delta);
  }
  if (type === "BANK_TRANSFER") {
    requestBody.targetPlayerId = String(p.to);
    requestBody.amount = Number(p.amt ?? p.amount ?? 0);
    requestBody.metadata = {
      fromPlayerId: String(p.from)
    };
  }
  if (p.metadata && typeof p.metadata === "object") {
    requestBody.metadata = normalizeMetadata(p.metadata);
  }
  if (type === "PROPOSE_TRADE" && p.offer) {
    const offer = p.offer;
    requestBody.targetPlayerId = String(offer.toId);
    const metadata = {};
    if (offer.fromProps?.[0] != null) metadata.offeredTile = String(offer.fromProps[0]);
    if (offer.toProps?.[0] != null) metadata.requestedTile = String(offer.toProps[0]);
    if (Object.keys(metadata).length > 0) requestBody.metadata = metadata;
    const cashDelta = Number(offer.fromCash ?? 0) - Number(offer.toCash ?? 0);
    if (cashDelta !== 0) requestBody.amount = cashDelta;
  }
  if (type === "RESPOND_TRADE") {
    requestBody.targetPlayerId = String(p.targetPlayerId ?? "");
    requestBody.metadata = {
      action: String(p.decision ?? "DECLINE"),
      tradeId: String(p.tradeId ?? "")
    };
  }
  return requestBody;
}
function extractSocketState(message) {
  if (!message || typeof message !== "object") return null;
  const envelope = message;
  const payload = envelope.payload;
  if (payload && typeof payload === "object" && "state" in payload) {
    return payload.state ?? null;
  }
  if (payload && typeof payload === "object") {
    return payload;
  }
  if (envelope.state) return envelope.state;
  return message;
}
function mapSnapshotToState(session, room, gameId, previous) {
  const backend = session.state ?? session;
  const resolvedSessionId = session.sessionId ?? session.id ?? gameId;
  const assets = backend.assets ?? {};
  const roomPlayers = room?.players ?? [];
  const players = roomPlayers.map((p) => {
    const asset = assets[p.id] ?? assets[p.userId] ?? null;
    const username = p.username ?? p.displayName ?? p.id;
    return {
      id: p.id,
      userId: p.userId,
      username,
      avatarColor: p.avatarColor ?? pickAvatarColor(username),
      isAI: p.isAI ?? p.aiControlled ?? false,
      position: asset?.position ?? 0,
      cash: asset?.cash ?? 15e3,
      inJail: asset?.inJail ?? false,
      jailTurns: asset?.jailTurns ?? 0,
      jailCards: asset?.jailCards ?? asset?.getOutOfJailCards ?? 0,
      bankrupt: asset?.bankrupt ?? false
    };
  });
  const properties = {};
  BOARD.forEach((tile) => {
    if (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") {
      properties[tile.index] = {
        ownerId: null,
        houses: 0,
        mortgaged: false
      };
    }
  });
  const owners = {};
  Object.entries(backend.owners ?? {}).forEach(([pos, ownerId]) => {
    const resolvedOwnerId = resolveRoomPlayerId(ownerId != null ? String(ownerId) : null, roomPlayers);
    if (resolvedOwnerId) owners[pos] = resolvedOwnerId;
  });
  if (Object.keys(owners).length === 0) {
    Object.entries(assets).forEach(([playerId, asset]) => {
      const positions = asset?.ownedTilePositions ?? [];
      positions.forEach((pos) => {
        owners[String(pos)] = resolveRoomPlayerId(String(playerId), roomPlayers) ?? String(playerId);
      });
    });
  }
  const developments = backend.developments ?? {};
  const mortgaged = new Set(backend.mortgagedTiles ?? []);
  Object.keys(owners).forEach((k) => {
    const pos = Number(k);
    const ownerId = owners[k] ? String(owners[k]) : null;
    const dev = developments[pos] ?? developments[String(pos)] ?? null;
    const houses = dev?.hotel ? 5 : dev?.houses ?? 0;
    properties[pos] = {
      ownerId,
      houses,
      mortgaged: mortgaged.has(pos)
    };
  });
  const rawCurrentPlayerId = String(backend.currentPlayerId ?? "");
  const curPlayerId = resolveRoomPlayerId(rawCurrentPlayerId, roomPlayers) ?? rawCurrentPlayerId;
  let curPlayerIndex = players.findIndex((p) => String(p.id) === curPlayerId || String(p.id) === rawCurrentPlayerId || String(p.userId) === rawCurrentPlayerId);
  if (curPlayerIndex < 0) curPlayerIndex = 0;
  curPlayerIndex = Math.min(curPlayerIndex, Math.max(players.length - 1, 0));
  const mappedPhase = mapPhase(backend.phase);
  const declinedPurchaseTile = mappedPhase === "rolling" ? null : backend.declinedPurchaseTile != null ? Number(backend.declinedPurchaseTile) : previous?.declinedPurchaseTile ?? null;
  let pendingPurchaseTile = backend.pendingPurchaseTile ?? null;
  if (pendingPurchaseTile == null && mappedPhase === "landed") {
    const currentPosition = players[curPlayerIndex]?.position;
    const tile = typeof currentPosition === "number" ? BOARD[currentPosition] : null;
    const property = typeof currentPosition === "number" ? properties[currentPosition] : null;
    const purchaseClosed = declinedPurchaseTile != null && declinedPurchaseTile === currentPosition;
    if (tile && property && (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") && !property.ownerId && !purchaseClosed) {
      pendingPurchaseTile = currentPosition;
    }
  }
  const total = backend.lastDiceTotal ?? 0;
  const d1 = total > 0 ? Math.ceil(total / 2) : 1;
  const d2 = total > 0 ? Math.floor(total / 2) : 1;
  const prevTotal = previous?.lastRoll ? previous.lastRoll.d1 + previous.lastRoll.d2 : null;
  const lastRoll = total > 0 ? {
    d1,
    d2,
    isDouble: d1 === d2,
    rolledAt: previous?.lastRoll && prevTotal === total ? previous.lastRoll.rolledAt : Date.now()
  } : null;
  return {
    gameId: String(resolvedSessionId),
    players,
    currentPlayerIndex: curPlayerIndex,
    phase: mappedPhase,
    lastRoll,
    consecutiveDoubles: backend.consecutiveDoubles ?? 0,
    properties,
    chanceDeck: backend.board?.chanceDeck ?? [],
    chestDeck: backend.board?.chestDeck ?? [],
    pendingPurchaseTile,
    declinedPurchaseTile,
    pendingCard: backend.pendingCard ?? null,
    auction: normalizeAuctionState(backend.auction, roomPlayers),
    trade: normalizeTradeState(backend.trade, roomPlayers),
    log: (backend.log ?? []).map((t, i) => {
      let text = String(t);
      for (const p of players) {
        if (p.id) text = text.split(p.id).join(p.username);
        if (p.userId) text = text.split(String(p.userId)).join(p.username);
      }
      const lower = text.toLowerCase();
      const kind = lower.includes("rent") || lower.includes("bank") || lower.includes("tax") || lower.includes("₹") || lower.includes("paid") || lower.includes("purchased") || lower.includes("mortgage") ? "money" : lower.includes("card") || lower.includes("event") || lower.includes("chance") ? "event" : lower.includes("trade") ? "trade" : "info";
      return {
        id: String(i),
        text,
        ts: i,
        kind
      };
    }),
    winnerId: resolveRoomPlayerId(backend.winnerId != null ? String(backend.winnerId) : null, roomPlayers) ?? backend.winnerId ?? null,
    activeEvent: backend.activeEvent?.id ? {
      id: String(backend.activeEvent.id),
      title: backend.activeEvent.title ?? String(backend.activeEvent.id),
      description: backend.activeEvent.description ?? "",
      expiresOnTurn: backend.activeEvent.expiresOnTurn ?? 0
    } : null
  };
}
function MonopolyPage() {
  const {
    gameId
  } = Route$2.useParams();
  const navigate = useNavigate();
  const state = useMonopolyStore((s) => s.games[gameId]);
  const setGame = useMonopolyStore((s) => s.setGame);
  const snapshot = useGameSnapshot(gameId);
  const pauseGame = usePauseGame();
  const resumeGame = useResumeGame();
  const roomQuery = useRoom(snapshot.data?.roomId);
  const leaveRoomMut = useLeaveRoom();
  const reconnectMut = useReconnectRoom();
  const queryClient = useQueryClient();
  const wsConnected = useConnectionStore((s) => s.connected);
  const roomId = snapshot.data?.roomId;
  const sessionId = snapshot.data?.id ?? snapshot.data?.sessionId ?? gameId;
  reactExports.useEffect(() => {
    if (!roomId || !sessionId) return;
    localStorage.setItem("gamehub:resume-session", JSON.stringify({
      roomId,
      sessionId,
      gameType: "monopoly"
    }));
  }, [roomId, sessionId]);
  const prevWsConnected = reactExports.useRef(wsConnected);
  const didMountReconnect = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!roomId) return;
    const becameConnected = wsConnected && !prevWsConnected.current;
    prevWsConnected.current = wsConnected;
    const mountReconnect = wsConnected && !didMountReconnect.current;
    if (mountReconnect) didMountReconnect.current = true;
    if (!becameConnected && !mountReconnect) return;
    let cancelled = false;
    (async () => {
      try {
        await reconnectMut.mutateAsync(roomId);
        if (cancelled) return;
        await queryClient.invalidateQueries({
          queryKey: ["game", gameId]
        });
        await snapshot.refetch();
      } catch (e) {
        console.warn("[monopoly] room reconnect failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, wsConnected, gameId, queryClient]);
  const primaryDestination = roomId ? Topics.gameRoom(roomId) : null;
  reactExports.useEffect(() => {
    console.log("[monopoly] sessionId:", sessionId, "roomId:", roomId);
    console.log("[monopoly] room topic:", primaryDestination);
  }, [sessionId, roomId, primaryDestination]);
  const roomDataRef = reactExports.useRef(roomQuery.data);
  reactExports.useEffect(() => {
    roomDataRef.current = roomQuery.data;
  }, [roomQuery.data]);
  const applyMonopolyState = reactExports.useCallback((nextState, nextSessionId) => {
    const previous = useMonopolyStore.getState().games[gameId] ?? null;
    const mapped = mapSnapshotToState({
      sessionId: nextSessionId ?? nextState?.sessionId ?? sessionId,
      state: nextState
    }, roomDataRef.current, gameId, previous);
    setGame(gameId, mapped);
    return mapped;
  }, [gameId, sessionId, setGame]);
  const handleGameUpdate = reactExports.useCallback((msg) => {
    console.log("[monopoly] 📥 STOMP message received:", JSON.stringify(msg, null, 2));
    if (!msg) return;
    try {
      const envelope = typeof msg === "object" ? msg : null;
      if (envelope?.type === "AUCTION_UPDATE") {
        const current = useMonopolyStore.getState().games[gameId];
        const auction = normalizeAuctionState(envelope.payload ?? null, roomDataRef.current?.players ?? current?.players ?? []);
        if (current) {
          const clearedTile = !auction && current.phase === "auction" ? current.auction?.tileIndex ?? current.pendingPurchaseTile : null;
          setGame(gameId, {
            ...current,
            auction,
            phase: auction ? "auction" : current.phase === "auction" ? "landed" : current.phase,
            // Auction finished (incl. unsold) — never reopen Buy/Auction for that tile.
            pendingPurchaseTile: auction ? auction.tileIndex ?? current.pendingPurchaseTile : null,
            declinedPurchaseTile: clearedTile != null ? clearedTile : current.declinedPurchaseTile
          });
        } else if (auction) {
          applyMonopolyState({
            sessionId,
            phase: "WAITING_FOR_AUCTION",
            auction: envelope.payload
          }, sessionId);
        }
        return;
      }
      const prevAuction = useMonopolyStore.getState().games[gameId]?.auction ?? null;
      const rawState = extractSocketState(msg);
      if (!rawState) return;
      const mapped = applyMonopolyState(rawState, envelope?.sessionId ?? rawState.sessionId ?? sessionId);
      if (envelope?.type !== "AUCTION" && !mapped.auction && prevAuction && mapped.phase !== "ended") {
        setGame(gameId, {
          ...mapped,
          auction: prevAuction,
          phase: "auction"
        });
      }
      console.log("[monopoly] ✅ Mapped — phase:", mapped.phase, "currentPlayerIndex:", mapped.currentPlayerIndex);
    } catch (e) {
      console.error("Failed to apply game update", e);
    }
  }, [applyMonopolyState, gameId, sessionId, setGame]);
  useStompSubscription(primaryDestination, handleGameUpdate, !!primaryDestination);
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = reactExports.useState(false);
  const [openTile, setOpenTile] = reactExports.useState(null);
  const [focusPlayerId, setFocusPlayerId] = reactExports.useState(null);
  const [tradePartner, setTradePartner] = reactExports.useState(null);
  const [bankOpen, setBankOpen] = reactExports.useState(false);
  const [cardCatalogOpen, setCardCatalogOpen] = reactExports.useState(false);
  const [cardReveal, setCardReveal] = reactExports.useState(null);
  const seenCardLogRef = reactExports.useRef(null);
  const seenPendingCardRef = reactExports.useRef(null);
  const seenRentLogRef = reactExports.useRef(null);
  const autoEndTimer = reactExports.useRef(null);
  const auctionStartingRef = reactExports.useRef(false);
  const aiTimer = reactExports.useRef(null);
  const hasValidState = Boolean(state && state.players?.length > 0);
  const me = reactExports.useMemo(() => {
    if (!state || !user) return void 0;
    return state.players.find((p) => p.userId === user.id || p.username === user.username) ?? state.players.find((p) => p.id === user.id) ?? state.players.find((p) => !p.isAI) ?? state.players[0];
  }, [state, user]);
  const isMyTurnPreview = Boolean(me && state && !state.players[state.currentPlayerIndex]?.isAI && !state.players[state.currentPlayerIndex]?.bankrupt && state.players[state.currentPlayerIndex]?.id === me.id);
  reactExports.useEffect(() => {
    if (!state?.log?.length) return;
    const last = state.log[state.log.length - 1];
    if (!last || last.text === seenCardLogRef.current) return;
    const parsed = parseCardLogLine(last.text);
    if (parsed) {
      seenCardLogRef.current = last.text;
      setCardReveal(parsed);
    }
  }, [state?.log]);
  reactExports.useEffect(() => {
    const pendingCard = state?.pendingCard;
    if (!pendingCard) {
      seenPendingCardRef.current = null;
      return;
    }
    const key = `${pendingCard.deck}:${pendingCard.index}:${state.lastRoll?.rolledAt ?? ""}`;
    if (seenPendingCardRef.current === key) return;
    const deck = pendingCard.deck === "chance" ? CHANCE_CARDS : CHEST_CARDS;
    const card = deck[pendingCard.index];
    if (!card) return;
    seenPendingCardRef.current = key;
    setCardReveal({
      deck: pendingCard.deck,
      text: card.text
    });
  }, [state?.pendingCard, state?.lastRoll?.rolledAt]);
  reactExports.useEffect(() => {
    const logs = state?.log;
    if (!logs?.length) return;
    const logKey = (entry) => `${entry.id}:${entry.text}`;
    const currentKeys = new Set(logs.map(logKey));
    const seen = seenRentLogRef.current;
    if (!seen) {
      seenRentLogRef.current = currentKeys;
      return;
    }
    logs.forEach((entry) => {
      const key = logKey(entry);
      if (seen.has(key)) return;
      seen.add(key);
      const transfer = parseRentTransferLogLine(entry.text, state.players);
      if (!transfer || !me) return;
      if (transfer.payer.id === me.id) {
        toast.message("Rent paid", {
          description: `You paid ${transfer.amount} rent to ${transfer.recipient.username}.`
        });
      } else if (transfer.recipient.id === me.id) {
        toast.success("Rent received", {
          description: `${transfer.payer.username} paid you ${transfer.amount} rent.`
        });
      }
    });
    seen.forEach((key) => {
      if (!currentKeys.has(key)) seen.delete(key);
    });
  }, [state?.log, state?.players, me]);
  reactExports.useEffect(() => {
    if (autoEndTimer.current) {
      clearTimeout(autoEndTimer.current);
      autoEndTimer.current = null;
    }
    if (!state || !me || !isMyTurnPreview || !sessionId) return;
    if (state.phase === "auction" || state.auction || auctionStartingRef.current) return;
    if (state.phase !== "landed") return;
    if (state.pendingPurchaseTile != null) return;
    const curPlayer = state.players[state.currentPlayerIndex];
    const pos = curPlayer?.position;
    if (typeof pos === "number") {
      const tile = BOARD[pos];
      const prop = state.properties[pos];
      const offerClosed = state.declinedPurchaseTile === pos;
      const buyable = !offerClosed && tile && (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") && prop && !prop.ownerId;
      if (buyable) return;
    }
    if (cardReveal || openTile != null || bankOpen || tradePartner) return;
    autoEndTimer.current = setTimeout(async () => {
      const live = useMonopolyStore.getState().games[gameId];
      if (!live || live.phase === "auction" || live.auction || auctionStartingRef.current || live.pendingPurchaseTile != null) {
        return;
      }
      try {
        const nextState = await monopolyApi.action(sessionId, {
          type: "END_TURN"
        });
        applyMonopolyState(nextState, sessionId);
        toast.message("Turn passed");
      } catch (e) {
        console.error("[monopoly] auto continue failed", e);
      }
    }, 1200);
    return () => {
      if (autoEndTimer.current) clearTimeout(autoEndTimer.current);
    };
  }, [state, me, isMyTurnPreview, sessionId, cardReveal, openTile, bankOpen, tradePartner, applyMonopolyState, gameId]);
  reactExports.useEffect(() => {
    if (state?.auction || state?.phase === "auction") {
      auctionStartingRef.current = false;
    }
  }, [state?.auction, state?.phase]);
  reactExports.useEffect(() => {
    if (!state || state.phase === "ended") return;
    const timer = aiTimer.current;
    if (timer) clearTimeout(timer);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, gameId]);
  reactExports.useEffect(() => {
    if (!snapshot.data || !roomQuery.data) return;
    try {
      const session = snapshot.data;
      const room = roomQuery.data;
      const mapped = mapSnapshotToState(session, room, gameId, useMonopolyStore.getState().games[gameId] ?? null);
      const prevAuction = useMonopolyStore.getState().games[gameId]?.auction ?? null;
      if (!mapped.auction && prevAuction) {
        mapped.auction = prevAuction;
        mapped.phase = "auction";
      }
      setGame(gameId, mapped);
      setHydrated(true);
    } catch (e) {
      console.error("Failed to hydrate Monopoly store from snapshot", e);
    }
  }, [snapshot.data, roomQuery.data, gameId, setGame]);
  if (snapshot.isLoading || roomQuery.isLoading || !snapshot.data || !roomQuery.data || !user || !hydrated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6 font-mono", children: "Fetching snapshot…" }) }) }) });
  }
  if (!hasValidState) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6 font-mono", children: "Waiting for players…" }) }) }) });
  }
  if (snapshot.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6 font-mono", children: "Unable to load game." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => navigate({
        to: "/"
      }), children: "Back Home" })
    ] }) }) });
  }
  if (!state || !me) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center px-6 pt-32 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 mb-6 font-mono", children: "This match has ended or was lost." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => navigate({
        to: "/"
      }), children: "Back Home" })
    ] }) }) });
  }
  const cur = state.players[state.currentPlayerIndex] ?? state.players[0];
  const isMyTurn = state.phase !== "paused" && !cur.isAI && !cur.bankrupt && cur.id === me.id;
  const isRoomHost = Boolean(user?.id && roomQuery.data?.hostId === user.id);
  const setGamePaused = async (paused) => {
    if (!isRoomHost || !sessionId) return;
    try {
      if (paused) await pauseGame.mutateAsync(sessionId);
      else await resumeGame.mutateAsync(sessionId);
      await queryClient.invalidateQueries({
        queryKey: ["game", gameId]
      });
      await snapshot.refetch();
    } catch (e) {
      console.error("[monopoly] pause state change failed", e);
      toast.error(paused ? "Unable to pause game" : "Unable to resume game");
    }
  };
  const sendGameAction = async (type, payload = {}) => {
    if (!sessionId) return false;
    const isAuctionAct = type === "PLACE_BID" || type === "PASS_BID";
    const isBankAct = type === "BANK_ADJUST" || type === "BANK_TRANSFER";
    const isTradeResponse = type === "RESPOND_TRADE";
    if (state.phase === "paused") {
      toast.error("Game paused", {
        description: "Actions are blocked until the host resumes."
      });
      return false;
    }
    if (!isMyTurn && !isAuctionAct && !isBankAct && !isTradeResponse) {
      console.warn(`[game] ignoring "${type}" — it's ${cur.username}'s turn, not yours (${me.username}).`);
      return false;
    }
    if (isBankAct && !isRoomHost) {
      toast.error("Bank Manager locked", {
        description: "Only the room host can adjust or transfer cash."
      });
      return false;
    }
    const p = payload;
    const isAuctionAction = type === "START_AUCTION" || type === "PLACE_BID" || type === "PASS_BID";
    if (isAuctionAction) {
      const startTileIndex = p.tileIndex ?? state.pendingPurchaseTile;
      if (type === "START_AUCTION" && startTileIndex == null) {
        toast.error("Auction unavailable", {
          description: "No property selected to auction."
        });
        return false;
      }
      const auctionBody = type === "START_AUCTION" ? {
        action: "START",
        tilePosition: Number(startTileIndex)
      } : type === "PLACE_BID" ? {
        action: "PLACE_BID",
        amount: Number(p.amount ?? 0)
      } : {
        action: "PASS"
      };
      const dest = Topics.send.auction(sessionId);
      if (type === "START_AUCTION") {
        auctionStartingRef.current = true;
        if (autoEndTimer.current) {
          clearTimeout(autoEndTimer.current);
          autoEndTimer.current = null;
        }
        window.setTimeout(() => {
          if (!useMonopolyStore.getState().games[gameId]?.auction) {
            auctionStartingRef.current = false;
          }
        }, 15e3);
      }
      const {
        sent,
        requestId
      } = stomp.sendTrackedMessage(dest, auctionBody, type, {
        sessionId
      });
      if (sent) {
        console.debug("[game] sent auction action over STOMP", type, dest, auctionBody);
        return true;
      }
      auctionStartingRef.current = false;
      useWebsocketRequestStore.getState().failRequest(String(requestId), "CONNECTION_ERROR", "Unable to contact server");
      toast.error("Auction action failed", {
        description: "Realtime connection is unavailable. Reconnect before retrying the auction."
      });
      return false;
    }
    const requestBody = buildMonopolyActionRequest(type, payload, state);
    if (!requestBody) {
      toast.error("Action unavailable", {
        description: `Unsupported Monopoly action: ${type}`
      });
      return false;
    }
    try {
      const nextState = await monopolyApi.action(sessionId, requestBody);
      applyMonopolyState(nextState, sessionId);
      return true;
    } catch (e) {
      console.error("[monopoly] REST action failed", type, e);
      return false;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { hideChrome: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 -z-10", style: {
      background: "radial-gradient(circle at 50% 0%, #0a1a2e 0%, #050507 60%)"
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative h-[100dvh] max-h-[100dvh] overflow-hidden px-2.5 pt-2 pb-2 max-w-[1800px] mx-auto flex flex-col gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-2 shrink-0 min-h-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 shrink", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[7px] font-mono uppercase tracking-[0.32em] text-accent-cyan/80 leading-none mb-0.5", children: "Bharat · Live" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-lg md:text-xl italic uppercase neon-text-glow truncate leading-none", children: "Monopoly: India Edition" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(IndianEventBanner, { event: state.activeEvent }),
          state.phase === "paused" && !isRoomHost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { role: "status", className: "flex items-center gap-1.5 border border-accent-amber/40 bg-accent-amber/10 px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-accent-amber", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-3" }),
            " Game paused by host"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { variant: "ghost", size: "sm", onClick: () => setCardCatalogOpen(true), className: "!py-1 !px-2.5 !text-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "inline size-3 mr-1" }),
            " Cards"
          ] }),
          isRoomHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { variant: "ghost", size: "sm", onClick: () => setBankOpen(true), className: "!py-1 !px-2.5 !text-[10px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "inline size-3 mr-1" }),
              " Bank Manager"
            ] }),
            state.phase !== "paused" && state.phase !== "ended" && /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { variant: "ghost", size: "sm", disabled: pauseGame.isPending, onClick: () => void setGamePaused(true), className: "!py-1 !px-2.5 !text-[10px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "inline size-3 mr-1" }),
              " Pause"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "ghost", size: "sm", onClick: () => {
            navigate({
              to: "/"
            });
          }, className: "!py-1 !px-2.5 !text-[10px]", children: "Soft Exit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "pink", size: "sm", onClick: () => {
            localStorage.removeItem("gamehub:resume-session");
            if (roomId) {
              leaveRoomMut.mutate(roomId, {
                onSettled: () => navigate({
                  to: "/"
                })
              });
            } else {
              navigate({
                to: "/"
              });
            }
          }, className: "!py-1 !px-2.5 !text-[10px]", children: "Abandon" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-2 flex-1 min-h-0 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "order-2 xl:order-1 min-h-0 flex flex-col gap-1.5 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 min-h-0 overflow-y-auto flex-1", children: state.players.map((p, seatIdx) => {
            const isCurrent = state.players[state.currentPlayerIndex].id === p.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerPanel, { state, player: p, seatNumber: seatIdx + 1, compact: true, isCurrent, isMe: p.id === me.id, selected: focusPlayerId === p.id, onSelectPlayer: () => setFocusPlayerId((prev) => prev === p.id ? null : p.id), onSelectTile: (i) => setOpenTile(i), onProposeTrade: p.id !== me.id ? () => setTradePartner(p.id) : void 0, turnActions: isCurrent ? {
              isMyTurn,
              onRoll: () => void sendGameAction("ROLL"),
              onBuy: () => void sendGameAction("BUY", {
                tileIndex: state.pendingPurchaseTile ?? void 0
              }),
              onAuction: () => void sendGameAction("START_AUCTION", {
                tileIndex: state.pendingPurchaseTile ?? void 0
              }),
              onEnd: () => void sendGameAction("END_TURN"),
              onPayJail: () => void sendGameAction("PAY_JAIL"),
              onJailCard: () => void sendGameAction("USE_JAIL_CARD")
            } : void 0 }, p.id);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(EventLog, { log: state.log, compact: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "order-1 xl:order-2 min-h-0 h-full flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Board, { state, onTileClick: (i) => setOpenTile(i), highlightTile: state.pendingPurchaseTile, focusPlayerId }) })
      ] }),
      state.phase === "ended" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-40 bg-black/85 backdrop-blur-md grid place-items-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel border border-accent-amber/40 p-10 text-center max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-14 text-accent-amber mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-mono uppercase tracking-[0.4em] text-accent-amber mb-2", children: "Match Over" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-4xl italic uppercase mb-2", children: [
          state.players.find((p) => p.id === state.winnerId)?.username,
          " wins!"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/60 text-sm mb-6", children: "The last tycoon standing." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => {
          localStorage.removeItem("gamehub:resume-session");
          navigate({
            to: "/"
          });
        }, children: "Return Home" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
      cardCatalogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(CardCatalogModal, { onClose: () => setCardCatalogOpen(false) }),
      cardReveal && /* @__PURE__ */ jsxRuntimeExports.jsx(CardRevealModal, { card: cardReveal, onContinue: () => {
        setCardReveal(null);
        void sendGameAction("END_TURN");
      } }),
      openTile != null && /* @__PURE__ */ jsxRuntimeExports.jsx(PropertyCard, { state, tileIndex: openTile, isMyTurn, meId: me.id, onClose: () => setOpenTile(null), onBuild: state.properties[openTile]?.ownerId === me.id ? () => sendGameAction(state.properties[openTile]?.houses === 4 ? "BUILD_HOTEL" : "BUILD_HOUSE", {
        tileIndex: openTile
      }) : void 0, onSell: state.properties[openTile]?.ownerId === me.id && (state.properties[openTile]?.houses ?? 0) > 0 ? () => sendGameAction("SELL_HOUSE", {
        tileIndex: openTile
      }) : void 0, onMortgage: state.properties[openTile]?.ownerId === me.id ? () => sendGameAction("TOGGLE_MORTGAGE", {
        tileIndex: openTile
      }) : void 0 }),
      state.phase === "auction" && state.auction && /* @__PURE__ */ jsxRuntimeExports.jsx(AuctionPanel, { state, meId: me.id, onBid: (amount) => sendGameAction("PLACE_BID", {
        amount
      }), onPass: () => sendGameAction("PASS_BID") }),
      tradePartner && /* @__PURE__ */ jsxRuntimeExports.jsx(TradePanel, { state, meId: me.id, partnerId: tradePartner, onClose: () => setTradePartner(null), onPropose: (offer) => {
        void sendGameAction("PROPOSE_TRADE", {
          offer
        });
        setTradePartner(null);
      } }),
      state.phase === "trade" && state.trade?.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(TradeReviewPanel, { state, trade: state.trade, meId: me.id, onResolve: (accepted) => void sendGameAction("RESPOND_TRADE", {
        targetPlayerId: state.trade?.fromId,
        tradeId: state.trade?.id,
        decision: accepted ? "ACCEPT" : "DECLINE"
      }) }),
      bankOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(BankManager, { state, canEdit: isRoomHost, onClose: () => setBankOpen(false), onAdjust: (pid, delta) => sendGameAction("BANK_ADJUST", {
        playerId: pid,
        delta
      }), onTransfer: (from, to, amt) => sendGameAction("BANK_TRANSFER", {
        from,
        to,
        amt
      }) })
    ] }),
    state.phase === "paused" && isRoomHost && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[70] bg-black/90 backdrop-blur-md grid place-items-center p-6", role: "dialog", "aria-modal": "true", "aria-labelledby": "paused-title", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel border border-accent-amber/50 p-8 text-center max-w-md w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-10 text-accent-amber mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: "paused-title", className: "font-display text-3xl italic uppercase mb-2", children: "Game Paused" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/60 mb-5", children: isRoomHost ? "Resume when everyone is ready." : "Waiting for the host to resume." }),
      isRoomHost && /* @__PURE__ */ jsxRuntimeExports.jsxs(NeonButton, { variant: "cyan", disabled: resumeGame.isPending, onClick: () => void setGamePaused(false), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "inline size-4 mr-1" }),
        " Resume Game"
      ] })
    ] }) }),
    roomId && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatDrawer, { roomId })
  ] });
}
export {
  MonopolyPage as component
};
