import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Info } from "lucide-react";
import { BOARD, GROUP_COLORS, RAILROAD_RENT, developmentLabel } from "../../data/monopolyBoard";
import type { MonopolyState } from "../../models/monopoly";
import { NeonButton } from "../common/NeonButton";
import { formatInr } from "../../utils/monopolyEngine";

interface Props {
  state: MonopolyState;
  tileIndex: number;
  onClose: () => void;
  onBuild?: () => void;
  onSell?: () => void;
  onMortgage?: () => void;
}

export function PropertyCard({ state, tileIndex, onClose, onBuild, onSell, onMortgage }: Props) {
  const tile = BOARD[tileIndex];
  const prop = state.properties[tileIndex];
  if (!tile) return null;

  const owner = prop?.ownerId ? state.players.find((p) => p.id === prop.ownerId) : null;
  const groupColor = tile.group ? GROUP_COLORS[tile.group] : "#666";

  const isMortgaged = !!prop?.mortgaged;
  const devLevel = prop?.houses ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[340px] flex flex-col"
        style={{
          background: "#12121a",
          borderLeft: "1px solid rgba(212,168,67,0.2)",
          boxShadow: "-8px 0 48px rgba(0,0,0,0.7)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={`Property card for ${tile.name}`}
      >
        {/* Title Deed header */}
        <div
          className="relative h-20 shrink-0 flex flex-col justify-center text-center px-4"
          style={{ background: groupColor }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 size-8 grid place-items-center bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white"
          >
            <X className="size-4" />
          </button>
          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-black/80 font-bold mb-1">
            Title Deed
          </div>
          <div className="font-display text-2xl font-bold uppercase text-black leading-tight drop-shadow-sm">
            {tile.name}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Owner status */}
          <div
            className="flex items-center gap-3 mb-6 p-3 rounded-sm"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            {owner ? (
              <>
                <div
                  className="size-8 rounded-full shrink-0"
                  style={{ background: owner.avatarColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
                    Owner
                  </div>
                  <div className="text-sm font-bold truncate text-white">{owner.username}</div>
                </div>
              </>
            ) : (
              <>
                <div className="size-8 rounded-full bg-[#d4a843]/10 shrink-0 grid place-items-center">
                  <Info className="size-4 text-[#d4a843]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
                    Status
                  </div>
                  <div className="text-sm font-bold text-[#d4a843]">Unowned (Bank)</div>
                </div>
              </>
            )}
          </div>

          {/* Pricing & Rent Table */}
          {tile.price != null && (
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
                  Base Price
                </span>
                <span className="font-mono text-base font-bold text-[#d4a843]">
                  {formatInr(tile.price)}
                </span>
              </div>

              {tile.type === "property" && tile.rent && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-2 border-b border-[rgba(212,168,67,0.12)] pb-1">
                    Rent Schedule
                  </div>
                  {[
                    "Rent (Empty Land)",
                    "With Village",
                    "With Town",
                    "With City",
                    "With Metro",
                    "With Smart City",
                  ].map((label, idx) => (
                    <div
                      key={idx}
                      className={[
                        "flex justify-between py-1.5 px-2 rounded-sm text-xs font-mono",
                        idx === devLevel && owner && !isMortgaged
                          ? "bg-[rgba(212,168,67,0.15)] text-[#d4a843] font-bold"
                          : "text-white/70",
                      ].join(" ")}
                    >
                      <span>{label}</span>
                      <span>{formatInr(tile.rent![idx])}</span>
                    </div>
                  ))}

                  <div className="mt-4 pt-3 border-t border-[rgba(212,168,67,0.12)] space-y-2">
                    <div className="flex justify-between text-xs font-mono text-[#9baab8]">
                      <span>Upgrade Cost (per level)</span>
                      <span>{formatInr(tile.housePrice ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-[#9baab8]">
                      <span>Mortgage Value</span>
                      <span>{formatInr(Math.floor(tile.price / 2))}</span>
                    </div>
                  </div>
                </div>
              )}

              {tile.type === "railroad" && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-2 border-b border-[rgba(212,168,67,0.12)] pb-1">
                    Transit Fares
                  </div>
                  {RAILROAD_RENT.map((r, i) => (
                    <div
                      key={i}
                      className="flex justify-between py-1.5 px-2 text-xs font-mono text-white/70"
                    >
                      <span>
                        {i + 1} Transit Station{i > 0 ? "s" : ""} Owned
                      </span>
                      <span>{formatInr(r)}</span>
                    </div>
                  ))}
                  <div className="mt-4 pt-3 border-t border-[rgba(212,168,67,0.12)] flex justify-between text-xs font-mono text-[#9baab8]">
                    <span>Mortgage Value</span>
                    <span>{formatInr(Math.floor(tile.price / 2))}</span>
                  </div>
                </div>
              )}

              {tile.type === "utility" && (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#9baab8] mb-2 border-b border-[rgba(212,168,67,0.12)] pb-1">
                    Service Rates
                  </div>
                  <div className="flex justify-between py-1.5 px-2 text-xs font-mono text-white/70">
                    <span>1 Utility Owned</span>
                    <span>4× dice roll</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-2 text-xs font-mono text-white/70">
                    <span>2 Utilities Owned</span>
                    <span>10× dice roll</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[rgba(212,168,67,0.12)] flex justify-between text-xs font-mono text-[#9baab8]">
                    <span>Mortgage Value</span>
                    <span>{formatInr(Math.floor(tile.price / 2))}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {isMortgaged && (
            <div className="p-3 bg-[#8b2335]/15 border border-[#8b2335]/40 rounded-sm mb-4 text-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#e05060]">
                Mortgaged
              </div>
              <div className="text-xs text-white/60 mt-1">No rent can be collected</div>
            </div>
          )}
        </div>

        {/* Action buttons (only if you are the owner and there are actions available) */}
        {(onBuild || onSell || onMortgage) && (
          <div
            className="px-5 py-4 space-y-2 shrink-0 bg-[#0d0d12]"
            style={{ borderTop: "1px solid rgba(212,168,67,0.12)" }}
          >
            {onBuild && (
              <NeonButton
                variant="gold"
                size="sm"
                onClick={onBuild}
                className="w-full"
                icon={<TrendingUp className="size-4" />}
              >
                Upgrade Property
              </NeonButton>
            )}
            <div className="flex gap-2">
              {onSell && (
                <NeonButton
                  variant="danger"
                  size="sm"
                  onClick={onSell}
                  className="flex-1"
                  icon={<TrendingDown className="size-4" />}
                >
                  Sell Level
                </NeonButton>
              )}
              {onMortgage && (
                <NeonButton
                  variant={isMortgaged ? "gold" : "danger"}
                  size="sm"
                  onClick={onMortgage}
                  className="flex-1"
                >
                  {isMortgaged ? "Unmortgage" : "Mortgage"}
                </NeonButton>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
