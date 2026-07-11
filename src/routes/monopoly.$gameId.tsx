import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trophy, Banknote } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { ChatDrawer } from "../components/chat/ChatDrawer";
import { Board } from "../components/monopoly/Board";
import { ActionBar } from "../components/monopoly/ActionBar";
import { PlayerPanel } from "../components/monopoly/PlayerPanel";
import { PropertyCard } from "../components/monopoly/PropertyCard";
import { AuctionPanel } from "../components/monopoly/AuctionPanel";
import { BOARD } from "../data/monopolyBoard";
import { TradePanel } from "../components/monopoly/TradePanel";
import { EventLog } from "../components/monopoly/EventLog";
import { BankManager } from "../components/monopoly/BankManager";
import { useMonopolyStore } from "../store/monopolyStore";
import { useAuthStore } from "../store/authStore";
import { useGameSnapshot } from "../hooks/useGameSession";
import { useLeaveRoom, useRoom } from "../hooks/useRooms";
import { Topics } from "../websocket/topics";
import { useStompSubscription } from "../hooks/useStompSubscription";
import { stomp } from "../websocket/stompClient";
import { monopolyApi } from "../services/monopoly";
import { pickAvatarColor } from "../utils/ids";
import { resolveTrade } from "../utils/monopolyEngine";
import type { MonopolyState, PropertyState } from "../models/monopoly";
import { toast } from "sonner";

export const Route = createFileRoute("/monopoly/$gameId")({
  head: () => ({
    meta: [
      { title: "Monopoly — GameHub" },
      { name: "description", content: "Play Monopoly locally with friends and AI. Offline-ready." },
    ],
  }),
  component: MonopolyPage,
});

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

function mapSnapshotToState(session: any, room: any, gameId: string): MonopolyState {
  // session can be either:
  //  A) GameSession wrapper (initial REST snapshot):
  //     { id, roomId, status, state: { sessionId, phase, assets, owners?, ... } }
  //  B) MonopolyState directly (STOMP broadcast or REST action response):
  //     { sessionId, phase, currentPlayerId, lastDiceTotal, assets, ... }
  const backend = session.state ?? session;
  const resolvedSessionId = session.sessionId ?? session.id ?? gameId;
  const assets: Record<string, any> = backend.assets ?? {};
  const roomPlayers: any[] = room?.players ?? [];

  const players = roomPlayers.map((p: { id: string; userId: string; displayName?: string; username?: string; avatarColor?: string; isAI?: boolean; aiControlled?: boolean }) => {
    // Asset keys may be room player `id` OR `userId` — try both
    const asset: any = assets[p.id] ?? assets[p.userId] ?? null;
    const username = p.username ?? p.displayName ?? p.id;
    return {
      id: p.id,
      userId: p.userId,
      username,
      avatarColor: p.avatarColor ?? pickAvatarColor(username),
      isAI: p.isAI ?? p.aiControlled ?? false,
      position: asset?.position ?? 0,
      cash: asset?.cash ?? 1500,
      inJail: asset?.inJail ?? false,
      jailTurns: asset?.jailTurns ?? 0,
      jailCards: asset?.jailCards ?? asset?.getOutOfJailCards ?? 0,
      bankrupt: asset?.bankrupt ?? false,
    };
  });

  // Initialise all purchasable tiles to unowned
  const properties: Record<number, PropertyState> = {};
  BOARD.forEach((tile) => {
    if (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") {
      properties[tile.index] = { ownerId: null, houses: 0, mortgaged: false };
    }
  });

  // Build owners map: prefer backend.owners (old format), fall back to
  // reconstructing from per-player ownedTilePositions (new STOMP broadcast format)
  const owners: Record<string, string> = { ...(backend.owners ?? {}) };
  if (Object.keys(owners).length === 0) {
    // Reconstruct from ownedTilePositions per asset entry
    Object.entries(assets).forEach(([playerId, asset]: [string, any]) => {
      const positions: number[] = asset?.ownedTilePositions ?? [];
      positions.forEach((pos) => {
        owners[String(pos)] = playerId;
      });
    });
  }

  const developments: Record<string, any> = backend.developments ?? {};
  const mortgaged = new Set<number>(backend.mortgagedTiles ?? []);

  Object.keys(owners).forEach((k) => {
    const pos = Number(k);
    const ownerId = owners[k] ? String(owners[k]) : null;
    const dev = developments[pos] ?? null;
    properties[pos] = {
      ownerId,
      houses: dev ? (dev.houses ?? 0) : 0,
      mortgaged: mortgaged.has(pos),
    };
  });

  // Match currentPlayerId against both p.id and p.userId
  const curPlayerId = String(backend.currentPlayerId ?? "");
  let curPlayerIndex = players.findIndex(
    (p: MonopolyState["players"][number]) =>
      String(p.id) === curPlayerId || String(p.userId) === curPlayerId,
  );
  if (curPlayerIndex < 0) curPlayerIndex = 0;
  curPlayerIndex = Math.min(curPlayerIndex, Math.max(players.length - 1, 0));

  // lastDiceTotal → lastRoll (two dice that sum to the total, for display)
  const total: number = backend.lastDiceTotal ?? 0;
  const lastRoll: [number, number] | null =
    total > 0 ? [Math.ceil(total / 2), Math.floor(total / 2)] : null;

  return {
    gameId: String(resolvedSessionId),
    players,
    currentPlayerIndex: curPlayerIndex,
    phase: mapPhase(backend.phase),
    lastRoll,
    consecutiveDoubles: backend.consecutiveDoubles ?? 0,
    properties,
    chanceDeck: backend.board?.chanceDeck ?? [],
    chestDeck: backend.board?.chestDeck ?? [],
    pendingPurchaseTile: backend.pendingPurchaseTile ?? null,
    pendingCard: backend.pendingCard ?? null,
    auction: backend.auction ?? null,
    trade: backend.trade ?? null,
    log: (backend.log ?? []).map((t: string, i: number) => ({ id: String(i), text: t, ts: i, kind: "info" as const })),
    winnerId: backend.winnerId ?? null,
  };
}


function MonopolyPage() {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const state = useMonopolyStore((s) => s.games[gameId]);
  const setGame = useMonopolyStore((s) => s.setGame);
  const snapshot = useGameSnapshot<any>(gameId);
  const roomQuery = useRoom(snapshot.data?.roomId);
  const leaveRoomMut = useLeaveRoom();

  const roomId = snapshot.data?.roomId;
  // The URL :gameId param may differ from the session's own UUID — extract both.
  // Backend Swagger shows actions go to /api/monopoly/{sessionId}/action where
  // sessionId is the id field returned by GET /api/games/{urlGameId}.
  const sessionId: string = (snapshot.data?.id ?? snapshot.data?.sessionId ?? gameId) as string;
  const destination = gameId ? Topics.game(gameId) : null;
  // Also subscribe to the roomId-keyed topic — backend may broadcast on either
  const roomDestination = roomId ? Topics.game(roomId) : null;
  // And subscribe to the monopoly-specific session topic
  const monopolyDestination = sessionId && sessionId !== gameId ? `/topic/monopoly/${sessionId}` : null;

  // DEBUG — log which topics we are listening on
  useEffect(() => {
    console.log("[monopoly] gameId (URL):", gameId, "sessionId (backend):", sessionId, "roomId:", roomId);
    console.log("[monopoly] Subscribing to:", destination, "|", roomDestination, "|", monopolyDestination);
  }, [gameId, sessionId, roomId, destination, roomDestination, monopolyDestination]);

  // Keep roomQuery.data in a ref so handleGameUpdate never becomes stale
  // and the subscription hook doesn't re-subscribe on every room poll.
  const roomDataRef = useRef<typeof roomQuery.data>(roomQuery.data);
  useEffect(() => {
    roomDataRef.current = roomQuery.data;
  }, [roomQuery.data]);

  const handleGameUpdate = useCallback(
    (msg: any) => {
      console.log("[monopoly] 📥 STOMP message received:", JSON.stringify(msg, null, 2));
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
              startedAt: 0,
            }
            : null;
          setGame(gameId!, { ...(current ?? {}), auction });
          return;
        }
        const payload = msg.payload ?? msg;
        const sessionLike = { sessionId: gameId, state: payload };
        // Use ref so this callback is never recreated when roomQuery changes.
        const mapped = mapSnapshotToState(sessionLike, roomDataRef.current, gameId);
        console.log("[monopoly] Mapped state from update — phase:", mapped.phase, "currentPlayerIndex:", mapped.currentPlayerIndex);
        setGame(gameId!, mapped);
      } catch (e) {
        console.error("Failed to apply game update", e);
      }
    },
    // Intentionally omit roomQuery.data — we read it via ref to keep the
    // subscription stable and avoid re-subscribe gaps that drop messages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameId, setGame],
  );

  // Primary subscription on /topic/games/{gameId}
  useStompSubscription<any>(destination, handleGameUpdate, !!destination);
  // Fallback: roomId-keyed topic
  useStompSubscription<any>(roomDestination, handleGameUpdate, !!roomDestination && roomDestination !== destination);
  // Fallback: monopoly session-specific topic
  useStompSubscription<any>(monopolyDestination, handleGameUpdate, !!monopolyDestination);
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);
  const [openTile, setOpenTile] = useState<number | null>(null);
  const [tradePartner, setTradePartner] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasValidState = Boolean(state && state.players?.length > 0);
  const safePlayer = (idx: number) => state?.players?.[idx] ?? state?.players?.[0] ?? null;

  // AI driver — runs whenever it's an AI's turn or AI auction bidder
  useEffect(() => {
    if (!state || state.phase === "ended") return;
    if (aiTimer.current) clearTimeout(aiTimer.current);
    // Since backend runs AI logic when online, do nothing here.
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current);
    };
  }, [state, gameId]);

  // The logged-in user should be treated as "me" when present. If the auth user is not
  // part of this game session, fall back to the first available human player.
  const me = useMemo(() => {
    if (!state || !user) return undefined;
    return (
      state.players.find((p) => p.userId === user.id || p.username === user.username) ??
      state.players.find((p) => p.id === user.id) ??
      state.players.find((p) => !p.isAI) ??
      state.players[0]
    );
  }, [state, user]);

  // Hydrate only when we have snapshot + room info
  useEffect(() => {
    if (!snapshot.data || !roomQuery.data) return;
    try {
      const session = snapshot.data;
      const room = roomQuery.data;
      const mapped = mapSnapshotToState(session, room, gameId);
      setGame(gameId!, mapped);
      setHydrated(true);
    } catch (e) {
      console.error("Failed to hydrate Monopoly store from snapshot", e);
    }
  }, [snapshot.data, roomQuery.data, gameId, setGame]);

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
  if (!hasValidState) {
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

  const cur = state.players[state.currentPlayerIndex] ?? state.players[0];
  const isMyTurn = !cur.isAI && !cur.bankrupt && cur.id === me.id;

  // Send action to server via STOMP. Actions are validated/processed by backend.
  const sendGameAction = (type: string, payload: Record<string, unknown> = {}) => {
    if (!gameId) return false;
    const isAuctionAct = type === "PLACE_BID" || type === "PASS_BID";
    if (!isMyTurn && !isAuctionAct) {
      console.warn(
        `[game] ignoring "${type}" — it's ${cur.username}'s turn, not yours (${me.username}).`,
      );
      return false;
    }

    const actionTypeMap: Record<string, string> = {
      ROLL: "ROLL_DICE",
      BUY: "BUY_PROPERTY",
      END_TURN: "END_TURN",
      PAY_JAIL: "PAY_JAIL",
      USE_JAIL_CARD: "USE_JAIL_CARD",
      BUILD_HOUSE: "BUILD_HOUSE",
      SELL_HOUSE: "SELL_HOUSE",
      TOGGLE_MORTGAGE: "MORTGAGE",
      PROPOSE_TRADE: "TRADE",
      RESOLVE_TRADE: "TRADE",
      START_AUCTION: "AUCTION",
      PLACE_BID: "AUCTION",
      PASS_BID: "AUCTION",
    };
    const isAuctionAction = type === "START_AUCTION" || type === "PLACE_BID" || type === "PASS_BID";
    // Use monopoly-specific STOMP destinations with the true session ID.
    // The URL :gameId param is the room/game lookup key; sessionId is the
    // backend session UUID used by /api/monopoly/{sessionId}/action.
    const dest = isAuctionAction
      ? Topics.send.monopolyAuction(sessionId)
      : Topics.send.monopolyAction(sessionId);
    console.debug("[game] sending to dest:", dest, "sessionId:", sessionId);

    // Build server-friendly MonopolyActionRequest shape
    const p = payload as Record<string, any>;
    const requestBody: Record<string, unknown> = {
      type: actionTypeMap[type] ?? type,
    };
    if (p.tileIndex != null) requestBody.tilePosition = p.tileIndex;
    if (p.amount != null) requestBody.amount = p.amount;
    if (p.targetPlayerId != null) requestBody.targetPlayerId = p.targetPlayerId;
    if (p.metadata != null) requestBody.metadata = p.metadata;
    // Auction-specific hints
    if (type === "START_AUCTION") requestBody.auctionAction = "START";
    if (type === "PLACE_BID") requestBody.auctionAction = "BID";
    if (type === "PASS_BID") requestBody.auctionAction = "PASS";

    const sent = stomp.sendMessage(dest, requestBody);
    if (sent) {
      console.debug("[game] sent action over STOMP", type, dest, requestBody);
      return true;
    }

    console.warn("[game] STOMP unavailable, falling back to REST action", type, dest, requestBody);
    // REST fallback — use sessionId (backend UUID) not gameId (URL param)
    try {
      monopolyApi.action(sessionId, requestBody)
        .then(() => {
          console.debug("[game] REST action succeeded", type);
        })
        .catch((error) => {
          console.error("[game] REST action failed", type, error);
          toast.error("Action failed", {
            description: "Connection to the game server is currently unavailable."
          });
        });
      return true;
    } catch (e) {
      console.error("[game] REST action exception", type, e);
    }

    toast.error("Action failed", {
      description: "Connection to the game server is currently unavailable."
    });
    return false;
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
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => {
                if (roomId) {
                  leaveRoomMut.mutate(roomId, {
                    onSettled: () => navigate({ to: "/" }),
                  });
                } else {
                  navigate({ to: "/" });
                }
              }}
            >
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
              onBuy={() =>
                sendGameAction("BUY", { tileIndex: state.pendingPurchaseTile ?? undefined })
              }
              onAuction={() =>
                sendGameAction("START_AUCTION", {
                  tileIndex: state.pendingPurchaseTile ?? undefined,
                })
              }
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
            onBid={(amount) => sendGameAction("PLACE_BID", { amount })}
            onPass={() => sendGameAction("PASS_BID")}
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

      {roomId && <ChatDrawer roomId={roomId} />}
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
