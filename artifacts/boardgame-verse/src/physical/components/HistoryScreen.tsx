import { usePhysicalStore } from "../store/physicalStore";
import { inr } from "./ui";

export function HistoryScreen() {
  const game = usePhysicalStore((state) => state.game);
  if (!game) return null;
  const transactions = [...game.transactions].reverse();
  const voided = [...game.voidedTransactions].reverse();
  const events = [...game.events].reverse();
  return (
    <div className="flex flex-col gap-4">
      <h2 className="display text-3xl uppercase">History</h2>
      <section>
        <h3 className="mb-2 text-sm uppercase tracking-wider text-white/45">Transactions</h3>
        {transactions.map((entry) => (
          <article key={entry.id} className="border-b border-white/10 py-3">
            <p className="text-xs text-white/40">{new Date(entry.timestamp).toLocaleString()}</p>
            <p>{entry.description}</p>
            <p className="text-lg font-semibold text-[#e6b325]">{inr(entry.amount)}</p>
          </article>
        ))}
      </section>
      {voided.length ? (
        <section>
          <h3 className="mb-2 text-sm uppercase tracking-wider text-white/45">Reversed</h3>
          {voided.map((entry) => (
            <article key={entry.id} className="border-b border-white/10 py-3 opacity-60">
              <p className="text-xs">Reversed · {new Date(entry.timestamp).toLocaleString()}</p>
              <p>{entry.description}</p>
              <p>{inr(entry.amount)}</p>
            </article>
          ))}
        </section>
      ) : null}
      <section>
        <h3 className="mb-2 text-sm uppercase tracking-wider text-white/45">Events</h3>
        {events.map((event) => (
          <article key={event.id} className="border-b border-white/10 py-2 text-sm">
            <p className="text-xs text-white/40">{event.type}</p>
            <p>{event.message}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
