import { PhoneCall, PhoneOff } from "lucide-react";
import { useVoiceChat } from "../../hooks/useVoiceChat";
import { MicButton } from "./MicButton";
import { VoiceParticipant } from "./VoiceParticipant";

type UserLookup = Record<string, { username?: string; avatarColor?: string }>;

interface VoiceChatPanelProps {
  roomId: string;
  selfUserId: string;
  userLookup?: UserLookup;
}

export function VoiceChatPanel({ roomId, selfUserId, userLookup = {} }: VoiceChatPanelProps) {
  const { joined, selfMuted, participants, joinVoice, leaveVoice, toggleMute } = useVoiceChat(roomId, selfUserId);

  const resolveDisplayName = (userId: string) => {
    const user = userLookup[userId];
    if (user?.username) return user.username;
    return userId.slice(0, 8);
  };

  const resolveAvatarColor = (userId: string) => {
    const user = userLookup[userId];
    if (user?.avatarColor) return user.avatarColor;
    return "#4ecdc4";
  };

  return (
    <div className="glass-panel border border-white/10 p-4 text-white">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-accent-cyan">Voice Chat</div>
        <div className={`inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.25em] ${joined ? "text-emerald-400" : "text-white/40"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${joined ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
          {joined ? "Live" : "Offline"}
        </div>
      </div>

      {joined && participants.length > 0 ? (
        <div className="space-y-2 pb-2">
          {participants.map((p) => (
            <VoiceParticipant
              key={p.userId}
              userId={p.userId}
              displayName={resolveDisplayName(p.userId)}
              avatarColor={resolveAvatarColor(p.userId)}
              muted={p.muted}
              speaking={p.speaking}
            />
          ))}
        </div>
      ) : (
        <div className="mb-3 rounded-xl border border-dashed border-white/10 bg-white/3 px-3 py-3 text-[10px] font-mono uppercase tracking-[0.25em] text-white/35">
          {joined ? "Waiting for peers" : "Join to enable audio"}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {joined && <MicButton muted={selfMuted} onToggle={toggleMute} />}

        <button
          type="button"
          onClick={() => (joined ? leaveVoice() : void joinVoice())}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            joined ? "bg-red-500/80 hover:bg-red-500 text-white" : "bg-accent-cyan/80 hover:bg-accent-cyan text-slate-950"
          }`}
        >
          {joined ? <PhoneOff size={16} /> : <PhoneCall size={16} />}
          {joined ? "Leave" : "Join"}
        </button>
      </div>
    </div>
  );
}
