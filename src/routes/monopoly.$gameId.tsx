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
import { useGameSnapshot } from "../hooks/useGameSession";
import { useRoom } from "../hooks/useRooms";
import { Topics } from "../websocket/topics";
import { useStompSubscription } from "../hooks/useStompSubscription";
import { stomp } from "../websocket/stompClient";
import { monopolyApi } from "../services/monopoly";
import { pickAvatarColor } from "../utils/ids";
import type { MonopolyState, PropertyState } from "../models/monopoly";
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
  const snapshot = useGameSnapshot<any>(gameId);
  const roomQuery = useRoom(snapshot.data?.roomId);

  // Map backend phase enum to frontend phase strings
  function mapPhase(phase: string | null | undefined) {
    switch ((phase ?? "").toString()) {
      case "WAITING_FOR_ROLL":
        return "rolling";
      case "WAITING_FOR_DECISION":
        return "landed";
      case "WAITING_FOR_TRADE":
        return "trade";
      case "WAITING_FOR_AUCTION":
        return "auction";
      case "PAUSED":
        return "ended";
      case "ENDED":
        return "ended";
      default:
        return "rolling";
    }
  }

  function mapSnapshotToState(session: any, room: any): MonopolyState {
    const backend = session.state ?? {};
    const sessionId = session.sessionId ?? gameId;
    const assets = backend.assets ?? {};
    const roomPlayers = room?.players ?? [];

    const players = roomPlayers.map((p: any) => {
      const asset = assets[p.id] ?? null;
      return {
        id: p.id,
        username: p.username,
        avatarColor: p.avatarColor ?? pickAvatarColor(p.username),
        isAI: p.isAI,
        position: asset?.position ?? 0,
        cash: asset?.cash ?? 1500,
        inJail: asset?.inJail ?? false,
        jailTurns: asset?.jailTurns ?? 0,
        bankrupt: false,
      };
    });

    const properties: Record<number, PropertyState> = {};
    const owners = backend.owners ?? {};
    const developments = backend.developments ?? {};
    const mortgaged = new Set(backend.mortgagedTiles ?? []);
    Object.keys(owners).forEach((k) => {
      const pos = Number(k);
      const ownerId = owners[k] ? String(owners[k]) : null;
      const dev = developments[pos] ?? null;
      properties[pos] = {
        ownerId,
        houses: dev ? dev.houses ?? 0 : 0,
        mortgaged: mortgaged.has(pos),
      };
    });

    const curPlayerIndex = players.findIndex(
      (p) => String(p.id) === String(backend.currentPlayerId),
    );

    const mapped: MonopolyState = {
      gameId: String(sessionId),
      players,
      currentPlayerIndex: curPlayerIndex >= 0 ? curPlayerIndex : 0,
      phase: mapPhase(backend.phase),
      lastRoll: null,
      consecutiveDoubles: 0,
      properties,
      chanceDeck: backend.board?.chanceDeck ?? [],
      chestDeck: backend.board?.chestDeck ?? [],
      pendingPurchaseTile: backend.pendingPurchaseTile ?? null,
      pendingCard: backend.pendingCard ?? null,
      auction: backend.auction ?? null,
      trade: backend.trade ?? null,
      log: (backend.log ?? []).map((t: string, i: number) => ({ id: String(i), text: t, ts: Date.now(), kind: "info" })),
      winnerId: null,
    };

    return mapped;
  }

  // Subscribe to game updates broadcast for this room (payload contains refreshed state)
  useStompSubscription<any>(
    snapshot.data?.roomId ? Topics.gameRoom(snapshot.data.roomId) : null,
    (msg) => {
      if (!msg) return;
      try {
        if (msg.type === "AUCTION_UPDATE") {
          const a = msg.payload ?? null;
          const current = useMonopolyStore.getState().games[gameId];
          const auction = a
            ? {
                tileIndex: a.tilePosition ?? a.tileIndex ?? 0,
                bids: [],
                currentBidderIndex: a.currentBidderIndex ?? 0,
                activePlayerIds: a.activePlayerIds ?? [],
                highestBid: a.highestBid ?? 0,
                highestBidderId: a.highestBidder ? String(a.highestBidder) : null,
                startedAt: Date.now(),
              }
            : null;
          setGame(gameId!, { ...(current ?? {}), auction });
          return;
        }
        const payload = msg.payload ?? msg; // payload may be in .payload
        // payload may be a MonopolyStateResponse or raw game state; normalize and hydrate
        const sessionLike = { sessionId: gameId, state: payload };
        const mapped = mapSnapshotToState(sessionLike, roomQuery.data);
        setGame(gameId!, mapped);
      } catch (e) {
        console.error("Failed to apply game update", e);
      }
    },
    !!snapshot.data?.roomId,
  );
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate only when we have snapshot + room info
  useEffect(() => {
    if (!snapshot.data || !roomQuery.data) return;
    try {
      const session = snapshot.data;
      const room = roomQuery.data;
      const mapped = mapSnapshotToState(session, room);
      setGame(gameId!, mapped);
      setHydrated(true);
    } catch (e) {
      console.error("Failed to hydrate Monopoly store from snapshot", e);
    }
  }, [snapshot.data, roomQuery.data, gameId, setGame]);

  // Subscribe to game updates broadcast for this room (payload contains refreshed state)
  useStompSubscription<any>(
    snapshot.data?.roomId ? Topics.gameRoom(snapshot.data.roomId) : null,
    (msg) => {
      if (!msg) return;
      try {
        if (msg.type === "AUCTION_UPDATE") {
          const a = msg.payload ?? null;
          const current = useMonopolyStore.getState().games[gameId];
          const auction = a
            ? {
                tileIndex: a.tilePosition ?? a.tileIndex ?? 0,
                bids: [],
                currentBidderIndex: a.currentBidderIndex ?? 0,
                activePlayerIds: a.activePlayerIds ?? [],
                highestBid: a.highestBid ?? 0,
                highestBidderId: a.highestBidder ? String(a.highestBidder) : null,
                startedAt: Date.now(),
              }
            : null;
          setGame(gameId!, { ...(current ?? {}), auction });
          return;
        }
        const payload = msg.payload ?? msg; // payload may be in .payload
        // payload may be a MonopolyStateResponse or raw game state; normalize and hydrate
        const sessionLike = { sessionId: gameId, state: payload };
        const mapped = mapSnapshotToState(sessionLike, roomQuery.data);
        setGame(gameId!, mapped);
      } catch (e) {
        console.error("Failed to apply game update", e);
      }
    },
    !!snapshot.data?.roomId,
  );

  // Show loading until snapshot and room are available, store hydrated, and user resolved
  if (snapshot.isLoading || roomQuery.isLoading || !snapshot.data || !roomQuery.data || !user || !hydrated) {
    return (
      <AppShell>
        <div className="min-h-screen grid place-items-center px-6 pt-32 text-center">
          <div>
            <p className="text-white/60 mb-6 font-mono">Fetching snapshot…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Defensive guard: if the mapped state has no players yet, avoid rendering main UI to prevent crashes
  if (!state || !state.players || state.players.length === 0) {
    return (
      <AppShell>
        <div className="min-h-screen grid place-items-center px-6 pt-32 text-center">
          <div>
            <p className="text-white/60 mb-6 font-mono">Waiting for players…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (snapshot.isError) {
    return (
      <AppShell>
        <div className="min-h-screen grid place-items-center px-6 pt-32 text-center">
          <div>
            <p className="text-white/60 mb-6 font-mono">Unable to load game.</p>
            <NeonButton onClick={() => navigate({ to: "/" })}>Back Home</NeonButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const [openTile, setOpenTile] = useState<number | null>(null);
  const [tradePartner, setTradePartner] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI driver — runs whenever it's an AI's turn or AI auction bidder
  useEffect(() => {
    if (!state || state.phase === "ended") return;
    if (aiTimer.current) clearTimeout(aiTimer.current);
    const cur = currentPlayer(state);
    // If we're offline (no stomp broker), run local AI steps to keep single-device demos working.
    // When online, the backend is authoritative and will run AI logic and broadcast updates — do nothing here.
    if (stomp.isOffline) {
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

  // Send action to server via STOMP. Actions are validated/processed by backend.
  const sendGameAction = (type: string, payload: Record<string, unknown> = {}) => {
    if (!gameId) return false;
    if (!isMyTurn) {
      console.warn("Attempted action while not player's turn", type);
      return false;
    }

    // Local fallback implementations for offline demo mode
    const fallback = (action: string, p: Record<string, unknown>) => {
      switch (action) {
        case "ROLL":
          return apply(rollDice);
        case "BUY":
          return apply(buyPending);
        case "START_AUCTION":
          return apply(startAuction);
        case "END_TURN":
          return apply(endTurn);
        case "PAY_JAIL":
          return apply(payJailFee);
        case "USE_JAIL_CARD":
          return apply(useJailCard);
        case "PLACE_BID":
          return apply((s) => placeBid(s, me.id, (p.amount as number) ?? 0));
        case "PASS_BID":
          return apply((s) => passBid(s, me.id));
        case "BUILD_HOUSE":
          return apply((s) => buildHouse(s, (p.tileIndex as number) ?? 0));
        case "SELL_HOUSE":
          return apply((s) => sellHouse(s, (p.tileIndex as number) ?? 0));
        case "TOGGLE_MORTGAGE":
          return apply((s) => toggleMortgage(s, (p.tileIndex as number) ?? 0));
        case "PROPOSE_TRADE":
          return apply((s) => proposeTrade(s, p.offer as any));
        case "RESOLVE_TRADE":
          return apply((s) => resolveTrade(s, !!p.accept));
        case "BANK_ADJUST":
          return apply((s) => bankAdjust(s, (p.playerId as string) ?? "", (p.delta as number) ?? 0));
        case "BANK_TRANSFER":
          return apply((s) => bankTransfer(s, (p.from as string) ?? "", (p.to as string) ?? "", (p.amt as number) ?? 0));
        default:
          console.warn("Unknown fallback action", action);
      }
    };

    const dest = Topics.send.gameAction(gameId);
    // Build server-friendly MonopolyActionRequest shape
    const requestBody: Record<string, unknown> = {
      type: (
        {
          ROLL: "ROLL_DICE",
          BUY: "BUY_PROPERTY",
          START_AUCTION: "AUCTION",
          END_TURN: "END_TURN",
          PAY_JAIL: "PAY_JAIL",
          USE_JAIL_CARD: "USE_JAIL_CARD",
          PLACE_BID: "AUCTION",
          PASS_BID: "AUCTION",
          BUILD_HOUSE: "BUILD_HOUSE",
          SELL_HOUSE: "SELL_HOUSE",
          TOGGLE_MORTGAGE: "MORTGAGE",
          PROPOSE_TRADE: "TRADE",
          RESOLVE_TRADE: "TRADE",
          BANK_ADJUST: "TRADE",
          BANK_TRANSFER: "TRADE",
        } as Record<string, string>
      )[type] ?? type,
    };
    if ((payload as any).tileIndex != null) requestBody.tilePosition = (payload as any).tileIndex;
    if ((payload as any).amount != null) requestBody.amount = (payload as any).amount;
    if ((payload as any).targetPlayerId != null) requestBody.targetPlayerId = (payload as any).targetPlayerId;
    if ((payload as any).metadata != null) requestBody.metadata = (payload as any).metadata;

    const sent = stomp.sendMessage(dest, requestBody);
    if (sent) {
      // Optimistic local update to keep UI responsive; server broadcast will reconcile.
      if (!stomp.isOffline) {
        fallback(type, payload);
      }
      return true;
    }

    // Try HTTP fallback (server may accept action via REST)
    try {
      monopolyApi.action(gameId, requestBody).catch(() => {});
      // optimistic apply for HTTP fallback too
      fallback(type, payload);
      return true;
    } catch (e) {
      // ignore and fall through to local fallback
    }

    // STOMP and HTTP both unavailable — apply fallback locally to preserve offline demo.
    fallback(type, payload);
    return true;
  };

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
              onRoll={() => sendGameAction("ROLL")}
              onBuy={() => sendGameAction("BUY")}
              onAuction={() => stomp.sendMessage(Topics.send.auction(gameId), { action: "START", tilePosition: state.pendingPurchaseTile })}
              onEnd={() => sendGameAction("END_TURN")}
              onPayJail={() => sendGameAction("PAY_JAIL")}
              onJailCard={() => sendGameAction("USE_JAIL_CARD")}
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
                ? () => sendGameAction("BUILD_HOUSE", { tileIndex: openTile })
                : undefined
            }
            onSell={
              state.properties[openTile]?.ownerId === me.id && state.properties[openTile].houses > 0
                ? () => sendGameAction("SELL_HOUSE", { tileIndex: openTile })
                : undefined
            }
            onMortgage={
              state.properties[openTile]?.ownerId === me.id
                ? () => sendGameAction("TOGGLE_MORTGAGE", { tileIndex: openTile })
                : undefined
            }
          />
        )}

        {state.phase === "auction" && state.auction && (
          <AuctionPanel
            state={state}
            meId={me.id}
            onBid={(amount) => {
              stomp.sendMessage(Topics.send.auction(gameId), { action: "PLACE_BID", amount });
            }}
            onPass={() => {
              stomp.sendMessage(Topics.send.auction(gameId), { action: "PASS" });
            }}
          />
        )}

        {tradePartner && (
          <TradePanel
            state={state}
            meId={me.id}
            partnerId={tradePartner}
            onClose={() => setTradePartner(null)}
            onPropose={(offer) => {
              sendGameAction("PROPOSE_TRADE", { offer });
              // Auto-resolve locally for AI partner to keep UX snappy in offline demos
              const partner = state.players.find((p) => p.id === tradePartner);
              if (partner?.isAI && stomp.isOffline) {
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
            onClose={() => sendGameAction("RESOLVE_TRADE", { accept: false })}
            onAccept={() => sendGameAction("RESOLVE_TRADE", { accept: true })}
            onDecline={() => sendGameAction("RESOLVE_TRADE", { accept: false })}
          />
        )}

        {bankOpen && (
          <BankManager
            state={state}
            onClose={() => setBankOpen(false)}
            onAdjust={(pid, delta) => sendGameAction("BANK_ADJUST", { playerId: pid, delta })}
            onTransfer={(from, to, amt) => sendGameAction("BANK_TRANSFER", { from, to, amt })}
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
