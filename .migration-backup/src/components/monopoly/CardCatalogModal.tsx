import { useState } from "react";
import { motion } from "framer-motion";
import { Boxes, ChevronDown, Search, Sparkles, X } from "lucide-react";
import { CHANCE_CARDS, CHEST_CARDS } from "../../data/monopolyCards";
import type { DeckCard } from "../../data/monopolyCards";
import { BOARD } from "../../data/monopolyBoard";

type EffectCategory = "cash" | "movement" | "jail" | "repairs";
type EffectFilter = "all" | EffectCategory;

const EFFECT_FILTERS: { id: EffectFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cash", label: "Cash" },
  { id: "movement", label: "Movement" },
  { id: "jail", label: "Jail" },
  { id: "repairs", label: "Repairs" },
];

const ALL_CARDS = [...CHANCE_CARDS, ...CHEST_CARDS];

function effectCategory(action: DeckCard["action"]): EffectCategory {
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

function effectDescription(action: DeckCard["action"]): string {
  switch (action.kind) {
    case "money":
      return action.amount >= 0
        ? `Collect ₹${action.amount.toLocaleString("en-IN")} from the bank.`
        : `Pay ₹${Math.abs(action.amount).toLocaleString("en-IN")} to the bank.`;
    case "moneyFromEach":
      return action.amount >= 0
        ? `Collect ₹${action.amount.toLocaleString("en-IN")} from each other player.`
        : `Pay ₹${Math.abs(action.amount).toLocaleString("en-IN")} to each other player.`;
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

function isPositiveOutcome(action: DeckCard["action"]): boolean {
  if (action.kind === "money" || action.kind === "moneyFromEach") return action.amount > 0;
  if (action.kind === "getOutCard") return true;
  return action.kind === "move" && action.collectGoIfPass === true;
}

export function CardCatalogModal({ onClose, initialDeck = "chest" }: { onClose: () => void; initialDeck?: "chance" | "chest" }) {
  const [deck, setDeck] = useState<"chance" | "chest">(initialDeck);
  const [filter, setFilter] = useState<EffectFilter>("all");
  const [search, setSearch] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const isChance = deck === "chance";
  const cards = isChance ? CHANCE_CARDS : CHEST_CARDS;
  const visibleCards = cards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => filter === "all" || effectCategory(card.action) === filter)
    .filter(({ card }) => card.text.toLowerCase().includes(search.trim().toLowerCase()));
  const rewardCount = ALL_CARDS.filter(({ action }) => isPositiveOutcome(action)).length;
  const movementCount = ALL_CARDS.filter(({ action }) => effectCategory(action) === "movement").length;
  const jailCardCount = ALL_CARDS.filter(({ action }) => action.kind === "getOutCard").length;
  const costCount = ALL_CARDS.filter(
    ({ action }) =>
      (action.kind === "money" || action.kind === "moneyFromEach") && action.amount < 0,
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-catalog-title"
        className="glass-panel border border-white/15 w-full max-w-2xl max-h-[85vh] p-5 sm:p-6 flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {isChance ? (
              <Sparkles className="size-5 text-accent-pink shrink-0" />
            ) : (
              <Boxes className="size-5 text-accent-cyan shrink-0" />
            )}
            <div>
              <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/45">
                Card Decks
              </div>
              <h2 id="card-catalog-title" className="font-display text-2xl italic uppercase">
                Available Cards
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close card catalog"
            className="size-8 grid place-items-center border border-white/15 hover:border-accent-pink/60 hover:text-accent-pink shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-4" role="tablist" aria-label="Card deck">
          <button
            type="button"
            role="tab"
            aria-selected={isChance}
            onClick={() => setDeck("chance")}
            className={`border px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${
              isChance
                ? "border-accent-pink/70 bg-accent-pink/15 text-accent-pink"
                : "border-white/15 text-white/50 hover:text-white"
            }`}
          >
            Chance ({CHANCE_CARDS.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isChance}
            onClick={() => setDeck("chest")}
            className={`border px-3 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${
              !isChance
                ? "border-accent-cyan/70 bg-accent-cyan/15 text-accent-cyan"
                : "border-white/15 text-white/50 hover:text-white"
            }`}
          >
            Community Chest ({CHEST_CARDS.length})
          </button>
        </div>

        <div className="border-y border-white/10 py-2.5 mb-3">
          <div className="text-[8px] font-mono uppercase tracking-[0.25em] text-white/40 mb-2">
            Combined deck effects · {ALL_CARDS.length} cards
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] sm:text-[10px] font-mono">
            <span className="text-accent-amber">{rewardCount} reward outcomes</span>
            <span className="text-accent-cyan">{movementCount} movement cards</span>
            <span className="text-accent-amber">{jailCardCount} Get Out of Jail cards</span>
            <span className="text-accent-pink">{costCount} direct cash penalties</span>
          </div>
        </div>

        <label className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search card text"
            className="w-full bg-black/35 border border-white/15 py-2 pl-8 pr-3 text-xs font-mono placeholder:text-white/30 focus:border-accent-cyan/60 outline-none"
          />
        </label>

        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1" aria-label="Filter cards by effect">
          {EFFECT_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={`shrink-0 border px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-colors ${
                filter === option.id
                  ? "border-white/60 bg-white/10 text-white"
                  : "border-white/10 text-white/45 hover:text-white/80"
              }`}
            >
              {option.label}
            </button>
          ))}
          <span className="ml-auto self-center shrink-0 text-[9px] font-mono text-white/35">
            {visibleCards.length} shown
          </span>
        </div>

        <ol className="min-h-0 overflow-y-auto divide-y divide-white/10 border-y border-white/10">
          {visibleCards.length === 0 ? (
            <li className="py-8 text-center text-xs font-mono text-white/40">
              No cards match these filters.
            </li>
          ) : (
            visibleCards.map(({ card, index }) => {
              const expanded = expandedCard === index;
              return (
                <li key={`${deck}-${index}`}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpandedCard(expanded ? null : index)}
                    className="w-full flex items-center gap-3 py-3 px-1 text-left hover:bg-white/[0.04] transition-colors"
                  >
                    <span
                      className={`font-mono text-[10px] tabular-nums shrink-0 ${
                        isChance ? "text-accent-pink" : "text-accent-cyan"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 min-w-0 text-xs sm:text-sm font-mono text-white/85 leading-relaxed">
                      {card.text}
                    </span>
                    <span className="hidden sm:inline shrink-0 border border-white/15 px-1.5 py-0.5 text-[8px] font-mono uppercase text-white/45">
                      {effectCategory(card.action)}
                    </span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-white/45 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expanded && (
                    <div className="ml-7 mr-2 mb-3 border-l-2 pl-3 py-1 text-[10px] sm:text-xs font-mono text-white/60"
                      style={{ borderColor: isChance ? "var(--accent-pink)" : "var(--accent-cyan)" }}
                    >
                      <span className="uppercase tracking-widest text-white/40 mr-2">Effect</span>
                      {effectDescription(card.action)}
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ol>
      </motion.div>
    </motion.div>
  );
}