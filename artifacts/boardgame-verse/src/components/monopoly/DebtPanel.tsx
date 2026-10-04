import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Building2, Handshake, Minus, Plus, Wallet } from "lucide-react";
import { BOARD, GROUP_COLORS, GROUP_TILES, developmentLabel } from "../../data/monopolyBoard";
import type { MonopolyState, PendingDebt, PendingSale } from "../../models/monopoly";
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

type Tab = "raise" | "sell";

const PRICE_STEP = 100;

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
  const owned = useMemo(
    () =>
      Object.entries(state.properties)
        .map(([index, property]) => ({
          index: Number(index),
          property,
          tile: BOARD[Number(index)],
        }))
        .filter((entry) => entry.property.ownerId === debt.debtorId && entry.tile),
    [state.properties, debt.debtorId],
  );
  const others = state.players.filter((player) => player.id !== debt.debtorId && !player.bankrupt);
  const cash = debtor?.cash ?? 0;
  const canPay = cash >= debt.amount;
  const shortfall = Math.max(0, debt.amount - cash);
  const covered = Math.min(100, debt.amount > 0 ? (cash / debt.amount) * 100 : 100);
  const ownedKey = owned
    .map((entry) => `${entry.index}:${entry.property.houses}:${entry.property.mortgaged}`)
    .join("|");

  const [tab, setTab] = useState<Tab>("raise");
  const [selected, setSelected] = useState(owned[0]?.index ?? 0);
  const [saleTile, setSaleTile] = useState(owned[0]?.index ?? 0);
  const [buyerId, setBuyerId] = useState(others[0]?.id ?? "");
  const [price, setPrice] = useState(BOARD[owned[0]?.index ?? 0]?.price ?? 500);
  const [confirmBankrupt, setConfirmBankrupt] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [raised, setRaised] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevCash = useRef(cash);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const delta = cash - prevCash.current;
    prevCash.current = cash;
    if (delta > 0) setRaised(delta);
  }, [cash]);

  useEffect(() => {
    if (raised == null) return;
    const timer = window.setTimeout(() => setRaised(null), 1600);
    return () => window.clearTimeout(timer);
  }, [raised]);

  useEffect(() => {
    setPending(null);
  }, [cash, ownedKey, sale?.tilePosition, sale?.price, sale?.buyerId]);

  useEffect(() => {
    if (owned.length === 0) return;
    if (!owned.some((entry) => entry.index === selected)) setSelected(owned[0].index);
    if (!owned.some((entry) => entry.index === saleTile)) {
      setSaleTile(owned[0].index);
      setPrice(owned[0].tile.price ?? 500);
    }
  }, [owned, ownedKey, selected, saleTile]);

  const saleEntry = owned.find((entry) => entry.index === saleTile) ?? owned[0];
  const selectedBuyer = others.find((player) => player.id === buyerId) ?? others[0];
  const buyerShort = selectedBuyer ? Math.max(0, price - selectedBuyer.cash) : 0;

  const run = (key: string, action: () => void) => {
    setPending(key);
    action();
    window.setTimeout(() => {
      setPending((current) => (current === key ? null : current));
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
      role="presentation"
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
        className="flex max-h-[min(92dvh,820px)] w-full max-w-lg flex-col overflow-hidden border border-[#e05060]/35 bg-[#12121a] shadow-[0_24px_80px_rgba(0,0,0,0.65)] outline-none"
        role="dialog"
        aria-modal="true"
        aria-label="Raise funds"
      >
        <div className="h-1.5 w-full bg-[#e05060]" />

        <div className="shrink-0 px-4 pb-3 pt-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#e05060]">
                Raise funds
              </div>
              <h2 className="mt-1 font-display text-2xl font-bold uppercase text-white sm:text-3xl">
                {formatInr(debt.amount)}
              </h2>
              <p className="mt-1 text-[11px] font-mono text-[#9baab8]">
                {debtor?.username ?? "Player"} · {debt.reason} · to {creditor?.username ?? "the bank"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#9baab8]">Cash</div>
              <div className="font-mono text-sm font-bold text-white">{formatInr(cash)}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
              <span className={canPay ? "text-[#d4a843]" : "text-[#e05060]"}>
                {canPay ? "Ready to pay" : `${formatInr(shortfall)} still short`}
              </span>
              <span className="text-[#9baab8]">{Math.round(covered)}%</span>
            </div>
            <div className="h-1.5 overflow-hidden bg-white/10">
              <motion.div
                className={canPay ? "h-full bg-[#d4a843]" : "h-full bg-[#e05060]"}
                initial={false}
                animate={{ width: `${covered}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>

          <AnimatePresence>
            {raised != null && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-[11px] font-mono text-[#d4a843]"
              >
                +{formatInr(raised)} raised
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {sale && (
          <div className="mx-4 mb-3 shrink-0 border border-[rgba(212,168,67,0.28)] bg-[#1a1508] p-3 sm:mx-5">
            <div className="text-[9px] font-mono uppercase tracking-widest text-[#d4a843]">
              Sale offer
            </div>
            <p className="mt-1 text-sm text-white">
              {BOARD[sale.tilePosition]?.name} to {buyer?.username ?? "a player"} for{" "}
              {formatInr(sale.price)}
            </p>
            {canAnswerSale ? (
              <div className="mt-3 flex gap-2">
                <NeonButton
                  variant="gold"
                  size="sm"
                  className="flex-1"
                  loading={pending === "accept"}
                  onClick={() => run("accept", onAcceptSale)}
                >
                  Accept
                </NeonButton>
                <NeonButton
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  loading={pending === "decline"}
                  onClick={() => run("decline", onDeclineSale)}
                >
                  Decline
                </NeonButton>
              </div>
            ) : (
              <p className="mt-2 text-[11px] font-mono text-[#9baab8]">
                Waiting for {buyer?.username ?? "the buyer"} to answer.
              </p>
            )}
          </div>
        )}

        {canResolve && !sale && (
          <div className="mx-4 mb-2 grid shrink-0 grid-cols-2 gap-1 sm:mx-5" role="tablist">
            <TabButton active={tab === "raise"} onClick={() => setTab("raise")} label="Raise cash" />
            <TabButton
              active={tab === "sell"}
              onClick={() => setTab("sell")}
              label="Sell a city"
              disabled={others.length === 0 || owned.length === 0}
            />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 sm:px-5">
          {!canResolve && !canAnswerSale && (
            <p className="py-6 text-center text-xs font-mono text-[#9baab8]">
              Waiting for {debtor?.username ?? "the debtor"} to settle {formatInr(debt.amount)}.
            </p>
          )}

          {canResolve && !sale && tab === "raise" && (
            <div className="flex flex-col gap-2">
              {owned.length === 0 && (
                <p className="py-4 text-center text-xs font-mono text-[#9baab8]">
                  No cities left to mortgage or sell.
                </p>
              )}
              {owned.map(({ index, property, tile }) => {
                const houseRefund = Math.floor((tile.housePrice ?? 0) / 2);
                const mortgageValue = Math.floor((tile.price ?? 0) / 2);
                const hasBuilding = property.houses > 0;
                const sellCheck = canSellBuilding(state, index, property.houses, tile.group);
                const isSelected = selected === index;
                const color = tile.group ? GROUP_COLORS[tile.group] : "#9baab8";
                const gain = hasBuilding ? houseRefund : property.mortgaged ? 0 : mortgageValue;
                return (
                  <div
                    key={index}
                    className={[
                      "border text-left transition-colors",
                      isSelected
                        ? "border-[rgba(212,168,67,0.45)] bg-[#1a1508]"
                        : "border-white/10 bg-black/25 hover:border-white/25",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                      onClick={() => setSelected(index)}
                      aria-expanded={isSelected}
                    >
                      <span className="h-9 w-1 shrink-0" style={{ background: color }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">{tile.name}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-[10px] font-mono text-[#9baab8]">
                          {property.mortgaged ? "Mortgaged" : developmentLabel(property.houses)}
                          <HousePips houses={property.houses} />
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-[#d4a843]">
                        {gain > 0 ? `+${formatInr(gain)}` : "—"}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10 px-3 py-3">
                            {hasBuilding ? (
                              <>
                                <NeonButton
                                  variant="gold"
                                  size="sm"
                                  className="w-full"
                                  disabled={!sellCheck.ok}
                                  loading={pending === `sell-${index}`}
                                  icon={<Building2 className="size-3.5" />}
                                  onClick={() => run(`sell-${index}`, () => onSellBuilding(index))}
                                >
                                  {property.houses >= 5 ? "Sell smart city" : "Sell one level"} · +
                                  {formatInr(houseRefund)}
                                </NeonButton>
                                <p className="mt-2 text-[10px] font-mono text-[#9baab8]">
                                  {sellCheck.ok
                                    ? `Cash becomes ${formatInr(cash + houseRefund)}.`
                                    : sellCheck.reason}
                                </p>
                              </>
                            ) : property.mortgaged ? (
                              <p className="text-[11px] font-mono text-[#9baab8]">
                                Already mortgaged. It stays with the bank until you can unmortgage it.
                              </p>
                            ) : (
                              <>
                                <NeonButton
                                  variant="gold"
                                  size="sm"
                                  className="w-full"
                                  loading={pending === `mort-${index}`}
                                  icon={<Wallet className="size-3.5" />}
                                  onClick={() => run(`mort-${index}`, () => onMortgage(index))}
                                >
                                  Mortgage · +{formatInr(mortgageValue)}
                                </NeonButton>
                                <p className="mt-2 text-[10px] font-mono text-[#9baab8]">
                                  Cash becomes {formatInr(cash + mortgageValue)}. Rent stops until you
                                  unmortgage.
                                </p>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {canResolve && !sale && tab === "sell" && saleEntry && (
            <div className="flex flex-col gap-4 py-1">
              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
                  Property
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {owned.map(({ index, tile, property }) => {
                    const active = saleTile === index;
                    const color = tile.group ? GROUP_COLORS[tile.group] : "#9baab8";
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSaleTile(index);
                          setPrice(tile.price ?? price);
                        }}
                        className={[
                          "min-h-[44px] border px-3 text-left text-xs font-bold transition-colors",
                          active
                            ? "border-[#d4a843] bg-[#1a1508] text-[#d4a843]"
                            : "border-white/15 text-white/80 hover:border-white/40",
                        ].join(" ")}
                      >
                        <span className="mr-2 inline-block h-2 w-2" style={{ background: color }} />
                        {tile.name}
                        {property.mortgaged ? " · deed" : ""}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">
                  Buyer
                </div>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {others.map((player) => {
                    const active = buyerId === player.id;
                    const short = Math.max(0, price - player.cash);
                    return (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => setBuyerId(player.id)}
                        className={[
                          "flex min-h-[44px] items-center gap-2 border px-3 py-2 text-left transition-colors",
                          active
                            ? "border-[#d4a843] bg-[#1a1508]"
                            : "border-white/15 hover:border-white/40",
                        ].join(" ")}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: player.avatarColor }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-white">
                            {player.username}
                          </span>
                          <span className="text-[10px] font-mono text-[#9baab8]">
                            {formatInr(player.cash)}
                            {short > 0 ? ` · short ${formatInr(short)}` : " · can pay"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <PriceControl
                price={price}
                listPrice={saleEntry.tile.price ?? price}
                mortgageValue={Math.floor((saleEntry.tile.price ?? 0) / 2)}
                onChange={setPrice}
              />

              {buyerShort > 0 && selectedBuyer && (
                <p className="text-[10px] font-mono text-[#e05060]">
                  {selectedBuyer.username} is {formatInr(buyerShort)} short. They can still accept and
                  raise funds.
                </p>
              )}

              <NeonButton
                variant="gold"
                size="sm"
                className="w-full"
                disabled={!buyerId || price <= 0}
                loading={pending === "offer"}
                icon={<Handshake className="size-3.5" />}
                onClick={() => run("offer", () => onProposeSale(saleTile, buyerId, price))}
              >
                Offer {saleEntry.tile.name} for {formatInr(Math.max(0, price))}
              </NeonButton>
            </div>
          )}
        </div>

        {canResolve && (
          <div className="shrink-0 border-t border-white/10 bg-[#0d0d12] px-4 py-3 sm:px-5">
            {confirmBankrupt ? (
              <div>
                <div className="mb-2 flex items-start gap-2 text-xs text-white">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#e05060]" />
                  <span>
                    Bankruptcy gives your remaining cities to {creditor?.username ?? "the bank"} and
                    removes you from the match.
                  </span>
                </div>
                <div className="flex gap-2">
                  <NeonButton
                    variant="ruby"
                    size="sm"
                    className="flex-1"
                    loading={pending === "bankrupt"}
                    onClick={() => run("bankrupt", onBankrupt)}
                  >
                    Confirm bankruptcy
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmBankrupt(false)}
                  >
                    Keep playing
                  </NeonButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <NeonButton
                  variant="gold"
                  size="sm"
                  className="flex-1"
                  disabled={!canPay || Boolean(sale)}
                  loading={pending === "pay"}
                  onClick={() => run("pay", onPay)}
                >
                  Pay {formatInr(debt.amount)}
                </NeonButton>
                <NeonButton
                  variant="ruby"
                  size="sm"
                  className="flex-1"
                  disabled={Boolean(sale)}
                  onClick={() => setConfirmBankrupt(true)}
                >
                  Declare bankruptcy
                </NeonButton>
              </div>
            )}
            {sale && (
              <p className="mt-2 text-center text-[10px] font-mono text-[#9baab8]">
                The offer has to be accepted or declined before you can pay.
              </p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function TabButton({
  active,
  label,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={[
        "min-h-[40px] border text-[10px] font-bold uppercase tracking-widest transition-colors",
        active
          ? "border-[#d4a843]/60 bg-[#1a1508] text-[#d4a843]"
          : "border-white/10 text-[#9baab8] hover:text-white",
        "disabled:cursor-not-allowed disabled:opacity-40",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function HousePips({ houses }: { houses: number }) {
  if (houses <= 0) return null;
  if (houses >= 5) {
    return <span className="text-[#d4a843]">★</span>;
  }
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {Array.from({ length: houses }, (_, index) => (
        <span key={index} className="size-1.5 bg-[#22c55e]" />
      ))}
    </span>
  );
}

function PriceControl({
  price,
  listPrice,
  mortgageValue,
  onChange,
}: {
  price: number;
  listPrice: number;
  mortgageValue: number;
  onChange: (next: number) => void;
}) {
  const presets = [
    { label: "Half", value: Math.max(1, Math.floor(listPrice / 2)) },
    { label: "Deed", value: Math.max(1, mortgageValue) },
    { label: "List", value: Math.max(1, listPrice) },
  ];
  return (
    <div>
      <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#9baab8]">Price</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Lower price"
          onClick={() => onChange(Math.max(PRICE_STEP, price - PRICE_STEP))}
          className="grid size-11 shrink-0 place-items-center border border-white/15 text-white hover:border-[#d4a843]/60 hover:text-[#d4a843]"
        >
          <Minus className="size-4" />
        </button>
        <input
          type="number"
          min={1}
          step={PRICE_STEP}
          value={Number.isFinite(price) ? price : 0}
          onChange={(event) => onChange(Math.max(0, Number(event.target.value)))}
          className="h-11 min-w-0 flex-1 border border-white/15 bg-black/40 px-3 text-center font-mono text-sm text-white outline-none focus:border-[#d4a843]"
        />
        <button
          type="button"
          aria-label="Raise price"
          onClick={() => onChange(price + PRICE_STEP)}
          className="grid size-11 shrink-0 place-items-center border border-white/15 text-white hover:border-[#d4a843]/60 hover:text-[#d4a843]"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.value)}
            className={[
              "min-h-[40px] border text-[10px] font-mono uppercase tracking-widest transition-colors",
              price === preset.value
                ? "border-[#d4a843] text-[#d4a843]"
                : "border-white/15 text-[#9baab8] hover:text-white",
            ].join(" ")}
          >
            {preset.label} {formatInr(preset.value)}
          </button>
        ))}
      </div>
    </div>
  );
}

function canSellBuilding(
  state: MonopolyState,
  tileIndex: number,
  houses: number,
  group: string | undefined,
): { ok: boolean; reason?: string } {
  if (houses <= 0 || !group) return { ok: false, reason: "Nothing to sell on this city." };
  const indexes = GROUP_TILES[group] ?? [tileIndex];
  const tallest = Math.max(...indexes.map((index) => state.properties[index]?.houses ?? 0));
  if (houses < tallest) {
    return { ok: false, reason: "Sell a level from the most developed city in this color first." };
  }
  return { ok: true };
}
