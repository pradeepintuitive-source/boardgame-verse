import { Mic, MicOff } from "lucide-react";
import { Avatar } from "../common/Avatar";

interface VoiceParticipantProps {
  userId: string;
  displayName: string;
  avatarColor?: string;
  muted: boolean;
  speaking: boolean;
}

export function VoiceParticipant({ userId, displayName, avatarColor, muted, speaking }: VoiceParticipantProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-all ${
        speaking ? "border-emerald-400/70 bg-emerald-500/10" : "border-white/10 bg-white/3"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar name={displayName || userId} color={avatarColor ?? "#4ecdc4"} size={32} />
        <span
          className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-background ${
            muted ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
          }`}
        >
          {muted ? <MicOff size={10} /> : <Mic size={10} />}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white/85">{displayName || userId}</div>
        <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/40">
          {speaking ? "Speaking" : muted ? "Muted" : "Listening"}
        </div>
      </div>
    </div>
  );
}
