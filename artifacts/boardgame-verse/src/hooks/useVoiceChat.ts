import { useCallback, useEffect, useRef } from "react";
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
} from "../services/voiceSignaling";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useVoiceChat(roomId: string, selfUserId: string) {
  const store = useVoiceStore();
  const isConnected = useConnectionStore((state) => state.connected);
  const peerConns = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStream = useRef<MediaStream | null>(null);
  const subscriptions = useRef<Array<() => void>>([]);

  const cleanupPeer = useCallback(
    (peerId: string) => {
      const pc = peerConns.current.get(peerId);
      if (pc) {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.close();
        peerConns.current.delete(peerId);
      }
      store.removeParticipant(peerId);
    },
    [store],
  );

  const createPeerConnection = useCallback(
    (peerId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate && isConnected) {
          sendSignal(roomId, "ICE_CANDIDATE", peerId, {
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
        audio.muted = false;
        void audio.play().catch(() => {
          // Browser autoplay restrictions may block playback until the user interacts.
        });
      };

      pc.onconnectionstatechange = () => {
        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
          cleanupPeer(peerId);
        }
      };

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStream.current as MediaStream);
        });
      }

      peerConns.current.set(peerId, pc);
      return pc;
    },
    [cleanupPeer, isConnected, roomId],
  );

  const handleSignal = useCallback(
    async (msg: VoiceSignalMessage) => {
      const peerId = msg.fromUserId;
      if (!peerId || peerId === selfUserId) return;

      switch (msg.type) {
        case "OFFER": {
          const pc = createPeerConnection(peerId);
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(roomId, "ANSWER", peerId, {
            type: answer.type,
            sdp: answer.sdp,
          });
          break;
        }
        case "ANSWER": {
          const pc = peerConns.current.get(peerId);
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
          const pc = peerConns.current.get(peerId);
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
            store.setParticipantMute(peerId, payload.muted);
          }
          break;
        }
        default:
          break;
      }
    },
    [cleanupPeer, createPeerConnection, roomId, selfUserId, store],
  );

  const initiateOffer = useCallback(
    async (peerId: string) => {
      if (!isConnected) return;
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(roomId, "OFFER", peerId, {
        type: offer.type,
        sdp: offer.sdp,
      });
    },
    [createPeerConnection, isConnected, roomId],
  );

  const handlePresence = useCallback(
    (msg: VoicePresenceMessage) => {
      const remoteParticipants = msg.participants.filter((id) => id !== selfUserId);
      store.setParticipants(remoteParticipants);

      if (msg.joined && msg.changedUserId !== selfUserId) {
        store.addParticipant(msg.changedUserId);
        void initiateOffer(msg.changedUserId);
      } else if (!msg.joined) {
        cleanupPeer(msg.changedUserId);
      }
    },
    [cleanupPeer, initiateOffer, selfUserId, store],
  );

  const joinVoice = useCallback(async () => {
    if (!isConnected || store.joined || !roomId) return;

    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (error) {
      console.error("[voice] microphone access denied", error);
      return;
    }

    subscriptions.current.push(
      stomp.subscribe(Topics.privateVoice, (body) => {
        const msg = body as VoiceSignalMessage;
        if (msg && typeof msg.type === "string") {
          void handleSignal(msg);
        }
      }),
    );

    subscriptions.current.push(
      stomp.subscribe(Topics.voiceRoom(roomId), (body) => {
        const msg = body as Partial<VoicePresenceMessage>;
        if (msg?.type === "VOICE_PRESENCE") {
          handlePresence(msg as VoicePresenceMessage);
        }
      }),
    );

    sendJoin(roomId);
    store.setJoined(true);
  }, [handlePresence, handleSignal, isConnected, roomId, store]);

  const leaveVoice = useCallback(() => {
    if (!store.joined) return;

    peerConns.current.forEach((pc) => pc.close());
    peerConns.current.clear();

    localStream.current?.getTracks().forEach((track) => track.stop());
    localStream.current = null;

    subscriptions.current.forEach((unsubscribe) => unsubscribe());
    subscriptions.current = [];

    if (isConnected) {
      sendLeave(roomId);
    }

    store.reset();
  }, [isConnected, roomId, store]);

  const toggleMute = useCallback(() => {
    const nextMuted = !store.selfMuted;

    localStream.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    store.setSelfMuted(nextMuted);
    if (isConnected) {
      sendMuteState(roomId, nextMuted);
    }
  }, [isConnected, roomId, store]);

  useEffect(() => {
    return () => {
      leaveVoice();
    };
  }, [leaveVoice]);

  return {
    joined: store.joined,
    selfMuted: store.selfMuted,
    participants: Object.values(store.participants),
    joinVoice,
    leaveVoice,
    toggleMute,
  };
}
