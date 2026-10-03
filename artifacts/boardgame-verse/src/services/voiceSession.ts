import { useConnectionStore } from "../store/connectionStore";
import { useVoiceStore } from "../store/voiceStore";
import { stomp } from "../websocket/stompClient";
import { Topics } from "../websocket/topics";
import {
  sendJoin,
  sendLeave,
  sendMuteState,
  sendSignal,
  type VoicePresenceMessage,
  type VoiceSignalMessage,
} from "./voiceSignaling";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

type ActiveSession = {
  roomId: string;
  selfUserId: string;
  stream: MediaStream | null;
  peers: Map<string, RTCPeerConnection>;
  unsubs: Array<() => void>;
  retainers: number;
  leaveTimer: number | null;
};

let active: ActiveSession | null = null;
let joining: Promise<void> | null = null;
let suppressAutoJoin = false;

function cleanupPeer(peerId: string) {
  const pc = active?.peers.get(peerId);
  if (pc) {
    pc.onicecandidate = null;
    pc.ontrack = null;
    pc.close();
    active?.peers.delete(peerId);
  }
  useVoiceStore.getState().removeParticipant(peerId);
}

function createPeerConnection(peerId: string): RTCPeerConnection {
  if (!active) throw new Error("Voice session is not active");
  const session = active;
  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (event) => {
    if (event.candidate && useConnectionStore.getState().connected) {
      sendSignal(session.roomId, "ICE_CANDIDATE", peerId, {
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
      });
    }
  };

  pc.ontrack = (event) => {
    const [firstStream] = event.streams;
    if (!firstStream) return;
    const audio = new Audio();
    audio.srcObject = firstStream;
    audio.autoplay = true;
    void audio.play().catch(() => {
      // Playback can wait for a user gesture.
    });
  };

  pc.onconnectionstatechange = () => {
    if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
      cleanupPeer(peerId);
    }
  };

  if (session.stream) {
    session.stream.getTracks().forEach((track) => {
      pc.addTrack(track, session.stream as MediaStream);
    });
  }

  session.peers.set(peerId, pc);
  return pc;
}

async function initiateOffer(peerId: string) {
  if (!active || !useConnectionStore.getState().connected) return;
  const pc = createPeerConnection(peerId);
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  sendSignal(active.roomId, "OFFER", peerId, {
    type: offer.type,
    sdp: offer.sdp,
  });
}

async function handleSignal(msg: VoiceSignalMessage) {
  if (!active) return;
  const peerId = msg.fromUserId;
  if (!peerId || peerId === active.selfUserId) return;

  switch (msg.type) {
    case "OFFER": {
      const pc = createPeerConnection(peerId);
      await pc.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(active.roomId, "ANSWER", peerId, {
        type: answer.type,
        sdp: answer.sdp,
      });
      break;
    }
    case "ANSWER": {
      const pc = active.peers.get(peerId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
      }
      break;
    }
    case "ICE_CANDIDATE": {
      const candidatePayload = msg.payload as {
        candidate?: string;
        sdpMid?: string | null;
        sdpMLineIndex?: number;
      };
      const pc = active.peers.get(peerId);
      if (!pc || !candidatePayload.candidate) break;
      await pc.addIceCandidate(
        new RTCIceCandidate({
          candidate: candidatePayload.candidate,
          sdpMid: candidatePayload.sdpMid ?? null,
          sdpMLineIndex: candidatePayload.sdpMLineIndex ?? 0,
        }),
      );
      break;
    }
    case "HANG_UP": {
      cleanupPeer(peerId);
      break;
    }
    case "MUTE_STATE": {
      const payload = msg.payload as { muted?: boolean };
      if (typeof payload.muted === "boolean") {
        useVoiceStore.getState().setParticipantMute(peerId, payload.muted);
      }
      break;
    }
    default:
      break;
  }
}

function handlePresence(msg: VoicePresenceMessage) {
  if (!active) return;
  const remoteParticipants = msg.participants.filter((id) => id !== active?.selfUserId);
  useVoiceStore.getState().setParticipants(remoteParticipants);

  if (msg.joined && msg.changedUserId !== active.selfUserId) {
    useVoiceStore.getState().addParticipant(msg.changedUserId);
    void initiateOffer(msg.changedUserId);
  } else if (!msg.joined) {
    cleanupPeer(msg.changedUserId);
  }
}

function destroyActive() {
  if (!active) return;
  const session = active;
  active = null;
  joining = null;

  if (session.leaveTimer != null) {
    window.clearTimeout(session.leaveTimer);
  }

  session.peers.forEach((pc) => pc.close());
  session.peers.clear();
  session.stream?.getTracks().forEach((track) => track.stop());
  session.unsubs.forEach((unsubscribe) => unsubscribe());

  if (useConnectionStore.getState().connected) {
    sendLeave(session.roomId);
  }

  useVoiceStore.getState().reset();
}

export function retainVoiceSession(roomId: string, selfUserId: string) {
  if (active?.leaveTimer != null) {
    window.clearTimeout(active.leaveTimer);
    active.leaveTimer = null;
  }

  if (active && active.roomId !== roomId) {
    destroyActive();
  }

  if (!active) {
    active = {
      roomId,
      selfUserId,
      stream: null,
      peers: new Map(),
      unsubs: [],
      retainers: 0,
      leaveTimer: null,
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

  if (active && active.roomId !== roomId) {
    destroyActive();
  }
  if (!active) {
    active = {
      roomId,
      selfUserId,
      stream: null,
      peers: new Map(),
      unsubs: [],
      retainers: 0,
      leaveTimer: null,
    };
  }
  active.selfUserId = selfUserId;

  joining = (async () => {
    const session = active;
    if (!session || session.roomId !== roomId) return;

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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

    session.unsubs.push(
      stomp.subscribe(Topics.privateVoice, (body) => {
        const msg = body as VoiceSignalMessage;
        if (msg && typeof msg.type === "string") {
          void handleSignal(msg);
        }
      }),
    );

    session.unsubs.push(
      stomp.subscribe(Topics.voiceRoom(roomId), (body) => {
        const msg = body as Partial<VoicePresenceMessage>;
        if (msg?.type === "VOICE_PRESENCE") {
          handlePresence(msg as VoicePresenceMessage);
        }
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
  if (!active) return;
  const nextMuted = !useVoiceStore.getState().selfMuted;
  active.stream?.getAudioTracks().forEach((track) => {
    track.enabled = !nextMuted;
  });
  useVoiceStore.getState().setSelfMuted(nextMuted);
  if (useConnectionStore.getState().connected) {
    sendMuteState(active.roomId, nextMuted);
  }
}
