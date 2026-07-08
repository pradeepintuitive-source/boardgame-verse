import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trophy, Banknote } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { ChatDrawer } from "../components/chat/ChatDrawer";
import { Board } from "../components/monopoly/Board";
import { ActionBar } from "../components/monopoly/ActionBar";
import { PlayerPanel } from "../components/monopoly/PlayerPanel";
import { PropertyCard } from "../components/monopoly/PropertyCard";
import { AuctionPanel } from "../components/monopoly/AuctionPanel";
import { TradePanel } from "../components/monopoly/TradePanel";
import { EventLog } from "../components/monopoly/EventLog";
import { BankManager } from "../components/monopoly/BankManager";
import { useMonopolyStore } from "../store/monopolyStore";
import { useAuthStore } from "../store/authStore";
import {
  aiAuctionStep,
  aiStep,
  bankAdjust,
  bankTransfer,
  buildHouse,
  buyPending,
  currentPlayer,
  endTurn,
  passBid,
  payJailFee,
  placeBid,
  proposeTrade,
  resolveTrade,
  rollDice,
  sellHouse,
  settleAuction,
  startAuction,
  toggleMortgage,
  useJailCard,
} from "../utils/monopolyEngine";

export const Route = createFileRoute("/monopoly/$gameId")({
  head: () => ({
    meta: [
      { title: "Monopoly — GameHub" },
      { name: "description", content: "Play Monopoly locally with friends and AI. Offline-ready." },
    ],
  }),
  component: MonopolyPage,
});

function MonopolyPage() {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const state = useMonopolyStore((s) => s.games[gameId]);
  const setGame = useMonopolyStore((s) => s.setGame);
  const user = useAuthStore((s) => s.user);

  const [openTile, setOpenTile] = useState<number | null>(null);
  const [tradePartner, setTradePartner] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI driver — runs whenever it's an AI's turn or AI auction bidder
  useEffect(() => {
    if (!state || state.phase === "ended") return;
    if (aiTimer.current) clearTimeout(aiTimer.current);
    const cur = currentPlayer(state);

    if (state.phase === "auction" && state.auction) {
      const bidderId = state.auction.activePlayerIds[state.auction.currentBidderIndex];
      const bidder = state.players.find((p) => p.id === bidderId);
      if (state.auction.activePlayerIds.length <= 1) {
        aiTimer.current = setTimeout(() => setGame(gameId, settleAuction(state)), 600);
        return;
      }
      if (bidder?.isAI) {
        aiTimer.current = setTimeout(() => setGame(gameId, aiAuctionStep(state)), 900);
      }
      return;
    }

    if (cur.isAI && (state.phase === "rolling" || state.phase === "landed")) {
      aiTimer.current = setTimeout(() => setGame(gameId, aiStep(state)), 1100);
    }
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
    };
  }, [state, gameId, setGame]);

  // Pass-and-play: the "me" view always follows whoever's turn it is, as long as
  // they're a human. The auth user is only used as a fallback identity.
  const me = useMemo(() => {
    if (!state) return undefined;
    const cur = state.players[state.currentPlayerIndex];
    if (cur && !cur.isAI && !cur.bankrupt) return cur;
    return (
      state.players.find((p) => p.id === user?.id) ??
      state.players.find((p) => !p.isAI) ??
      state.players[0]
    );
  }, [state, user]);

  if (!state || !me) {
    return (
      <AppShell>
        <div className="min-h-screen grid place-items-center px-6 pt-32 text-center">
          <div>
            <p className="text-white/60 mb-6 font-mono">This match has ended or was lost.</p>
            <NeonButton onClick={() => navigate({ to: "/" })}>Back Home</NeonButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const cur = currentPlayer(state);
  const isMyTurn = !cur.isAI && !cur.bankrupt && cur.id === me.id;
  const apply = (fn: (s: typeof state) => typeof state) => setGame(gameId, fn(state));

  return (
    <AppShell hideChrome>
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "radial-gradient(circle at 50% 0%, #0a1a2e 0%, #050507 60%)" }}
      />
      <main className="relative px-4 pt-20 pb-32 max-w-[1600px] mx-auto">
        <header className="flex items-end justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-cyan mb-1">
              Local Game · Offline Ready
            </div>
            <h1 className="font-display text-4xl md:text-5xl italic uppercase neon-text-glow">
              Monopoly
            </h1>
          </div>
          <div className="flex gap-2">
            <NeonButton variant="ghost" size="sm" onClick={() => setBankOpen(true)}>
              <Banknote className="inline size-4 mr-1" /> Bank
            </NeonButton>
            <NeonButton variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
              Exit
            </NeonButton>
          </div>
        </header>

        <div className="grid xl:grid-cols-[280px_minmax(0,1fr)_320px] gap-4">
          {/* Left: players */}
          <aside className="space-y-2 order-2 xl:order-1">
            {state.players.map((p) => (
              <PlayerPanel
                key={p.id}
                state={state}
                player={p}
                isCurrent={state.players[state.currentPlayerIndex].id === p.id}
                isMe={p.id === me.id}
                onSelectTile={(i) => setOpenTile(i)}
                onProposeTrade={p.id !== me.id ? () => setTradePartner(p.id) : undefined}
              />
            ))}
          </aside>

          {/* Center: board */}
          <section className="order-1 xl:order-2">
            <Board
              state={state}
              onTileClick={(i) => setOpenTile(i)}
              highlightTile={state.pendingPurchaseTile}
            />
          </section>

          {/* Right: action + log */}
          <aside className="space-y-4 order-3">
            <ActionBar
              state={state}
              me={me}
              isMyTurn={isMyTurn}
              onRoll={() => apply(rollDice)}
              onBuy={() => apply(buyPending)}
              onAuction={() => apply(startAuction)}
              onEnd={() => apply(endTurn)}
              onPayJail={() => apply(payJailFee)}
              onJailCard={() => apply(useJailCard)}
            />
            <EventLog log={state.log} />
          </aside>
        </div>

        {state.phase === "ended" && (
          <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md grid place-items-center p-6">
            <div className="glass-panel border border-accent-amber/40 p-10 text-center max-w-md">
              <Trophy className="size-14 text-accent-amber mx-auto mb-4" />
              <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-accent-amber mb-2">
                Match Over
              </div>
              <h2 className="font-display text-4xl italic uppercase mb-2">
                {state.players.find((p) => p.id === state.winnerId)?.username} wins!
              </h2>
              <p className="text-white/60 text-sm mb-6">The last tycoon standing.</p>
              <NeonButton onClick={() => navigate({ to: "/" })}>Return Home</NeonButton>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {openTile != null && (
          <PropertyCard
            state={state}
            tileIndex={openTile}
            onClose={() => setOpenTile(null)}
            onBuild={
              state.properties[openTile]?.ownerId === me.id
                ? () => apply((s) => buildHouse(s, openTile))
                : undefined
            }
            onSell={
              state.properties[openTile]?.ownerId === me.id && state.properties[openTile].houses > 0
                ? () => apply((s) => sellHouse(s, openTile))
                : undefined
            }
            onMortgage={
              state.properties[openTile]?.ownerId === me.id
                ? () => apply((s) => toggleMortgage(s, openTile))
                : undefined
            }
          />
        )}

        {state.phase === "auction" && state.auction && (
          <AuctionPanel
            state={state}
            meId={me.id}
            onBid={(amount) => apply((s) => placeBid(s, me.id, amount))}
            onPass={() => apply((s) => passBid(s, me.id))}
          />
        )}

        {tradePartner && (
          <TradePanel
            state={state}
            meId={me.id}
            partnerId={tradePartner}
            onClose={() => setTradePartner(null)}
            onPropose={(offer) => {
              apply((s) => proposeTrade(s, offer));
              // Auto-resolve if partner is AI (simple heuristic)
              const partner = state.players.find((p) => p.id === tradePartner);
              if (partner?.isAI) {
                setTimeout(() => {
                  setGame(
                    gameId,
                    resolveTrade(useMonopolyStore.getState().games[gameId], aiAcceptsTrade(offer)),
                  );
                }, 1200);
              }
              setTradePartner(null);
            }}
          />
        )}

        {state.trade && state.trade.toId === me.id && (
          <TradePanel
            state={state}
            meId={state.trade.toId}
            partnerId={state.trade.fromId}
            existingOffer={state.trade}
            onClose={() => apply((s) => resolveTrade(s, false))}
            onAccept={() => apply((s) => resolveTrade(s, true))}
            onDecline={() => apply((s) => resolveTrade(s, false))}
          />
        )}

        {bankOpen && (
          <BankManager
            state={state}
            onClose={() => setBankOpen(false)}
            onAdjust={(pid, delta) => apply((s) => bankAdjust(s, pid, delta))}
            onTransfer={(from, to, amt) => apply((s) => bankTransfer(s, from, to, amt))}
          />
        )}
      </AnimatePresence>

      <ChatDrawer roomId={gameId} />
    </AppShell>
  );
}

function aiAcceptsTrade(offer: {
  fromCash: number;
  toCash: number;
  fromProps: number[];
  toProps: number[];
}) {
  // Simple heuristic: AI accepts if cash+prop-count is roughly fair (within 15%)
  const give = offer.toCash + offer.toProps.length * 150;
  const get = offer.fromCash + offer.fromProps.length * 150;
  return get >= give * 0.9;
}
