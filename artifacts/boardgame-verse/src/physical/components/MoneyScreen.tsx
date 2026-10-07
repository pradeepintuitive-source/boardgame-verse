import { useState } from "react";
import { BANK_ID, quickTransfer } from "../engine/engine";
import { usePhysicalStore } from "../store/physicalStore";
import { BigButton, Card, FieldLabel, inr } from "./ui";

const REASONS = ["Rent", "Tax", "Chance", "Community Chest", "Other"];

export function MoneyScreen() {
  const game = usePhysicalStore((state) => state.game);
  const apply = usePhysicalStore((state) => state.apply);
  const error = usePhysicalStore((state) => state.error);
  const [fromId, setFromId] = useState(BANK_ID);
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Other");
  const [confirming, setConfirming] = useState(false);
  if (!game) return null;
  const parties = [{ id: BANK_ID, name: "Bank" }, ...game.players.map((player) => ({ id: player.id, name: player.name }))];
  const receiver = toId || game.players[0]?.id || BANK_ID;
  const rupees = Number(amount || 0);
  const from = parties.find((party) => party.id === fromId);
  const to = parties.find((party) => party.id === receiver);
  const fromBalance = fromId === BANK_ID ? game.bankLedger : game.players.find((player) => player.id === fromId)?.cash ?? 0;
  const toBalance = receiver === BANK_ID ? game.bankLedger : game.players.find((player) => player.id === receiver)?.cash ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="display text-3xl uppercase">Money</h2>
      <Card>
        <p className="text-sm text-white/60">Bank ledger {inr(game.bankLedger)}</p>
        <p className="text-xs text-white/40">A negative bank means cash has been issued. The rule sheet lets money keep flowing.</p>
      </Card>
      {error ? <p className="text-sm text-[#ffb4b4]">{error}</p> : null}
      <Card>
        <FieldLabel>From</FieldLabel>
        <select value={fromId} onChange={(event) => setFromId(event.target.value)} className="mb-3 min-h-12 w-full rounded-2xl bg-black/30 px-3">
          {parties.map((party) => (
            <option key={party.id} value={party.id}>
              {party.name}
            </option>
          ))}
        </select>
        <FieldLabel>To</FieldLabel>
        <select value={receiver} onChange={(event) => setToId(event.target.value)} className="mb-3 min-h-12 w-full rounded-2xl bg-black/30 px-3">
          {parties.map((party) => (
            <option key={party.id} value={party.id}>
              {party.name}
            </option>
          ))}
        </select>
        <FieldLabel>Amount</FieldLabel>
        <input
          inputMode="numeric"
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, "").slice(0, 8))}
          className="mb-3 min-h-14 w-full rounded-2xl border border-white/10 bg-black/30 px-3 text-3xl"
          placeholder="₹"
        />
        <FieldLabel>Reason</FieldLabel>
        <div className="mb-3 flex flex-wrap gap-2">
          {REASONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setReason(item)}
              className={`min-h-10 rounded-full px-3 text-sm ${reason === item ? "bg-[#e6b325] text-[#1a1404]" : "bg-white/10"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <BigButton disabled={!rupees} onClick={() => setConfirming(true)}>
          Review
        </BigButton>
      </Card>
      {confirming ? (
        <Card>
          <p className="text-lg font-semibold">
            {from?.name} → {to?.name}
          </p>
          <p className="my-2 text-4xl font-semibold text-[#e6b325]">{inr(rupees)}</p>
          <p className="text-sm">
            {from?.name}: {inr(fromBalance)} → {inr(fromBalance - rupees)}
          </p>
          <p className="mb-3 text-sm">
            {to?.name}: {inr(toBalance)} → {inr(toBalance + rupees)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <BigButton tone="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </BigButton>
            <BigButton
              onClick={() => {
                void apply(quickTransfer(game, fromId, receiver, rupees, reason)).then(() => setConfirming(false));
              }}
            >
              Confirm
            </BigButton>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
