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
import { IndianEventBanner } from "../components/monopoly/IndianEventBanner";
import {
  CardRevealModal,
  parseCardLogLine,
  type CardReveal,
} from "../components/monopoly/CardRevealModal";
import { useMonopolyStore } from "../store/monopolyStore";
import { useAuthStore } from "../store/authStore";
import { useGameSnapshot } from "../hooks/useGameSession";
import { useLeaveRoom, useReconnectRoom, useRoom } from "../hooks/useRooms";
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
import { useConnectionStore } from "../store/connectionStore";
import { useQueryClient } from "@tanstack/react-query";

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
  developments?: Record<string, { houses?: number; hotel?: boolean }>;
  mortgagedTiles?: number[];
  board?: {
    chanceDeck?: number[];
    chestDeck?: number[];
  };
  pendingPurchaseTile?: number | null;
  declinedPurchaseTile?: number | null;
  pendingCard?: MonopolyState["pendingCard"];
  auction?: MonopolyAuctionSnapshot | null;
  trade?: MonopolyState["trade"];
  log?: string[];
  winnerId?: string | null;
  activeEvent?: {
    id?: string;
    title?: string;
    description?: string;
    expiresOnTurn?: number;
  } | null;
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
  playerId?: string | null;
  delta?: number | string | null;
  from?: string | null;
  to?: string | null;
  amt?: number | string | null;
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
      { title: "Monopoly: India Edition — GameHub" },
      {
        name: "description",
        content: "Play Monopoly: India Edition with friends and AI. Indian cities, ₹ currency, offline-ready.",
      },
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
      return "rolling";
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
    case "BANK_ADJUST":
      actionType = "BANK_ADJUST";
      break;
    case "BANK_TRANSFER":
      actionType = "BANK_TRANSFER";
      break;
    default:
      return null;
  }

  const requestBody: MonopolyActionRequest = { type: actionType };

  if (p.tileIndex != null) requestBody.tilePosition = Number(p.tileIndex);
  if (p.amount != null) requestBody.amount = Number(p.amount);
  if (p.targetPlayerId != null) requestBody.targetPlayerId = String(p.targetPlayerId);
  if (p.playerId != null && type === "BANK_ADJUST") {
    requestBody.targetPlayerId = String(p.playerId);
    if (p.delta != null) requestBody.amount = Number(p.delta);
  }
  if (type === "BANK_TRANSFER") {
    requestBody.targetPlayerId = String(p.to);
    requestBody.amount = Number(p.amt ?? p.amount ?? 0);
    requestBody.metadata = { fromPlayerId: String(p.from) };
  }
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
  previous?: MonopolyState | null,
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
      cash: asset?.cash ?? 15000,
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

  const developments: Record<string, { houses?: number; hotel?: boolean }> =
    backend.developments ?? {};
  const mortgaged = new Set<number>(backend.mortgagedTiles ?? []);

  Object.keys(owners).forEach((k) => {
    const pos = Number(k);
    const ownerId = owners[k] ? String(owners[k]) : null;
    const dev = developments[pos] ?? developments[String(pos)] ?? null;
    const houses = dev?.hotel ? 5 : (dev?.houses ?? 0);
    properties[pos] = {
      ownerId,
      houses,
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
  const declinedPurchaseTile =
    mappedPhase === "rolling"
      ? null
      : backend.declinedPurchaseTile != null
        ? Number(backend.declinedPurchaseTile)
        : (previous?.declinedPurchaseTile ?? null);
  let pendingPurchaseTile: number | null = backend.pendingPurchaseTile ?? null;
  if (pendingPurchaseTile == null && mappedPhase === "landed") {
    const currentPosition = players[curPlayerIndex]?.position;
    const tile = typeof currentPosition === "number" ? BOARD[currentPosition] : null;
    const property = typeof currentPosition === "number" ? properties[currentPosition] : null;
    const purchaseClosed =
      declinedPurchaseTile != null && declinedPurchaseTile === currentPosition;
    if (
      tile &&
      property &&
      (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") &&
      !property.ownerId &&
      !purchaseClosed
    ) {
      pendingPurchaseTile = currentPosition;
    }
  }

  // lastDiceTotal → lastRoll. Only bump rolledAt when the total changes so
  // turn switches / remaps do not replay the roll animation.
  const total: number = backend.lastDiceTotal ?? 0;
  const d1 = total > 0 ? Math.ceil(total / 2) : 1;
  const d2 = total > 0 ? Math.floor(total / 2) : 1;
  const prevTotal = previous?.lastRoll
    ? previous.lastRoll.d1 + previous.lastRoll.d2
    : null;
  const lastRoll: import("../models/monopoly").DiceRoll | null =
    total > 0
      ? {
          d1,
          d2,
          isDouble: d1 === d2,
          rolledAt:
            previous?.lastRoll && prevTotal === total
              ? previous.lastRoll.rolledAt
              : Date.now(),
        }
      : null;

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
    declinedPurchaseTile,
    pendingCard: backend.pendingCard ?? null,
    auction: normalizeAuctionState(backend.auction, roomPlayers),
    trade: backend.trade ?? null,
    log: (backend.log ?? []).map((t: string, i: number) => {
      let text = String(t);
      for (const p of players) {
        if (p.id) text = text.split(p.id).join(p.username);
        if (p.userId) text = text.split(String(p.userId)).join(p.username);
      }
      const lower = text.toLowerCase();
      const kind =
        lower.includes("rent") ||
        lower.includes("bank") ||
        lower.includes("tax") ||
        lower.includes("₹") ||
        lower.includes("paid") ||
        lower.includes("purchased") ||
        lower.includes("mortgage")
          ? ("money" as const)
          : lower.includes("card") || lower.includes("event") || lower.includes("chance")
            ? ("event" as const)
            : lower.includes("trade")
              ? ("trade" as const)
              : ("info" as const);
      return { id: String(i), text, ts: i, kind };
    }),
    winnerId:
      resolveRoomPlayerId(
        backend.winnerId != null ? String(backend.winnerId) : null,
        roomPlayers,
      ) ??
      backend.winnerId ??
      null,
    activeEvent: backend.activeEvent?.id
      ? {
          id: String(backend.activeEvent.id),
          title: backend.activeEvent.title ?? String(backend.activeEvent.id),
          description: backend.activeEvent.description ?? "",
          expiresOnTurn: backend.activeEvent.expiresOnTurn ?? 0,
        }
      : null,
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
  const reconnectMut = useReconnectRoom();
  const queryClient = useQueryClient();
  const wsConnected = useConnectionStore((s) => s.connected);

  const roomId = snapshot.data?.roomId;
  const sessionId: string = (snapshot.data?.id ?? snapshot.data?.sessionId ?? gameId) as string;

  useEffect(() => {
    if (!roomId || !sessionId) return;
    localStorage.setItem(
      "gamehub:resume-session",
      JSON.stringify({ roomId, sessionId, gameType: "monopoly" }),
    );
  }, [roomId, sessionId]);

  // Mark seat connected + refresh authoritative snapshot on enter and after STOMP recovery
  const prevWsConnected = useRef(wsConnected);
  const didMountReconnect = useRef(false);
  useEffect(() => {
    if (!roomId) return;
    const becameConnected = wsConnected && !prevWsConnected.current;
    prevWsConnected.current = wsConnected;
    const mountReconnect = wsConnected && !didMountReconnect.current;
    if (mountReconnect) didMountReconnect.current = true;
    if (!becameConnected && !mountReconnect) return;

    let cancelled = false;
    (async () => {
      try {
        await reconnectMut.mutateAsync(roomId);
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: ["game", gameId] });
        await snapshot.refetch();
      } catch (e) {
        console.warn("[monopoly] room reconnect failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, wsConnected, gameId, queryClient]);

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
      const previous = useMonopolyStore.getState().games[gameId] ?? null;
      const mapped = mapSnapshotToState(
        { sessionId: nextSessionId ?? nextState?.sessionId ?? sessionId, state: nextState },
        roomDataRef.current,
        gameId,
        previous,
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
            roomDataRef.current?.players ?? current?.players ?? [],
          );
          if (current) {
            const clearedTile =
              !auction && current.phase === "auction"
                ? (current.auction?.tileIndex ?? current.pendingPurchaseTile)
                : null;
            setGame(gameId!, {
              ...current,
              auction,
              phase: auction ? "auction" : current.phase === "auction" ? "landed" : current.phase,
              // Auction finished (incl. unsold) — never reopen Buy/Auction for that tile.
              pendingPurchaseTile: auction
                ? (auction.tileIndex ?? current.pendingPurchaseTile)
                : null,
              declinedPurchaseTile:
                clearedTile != null
                  ? clearedTile
                  : current.declinedPurchaseTile,
            });
          } else if (auction) {
            // Seed a minimal game shell if auction arrives before hydrate finishes
            applyMonopolyState(
              {
                sessionId,
                phase: "WAITING_FOR_AUCTION",
                auction: envelope.payload as MonopolyAuctionSnapshot,
              } as MonopolyBackendState,
              sessionId,
            );
          }
          return;
        }
        const prevAuction = useMonopolyStore.getState().games[gameId]?.auction ?? null;
        const rawState = extractSocketState(msg);
        if (!rawState) return;
        const mapped = applyMonopolyState(
          rawState,
          envelope?.sessionId ?? rawState.sessionId ?? sessionId,
        );
        // Monopoly REST/STOMP state payloads omit live auctions (in-memory only).
        // Keep the in-progress auction unless this message settled it (type AUCTION).
        if (
          envelope?.type !== "AUCTION" &&
          !mapped.auction &&
          prevAuction &&
          mapped.phase !== "ended"
        ) {
          setGame(gameId!, {
            ...mapped,
            auction: prevAuction,
            phase: "auction",
          });
        }
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
  const [focusPlayerId, setFocusPlayerId] = useState<string | null>(null);
  const [tradePartner, setTradePartner] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [cardReveal, setCardReveal] = useState<CardReveal | null>(null);
  const seenCardLogRef = useRef<string | null>(null);
  const autoEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const auctionStartingRef = useRef(false);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasValidState = Boolean(state && state.players?.length > 0);

  // The logged-in user should be treated as "me" when present.
  const me = useMemo(() => {
    if (!state || !user) return undefined;
    return (
      state.players.find((p) => p.userId === user.id || p.username === user.username) ??
      state.players.find((p) => p.id === user.id) ??
      state.players.find((p) => !p.isAI) ??
      state.players[0]
    );
  }, [state, user]);

  const isMyTurnPreview = Boolean(
    me &&
      state &&
      !state.players[state.currentPlayerIndex]?.isAI &&
      !state.players[state.currentPlayerIndex]?.bankrupt &&
      state.players[state.currentPlayerIndex]?.id === me.id,
  );

  // Detect Chance / Chest from game log
  useEffect(() => {
    if (!state?.log?.length) return;
    const last = state.log[state.log.length - 1];
    if (!last || last.text === seenCardLogRef.current) return;
    const parsed = parseCardLogLine(last.text);
    if (parsed) {
      seenCardLogRef.current = last.text;
      setCardReveal(parsed);
    }
  }, [state?.log]);

  // Auto-continue after passive landings ONLY — never while buy/auction is available.
  useEffect(() => {
    if (autoEndTimer.current) {
      clearTimeout(autoEndTimer.current);
      autoEndTimer.current = null;
    }
    if (!state || !me || !isMyTurnPreview || !sessionId) return;
    if (state.phase === "auction" || state.auction || auctionStartingRef.current) return;
    if (state.phase !== "landed") return;
    if (state.pendingPurchaseTile != null) return;

    // Safety: unowned buyable tile under current player = Buy/Auction decision, not auto-end.
    // Skip once auction/buy offer was already closed for this tile.
    const curPlayer = state.players[state.currentPlayerIndex];
    const pos = curPlayer?.position;
    if (typeof pos === "number") {
      const tile = BOARD[pos];
      const prop = state.properties[pos];
      const offerClosed = state.declinedPurchaseTile === pos;
      const buyable =
        !offerClosed &&
        tile &&
        (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") &&
        prop &&
        !prop.ownerId;
      if (buyable) return;
    }

    if (cardReveal || openTile != null || bankOpen || tradePartner) return;

    autoEndTimer.current = setTimeout(async () => {
      // Re-check live store — auction may have started during the delay.
      const live = useMonopolyStore.getState().games[gameId];
      if (
        !live ||
        live.phase === "auction" ||
        live.auction ||
        auctionStartingRef.current ||
        live.pendingPurchaseTile != null
      ) {
        return;
      }
      try {
        const nextState = await monopolyApi.action<MonopolyBackendState>(sessionId, {
          type: "END_TURN",
        });
        applyMonopolyState(nextState, sessionId);
        toast.message("Turn passed");
      } catch (e) {
        console.error("[monopoly] auto continue failed", e);
      }
    }, 1200);

    return () => {
      if (autoEndTimer.current) clearTimeout(autoEndTimer.current);
    };
  }, [
    state,
    me,
    isMyTurnPreview,
    sessionId,
    cardReveal,
    openTile,
    bankOpen,
    tradePartner,
    applyMonopolyState,
    gameId,
  ]);

  // Clear "auction starting" latch once live auction state arrives (or timed out).
  useEffect(() => {
    if (state?.auction || state?.phase === "auction") {
      auctionStartingRef.current = false;
    }
  }, [state?.auction, state?.phase]);

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

  // Hydrate only when we have snapshot + room info
  useEffect(() => {
    if (!snapshot.data || !roomQuery.data) return;
    try {
      const session = snapshot.data;
      const room = roomQuery.data;
      const mapped = mapSnapshotToState(session, room, gameId, useMonopolyStore.getState().games[gameId] ?? null);
      const prevAuction = useMonopolyStore.getState().games[gameId]?.auction ?? null;
      // Live auctions are STOMP-only / in-memory — don't wipe them on REST rehydrate.
      if (!mapped.auction && prevAuction) {
        mapped.auction = prevAuction;
        mapped.phase = "auction";
      }
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
  const isRoomHost = Boolean(user?.id && roomQuery.data?.hostId === user.id);

  // Normal Monopoly actions are REST-authoritative; auctions remain STOMP-only.
  const sendGameAction = async (type: string, payload: Record<string, unknown> = {}) => {
    if (!sessionId) return false;
    const isAuctionAct = type === "PLACE_BID" || type === "PASS_BID";
    const isBankAct = type === "BANK_ADJUST" || type === "BANK_TRANSFER";
    if (!isMyTurn && !isAuctionAct && !isBankAct) {
      console.warn(
        `[game] ignoring "${type}" — it's ${cur.username}'s turn, not yours (${me.username}).`,
      );
      return false;
    }
    if (isBankAct && !isRoomHost) {
      toast.error("Bank Manager locked", {
        description: "Only the room host can adjust or transfer cash.",
      });
      return false;
    }

    const p = payload as MonopolyActionPayload;
    const isAuctionAction = type === "START_AUCTION" || type === "PLACE_BID" || type === "PASS_BID";
    if (isAuctionAction) {
      const startTileIndex = p.tileIndex ?? state.pendingPurchaseTile;
      if (type === "START_AUCTION" && startTileIndex == null) {
        toast.error("Auction unavailable", { description: "No property selected to auction." });
        return false;
      }
      const auctionBody: MonopolyAuctionMessage =
        type === "START_AUCTION"
          ? {
              action: "START",
              tilePosition: Number(startTileIndex),
            }
          : type === "PLACE_BID"
            ? { action: "PLACE_BID", amount: Number(p.amount ?? 0) }
            : { action: "PASS" };

      const dest = Topics.send.auction(sessionId);
      if (type === "START_AUCTION") {
        // Block auto END_TURN until AUCTION_UPDATE arrives (STOMP can lag past 1.2s).
        auctionStartingRef.current = true;
        if (autoEndTimer.current) {
          clearTimeout(autoEndTimer.current);
          autoEndTimer.current = null;
        }
        window.setTimeout(() => {
          if (!useMonopolyStore.getState().games[gameId]?.auction) {
            auctionStartingRef.current = false;
          }
        }, 15_000);
      }
      const { sent, requestId } = stomp.sendTrackedMessage(dest, auctionBody, type, { sessionId });
      if (sent) {
        console.debug("[game] sent auction action over STOMP", type, dest, auctionBody);
        return true;
      }
      auctionStartingRef.current = false;
      useWebsocketRequestStore
        .getState()
        .failRequest(String(requestId), "CONNECTION_ERROR", "Unable to contact server");

      toast.error("Auction action failed", {
        description: "Realtime connection is unavailable. Reconnect before retrying the auction.",
      });
      return false;
    }

    const requestBody = buildMonopolyActionRequest(type, payload, state);
    if (!requestBody) {
      toast.error("Action unavailable", {
        description: `Unsupported Monopoly action: ${type}`,
      });
      return false;
    }

    try {
      const nextState = await monopolyApi.action<MonopolyBackendState>(sessionId, requestBody);
      applyMonopolyState(nextState, sessionId);
      return true;
    } catch (e) {
      // Axios interceptor already surfaces a toast for API errors.
      console.error("[monopoly] REST action failed", type, e);
      return false;
    }
  };

  return (
    <AppShell hideChrome>
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "radial-gradient(circle at 50% 0%, #0a1a2e 0%, #050507 60%)" }}
      />
      <main className="relative h-[100dvh] max-h-[100dvh] overflow-hidden px-3 pt-3 pb-3 max-w-[1800px] mx-auto flex flex-col gap-2">
        <header className="flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="text-[8px] font-mono uppercase tracking-[0.35em] text-accent-cyan">
              Bharat Edition · Multiplayer
            </div>
            <h1 className="font-display text-2xl md:text-3xl italic uppercase neon-text-glow truncate leading-none">
              Monopoly: India Edition
            </h1>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <NeonButton variant="ghost" size="sm" onClick={() => setBankOpen(true)}>
              <Banknote className="inline size-3.5 mr-1" /> Bank
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => {
                navigate({ to: "/" });
              }}
            >
              Soft Exit
            </NeonButton>
            <NeonButton
              variant="pink"
              size="sm"
              onClick={() => {
                localStorage.removeItem("gamehub:resume-session");
                if (roomId) {
                  leaveRoomMut.mutate(roomId, {
                    onSettled: () => navigate({ to: "/" }),
                  });
                } else {
                  navigate({ to: "/" });
                }
              }}
            >
              Abandon
            </NeonButton>
          </div>
        </header>

        <IndianEventBanner event={state.activeEvent} />

        <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_240px] gap-2 flex-1 min-h-0 overflow-hidden">
          {/* Left: players */}
          <aside className="space-y-1.5 order-2 xl:order-1 min-h-0 overflow-y-auto">
            {state.players.map((p, seatIdx) => (
              <PlayerPanel
                key={p.id}
                state={state}
                player={p}
                seatNumber={seatIdx + 1}
                compact
                isCurrent={state.players[state.currentPlayerIndex].id === p.id}
                isMe={p.id === me.id}
                selected={focusPlayerId === p.id}
                onSelectPlayer={() =>
                  setFocusPlayerId((prev) => (prev === p.id ? null : p.id))
                }
                onSelectTile={(i) => setOpenTile(i)}
                onProposeTrade={p.id !== me.id ? () => setTradePartner(p.id) : undefined}
              />
            ))}
          </aside>

          {/* Center: board */}
          <section className="order-1 xl:order-2 min-h-0 h-full flex items-center justify-center overflow-hidden">
            <Board
              state={state}
              onTileClick={(i) => setOpenTile(i)}
              highlightTile={state.pendingPurchaseTile}
              focusPlayerId={focusPlayerId}
            />
          </section>

          {/* Right: action + log */}
          <aside className="space-y-2 order-3 min-h-0 flex flex-col overflow-hidden">
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
            <EventLog log={state.log} compact />
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
              <NeonButton onClick={() => { localStorage.removeItem("gamehub:resume-session"); navigate({ to: "/" }); }}>Return Home</NeonButton>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {cardReveal && (
          <CardRevealModal
            card={cardReveal}
            onContinue={() => {
              setCardReveal(null);
              void sendGameAction("END_TURN");
            }}
          />
        )}

        {openTile != null && (
          <PropertyCard
            state={state}
            tileIndex={openTile}
            isMyTurn={isMyTurn}
            meId={me.id}
            onClose={() => setOpenTile(null)}
            onBuild={
              state.properties[openTile]?.ownerId === me.id
                ? () => sendGameAction("BUILD_HOUSE", { tileIndex: openTile })
                : undefined
            }
            onSell={
              state.properties[openTile]?.ownerId === me.id &&
              (state.properties[openTile]?.houses ?? 0) > 0
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
              void sendGameAction("PROPOSE_TRADE", { offer });
              setTradePartner(null);
            }}
          />
        )}

        {bankOpen && (
          <BankManager
            state={state}
            canEdit={isRoomHost}
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
