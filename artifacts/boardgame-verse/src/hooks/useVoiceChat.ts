import { useEffect } from "react";
import { useConnectionStore } from "../store/connectionStore";
import { useVoiceStore } from "../store/voiceStore";
import {
  joinVoiceSession,
  leaveVoiceSession,
  retainVoiceSession,
  shouldAutoJoinVoice,
  toggleVoiceMute,
} from "../services/voiceSession";

export function useVoiceChat(roomId: string, selfUserId: string) {
  const joined = useVoiceStore((state) => state.joined);
  const selfMuted = useVoiceStore((state) => state.selfMuted);
  const participants = useVoiceStore((state) => state.participants);
  const isConnected = useConnectionStore((state) => state.connected);

  useEffect(() => retainVoiceSession(roomId, selfUserId), [roomId, selfUserId]);

  useEffect(() => {
    if (!shouldAutoJoinVoice(roomId)) return;
    void joinVoiceSession(roomId, selfUserId);
  }, [isConnected, roomId, selfUserId]);

  return {
    joined,
    selfMuted,
    participants: Object.values(participants),
    joinVoice: () => joinVoiceSession(roomId, selfUserId),
    leaveVoice: leaveVoiceSession,
    toggleMute: toggleVoiceMute,
  };
}
