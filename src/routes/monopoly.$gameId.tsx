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
import type {
  MonopolyActionRequest,
  MonopolyActionType,
  MonopolyAuctionMessage,
  MonopolyState,
  PropertyState,
} from "../models/monopoly";
import { toast } from "sonner";
import { useWebsocketRequestStore } from "../store/requestStore";

type RoomPlayerSnapshot = {
  id: string;
  userId: string;
  displayName?: string;
  username?: string;
  avatarColor?: string;
  isAI?: boolean;
  aiControlled?: boolean;
};

type RoomSnapshotData = {
  roomId?: string;
  players?: RoomPlayerSnapshot[];
};

type MonopolyAssetSnapshot = {
  cash?: number;
  position?: number;
  inJail?: boolean;
  jailTurns?: number;
  jailCards?: number;
  getOutOfJailCards?: number;
  bankrupt?: boolean;
  ownedTilePositions?: number[];
};

type MonopolyAuctionBidSnapshot = {
  playerId?: string;
  bidderId?: string;
  amount?: number;
};

type MonopolyAuctionSnapshot = {
  tilePosition?: number;
  tileIndex?: number;
  bids?: MonopolyAuctionBidSnapshot[];
  currentBidderIndex?: number;
  activePlayerIds?: string[];
  highestBid?: number;
  highestBidder?: string;
  highestBidderId?: string;
  startedAt?: number;
};

type MonopolyBackendState = {
  sessionId?: string;
  phase?: string;
  currentPlayerId?: string;
  lastDiceTotal?: number;
  consecutiveDoubles?: number;
  assets?: Record<string, MonopolyAssetSnapshot>;
  owners?: Record<string, string>;
  developments?: Record<string, { houses?: number }>;
  mortgagedTiles?: number[];
  board?: {
    chanceDeck?: number[];
    chestDeck?: number[];
  };
  pendingPurchaseTile?: number | null;
  pendingCard?: MonopolyState["pendingCard"];
  auction?: MonopolyAuctionSnapshot | null;
  trade?: MonopolyState["trade"];
  log?: string[];
  winnerId?: string | null;
};

type MonopolySessionSnapshot = {
  id?: string;
  sessionId?: string;
  roomId?: string;
  state?: MonopolyBackendState;
} & MonopolyBackendState;

type MonopolySocketEnvelope = {
  type?: string;
  sessionId?: string;
  payload?: unknown;
  state?: MonopolyBackendState;
};

type MonopolyActionPayload = {
  tileIndex?: number | string | null;
  amount?: number | string | null;
  targetPlayerId?: string | null;
  metadata?: Record<string, unknown>;
  offer?: {
    toId: string;
    fromProps?: number[];
    toProps?: number[];
    fromCash?: number;
    toCash?: number;
  };
};

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

function resolveRoomPlayerId(
  rawPlayerId: string | null | undefined,
  roomPlayers: Array<{ id?: string; userId?: string }>,
) {
  if (!rawPlayerId) return null;
  const match = roomPlayers.find(
    (player) =>
      String(player.id ?? "") === String(rawPlayerId) ||
      String(player.userId ?? "") === String(rawPlayerId),
  );
  return match?.id ? String(match.id) : String(rawPlayerId);
}

function normalizeMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, String(value)]));
}

function normalizeAuctionState(
  auction: MonopolyAuctionSnapshot | null | undefined,
  roomPlayers: Array<{ id?: string; userId?: string }>,
) {
  if (!auction) return null;
  return {
    tileIndex: auction.tilePosition ?? auction.tileIndex ?? 0,
    bids: Array.isArray(auction.bids)
      ? auction.bids.map((bid) => ({
          playerId:
            resolveRoomPlayerId(String(bid.playerId ?? bid.bidderId ?? ""), roomPlayers) ??
            String(bid.playerId ?? bid.bidderId ?? ""),
          amount: Number(bid.amount ?? 0),
        }))
      : [],
    currentBidderIndex: auction.currentBidderIndex ?? 0,
    activePlayerIds: Array.isArray(auction.activePlayerIds)
      ? auction.activePlayerIds.map(
          (playerId: string) =>
            resolveRoomPlayerId(String(playerId), roomPlayers) ?? String(playerId),
        )
      : [],
    highestBid: auction.highestBid ?? 0,
    highestBidderId:
      auction.highestBidder != null
        ? (resolveRoomPlayerId(String(auction.highestBidder), roomPlayers) ??
          String(auction.highestBidder))
        : auction.highestBidderId != null
          ? (resolveRoomPlayerId(String(auction.highestBidderId), roomPlayers) ??
            String(auction.highestBidderId))
          : null,
    startedAt: auction.startedAt ?? 0,
  };
}

function buildMonopolyActionRequest(
  type: string,
  payload: MonopolyActionPayload,
  state: MonopolyState,
): MonopolyActionRequest | null {
  const p = payload;
  let actionType: MonopolyActionType | null = null;

  switch (type) {
    case "ROLL":
      actionType = "ROLL_DICE";
      break;
    case "BUY":
      actionType = "BUY_PROPERTY";
      break;
    case "END_TURN":
      actionType = "END_TURN";
      break;
    case "PAY_JAIL":
      actionType = "PAY_JAIL";
      break;
    case "USE_JAIL_CARD":
      actionType = "USE_JAIL_CARD";
      break;
    case "BUILD_HOUSE":
      actionType = "BUILD_HOUSE";
      break;
    case "SELL_HOUSE":
      actionType = "SELL_HOUSE";
      break;
    case "TOGGLE_MORTGAGE": {
      const tileIndex = Number(p.tileIndex);
      const property = Number.isFinite(tileIndex) ? state.properties[tileIndex] : undefined;
      actionType = property?.mortgaged ? "UNMORTGAGE" : "MORTGAGE";
      break;
    }
    case "PROPOSE_TRADE":
      actionType = "TRADE";
      break;
    default:
      return null;
  }

  const requestBody: MonopolyActionRequest = { type: actionType };

  if (p.tileIndex != null) requestBody.tilePosition = Number(p.tileIndex);
  if (p.amount != null) requestBody.amount = Number(p.amount);
  if (p.targetPlayerId != null) requestBody.targetPlayerId = String(p.targetPlayerId);
  if (p.metadata && typeof p.metadata === "object") {
    requestBody.metadata = normalizeMetadata(p.metadata as Record<string, unknown>);
  }

  if (type === "PROPOSE_TRADE" && p.offer) {
    const offer = p.offer as {
      toId: string;
      fromProps: number[];
      toProps: number[];
      fromCash: number;
      toCash: number;
    };

    requestBody.targetPlayerId = String(offer.toId);

    const metadata: Record<string, string> = {};
    if (offer.fromProps?.[0] != null) metadata.offeredTile = String(offer.fromProps[0]);
    if (offer.toProps?.[0] != null) metadata.requestedTile = String(offer.toProps[0]);
    if (Object.keys(metadata).length > 0) requestBody.metadata = metadata;

    const cashDelta = Number(offer.fromCash ?? 0) - Number(offer.toCash ?? 0);
    if (cashDelta !== 0) requestBody.amount = cashDelta;
  }

  return requestBody;
}

function extractSocketState(message: unknown) {
  if (!message || typeof message !== "object") return null;
  const envelope = message as MonopolySocketEnvelope;
  const payload = envelope.payload;
  if (payload && typeof payload === "object" && "state" in payload) {
    return (payload as { state?: MonopolyBackendState }).state ?? null;
  }
  if (payload && typeof payload === "object") {
    return payload as MonopolyBackendState;
  }
  if (envelope.state) return envelope.state;
  return message as MonopolyBackendState;
}

function mapSnapshotToState(
  session: MonopolySessionSnapshot,
  room: RoomSnapshotData | null | undefined,
  gameId: string,
): MonopolyState {
  // session can be either:
  //  A) GameSession wrapper (initial REST snapshot):
  //     { id, roomId, status, state: { sessionId, phase, assets, owners?, ... } }
  //  B) MonopolyState directly (STOMP broadcast or REST action response):
  //     { sessionId, phase, currentPlayerId, lastDiceTotal, assets, ... }
  const backend = session.state ?? session;
  const resolvedSessionId = session.sessionId ?? session.id ?? gameId;
  const assets: Record<string, MonopolyAssetSnapshot> = backend.assets ?? {};
  const roomPlayers: RoomPlayerSnapshot[] = room?.players ?? [];

  const players = roomPlayers.map((p) => {
    // Asset keys may be room player `id` OR `userId` — try both
    const asset: MonopolyAssetSnapshot | null = assets[p.id] ?? assets[p.userId] ?? null;
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
  const owners: Record<string, string> = {};
  Object.entries(backend.owners ?? {}).forEach(([pos, ownerId]) => {
    const resolvedOwnerId = resolveRoomPlayerId(
      ownerId != null ? String(ownerId) : null,
      roomPlayers,
    );
    if (resolvedOwnerId) owners[pos] = resolvedOwnerId;
  });
  if (Object.keys(owners).length === 0) {
    // Reconstruct from ownedTilePositions per asset entry
    Object.entries(assets).forEach(([playerId, asset]) => {
      const positions: number[] = asset?.ownedTilePositions ?? [];
      positions.forEach((pos) => {
        owners[String(pos)] =
          resolveRoomPlayerId(String(playerId), roomPlayers) ?? String(playerId);
      });
    });
  }

  const developments: Record<string, { houses?: number }> = backend.developments ?? {};
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
  const rawCurrentPlayerId = String(backend.currentPlayerId ?? "");
  const curPlayerId = resolveRoomPlayerId(rawCurrentPlayerId, roomPlayers) ?? rawCurrentPlayerId;
  let curPlayerIndex = players.findIndex(
    (p: MonopolyState["players"][number]) =>
      String(p.id) === curPlayerId ||
      String(p.id) === rawCurrentPlayerId ||
      String(p.userId) === rawCurrentPlayerId,
  );
  if (curPlayerIndex < 0) curPlayerIndex = 0;
  curPlayerIndex = Math.min(curPlayerIndex, Math.max(players.length - 1, 0));

  const mappedPhase = mapPhase(backend.phase);
  let pendingPurchaseTile: number | null = backend.pendingPurchaseTile ?? null;
  if (pendingPurchaseTile == null && mappedPhase === "landed") {
    const currentPosition = players[curPlayerIndex]?.position;
    const tile = typeof currentPosition === "number" ? BOARD[currentPosition] : null;
    const property = typeof currentPosition === "number" ? properties[currentPosition] : null;
    if (
      tile &&
      property &&
      (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") &&
      !property.ownerId
    ) {
      pendingPurchaseTile = currentPosition;
    }
  }

  // lastDiceTotal → lastRoll (two dice that sum to the total, for display)
  const total: number = backend.lastDiceTotal ?? 0;
  const d1 = total > 0 ? Math.ceil(total / 2) : 1;
  const d2 = total > 0 ? Math.floor(total / 2) : 1;
  const lastRoll: import("../models/monopoly").DiceRoll | null =
    total > 0 ? { d1, d2, isDouble: d1 === d2, rolledAt: Date.now() } : null;

  return {
    gameId: String(resolvedSessionId),
    players,
    currentPlayerIndex: curPlayerIndex,
    phase: mappedPhase,
    lastRoll,
    consecutiveDoubles: backend.consecutiveDoubles ?? 0,
    properties,
    chanceDeck: backend.board?.chanceDeck ?? [],
    chestDeck: backend.board?.chestDeck ?? [],
    pendingPurchaseTile,
    pendingCard: backend.pendingCard ?? null,
    auction: normalizeAuctionState(backend.auction, roomPlayers),
    trade: backend.trade ?? null,
    log: (backend.log ?? []).map((t: string, i: number) => ({
      id: String(i),
      text: t,
      ts: i,
      kind: "info" as const,
    })),
    winnerId:
      resolveRoomPlayerId(
        backend.winnerId != null ? String(backend.winnerId) : null,
        roomPlayers,
      ) ??
      backend.winnerId ??
      null,
  };
}

function MonopolyPage() {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const state = useMonopolyStore((s) => s.games[gameId]);
  const setGame = useMonopolyStore((s) => s.setGame);
  const snapshot = useGameSnapshot<MonopolySessionSnapshot>(gameId);
  const roomQuery = useRoom(snapshot.data?.roomId);
  const leaveRoomMut = useLeaveRoom();

  const roomId = snapshot.data?.roomId;
  const sessionId: string = (snapshot.data?.id ?? snapshot.data?.sessionId ?? gameId) as string;

  // Backend broadcasts Monopoly state on /topic/game/{roomId} (singular)
  const primaryDestination = roomId ? Topics.gameRoom(roomId) : null;

  // DEBUG — log which topic we are listening on
  useEffect(() => {
    console.log("[monopoly] sessionId:", sessionId, "roomId:", roomId);
    console.log("[monopoly] room topic:", primaryDestination);
  }, [sessionId, roomId, primaryDestination]);

  // Keep roomQuery.data in a ref so handleGameUpdate never becomes stale
  // and the subscription hook doesn't re-subscribe on every room poll.
  const roomDataRef = useRef<typeof roomQuery.data>(roomQuery.data);
  useEffect(() => {
    roomDataRef.current = roomQuery.data;
  }, [roomQuery.data]);

  const applyMonopolyState = useCallback(
    (nextState: MonopolyBackendState, nextSessionId?: string) => {
      const mapped = mapSnapshotToState(
        { sessionId: nextSessionId ?? nextState?.sessionId ?? sessionId, state: nextState },
        roomDataRef.current,
        gameId,
      );
      setGame(gameId!, mapped);
      return mapped;
    },
    [gameId, sessionId, setGame],
  );

  const handleGameUpdate = useCallback(
    (msg: unknown) => {
      console.log("[monopoly] 📥 STOMP message received:", JSON.stringify(msg, null, 2));
      if (!msg) return;
      try {
        const envelope = typeof msg === "object" ? (msg as MonopolySocketEnvelope) : null;
        if (envelope?.type === "AUCTION_UPDATE") {
          const current = useMonopolyStore.getState().games[gameId];
          const auction = normalizeAuctionState(
            (envelope.payload as MonopolyAuctionSnapshot | null | undefined) ?? null,
            roomDataRef.current?.players ?? [],
          );
          if (current) {
            setGame(gameId!, {
              ...current,
              auction,
              phase: auction ? "auction" : current.phase,
              pendingPurchaseTile: auction?.tileIndex ?? current.pendingPurchaseTile,
            });
          }
          return;
        }
        const rawState = extractSocketState(msg);
        if (!rawState) return;
        const mapped = applyMonopolyState(
          rawState,
          envelope?.sessionId ?? rawState.sessionId ?? sessionId,
        );
        console.log(
          "[monopoly] ✅ Mapped — phase:",
          mapped.phase,
          "currentPlayerIndex:",
          mapped.currentPlayerIndex,
        );
      } catch (e) {
        console.error("Failed to apply game update", e);
      }
    },
    [applyMonopolyState, gameId, sessionId, setGame],
  );

  // Canonical backend broadcast topic for Monopoly state updates
  useStompSubscription<unknown>(primaryDestination, handleGameUpdate, !!primaryDestination);
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);
  const [openTile, setOpenTile] = useState<number | null>(null);
  const [tradePartner, setTradePartner] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasValidState = Boolean(state && state.players?.length > 0);

  // AI driver — runs whenever it's an AI's turn or AI auction bidder
  useEffect(() => {
    if (!state || state.phase === "ended") return;
    const timer = aiTimer.current;
    if (timer) clearTimeout(timer);
    // Since backend runs AI logic when online, do nothing here.
    return () => {
      if (timer) clearTimeout(timer);
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
  if (
    snapshot.isLoading ||
    roomQuery.isLoading ||
    !snapshot.data ||
    !roomQuery.data ||
    !user ||
    !hydrated
  ) {
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

  // Normal Monopoly actions are REST-authoritative; auctions remain STOMP-only.
  const sendGameAction = async (type: string, payload: Record<string, unknown> = {}) => {
    if (!sessionId) return false;
    const isAuctionAct = type === "PLACE_BID" || type === "PASS_BID";
    if (!isMyTurn && !isAuctionAct) {
      console.warn(
        `[game] ignoring "${type}" — it's ${cur.username}'s turn, not yours (${me.username}).`,
      );
      return false;
    }

    const p = payload as MonopolyActionPayload;
    const isAuctionAction = type === "START_AUCTION" || type === "PLACE_BID" || type === "PASS_BID";
    if (isAuctionAction) {
      const startTileIndex = p.tileIndex ?? state.pendingPurchaseTile;
      const auctionBody: MonopolyAuctionMessage =
        type === "START_AUCTION"
          ? {
              action: "START",
              ...(startTileIndex != null ? { tilePosition: Number(startTileIndex) } : {}),
            }
          : type === "PLACE_BID"
            ? { action: "PLACE_BID", amount: Number(p.amount ?? 0) }
            : { action: "PASS" };

      const dest = Topics.send.auction(sessionId);
      const { sent, requestId } = stomp.sendTrackedMessage(dest, auctionBody, type, { sessionId });
      if (sent) {
        console.debug("[game] sent auction action over STOMP", type, dest, auctionBody);
        return true;
      }
      useWebsocketRequestStore.getState().failRequest(String(requestId), "CONNECTION_ERROR", "Unable to contact server");

      toast.error("Auction action failed", {
        description: "Realtime connection is unavailable. Reconnect before retrying the auction.",
      });
      return false;
    }

    const requestBody = buildMonopolyActionRequest(type, payload, state);
    if (!requestBody) {
      const description =
        type === "RESOLVE_TRADE"
          ? "Trade responses are not part of the current backend Monopoly contract."
          : type === "BANK_ADJUST" || type === "BANK_TRANSFER"
            ? "Bank manager actions are not supported by the live backend Monopoly API."
            : `Unsupported Monopoly action: ${type}`;
      toast.error("Action unavailable", { description });
      return false;
    }

    const requestId = crypto.randomUUID();
    const requestStore = useWebsocketRequestStore.getState();
    requestStore.createRequest(requestBody.type, requestId, { sessionId, type });

    const dest = Topics.send.gameAction(sessionId);
    const sent = stomp.sendMessage(dest, { requestId, ...requestBody }, requestId);
    if (!sent) {
      requestStore.failRequest(requestId, "CONNECTION_ERROR", "Unable to contact server");
      toast.error("Action failed", {
        description: "Realtime connection is unavailable. Reconnect before retrying the action.",
      });
      return false;
    }

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
