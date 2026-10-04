import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trophy, Banknote } from "lucide-react";
import { AppShell } from "../components/layout/AppShell";
import { NeonButton } from "../components/common/NeonButton";
import { ChatDrawer } from "../components/chat/ChatDrawer";
import { Board } from "../components/monopoly/Board";
import { ActionBar } from "../components/monopoly/ActionBar";
import { DebtPanel } from "../components/monopoly/DebtPanel";
import { PlayerPanel } from "../components/monopoly/PlayerPanel";
import { PropertyCard } from "../components/monopoly/PropertyCard";
import { VoiceChatPanel } from "../components/voice/VoiceChatPanel";
import { AuctionPanel } from "../components/monopoly/AuctionPanel";
import { UpgradePrompt } from "../components/monopoly/UpgradePrompt";
import { BOARD } from "../data/monopolyBoard";
import { TradePanel } from "../components/monopoly/TradePanel";
import { EventLog } from "../components/monopoly/EventLog";
import { BankManager } from "../components/monopoly/BankManager";
import { IndianEventBanner } from "../components/monopoly/IndianEventBanner";
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
import {
  formatInr,
  landingUpgradeOfferKey,
  landingUpgradeTile,
  minAuctionBid,
  snapAuctionBid,
  upgradeActionFor,
} from "../utils/monopolyEngine";
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
  currentTurn?: number;
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
  pendingCard?: MonopolyState["pendingCard"];
  auction?: MonopolyAuctionSnapshot | null;
  trade?: MonopolyState["trade"];
  log?: string[];
  winnerId?: string | null;
  pendingDebt?: {
    debtorId?: string;
    creditorId?: string | null;
    amount?: number;
    reason?: string;
  } | null;
  pendingSale?: {
    sellerId?: string;
    buyerId?: string;
    tilePosition?: number;
    price?: number;
  } | null;
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
        content:
          "Play Monopoly: India Edition with friends and AI. Indian cities, ₹ currency, offline-ready.",
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
    case "RAISING_FUNDS":
      return "debt";
    case "PAUSED":
      return "rolling";
    case "ENDED":
      return "ended";
    default:
      return "rolling";
  }
}

function isSameUser(
  player: { id?: string; userId?: string; username?: string } | undefined,
  user: { id?: string; username?: string } | null | undefined,
) {
  if (!player || !user?.id) return false;
  return (
    player.userId === user.id ||
    player.id === user.id ||
    Boolean(user.username && player.username === user.username)
  );
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

/** Auction updates used to arrive wrapped as `{ payload: auction }`. */
function readAuctionUpdate(payload: unknown): MonopolyAuctionSnapshot | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as MonopolyAuctionSnapshot & { payload?: unknown };
  const nested = record.payload;
  const wrapped =
    nested !== undefined &&
    record.tilePosition == null &&
    record.tileIndex == null &&
    !Array.isArray(record.activePlayerIds);
  if (!wrapped) return record;
  if (!nested || typeof nested !== "object") return null;
  return nested as MonopolyAuctionSnapshot;
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
    case "PAY_DEBT":
      actionType = "PAY_DEBT";
      break;
    case "DECLARE_BANKRUPTCY":
      actionType = "DECLARE_BANKRUPTCY";
      break;
    case "PROPOSE_SALE":
      actionType = "PROPOSE_SALE";
      break;
    case "ACCEPT_SALE":
      actionType = "ACCEPT_SALE";
      break;
    case "DECLINE_SALE":
      actionType = "DECLINE_SALE";
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
    case "BUILD_HOTEL":
      actionType = "BUILD_HOTEL";
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

function unwrapBackend(
  session: MonopolySessionSnapshot | MonopolyBackendState | null | undefined,
): MonopolyBackendState | null {
  if (!session) return null;
  if ("state" in session && session.state && typeof session.state === "object") {
    return session.state;
  }
  return session;
}

function backendProgress(backend: MonopolyBackendState | null | undefined): number {
  if (!backend) return -1;
  // Turn count and log length only move forward. Board position does not:
  // passing GO drops the position sum, which used to discard the salary
  // update until a refresh painted the higher balance.
  const turn = backend.currentTurn ?? 0;
  return turn * 1_000_000 + (backend.log?.length ?? 0);
}

function findPlayerAsset(
  player: RoomPlayerSnapshot,
  assets: Record<string, MonopolyAssetSnapshot>,
  claimed: Set<string>,
): MonopolyAssetSnapshot | null {
  const keys = [player.id, player.userId, player.username, player.displayName]
    .filter((value): value is string => Boolean(value))
    .map(String);
  for (const key of keys) {
    if (assets[key] && !claimed.has(key)) {
      claimed.add(key);
      return assets[key];
    }
  }
  return null;
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

  const claimedAssets = new Set<string>();
  const players = roomPlayers.map((p) => {
    const asset = findPlayerAsset(p, assets, claimedAssets);
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

  const leftoverAssetKeys = Object.keys(assets).filter((key) => !claimedAssets.has(key));
  const unmatchedPlayers = players.filter((_, index) => {
    const roomPlayer = roomPlayers[index];
    const keys = [roomPlayer?.id, roomPlayer?.userId, roomPlayer?.username, roomPlayer?.displayName]
      .filter(Boolean)
      .map(String);
    return !keys.some((key) => claimedAssets.has(key));
  });
  if (unmatchedPlayers.length === 1 && leftoverAssetKeys.length === 1) {
    const leftover = assets[leftoverAssetKeys[0]];
    unmatchedPlayers[0].position = leftover?.position ?? unmatchedPlayers[0].position;
    unmatchedPlayers[0].cash = leftover?.cash ?? unmatchedPlayers[0].cash;
    unmatchedPlayers[0].inJail = leftover?.inJail ?? unmatchedPlayers[0].inJail;
    unmatchedPlayers[0].jailTurns = leftover?.jailTurns ?? unmatchedPlayers[0].jailTurns;
    unmatchedPlayers[0].jailCards =
      leftover?.jailCards ?? leftover?.getOutOfJailCards ?? unmatchedPlayers[0].jailCards;
    unmatchedPlayers[0].bankrupt = leftover?.bankrupt ?? unmatchedPlayers[0].bankrupt;
  }

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

  const developments: Record<string, { houses?: number; hotel?: boolean }> = backend.developments ?? {};
  const mortgaged = new Set<number>(backend.mortgagedTiles ?? []);

  Object.keys(owners).forEach((k) => {
    const pos = Number(k);
    const ownerId = owners[k] ? String(owners[k]) : null;
    const dev = developments[pos] ?? null;
    properties[pos] = {
      ownerId,
      houses: dev?.hotel ? 5 : dev ? (dev.houses ?? 0) : 0,
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
    declinedPurchaseTile: null,
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
    activeEvent: backend.activeEvent?.id
      ? {
          id: String(backend.activeEvent.id),
          title: backend.activeEvent.title ?? String(backend.activeEvent.id),
          description: backend.activeEvent.description ?? "",
          expiresOnTurn: backend.activeEvent.expiresOnTurn ?? 0,
        }
      : null,
    pendingDebt: mapParty(backend.pendingDebt, roomPlayers),
    pendingSale: mapSale(backend.pendingSale, roomPlayers),
  };
}

function mapParty(
  debt: MonopolyBackendState["pendingDebt"],
  roomPlayers: Array<{ id?: string; userId?: string }>,
) {
  if (!debt?.debtorId || debt.amount == null) return null;
  return {
    debtorId: resolveRoomPlayerId(String(debt.debtorId), roomPlayers) ?? String(debt.debtorId),
    creditorId: debt.creditorId
      ? (resolveRoomPlayerId(String(debt.creditorId), roomPlayers) ?? String(debt.creditorId))
      : null,
    amount: Number(debt.amount),
    reason: debt.reason ?? "Debt",
  };
}

function mapSale(
  sale: MonopolyBackendState["pendingSale"],
  roomPlayers: Array<{ id?: string; userId?: string }>,
) {
  if (!sale?.sellerId || !sale.buyerId || sale.tilePosition == null || sale.price == null) return null;
  return {
    sellerId: resolveRoomPlayerId(String(sale.sellerId), roomPlayers) ?? String(sale.sellerId),
    buyerId: resolveRoomPlayerId(String(sale.buyerId), roomPlayers) ?? String(sale.buyerId),
    tilePosition: Number(sale.tilePosition),
    price: Number(sale.price),
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
  const latestBackendRef = useRef<MonopolyBackendState | null>(null);
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
    (nextState: MonopolyBackendState, nextSessionId?: string, force = false) => {
      const incomingScore = backendProgress(nextState);
      const liveScore = backendProgress(latestBackendRef.current);
      const source =
        !force && incomingScore < liveScore && latestBackendRef.current
          ? latestBackendRef.current
          : nextState;
      if (source === nextState) latestBackendRef.current = nextState;
      const mapped = mapSnapshotToState(
        { sessionId: nextSessionId ?? source?.sessionId ?? sessionId, state: source },
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
            readAuctionUpdate(envelope.payload),
            roomDataRef.current?.players ?? [],
          );
          if (current) {
            setGame(gameId!, {
              ...current,
              auction,
              phase: auction ? "auction" : current.phase,
              pendingPurchaseTile: auction ? auction.tileIndex : current.pendingPurchaseTile,
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
  const isRoomHost = Boolean(user && roomQuery.data && roomQuery.data.hostId === user.id);
  const [hydrated, setHydrated] = useState(false);
  const [openTile, setOpenTile] = useState<number | null>(null);
  const [tradePartner, setTradePartner] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [dismissedUpgradeKey, setDismissedUpgradeKey] = useState<string | null>(null);

  useEffect(() => {
    latestBackendRef.current = null;
    setHydrated(false);
  }, [gameId]);
  const aiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const auctionStartingRef = useRef(false);

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
      state.players.find((p) => p.userId === user.id) ??
      state.players.find((p) => p.id === user.id) ??
      state.players.find((p) => p.username === user.username)
    );
  }, [state, user]);

  const voiceUserLookup = useMemo(
    () =>
      Object.fromEntries(
        (state?.players ?? []).flatMap((player) => {
          const profile = { username: player.username, avatarColor: player.avatarColor };
          return player.userId && player.userId !== player.id
            ? [[player.id, profile], [player.userId, profile]]
            : [[player.id, profile]];
        }),
      ),
    [state?.players],
  );

  // Hydrate from the latest snapshot, but never let a stale/empty snapshot
  // overwrite a live STOMP board after refresh or reconnect.
  useEffect(() => {
    if (!snapshot.data || !roomQuery.data) return;
    try {
      roomDataRef.current = roomQuery.data;
      const backend = unwrapBackend(snapshot.data);
      if (!backend) return;
      const snapshotScore = backendProgress(backend);
      const liveScore = backendProgress(latestBackendRef.current);
      const source =
        latestBackendRef.current && liveScore >= snapshotScore
          ? latestBackendRef.current
          : backend;
      if (source === backend) latestBackendRef.current = backend;
      const mapped = mapSnapshotToState(
        {
          sessionId: snapshot.data.sessionId ?? snapshot.data.id ?? source.sessionId ?? sessionId,
          state: source,
        },
        roomQuery.data,
        gameId,
      );
      setGame(gameId!, mapped);
      setHydrated(true);
    } catch (e) {
      console.error("Failed to hydrate Monopoly store from snapshot", e);
    }
  }, [snapshot.dataUpdatedAt, roomQuery.data, gameId, sessionId, setGame]);

  // Turns with nothing left to choose (rent, tax, cards, a finished purchase)
  // are passed on by the server. This covers a board already sitting in that
  // state, so nobody has to press End Turn.
  const handoverAttempt = useRef<string | null>(null);
  useEffect(() => {
    if (!state || !user || !sessionId || state.phase !== "landed") return;
    if (state.pendingPurchaseTile != null || state.auction || state.pendingDebt) return;
    const player = state.players[state.currentPlayerIndex];
    if (!player || player.isAI || player.bankrupt) return;
    const localPlay = roomQuery.data?.playMode === "LOCAL";
    const mine = localPlay || isSameUser(player, user);
    if (!mine) return;
    if (landingUpgradeTile(state, player.id) != null) return;
    const key = `${state.currentPlayerIndex}:${state.log.length}:${player.position}`;
    if (handoverAttempt.current === key) return;
    handoverAttempt.current = key;
    const request = buildMonopolyActionRequest("END_TURN", {}, state);
    if (!request) return;
    void monopolyApi
      .action<MonopolySessionSnapshot>(sessionId, request)
      .then((next) => {
        const backend = unwrapBackend(next);
        if (backend) applyMonopolyState(backend, sessionId, true);
      })
      .catch((error) => {
        console.error("[monopoly] automatic handover failed", error);
      });
  }, [state, user, sessionId, roomQuery.data?.playMode, applyMonopolyState]);

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

  const localPlay = roomQuery.data?.playMode === "LOCAL";
  const multiDevice = roomQuery.data?.playMode === "ONLINE";
  const cur = state.players[state.currentPlayerIndex] ?? state.players[0];
  const seat = localPlay ? cur : me;
  const auctionBidderId = state.auction
    ? (state.auction.activePlayerIds[state.auction.currentBidderIndex] ??
      state.auction.activePlayerIds[0])
    : undefined;
  const isMyTurn = localPlay
    ? Boolean(seat && !seat.isAI && !seat.bankrupt)
    : Boolean(me && !cur.isAI && !cur.bankrupt && isSameUser(cur, user));
  const debtor = state.pendingDebt
    ? state.players.find((player) => player.id === state.pendingDebt?.debtorId)
    : undefined;
  const saleBuyer = state.pendingSale
    ? state.players.find((player) => player.id === state.pendingSale?.buyerId)
    : undefined;
  const canResolveDebt =
    state.phase === "debt" && Boolean(debtor) && (localPlay || isSameUser(debtor, user));
  const canAnswerSale =
    state.phase === "debt" && Boolean(saleBuyer) && (localPlay || isSameUser(saleBuyer, user));
  const revisitUpgrade = isMyTurn && seat ? landingUpgradeTile(state, seat.id) : null;
  const upgradeOfferKey =
    multiDevice && isMyTurn && seat ? landingUpgradeOfferKey(state, seat.id) : null;
  const showUpgradePrompt = upgradeOfferKey != null && upgradeOfferKey !== dismissedUpgradeKey;

  // Normal Monopoly actions are REST-authoritative; auctions remain STOMP-only.
  const sendGameAction = async (type: string, payload: Record<string, unknown> = {}) => {
    if (!sessionId) return false;
    const isAuctionAct = type === "PLACE_BID" || type === "PASS_BID";
    const debtAction =
      canResolveDebt &&
      ["SELL_HOUSE", "TOGGLE_MORTGAGE", "PAY_DEBT", "DECLARE_BANKRUPTCY", "PROPOSE_SALE"].includes(type);
    const saleAction = canAnswerSale && (type === "ACCEPT_SALE" || type === "DECLINE_SALE");
    if (!isMyTurn && !isAuctionAct && !debtAction && !saleAction) {
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
            ? {
                action: "PLACE_BID",
                amount: snapAuctionBid(
                  Number(p.amount ?? 0),
                  minAuctionBid(state.auction?.highestBid ?? 0),
                ),
              }
            : { action: "PASS" };

      const dest = Topics.send.auction(sessionId);
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
      const description =
        type === "RESOLVE_TRADE"
          ? "Trade responses are not part of the current backend Monopoly contract."
          : type === "BANK_ADJUST" || type === "BANK_TRANSFER"
            ? "Bank manager actions are not supported by the live backend Monopoly API."
            : `Unsupported Monopoly action: ${type}`;
      toast.error("Action unavailable", { description });
      return false;
    }

    try {
      const nextState = await monopolyApi.action<MonopolySessionSnapshot>(sessionId, requestBody);
      const backend = unwrapBackend(nextState);
      if (backend) applyMonopolyState(backend, sessionId, true);
      return true;
    } catch (error) {
      console.error("[monopoly] REST action failed", type, error);
      return false;
    }
  };

  return (
    <AppShell hideChrome>
      <div
        className="fixed inset-0 -z-10 bg-background"
        style={{ background: "var(--gradient-radial-glow)" }}
      />
      <main className="relative mx-auto flex w-full max-w-[1600px] flex-col px-3 pb-6 pt-3 sm:px-4 sm:pt-5 lg:h-dvh lg:max-h-[1200px] lg:overflow-hidden lg:pb-4">
        <header className="mb-3 flex shrink-0 flex-col gap-3 sm:mb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-1">
              {localPlay ? "Same device" : "Multiplayer Match"}
            </div>
            <h1 className="font-display text-3xl font-bold uppercase gold-text-glow sm:text-4xl lg:text-5xl">
              Bharat Business
            </h1>
            {localPlay && (
              <p className="mt-1 text-xs font-mono text-[#d4a843] sm:mt-2 sm:text-sm">
                Pass the device to{" "}
                {state.phase === "debt"
                  ? (debtor?.username ?? cur.username)
                  : state.phase === "auction"
                  ? (state.players.find((player) => player.id === auctionBidderId)?.username ??
                    cur.username)
                  : cur.username}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <NeonButton variant="ghost" size="sm" onClick={() => setBankOpen(true)}>
              <Banknote className="inline size-4 mr-1" /> Bank
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => {
                // Soft Exit: keep seat + resume token for later return
                navigate({ to: "/" });
              }}
            >
              Soft Exit
            </NeonButton>
            <NeonButton
              variant="danger"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to abandon the game? You will forfeit all properties.",
                  )
                ) {
                  localStorage.removeItem("gamehub:resume-session");
                  if (roomId) {
                    leaveRoomMut.mutate(roomId, {
                      onSettled: () => navigate({ to: "/" }),
                    });
                  } else {
                    navigate({ to: "/" });
                  }
                }
              }}
            >
              Abandon
            </NeonButton>
          </div>
        </header>

        {!localPlay && roomId && user?.id && (
          <div className="mb-2">
            <VoiceChatPanel
              compact
              roomId={roomId}
              selfUserId={user.id}
              userLookup={voiceUserLookup}
            />
          </div>
        )}
        <IndianEventBanner event={state.activeEvent} />

        <div className="mt-3 grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(240px,320px)] lg:gap-4">
          {/* Players */}
          <aside className="order-3 flex min-w-0 max-w-full gap-3 overflow-x-auto pb-2 lg:order-1 lg:flex-col lg:gap-2 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1">
            {state.players.map((p, i) => (
              <div key={p.id} className="w-[min(85vw,280px)] shrink-0 lg:w-full">
                <PlayerPanel
                  state={state}
                  player={p}
                  playerIndex={i}
                  isCurrent={state.players[state.currentPlayerIndex]?.id === p.id}
                  isMe={p.id === seat.id}
                  onSelectTile={(i) => setOpenTile(i)}
                  onProposeTrade={p.id !== seat.id ? () => setTradePartner(p.id) : undefined}
                />
              </div>
            ))}
          </aside>

          {/* Board */}
          <section className="order-1 flex min-w-0 items-center justify-center lg:order-2 lg:min-h-0 lg:p-2">
            <Board
              state={state}
              onTileClick={(i) => setOpenTile(i)}
              highlightTile={state.pendingPurchaseTile ?? revisitUpgrade}
            />
          </section>

          {/* Action + log */}
          <aside className="order-2 flex min-w-0 flex-col gap-3 lg:order-3 lg:min-h-0 lg:overflow-y-auto lg:pb-2">
            {state.phase === "debt" && state.pendingDebt && (
              <DebtPanel
                state={state}
                debt={state.pendingDebt}
                sale={state.pendingSale}
                canResolve={canResolveDebt}
                canAnswerSale={canAnswerSale}
                onSellBuilding={(tileIndex) => sendGameAction("SELL_HOUSE", { tileIndex })}
                onMortgage={(tileIndex) => sendGameAction("TOGGLE_MORTGAGE", { tileIndex })}
                onProposeSale={(tileIndex, buyerId, price) =>
                  sendGameAction("PROPOSE_SALE", { tileIndex, targetPlayerId: buyerId, amount: price })
                }
                onAcceptSale={() => sendGameAction("ACCEPT_SALE")}
                onDeclineSale={() => sendGameAction("DECLINE_SALE")}
                onPay={() => sendGameAction("PAY_DEBT")}
                onBankrupt={() => sendGameAction("DECLARE_BANKRUPTCY")}
              />
            )}
            <ActionBar
              state={state}
              me={seat}
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
              onEnd={
                revisitUpgrade != null ? () => sendGameAction("END_TURN") : undefined
              }
              onPayJail={() => sendGameAction("PAY_JAIL")}
              onJailCard={() => sendGameAction("USE_JAIL_CARD")}
              upgradeTile={localPlay ? revisitUpgrade : null}
              onUpgrade={
                localPlay && revisitUpgrade != null
                  ? () =>
                      sendGameAction(upgradeActionFor(state, revisitUpgrade), {
                        tileIndex: revisitUpgrade,
                      })
                  : undefined
              }
            />
            <EventLog log={state.log} />
          </aside>
        </div>

        {state.phase === "ended" && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md grid place-items-center p-6">
            <div className="relative glass-panel border border-[#d4a843]/40 p-12 text-center max-w-lg w-full overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,168,67,0.15)_0%,transparent_70%)] pointer-events-none" />

              <Trophy className="size-20 text-[#d4a843] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,168,67,0.5)]" />
              <div className="text-[12px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-2 font-bold">
                Monopoly Conquered
              </div>
              <h2 className="font-display text-5xl font-bold uppercase mb-4 text-white">
                {state.players.find((p) => p.id === state.winnerId)?.username} Wins!
              </h2>
              <p className="text-[#9baab8] text-sm mb-8">
                The last tycoon standing in Bharat Business.
              </p>

              <NeonButton
                variant="gold"
                size="lg"
                onClick={() => {
                  localStorage.removeItem("gamehub:resume-session");
                  navigate({ to: "/" });
                }}
              >
                Return to Lobby
              </NeonButton>
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showUpgradePrompt && revisitUpgrade != null && seat && (
          <UpgradePrompt
            state={state}
            tileIndex={revisitUpgrade}
            cash={seat.cash}
            onUpgrade={() =>
              sendGameAction(upgradeActionFor(state, revisitUpgrade), {
                tileIndex: revisitUpgrade,
              })
            }
            onCancel={() => {
              setDismissedUpgradeKey(upgradeOfferKey);
              void sendGameAction("END_TURN");
            }}
          />
        )}
        {openTile != null && (
          <PropertyCard
            state={state}
            tileIndex={openTile}
            onClose={() => setOpenTile(null)}
            onBuild={
              localPlay && revisitUpgrade === openTile
                ? () =>
                    sendGameAction(upgradeActionFor(state, openTile), { tileIndex: openTile })
                : undefined
            }
            onSell={
              state.properties[openTile]?.ownerId === seat.id && state.properties[openTile].houses > 0
                ? () => sendGameAction("SELL_HOUSE", { tileIndex: openTile })
                : undefined
            }
            onMortgage={
              state.properties[openTile]?.ownerId === seat.id
                ? () => sendGameAction("TOGGLE_MORTGAGE", { tileIndex: openTile })
                : undefined
            }
          />
        )}

        {state.phase === "auction" && state.auction && (
          <AuctionPanel
            state={state}
            meId={localPlay ? (auctionBidderId ?? seat.id) : me.id}
            onBid={(amount) => sendGameAction("PLACE_BID", { amount })}
            onPass={() => sendGameAction("PASS_BID")}
          />
        )}

        {tradePartner && (
          <TradePanel
            state={state}
            meId={seat.id}
            partnerId={tradePartner}
            onClose={() => setTradePartner(null)}
            onPropose={(offer) => {
              sendGameAction("PROPOSE_TRADE", { offer });
              setTradePartner(null);
            }}
          />
        )}

        {state.trade && (localPlay || state.trade.toId === me.id) && (
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
            canEdit={isRoomHost}
            onClose={() => setBankOpen(false)}
            onAdjust={(pid, delta) => sendGameAction("BANK_ADJUST", { playerId: pid, delta })}
            onTransfer={(from, to, amt) => sendGameAction("BANK_TRANSFER", { from, to, amt })}
          />
        )}
      </AnimatePresence>

      {!localPlay && roomId && <ChatDrawer roomId={roomId} />}
    </AppShell>
  );
}
