import { motion } from "framer-motion";
import { X } from "lucide-react";
import { BOARD, GROUP_COLORS, RAILROAD_RENT, developmentLabel } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import { formatInr } from "../../utils/monopolyEngine";

interface Props {
  state: MonopolyState;
  tileIndex: number;
  isMyTurn: boolean;
  meId: string;
  onClose: () => void;
  onBuild?: () => void;
  onSell?: () => void;
  onMortgage?: () => void;
}

export function PropertyCard({
  state,
  tileIndex,
  isMyTurn,
  meId,
  onClose,
  onBuild,
  onSell,
  onMortgage,
}: Props) {
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

  let buildDisabledReason: string | null = null;
  if (!isMyTurn) buildDisabledReason = "Not your turn";
  else if (!isColorProperty) buildDisabledReason = "Only color properties can be upgraded";
  else if (prop?.mortgaged) buildDisabledReason = "Unmortgage before upgrading";
  else if (houses >= 5) buildDisabledReason = "Fully developed";
  else if ((me?.cash ?? 0) < houseCost) buildDisabledReason = "Need more cash";

  let sellDisabledReason: string | null = null;
  if (!isMyTurn) sellDisabledReason = "Not your turn";
  else if (!isColorProperty || !hasDev) sellDisabledReason = "Nothing to sell";

  let mortgageDisabledReason: string | null = null;
  if (!isMyTurn) mortgageDisabledReason = "Not your turn";
  else if (prop?.mortgaged && (me?.cash ?? 0) < unmortgageCost) {
    mortgageDisabledReason = "Need more cash to unmortgage";
  } else if (!prop?.mortgaged && hasDev) {
    mortgageDisabledReason = "Sell developments first";
  }

  const showActions = isOwner && (onBuild || onSell || onMortgage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm glass-panel border border-white/15 p-0 overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 size-7 grid place-items-center hover:text-accent-pink"
        >
          <X className="size-4" />
        </button>
        <div className="h-12 grid place-items-center" style={{ background: bar }}>
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-black/80">
            Title Deed
          </span>
        </div>
        <div className="p-6">
          <h3 className="font-display text-3xl italic uppercase mb-1">{tile.name}</h3>
          {tile.price != null && (
            <div className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan mb-4">
              Price {formatInr(tile.price ?? 0)}
            </div>
          )}

          {tile.type === "property" && tile.rent && (
            <ul className="text-xs font-mono space-y-1 mb-4">
              {[
                { label: "Rent (Empty Land)", level: 0 },
                { label: "With Village", level: 1 },
                { label: "With Town", level: 2 },
                { label: "With City", level: 3 },
                { label: "With Metro", level: 4 },
                { label: "With Smart City", level: 5 },
              ].map((row) => {
                const active = houses === row.level;
                return (
                  <li
                    key={row.level}
                    className={`flex justify-between px-2 py-1 rounded-sm ${
                      active
                        ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold"
                        : "text-white/70"
                    }`}
                  >
                    <span>
                      {row.label}
                      {active ? " · current" : ""}
                    </span>
                    <span>{formatInr(tile.rent![row.level])}</span>
                  </li>
                );
              })}
              <li className="flex justify-between text-white/40 pt-2">
                <span>Upgrade cost</span>
                <span>{formatInr(houseCost)}</span>
              </li>
              <li className="flex justify-between text-white/40">
                <span>Mortgage value</span>
                <span>{formatInr(mortgageValue)}</span>
              </li>
            </ul>
          )}
          {tile.type === "railroad" && (
            <ul className="text-xs font-mono space-y-1 mb-4">
              {RAILROAD_RENT.map((r, i) => {
                const ownedCount = owner
                  ? Object.entries(state.properties).filter(([idx, p]) => {
                      const t = BOARD[Number(idx)];
                      return p.ownerId === owner.id && t?.type === "railroad";
                    }).length
                  : 0;
                const active = ownedCount === i + 1;
                return (
                  <li
                    key={i}
                    className={`flex justify-between px-2 py-1 rounded-sm ${
                      active
                        ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold"
                        : "text-white/70"
                    }`}
                  >
                    <span>
                      {i + 1} Railway Owned{active ? " · current" : ""}
                    </span>
                    <span>{formatInr(r)}</span>
                  </li>
                );
              })}
              <li className="flex justify-between text-white/40 pt-2">
                <span>Mortgage value</span>
                <span>{formatInr(mortgageValue)}</span>
              </li>
            </ul>
          )}
          {tile.type === "utility" && (
            <ul className="text-xs font-mono space-y-1 mb-4">
              {(() => {
                const ownedUtils = owner
                  ? Object.entries(state.properties).filter(([idx, p]) => {
                      const t = BOARD[Number(idx)];
                      return p.ownerId === owner.id && t?.type === "utility";
                    }).length
                  : 0;
                return (
                  <>
                    <li
                      className={`flex justify-between px-2 py-1 rounded-sm ${
                        ownedUtils === 1
                          ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold"
                          : "text-white/70"
                      }`}
                    >
                      <span>1 Utility{ownedUtils === 1 ? " · current" : ""}</span>
                      <span>4× dice</span>
                    </li>
                    <li
                      className={`flex justify-between px-2 py-1 rounded-sm ${
                        ownedUtils >= 2
                          ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/50 font-bold"
                          : "text-white/70"
                      }`}
                    >
                      <span>2 Utilities{ownedUtils >= 2 ? " · current" : ""}</span>
                      <span>10× dice</span>
                    </li>
                  </>
                );
              })()}
              <li className="flex justify-between text-white/40 pt-2">
                <span>Mortgage value</span>
                <span>{formatInr(mortgageValue)}</span>
              </li>
            </ul>
          )}

          <div className="text-[10px] font-mono uppercase tracking-widest mb-2">
            Owner:{" "}
            {owner ? (
              <span style={{ color: owner.avatarColor }}>{owner.username}</span>
            ) : (
              <span className="text-white/40">Bank</span>
            )}
            {prop && houses > 0 ? (
              <span className="ml-3 text-accent-amber">{developmentLabel(houses)}</span>
            ) : null}
            {prop?.mortgaged && <span className="ml-3 text-destructive">MORTGAGED</span>}
          </div>

          {showActions ? (
            <p className="text-[10px] font-mono text-white/40 mb-3">
              Mortgage / Upgrade on your turn before Continue.
            </p>
          ) : null}

          {showActions ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {isColorProperty && onBuild ? (
                  <NeonButton
                    variant="cyan"
                    size="sm"
                    disabled={!!buildDisabledReason}
                    onClick={onBuild}
                    title={buildDisabledReason ?? undefined}
                  >
                    Upgrade
                  </NeonButton>
                ) : null}
                {isColorProperty && onSell ? (
                  <NeonButton
                    variant="ghost"
                    size="sm"
                    disabled={!!sellDisabledReason}
                    onClick={onSell}
                    title={sellDisabledReason ?? undefined}
                  >
                    Sell Development
                  </NeonButton>
                ) : null}
                {onMortgage ? (
                  <NeonButton
                    variant="ghost"
                    size="sm"
                    disabled={!!mortgageDisabledReason}
                    onClick={onMortgage}
                    title={mortgageDisabledReason ?? undefined}
                  >
                    {prop?.mortgaged ? "Unmortgage" : "Mortgage"}
                  </NeonButton>
                ) : null}
              </div>
              {(buildDisabledReason || sellDisabledReason || mortgageDisabledReason) && isMyTurn === false ? (
                <div className="text-[10px] font-mono text-accent-amber/80">Not your turn</div>
              ) : (
                <div className="text-[10px] font-mono text-white/35 space-y-0.5">
                  {isColorProperty && buildDisabledReason ? <div>{buildDisabledReason}</div> : null}
                  {isColorProperty && sellDisabledReason && hasDev ? (
                    <div>{sellDisabledReason}</div>
                  ) : null}
                  {mortgageDisabledReason ? <div>{mortgageDisabledReason}</div> : null}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
