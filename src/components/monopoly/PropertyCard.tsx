import { motion } from "framer-motion";
import { X } from "lucide-react";
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
  const bar = tile.group ? GROUP_COLORS[tile.group] : "#444";

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
              <li className="flex justify-between">
                <span>Rent (Empty Land)</span>
                <span>{formatInr(tile.rent[0])}</span>
              </li>
              <li className="flex justify-between">
                <span>With Village</span>
                <span>{formatInr(tile.rent[1])}</span>
              </li>
              <li className="flex justify-between">
                <span>With Town</span>
                <span>{formatInr(tile.rent[2])}</span>
              </li>
              <li className="flex justify-between">
                <span>With City</span>
                <span>{formatInr(tile.rent[3])}</span>
              </li>
              <li className="flex justify-between">
                <span>With Metro</span>
                <span>{formatInr(tile.rent[4])}</span>
              </li>
              <li className="flex justify-between">
                <span>With Smart City</span>
                <span>{formatInr(tile.rent[5])}</span>
              </li>
              <li className="flex justify-between text-white/40 pt-2">
                <span>Upgrade cost</span>
                <span>{formatInr(tile.housePrice ?? 0)}</span>
              </li>
              <li className="flex justify-between text-white/40">
                <span>Mortgage</span>
                <span>{formatInr(Math.floor((tile.price ?? 0) / 2))}</span>
              </li>
            </ul>
          )}
          {tile.type === "railroad" && (
            <ul className="text-xs font-mono space-y-1 mb-4">
              {RAILROAD_RENT.map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span>{i + 1} Railway Owned</span>
                  <span>{formatInr(r)}</span>
                </li>
              ))}
            </ul>
          )}
          {tile.type === "utility" && (
            <ul className="text-xs font-mono space-y-1 mb-4">
              <li className="flex justify-between">
                <span>1 Utility</span>
                <span>4× dice</span>
              </li>
              <li className="flex justify-between">
                <span>2 Utilities</span>
                <span>10× dice</span>
              </li>
            </ul>
          )}

          <div className="text-[10px] font-mono uppercase tracking-widest mb-4">
            Owner:{" "}
            {owner ? (
              <span style={{ color: owner.avatarColor }}>{owner.username}</span>
            ) : (
              <span className="text-white/40">Bank</span>
            )}
            {prop && prop.houses > 0 ? (
              <span className="ml-3 text-accent-amber">{developmentLabel(prop.houses)}</span>
            ) : null}
            {prop?.mortgaged && <span className="ml-3 text-destructive">MORTGAGED</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            {onBuild && (
              <NeonButton variant="cyan" size="sm" onClick={onBuild}>
                Upgrade
              </NeonButton>
            )}
            {onSell && (
              <NeonButton variant="ghost" size="sm" onClick={onSell}>
                Sell Development
              </NeonButton>
            )}
            {onMortgage && (
              <NeonButton variant="ghost" size="sm" onClick={onMortgage}>
                {prop?.mortgaged ? "Unmortgage" : "Mortgage"}
              </NeonButton>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
