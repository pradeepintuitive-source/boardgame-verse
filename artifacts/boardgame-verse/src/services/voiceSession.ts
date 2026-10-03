import { useConnectionStore } from "../store/connectionStore";
import { useVoiceStore } from "../store/voiceStore";
import { stomp } from "../websocket/stompClient";
import { Topics } from "../websocket/topics";
import {
  sendJoin,
  sendLeave,
  sendMuteState,
  sendSignal,
  type SignalType,
  type VoicePresenceMessage,
  type VoiceSignalMessage,
} from "./voiceSignaling";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    {
      urls: [
        "turn:openrelay.metered.ca:80",
        "turn:openrelay.metered.ca:443",
        "turns:openrelay.metered.ca:443?transport=tcp",
      ],
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
};

const SIGNAL_TYPES = new Set<SignalType>(["OFFER", "ANSWER", "ICE_CANDIDATE", "HANG_UP", "MUTE_STATE"]);

type PeerLink = {
  pc: RTCPeerConnection;
  makingOffer: boolean;
  iceRestarted: boolean;
  pendingCandidates: RTCIceCandidateInit[];
  remoteSource: MediaStreamAudioSourceNode | null;
};

type ActiveSession = {
  roomId: string;
  selfUserId: string;
  stream: MediaStream | null;
  peers: Map<string, PeerLink>;
  earlyCandidates: Map<string, RTCIceCandidateInit[]>;
  signalQueue: Map<string, Promise<void>>;
  recentSignals: Set<string>;
  unsubs: Array<() => void>;
  retainers: number;
  leaveTimer: number | null;
  removeUnlock: (() => void) | null;
};

let active: ActiveSession | null = null;
let joining: Promise<void> | null = null;
let suppressAutoJoin = false;
let outputContext: AudioContext | null = null;

function audioOutput() {
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!outputContext || outputContext.state === "closed") outputContext = new Ctx();
  return outputContext;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function readUserId(record: Record<string, unknown> | null): string {
  if (!record) return "";
  const id = record.fromUserId ?? record.senderUserId ?? record.senderId ?? record.userId;
  return typeof id === "string" ? id : "";
}

function participantIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const ids: string[] = [];
  for (const entry of value) {
    if (typeof entry === "string" && entry) {
      ids.push(entry);
      continue;
    }
    const record = asRecord(entry);
    const id = record?.userId ?? record?.id ?? record?.playerId;
    if (typeof id === "string" && id) ids.push(id);
  }
  return ids;
}

function normalizePresence(body: unknown): VoicePresenceMessage | null {
  const root = asRecord(body);
  if (!root) return null;
  const nested = asRecord(root.payload);
  const source =
    nested && (Array.isArray(nested.participants) || nested.type === "VOICE_PRESENCE")
      ? { ...root, ...nested }
      : root;
  const participants = participantIds(source.participants);
  if (!participants) return null;
  if (source.type && source.type !== "VOICE_PRESENCE") return null;
  return {
    type: "VOICE_PRESENCE",
    roomId: typeof source.roomId === "string" ? source.roomId : active?.roomId ?? "",
    participants,
    changedUserId: typeof source.changedUserId === "string" ? source.changedUserId : "",
    joined: source.joined !== false && source.joined !== "false",
  };
}

function normalizeSignal(body: unknown): VoiceSignalMessage | null {
  const root = asRecord(body);
  if (!root) return null;
  const nested = asRecord(root.payload);
  const rootType = typeof root.type === "string" ? root.type : "";
  const source =
    rootType === "VOICE_SIGNAL" || rootType === "VOICE_SIGNALING" ? (nested ?? root) : root;
  const typeValue = source.type ?? source.signalType ?? (rootType === "VOICE_SIGNAL" ? undefined : rootType);
  if (typeof typeValue !== "string" || !SIGNAL_TYPES.has(typeValue as SignalType)) return null;
  const payload =
    typeValue === root.type || source === root
      ? (source.payload ?? source)
      : (source.payload ?? source);
  return {
    type: typeValue as SignalType,
    roomId: typeof source.roomId === "string" ? source.roomId : undefined,
    fromUserId: readUserId(source) || readUserId(root) || readUserId(nested),
    toUserId: typeof source.toUserId === "string" ? source.toUserId : undefined,
    payload,
  };
}

function readDescription(payload: unknown): RTCSessionDescriptionInit | null {
  const record = asRecord(payload);
  const description = asRecord(record?.description) ?? record;
  if (!description) return null;
  const type = description.type;
  const sdp = description.sdp;
  if ((type === "offer" || type === "answer" || type === "pranswer" || type === "rollback") && typeof sdp === "string") {
    return { type, sdp };
  }
  return null;
}

function readCandidate(payload: unknown): RTCIceCandidateInit | null {
  const record = asRecord(payload);
  if (!record) return null;
  const nested = typeof record.candidate === "object" ? asRecord(record.candidate) : null;
  const candidate =
    typeof record.candidate === "string" ? record.candidate : typeof nested?.candidate === "string" ? nested.candidate : "";
  if (!candidate) return null;
  const sdpMid = record.sdpMid ?? nested?.sdpMid;
  const sdpMLineIndex = record.sdpMLineIndex ?? nested?.sdpMLineIndex;
  return {
    candidate,
    sdpMid: typeof sdpMid === "string" ? sdpMid : null,
    sdpMLineIndex: typeof sdpMLineIndex === "number" ? sdpMLineIndex : 0,
  };
}

function shouldOffer(peerId: string) {
  return Boolean(active && active.selfUserId < peerId);
}

function resumeRemotePlayback() {
  const context = audioOutput();
  if (context?.state === "suspended") void context.resume();
}

function installAudioUnlock(session: ActiveSession) {
  const unlock = () => resumeRemotePlayback();
  window.addEventListener("pointerdown", unlock);
  session.removeUnlock = () => window.removeEventListener("pointerdown", unlock);
}

function playRemoteStream(link: PeerLink, peerId: string, stream: MediaStream) {
  const context = audioOutput();
  if (!context) return;
  link.remoteSource?.disconnect();
  const source = context.createMediaStreamSource(stream);
  source.connect(context.destination);
  link.remoteSource = source;
  if (context.state === "suspended") void context.resume();
  console.info("[voice] receiving audio from", peerId, context.state);
}

function attachLocalTracks(pc: RTCPeerConnection) {
  const stream = active?.stream;
  if (!stream) return;
  for (const track of stream.getAudioTracks()) {
    const sender = pc.getSenders().find((item) => item.track?.kind === "audio");
    if (!sender) {
      pc.addTrack(track, stream);
    } else if (sender.track !== track) {
      void sender.replaceTrack(track);
    }
  }
}

async function withLiveMic<T>(run: () => Promise<T>): Promise<T> {
  const tracks = active?.stream?.getAudioTracks() ?? [];
  const previous = tracks.map((track) => track.enabled);
  tracks.forEach((track) => {
    track.enabled = true;
  });
  try {
    return await run();
  } finally {
    const muted = useVoiceStore.getState().selfMuted;
    tracks.forEach((track, index) => {
      track.enabled = muted ? false : previous[index];
    });
  }
}

function closePeer(peerId: string) {
  const link = active?.peers.get(peerId);
  if (!link) return;
  link.pc.onicecandidate = null;
  link.pc.ontrack = null;
  link.pc.onconnectionstatechange = null;
  link.pc.close();
  link.remoteSource?.disconnect();
  link.remoteSource = null;
  active?.peers.delete(peerId);
}

async function flushCandidates(peerId: string) {
  const link = active?.peers.get(peerId);
  if (!link?.pc.remoteDescription) return;
  const queued = link.pendingCandidates.splice(0);
  for (const candidate of queued) {
    try {
      await link.pc.addIceCandidate(candidate);
    } catch (error) {
      console.warn("[voice] skipped an ICE candidate", error);
    }
  }
}

function queueCandidate(peerId: string, candidate: RTCIceCandidateInit) {
  const session = active;
  if (!session) return;
  const link = session.peers.get(peerId);
  if (link) {
    link.pendingCandidates.push(candidate);
    return;
  }
  const early = session.earlyCandidates.get(peerId) ?? [];
  early.push(candidate);
  session.earlyCandidates.set(peerId, early);
}

function createPeer(peerId: string): PeerLink {
  if (!active) throw new Error("Voice session is not active");
  const session = active;
  const existing = session.peers.get(peerId);
  if (existing && existing.pc.connectionState !== "closed") return existing;
  existing?.remoteSource?.disconnect();
  existing?.pc.close();

  const pc = new RTCPeerConnection(ICE_SERVERS);
  const link: PeerLink = {
    pc,
    makingOffer: false,
    iceRestarted: false,
    pendingCandidates: session.earlyCandidates.get(peerId) ?? [],
    remoteSource: null,
  };
  session.earlyCandidates.delete(peerId);
  session.peers.set(peerId, link);

  pc.onicecandidate = (event) => {
    if (!event.candidate || !useConnectionStore.getState().connected || active !== session) return;
    sendSignal(session.roomId, "ICE_CANDIDATE", peerId, {
      candidate: event.candidate.candidate,
      sdpMid: event.candidate.sdpMid,
      sdpMLineIndex: event.candidate.sdpMLineIndex,
    });
  };

  pc.ontrack = (event) => {
    const [firstStream] = event.streams;
    const stream = firstStream && firstStream.getAudioTracks().length > 0 ? firstStream : new MediaStream([event.track]);
    playRemoteStream(link, peerId, stream);
  };

  // "disconnected" is often temporary during ICE. Dropping the peer here
  // removes the other player and leaves the mic on with nobody to hear it.
  pc.onconnectionstatechange = () => {
    if (active !== session) return;
    if (pc.connectionState === "connected") {
      console.info("[voice] peer connected", peerId);
      resumeRemotePlayback();
    } else if (pc.connectionState === "failed") {
      console.warn("[voice] peer connection failed", peerId);
      if (!link.iceRestarted) {
        link.iceRestarted = true;
        void restartIce(peerId);
      }
    } else if (pc.connectionState === "disconnected") {
      window.setTimeout(() => {
        if (active !== session || link.pc.connectionState !== "disconnected" || link.iceRestarted) return;
        link.iceRestarted = true;
        void restartIce(peerId);
      }, 2000);
    }
  };

  attachLocalTracks(pc);
  return link;
}

async function initiateOffer(peerId: string, force = false) {
  if (!active || !useConnectionStore.getState().connected || (!force && !shouldOffer(peerId))) return;
  const link = createPeer(peerId);
  if (link.makingOffer || link.pc.signalingState !== "stable") return;
  link.makingOffer = true;
  try {
    attachLocalTracks(link.pc);
    const restart = link.pc.connectionState === "failed" || link.pc.connectionState === "disconnected";
    const offer = await withLiveMic(() => link.pc.createOffer(restart ? { iceRestart: true } : undefined));
    if (active?.peers.get(peerId) !== link || link.pc.signalingState !== "stable") return;
    await link.pc.setLocalDescription(offer);
    sendSignal(active.roomId, "OFFER", peerId, { type: offer.type, sdp: offer.sdp });
    console.info("[voice] offered audio to", peerId);
  } catch (error) {
    console.error("[voice] failed to create offer", error);
  } finally {
    link.makingOffer = false;
  }
}

async function restartIce(peerId: string) {
  const link = active?.peers.get(peerId);
  if (!link || !active || link.pc.signalingState !== "stable" || link.makingOffer) {
    if (link) link.iceRestarted = false;
    return;
  }
  link.makingOffer = true;
  try {
    const offer = await withLiveMic(() => link.pc.createOffer({ iceRestart: true }));
    if (active?.peers.get(peerId) !== link) return;
    await link.pc.setLocalDescription(offer);
    sendSignal(active.roomId, "OFFER", peerId, { type: offer.type, sdp: offer.sdp });
  } catch (error) {
    link.iceRestarted = false;
    console.warn("[voice] ICE restart failed", error);
  } finally {
    link.makingOffer = false;
  }
}

function syncPeers(remoteIds: string[]) {
  const session = active;
  if (!session) return;
  const wanted = new Set(remoteIds);
  for (const peerId of [...session.peers.keys()]) {
    if (!wanted.has(peerId)) closePeer(peerId);
  }
  for (const peerId of remoteIds) {
    if (session.peers.has(peerId)) continue;
    if (shouldOffer(peerId)) {
      void initiateOffer(peerId);
      continue;
    }
    window.setTimeout(() => {
      if (active !== session || session.peers.has(peerId)) return;
      void initiateOffer(peerId, true);
    }, 2000);
  }
}

function enqueueSignal(peerId: string, task: () => Promise<void>) {
  const session = active;
  if (!session) return;
  const previous = session.signalQueue.get(peerId) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      if (active !== session) return;
      await task();
    })
    .catch((error) => {
      console.error("[voice] failed to apply signal from", peerId, error);
    });
  session.signalQueue.set(peerId, next);
}

function applyMute(peerId: string, muted: boolean) {
  if (!peerId || peerId === active?.selfUserId) return;
  useVoiceStore.getState().setParticipantMute(peerId, muted);
}

function rememberSignal(msg: VoiceSignalMessage) {
  const session = active;
  if (!session) return true;
  const key = `${msg.type}:${msg.fromUserId ?? ""}:${JSON.stringify(msg.payload)}`;
  if (session.recentSignals.has(key)) return true;
  session.recentSignals.add(key);
  if (session.recentSignals.size > 200) {
    const oldest = session.recentSignals.values().next().value;
    if (oldest) session.recentSignals.delete(oldest);
  }
  return false;
}

async function applySignal(msg: VoiceSignalMessage) {
  if (!active) return;
  const peerId = msg.fromUserId ?? "";
  if (!peerId || peerId === active.selfUserId) return;
  if (msg.toUserId && msg.toUserId !== active.selfUserId) return;
  if (rememberSignal(msg)) return;

  switch (msg.type) {
    case "OFFER": {
      const description = readDescription(msg.payload);
      if (!description) return;
      const link = createPeer(peerId);
      const polite = active.selfUserId > peerId;
      const collision = link.makingOffer || link.pc.signalingState !== "stable";
      if (collision && !polite) return;
      if (link.pc.signalingState !== "stable") await link.pc.setLocalDescription({ type: "rollback" });
      await link.pc.setRemoteDescription(description);
      await flushCandidates(peerId);
      attachLocalTracks(link.pc);
      const answer = await withLiveMic(() => link.pc.createAnswer());
      await link.pc.setLocalDescription(answer);
      sendSignal(active.roomId, "ANSWER", peerId, { type: answer.type, sdp: answer.sdp });
      break;
    }
    case "ANSWER": {
      const description = readDescription(msg.payload);
      const link = active.peers.get(peerId);
      if (!description || !link || link.pc.signalingState !== "have-local-offer") return;
      await link.pc.setRemoteDescription(description);
      await flushCandidates(peerId);
      break;
    }
    case "ICE_CANDIDATE": {
      const candidate = readCandidate(msg.payload);
      if (!candidate) return;
      const link = active.peers.get(peerId);
      if (!link || !link.pc.remoteDescription) {
        queueCandidate(peerId, candidate);
        return;
      }
      await link.pc.addIceCandidate(candidate);
      break;
    }
    case "HANG_UP": {
      closePeer(peerId);
      useVoiceStore.getState().removeParticipant(peerId);
      break;
    }
    case "MUTE_STATE": {
      const payload = asRecord(msg.payload);
      if (typeof payload?.muted === "boolean") applyMute(peerId, payload.muted);
      break;
    }
    default:
      break;
  }
}

function handleSignal(msg: VoiceSignalMessage) {
  const peerId = msg.fromUserId || "unknown";
  enqueueSignal(peerId, () => applySignal(msg));
}

function handlePresence(msg: VoicePresenceMessage) {
  if (!active) return;
  const remoteParticipants = msg.participants.filter((id) => id && id !== active?.selfUserId);
  useVoiceStore.getState().setParticipants(remoteParticipants);
  if (msg.joined === false && msg.changedUserId && msg.changedUserId !== active.selfUserId) {
    closePeer(msg.changedUserId);
  }
  syncPeers(remoteParticipants);
}

function handleRoomMessage(body: unknown) {
  const presence = normalizePresence(body);
  if (presence) {
    handlePresence(presence);
    return;
  }
  const signal = normalizeSignal(body);
  if (signal) handleSignal(signal);
}

function destroyActive() {
  if (!active) return;
  const session = active;
  active = null;
  joining = null;

  if (session.leaveTimer != null) window.clearTimeout(session.leaveTimer);
  session.removeUnlock?.();
  session.peers.forEach((link) => {
    link.pc.close();
    link.remoteSource?.disconnect();
  });
  session.peers.clear();
  void outputContext?.close();
  outputContext = null;
  session.stream?.getTracks().forEach((track) => track.stop());
  session.unsubs.forEach((unsubscribe) => unsubscribe());

  if (useConnectionStore.getState().connected) sendLeave(session.roomId);
  useVoiceStore.getState().reset();
}

export function retainVoiceSession(roomId: string, selfUserId: string) {
  if (active?.leaveTimer != null) {
    window.clearTimeout(active.leaveTimer);
    active.leaveTimer = null;
  }

  if (active && active.roomId !== roomId) destroyActive();

  if (!active) {
    active = {
      roomId,
      selfUserId,
      stream: null,
      peers: new Map(),
      earlyCandidates: new Map(),
      signalQueue: new Map(),
      recentSignals: new Set(),
      unsubs: [],
      retainers: 0,
      leaveTimer: null,
      removeUnlock: null,
    };
  }

  active.selfUserId = selfUserId;
  active.retainers += 1;

  return () => {
    if (!active || active.roomId !== roomId) return;
    active.retainers -= 1;
    if (active.retainers > 0) return;
    const session = active;
    session.leaveTimer = window.setTimeout(() => {
      if (active === session && session.retainers <= 0) {
        suppressAutoJoin = false;
        destroyActive();
      }
    }, 600);
  };
}

export function shouldAutoJoinVoice(roomId: string) {
  if (suppressAutoJoin) return false;
  if (!roomId || !useConnectionStore.getState().connected) return false;
  if (active?.roomId === roomId && useVoiceStore.getState().joined) return false;
  return true;
}

export async function joinVoiceSession(roomId: string, selfUserId: string) {
  if (!roomId || !selfUserId) return;
  if (!useConnectionStore.getState().connected) return;
  if (active?.roomId === roomId && useVoiceStore.getState().joined) return;
  if (joining) return joining;

  suppressAutoJoin = false;

  if (active && active.roomId !== roomId) destroyActive();
  if (!active) {
    active = {
      roomId,
      selfUserId,
      stream: null,
      peers: new Map(),
      earlyCandidates: new Map(),
      signalQueue: new Map(),
      recentSignals: new Set(),
      unsubs: [],
      retainers: 0,
      leaveTimer: null,
      removeUnlock: null,
    };
  }
  active.selfUserId = selfUserId;

  joining = (async () => {
    const session = active;
    if (!session || session.roomId !== roomId) return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: false,
      });
    } catch (error) {
      console.error("[voice] microphone access denied", error);
      return;
    }

    if (active !== session) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    session.stream = stream;
    if (!session.removeUnlock) installAudioUnlock(session);

    session.unsubs.push(
      stomp.subscribe(Topics.privateVoice, (body) => {
        const signal = normalizeSignal(body);
        if (signal) handleSignal(signal);
      }),
    );

    session.unsubs.push(
      stomp.subscribe(Topics.voiceRoom(roomId), (body) => {
        handleRoomMessage(body);
      }),
    );

    if (active !== session) {
      session.unsubs.forEach((unsubscribe) => unsubscribe());
      session.stream?.getTracks().forEach((track) => track.stop());
      return;
    }

    sendJoin(roomId);
    sendMuteState(roomId, true);
    useVoiceStore.getState().setSelfMuted(true);
    useVoiceStore.getState().setJoined(true);
  })().finally(() => {
    joining = null;
  });

  return joining;
}

export function leaveVoiceSession() {
  suppressAutoJoin = true;
  destroyActive();
}

export function toggleVoiceMute() {
  if (!active?.stream) return;
  const nextMuted = !useVoiceStore.getState().selfMuted;
  const tracks = active.stream.getAudioTracks();
  tracks.forEach((track) => {
    track.enabled = !nextMuted;
  });

  if (!nextMuted) {
    for (const link of active.peers.values()) {
      for (const track of tracks) {
        const sender = link.pc.getSenders().find((item) => item.track?.kind === "audio");
        if (sender) void sender.replaceTrack(track);
        else link.pc.addTrack(track, active.stream as MediaStream);
      }
    }
  }

  useVoiceStore.getState().setSelfMuted(nextMuted);
  if (useConnectionStore.getState().connected) sendMuteState(active.roomId, nextMuted);
  resumeRemotePlayback();
}
