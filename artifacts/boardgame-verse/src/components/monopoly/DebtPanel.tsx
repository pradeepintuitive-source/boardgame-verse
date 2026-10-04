import { useState } from "react";
import { BOARD } from "../../data/monopolyBoard";
import type { MonopolyPlayer, MonopolyState, PendingDebt, PendingSale } from "../../models/monopoly";
import { formatInr } from "../../utils/monopolyEngine";
import { NeonButton } from "../common/NeonButton";

interface Props {
  state: MonopolyState;
  debt: PendingDebt;
  sale: PendingSale | null;
  canResolve: boolean;
  canAnswerSale: boolean;
  onSellBuilding: (tileIndex: number) => void;
  onMortgage: (tileIndex: number) => void;
  onProposeSale: (tileIndex: number, buyerId: string, price: number) => void;
  onAcceptSale: () => void;
  onDeclineSale: () => void;
  onPay: () => void;
  onBankrupt: () => void;
}

export function DebtPanel({
  state,
  debt,
  sale,
  canResolve,
  canAnswerSale,
  onSellBuilding,
  onMortgage,
  onProposeSale,
  onAcceptSale,
  onDeclineSale,
  onPay,
  onBankrupt,
}: Props) {
  const debtor = state.players.find((player) => player.id === debt.debtorId);
  const creditor = debt.creditorId
    ? state.players.find((player) => player.id === debt.creditorId)
    : null;
  const buyer = sale ? state.players.find((player) => player.id === sale.buyerId) : null;
  const owned = Object.entries(state.properties)
    .map(([index, property]) => ({ index: Number(index), property, tile: BOARD[Number(index)] }))
    .filter((entry) => entry.property.ownerId === debt.debtorId && entry.tile);
  const others = state.players.filter((player) => player.id !== debt.debtorId && !player.bankrupt);
  const [saleTile, setSaleTile] = useState(owned[0]?.index ?? 0);
  const [buyerId, setBuyerId] = useState(others[0]?.id ?? "");
  const [price, setPrice] = useState(BOARD[owned[0]?.index ?? 0]?.price ?? 500);
  const cash = debtor?.cash ?? 0;
  const canPay = cash >= debt.amount;

  return (
    <div
      className="rounded-sm border border-[#e05060]/40 bg-[#1a1012] px-4 py-3 flex flex-col gap-3"
      role="region"
      aria-label="Raise funds"
    >
      <div>
        <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#e05060]">
          Raise funds
        </div>
        <div className="mt-1 text-sm font-bold text-white">
          {debtor?.username ?? "Player"} owes {formatInr(debt.amount)}
        </div>
        <div className="text-[11px] font-mono text-[#9baab8]">
          {debt.reason} · to {creditor?.username ?? "the bank"} · cash {formatInr(cash)}
        </div>
      </div>

      {canResolve && (
        <div className="flex flex-col gap-2">
          {owned.map(({ index, property, tile }) => {
            const houseRefund = Math.floor((tile.housePrice ?? 0) / 2);
            const mortgageValue = Math.floor((tile.price ?? 0) / 2);
            const hasBuilding = property.houses > 0;
            return (
              <div key={index} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-white">{tile.name}</span>
                {hasBuilding ? (
                  <NeonButton variant="ghost" size="sm" onClick={() => onSellBuilding(index)}>
                    {property.houses >= 5 ? "Sell hotel" : "Sell house"} {formatInr(houseRefund)}
                  </NeonButton>
                ) : property.mortgaged ? (
                  <span className="font-mono text-[10px] text-[#9baab8]">Mortgaged</span>
                ) : (
                  <NeonButton variant="ghost" size="sm" onClick={() => onMortgage(index)}>
                    Mortgage {formatInr(mortgageValue)}
                  </NeonButton>
                )}
              </div>
            );
          })}
        </div>
      )}

      {sale && (
        <div className="rounded-sm border border-[rgba(212,168,67,0.25)] bg-black/30 p-2 text-xs text-white">
          {BOARD[sale.tilePosition]?.name} offered to {buyer?.username ?? "a player"} for {formatInr(sale.price)}
          {canAnswerSale && (
            <div className="mt-2 flex gap-2">
              <NeonButton variant="gold" size="sm" onClick={onAcceptSale}>
                Accept
              </NeonButton>
              <NeonButton variant="ghost" size="sm" onClick={onDeclineSale}>
                Decline
              </NeonButton>
            </div>
          )}
        </div>
      )}

      {canResolve && !sale && others.length > 0 && owned.length > 0 && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[10px] font-mono text-[#9baab8]">
            Property
            <select
              className="mt-1 block bg-black/40 border border-white/10 px-2 py-1 text-xs text-white"
              value={saleTile}
              onChange={(event) => {
                const next = Number(event.target.value);
                setSaleTile(next);
                setPrice(BOARD[next]?.price ?? price);
              }}
            >
              {owned.map(({ index, tile }) => (
                <option key={index} value={index}>
                  {tile.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-mono text-[#9baab8]">
            Buyer
            <select
              className="mt-1 block bg-black/40 border border-white/10 px-2 py-1 text-xs text-white"
              value={buyerId}
              onChange={(event) => setBuyerId(event.target.value)}
            >
              {others.map((player: MonopolyPlayer) => (
                <option key={player.id} value={player.id}>
                  {player.username}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] font-mono text-[#9baab8]">
            Price
            <input
              type="number"
              min={1}
              className="mt-1 block w-24 bg-black/40 border border-white/10 px-2 py-1 text-xs text-white"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
            />
          </label>
          <NeonButton
            variant="ghost"
            size="sm"
            disabled={!buyerId || price <= 0}
            onClick={() => onProposeSale(saleTile, buyerId, price)}
          >
            Offer sale
          </NeonButton>
        </div>
      )}

      {canResolve && (
        <div className="flex flex-wrap gap-2">
          <NeonButton variant="gold" size="sm" disabled={!canPay} onClick={onPay}>
            Pay {formatInr(debt.amount)}
          </NeonButton>
          <NeonButton variant="ruby" size="sm" onClick={onBankrupt}>
            Declare bankruptcy
          </NeonButton>
        </div>
      )}
    </div>
  );
}
