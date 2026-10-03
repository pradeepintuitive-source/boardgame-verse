import { Topics } from "../websocket/topics";
import { stomp } from "../websocket/stompClient";

export type SignalType = "OFFER" | "ANSWER" | "ICE_CANDIDATE" | "HANG_UP" | "MUTE_STATE";

export interface VoiceSignalMessage {
  type: SignalType;
  roomId?: string;
  fromUserId?: string;
  toUserId?: string;
  payload: unknown;
  timestamp?: string;
}

export interface VoicePresenceMessage {
  type: "VOICE_PRESENCE";
  roomId: string;
  participants: string[];
  changedUserId: string;
  joined: boolean;
}

export function sendJoin(roomId: string) {
  stomp.sendMessage(Topics.send.voiceJoin(roomId), { roomId });
}

export function sendLeave(roomId: string) {
  stomp.sendMessage(Topics.send.voiceLeave(roomId), { roomId });
}

export function sendSignal(roomId: string, type: SignalType, toUserId: string, payload: unknown) {
  stomp.sendMessage(Topics.send.voiceSignal(roomId), {
    type,
    toUserId,
    payload,
  });
}

export function sendMuteState(roomId: string, muted: boolean) {
  stomp.sendMessage(Topics.send.voiceMute(roomId), { muted });
}
