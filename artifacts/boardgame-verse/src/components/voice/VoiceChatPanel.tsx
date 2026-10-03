import { PhoneCall, PhoneOff } from "lucide-react";
import { useState } from "react";
import { useConnectionStore } from "../../store/connectionStore";
import { useVoiceChat } from "../../hooks/useVoiceChat";
import { MicButton } from "./MicButton";
import { VoiceParticipant } from "./VoiceParticipant";

type UserLookup = Record<string, { username?: string; avatarColor?: string }>;

interface VoiceChatPanelProps {
  roomId: string;
  selfUserId: string;
  userLookup?: UserLookup;
  compact?: boolean;
}

export function VoiceChatPanel({ roomId, selfUserId, userLookup = {}, compact = false }: VoiceChatPanelProps) {
  const { joined, selfMuted, participants, joinVoice, leaveVoice, toggleMute } = useVoiceChat(roomId, selfUserId);
  const connected = useConnectionStore((state) => state.connected);
  const [expanded, setExpanded] = useState(false);

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

  if (compact) {
    return (
      <div className="relative z-[60] shrink-0">
        <button
          type="button"
          aria-label="Open voice chat controls"
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
          className={`inline-flex h-8 items-center gap-1.5 border px-2.5 text-[9px] font-mono uppercase tracking-widest transition-colors ${
            joined
              ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300"
              : "border-white/20 bg-black/40 text-white/75 hover:border-accent-cyan hover:text-accent-cyan"
          }`}
        >
          <PhoneCall className="size-3.5" />
          Voice
          {joined && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
        </button>

        {expanded && (
          <div className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] border border-white/15 bg-[#090c0e]/95 p-3 text-white shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <div className="text-[8px] font-mono uppercase tracking-[0.25em] text-accent-cyan">
                  Live channel
                </div>
                <div className="font-display text-lg italic uppercase">Voice chat</div>
              </div>
              <span className={`text-[8px] font-mono uppercase tracking-widest ${joined ? "text-emerald-300" : connected ? "text-white/45" : "text-accent-amber"}`}>
                {joined ? "Live" : connected ? "Ready" : "Offline"}
              </span>
            </div>

            {joined ? (
              <>
                {participants.length > 0 ? (
                  <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
                    {participants.map((participant) => (
                      <VoiceParticipant
                        key={participant.userId}
                        userId={participant.userId}
                        displayName={resolveDisplayName(participant.userId)}
                        avatarColor={resolveAvatarColor(participant.userId)}
                        muted={participant.muted}
                        speaking={participant.speaking}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mb-3 text-[10px] font-mono text-white/45">
                    You’re connected. Waiting for other players to join voice.
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <MicButton muted={selfMuted} onToggle={toggleMute} />
                  <button
                    type="button"
                    onClick={leaveVoice}
                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 border border-red-400/40 bg-red-500/15 text-xs font-mono uppercase tracking-widest text-red-200 hover:bg-red-500/30"
                  >
                    <PhoneOff className="size-3.5" /> Leave voice
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-3 text-[10px] font-mono leading-relaxed text-white/55">
                  Join voice to talk with players in this room. Your browser will ask for microphone access.
                </p>
                <button
                  type="button"
                  disabled={!connected}
                  onClick={() => void joinVoice()}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 bg-accent-cyan text-black text-xs font-mono uppercase tracking-widest hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PhoneCall className="size-3.5" />
                  {connected ? "Join voice" : "Waiting for connection"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

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
