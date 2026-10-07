import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { getCard, getSpace, spaceAt } from "../data/catalog";
import {
  applyPendingCard,
  buyProperty,
  confirmDice,
  currentPlayer,
  declineToAuction,
  dismissInfo,
  endAuction,
  payRent,
  payTax,
  placeBid,
  playerById,
  processLanding,
} from "../engine/engine";
import { formatInr } from "../money";
import { usePhysicalStore } from "../store/physicalStore";
import type { PhysicalGame } from "../types";
import { leaderboard } from "../engine/engine";
import { BigButton, Card, Sheet, inr, playerHex } from "./ui";

export function Dashboard() {
  const game = usePhysicalStore((state) => state.game);
  const apply = usePhysicalStore((state) => state.apply);
  const error = usePhysicalStore((state) => state.error);
  const [die1, setDie1] = useState<number | null>(null);
  const [die2, setDie2] = useState<number | null>(null);
  const [assistant, setAssistant] = useState(false);
  const [spaceId, setSpaceId] = useState("MUMBAI");
  const [taxAmount, setTaxAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [bidPlayer, setBidPlayer] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  if (!game) return null;
  const player = currentPlayer(game);
  const space = spaceAt(player.position);
  const total = die1 && die2 ? die1 + die2 : null;
  const finished = game.status === "finished";

  return (
    <div className="flex flex-col gap-4">
      {game.notice ? <p className="rounded-2xl bg-[#e6b325]/15 px-3 py-2 text-sm text-[#f3dd8a]">{game.notice}</p> : null}
      {error ? <p className="rounded-2xl bg-[#8f2d2d]/40 px-3 py-2 text-sm">{error}</p> : null}
      {finished ? <Winner game={game} /> : null}
      <Card>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Current turn</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="h-5 w-5 rounded-full" style={{ background: playerHex(player.color) }} />
          <h2 className="display text-4xl uppercase">{player.name}</h2>
        </div>
        <p className="mt-2 text-white/70">
          Position <span className="text-white">{space.name}</span>
          {player.inPrison ? " · In Jail" : ""}
        </p>
        {player.inPrison ? (
          <p className="mt-1 text-sm text-white/50">Roll doubles to leave. The rule sheet does not print a fine or a turn limit.</p>
        ) : null}
        {!finished && !game.pending ? (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <DiePicker label="Dice 1" value={die1} onChange={setDie1} />
              <DiePicker label="Dice 2" value={die2} onChange={setDie2} />
            </div>
            <p className="my-3 text-center text-3xl font-semibold">{total ? `Total ${total}` : "Total —"}</p>
            <BigButton
              disabled={!die1 || !die2}
              onClick={() => {
                if (!die1 || !die2) return;
                void apply(confirmDice(game, die1, die2));
                setDie1(null);
                setDie2(null);
              }}
            >
              Process move
            </BigButton>
            <p className="mt-2 text-center text-xs text-white/40">Doubles: move, then roll again. Third double: Jail, no move.</p>
          </>
        ) : null}
      </Card>
      {game.pending?.kind === "buy" ? (
        <Card>
          <h3 className="display text-3xl uppercase">{getSpace(game.pending.spaceId).name}</h3>
          <p className="text-white/60">Property value</p>
          <p className="text-4xl font-semibold text-[#e6b325]">{inr(game.pending.price)}</p>
          <p className="text-sm">
            {player.name}: {inr(player.cash)} → {inr(player.cash - game.pending.price)}
          </p>
          <p className="mb-3 text-sm uppercase tracking-wider text-white/50">Unowned</p>
          <div className="flex flex-col gap-2">
            <BigButton onClick={() => void apply(buyProperty(game))}>Buy property</BigButton>
            <BigButton tone="ghost" onClick={() => void apply(declineToAuction(game))}>
              Decline / auction
            </BigButton>
          </div>
        </Card>
      ) : null}
      {game.pending?.kind === "rent" ? (
        <RentCard game={game} onPay={() => void apply(payRent(game))} />
      ) : null}
      {game.pending?.kind === "tax" ? (
        <Card>
          <h3 className="display text-3xl uppercase">{game.pending.tax === "wealth" ? "Wealth tax" : "Income tax"}</h3>
          <p className="my-2 text-sm text-white/70">{game.pending.detail}</p>
          {game.pending.editable ? (
            <input
              inputMode="numeric"
              value={taxAmount}
              placeholder="0"
              onChange={(event) => setTaxAmount(event.target.value.replace(/[^\d]/g, "").slice(0, 7))}
              className="mb-3 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-3 text-2xl"
            />
          ) : (
            <p className="mb-3 text-4xl font-semibold">{inr(game.pending.amount)}</p>
          )}
          <BigButton
            onClick={() => void apply(payTax(game, game.pending?.kind === "tax" && game.pending.editable ? Number(taxAmount || 0) : undefined))}
          >
            Pay tax
          </BigButton>
        </Card>
      ) : null}
      {game.pending?.kind === "card" ? (
        <CardSheet
          game={game}
          cardAmount={cardAmount}
          setCardAmount={setCardAmount}
          onApply={(amount) => void apply(applyPendingCard(game, amount))}
        />
      ) : null}
      {game.pending?.kind === "info" ? (
        <Card>
          <h3 className="display text-3xl uppercase">{game.pending.title}</h3>
          <p className="my-3 text-sm leading-relaxed text-white/75">{game.pending.detail}</p>
          <BigButton onClick={() => void apply(dismissInfo(game))}>Continue</BigButton>
        </Card>
      ) : null}
      {game.pending?.kind === "auction" ? (
        <AuctionCard
          game={game}
          bidPlayer={bidPlayer || game.players.find((entry) => entry.status === "active")?.id || ""}
          setBidPlayer={setBidPlayer}
          bidAmount={bidAmount}
          setBidAmount={setBidAmount}
          onBid={(playerId, amount) => void apply(placeBid(game, playerId, amount))}
          onEnd={() => void apply(endAuction(game))}
        />
      ) : null}
      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Player balances</p>
        <ul className="flex flex-col gap-2">
          {game.players.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: playerHex(entry.color) }} />
                {entry.name}
              </span>
              <span className="font-semibold">{inr(entry.cash)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <div className="grid grid-cols-2 gap-2">
        <Link to="/physical/$gameId/money" params={{ gameId: game.id }}><BigButton tone="ghost">Payment</BigButton></Link>
        <Link to="/physical/$gameId/properties" params={{ gameId: game.id }}><BigButton tone="ghost">Property</BigButton></Link>
        <Link to="/physical/$gameId/players" params={{ gameId: game.id }}><BigButton tone="ghost">Players</BigButton></Link>
        <Link to="/physical/$gameId/board" params={{ gameId: game.id }}><BigButton tone="ghost">Board</BigButton></Link>
      </div>
      <button type="button" className="text-sm text-white/50" onClick={() => setAssistant(true)}>
        Landing assistant
      </button>
      <Card>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Recent transactions</p>
        {game.transactions.slice(-4).reverse().map((entry) => (
          <p key={entry.id} className="border-t border-white/5 py-2 text-sm">
            <span className="block text-white/80">{entry.description}</span>
            <span className="text-[#e6b325]">{inr(entry.amount)}</span>
          </p>
        ))}
      </Card>
      {assistant ? (
        <Sheet title="Landing assistant" onClose={() => setAssistant(false)}>
          <p className="mb-3 text-sm text-white/60">
            Places {player.name} on a space without adding Start salary. Use this when the token is already there.
          </p>
          <select
            value={spaceId}
            onChange={(event) => setSpaceId(event.target.value)}
            className="mb-3 min-h-12 w-full rounded-2xl bg-black/30 px-3"
          >
            {Array.from({ length: 36 }, (_, index) => (
              <option key={index} value={spaceAt(index).id}>
                {spaceAt(index).name}
              </option>
            ))}
          </select>
          <BigButton
            onClick={() => {
              void apply(processLanding(game, spaceId, die1 && die2 ? { die1, die2 } : undefined));
              setAssistant(false);
            }}
          >
            Process landing
          </BigButton>
        </Sheet>
      ) : null}
    </div>
  );
}

function DiePicker({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number) => void }) {
  return (
    <div>
      <p className="mb-2 text-center text-xs uppercase tracking-wider text-white/45">{label}</p>
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3, 4, 5, 6].map((face) => (
          <button
            key={face}
            type="button"
            onClick={() => onChange(face)}
            className={`die-btn rounded-xl text-lg font-semibold ${value === face ? "bg-[#e6b325] text-[#1a1404]" : "bg-white/10"}`}
          >
            {face}
          </button>
        ))}
      </div>
    </div>
  );
}

function RentCard({ game, onPay }: { game: PhysicalGame; onPay: () => void }) {
  const pending = game.pending;
  if (!pending || pending.kind !== "rent") return null;
  const payer = playerById(game, pending.payerId);
  const owner = playerById(game, pending.ownerId);
  return (
    <Card>
      <h3 className="display text-3xl uppercase">{getSpace(pending.spaceId).name}</h3>
      <p className="text-sm text-white/60">Owner {owner.name}</p>
      <p className="text-sm text-white/60">{pending.breakdown}</p>
      <p className="my-2 text-4xl font-semibold text-[#e6b325]">{inr(pending.amount)}</p>
      <p className="mb-1 text-sm">
        {payer.name} {inr(payer.cash)} → {inr(payer.cash - pending.amount)}
      </p>
      <p className="mb-3 text-sm">
        {owner.name} {inr(owner.cash)} → {inr(owner.cash + pending.amount)}
      </p>
      <BigButton onClick={onPay}>Pay rent</BigButton>
    </Card>
  );
}

function CardSheet({
  game,
  cardAmount,
  setCardAmount,
  onApply,
}: {
  game: PhysicalGame;
  cardAmount: string;
  setCardAmount: (value: string) => void;
  onApply: (amount?: number) => void;
}) {
  const pending = game.pending;
  if (!pending || pending.kind !== "card") return null;
  const card = getCard(pending.cardId);
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.18em] text-[#e6b325]">{card.deck === "chance" ? "Chance" : "Community Chest"}</p>
      <h3 className="display text-3xl uppercase">{card.title}</h3>
      <p className="my-2 text-sm leading-relaxed">{card.text}</p>
      {card.uncertain ? <p className="mb-2 text-xs text-[#f3dd8a]">This line was partly hidden in the photo. Confirm the amount before applying.</p> : null}
      {card.uncertain && card.effect.type !== "skip-turn" && card.effect.type !== "go-to-jail" && card.effect.type !== "advance" ? (
        <input
          inputMode="numeric"
          value={cardAmount}
          placeholder="Leave blank to use the printed amount"
          onChange={(event) => setCardAmount(event.target.value.replace(/[^\d]/g, "").slice(0, 7))}
          className="mb-3 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-3"
        />
      ) : null}
      <BigButton onClick={() => onApply(cardAmount ? Number(cardAmount) : undefined)}>Apply</BigButton>
    </Card>
  );
}

function AuctionCard({
  game,
  bidPlayer,
  setBidPlayer,
  bidAmount,
  setBidAmount,
  onBid,
  onEnd,
}: {
  game: PhysicalGame;
  bidPlayer: string;
  setBidPlayer: (id: string) => void;
  bidAmount: string;
  setBidAmount: (value: string) => void;
  onBid: (playerId: string, amount: number) => void;
  onEnd: () => void;
}) {
  const pending = game.pending;
  if (!pending || pending.kind !== "auction") return null;
  const space = getSpace(pending.spaceId);
  const high = pending.bids.reduce((best, bid) => Math.max(best, bid.amount), 0);
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">Bank auction</p>
      <h3 className="display text-3xl uppercase">{space.name}</h3>
      <p className="mb-2 text-sm text-white/60">Highest bid {high ? inr(high) : "none yet"}. The winner pays the bank.</p>
      {pending.bids
        .slice()
        .sort((left, right) => right.amount - left.amount)
        .map((bid) => (
          <p key={bid.playerId} className="text-sm">
            {playerById(game, bid.playerId).name} {inr(bid.amount)}
          </p>
        ))}
      <select value={bidPlayer} onChange={(event) => setBidPlayer(event.target.value)} className="my-3 min-h-12 w-full rounded-2xl bg-black/30 px-3">
        {game.players
          .filter((player) => player.status === "active")
          .map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
      </select>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <BigButton tone="ghost" onClick={() => onBid(bidPlayer, high + 500)}>
          + ₹500
        </BigButton>
        <BigButton tone="ghost" onClick={() => onBid(bidPlayer, high + 1000)}>
          + ₹1,000
        </BigButton>
      </div>
      <input
        inputMode="numeric"
        value={bidAmount}
        placeholder="Custom bid"
        onChange={(event) => setBidAmount(event.target.value.replace(/[^\d]/g, "").slice(0, 7))}
        className="mb-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-3"
      />
      <BigButton tone="ghost" onClick={() => bidAmount && onBid(bidPlayer, Number(bidAmount))}>
        Place custom bid
      </BigButton>
      <div className="mt-2">
        <BigButton onClick={onEnd}>End auction</BigButton>
      </div>
    </Card>
  );
}

function Winner({ game }: { game: PhysicalGame }) {
  const ranked = leaderboard(game);
  const winner = ranked.find((entry) => entry.player.id === game.winnerId) ?? ranked[0];
  const duration = game.finishedAt ? game.finishedAt - game.startedAt : Date.now() - game.startedAt;
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  if (!winner) return null;
  return (
    <Card className="border-[#e6b325]/40">
      <p className="text-xs uppercase tracking-[0.2em] text-[#e6b325]">Game over</p>
      <h2 className="display text-4xl uppercase">{winner.player.name}</h2>
      <p>Cash {formatInr(winner.worth.cash)}</p>
      <p>Properties {winner.worth.propertyCount}</p>
      <p>Net worth {formatInr(winner.worth.netWorth)}</p>
      <p className="text-sm text-white/60">
        {hours}h {minutes}m · {game.transactions.length} transactions
      </p>
      <ol className="mt-3 flex flex-col gap-1 text-sm">
        {ranked.map((entry, index) => (
          <li key={entry.player.id}>
            {index + 1}. {entry.player.name} · {formatInr(entry.worth.netWorth)}
          </li>
        ))}
      </ol>
    </Card>
  );
}
