import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  muted: boolean;
  onToggle: () => void;
}

export function MicButton({ muted, onToggle }: MicButtonProps) {
  return (
    <button
      type="button"
      title={muted ? "Unmute microphone" : "Mute microphone"}
      onClick={onToggle}
      className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
        muted ? "bg-red-500 hover:bg-red-400 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-white"
      }`}
    >
      {muted ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
