import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../components/layout/AppShell";
import { useSettingsStore } from "../store/settingsStore";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GameHub" },
      { name: "description", content: "Configure GameHub preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSettingsStore();

  return (
    <AppShell>
      <div className="min-h-screen px-6 pt-32 pb-20 max-w-2xl mx-auto">
        <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#d4a843] mb-2 font-bold">
          System Preferences
        </div>
        <h1 className="font-display text-5xl font-bold uppercase mb-8 gold-text-glow">Settings</h1>

        <div className="space-y-4">
          {[
            { key: "sfxVolume" as const, label: "SFX Volume", type: "range" as const },
            { key: "musicVolume" as const, label: "Music Volume", type: "range" as const },
          ].map((f) => (
            <div
              key={f.key}
              className="glass-panel p-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-[rgba(212,168,67,0.2)]"
            >
              <span className="text-sm font-mono uppercase tracking-widest text-[#9baab8]">
                {f.label}
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s[f.key]}
                onChange={(e) => s.set(f.key, Number(e.target.value))}
                className="w-40 accent-[#d4a843]"
              />
            </div>
          ))}
          {[
            { key: "reducedMotion" as const, label: "Reduced Motion" },
            { key: "showLatency" as const, label: "Show Server Latency" },
          ].map((f) => (
            <label
              key={f.key}
              className="glass-panel p-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 cursor-pointer border-[rgba(212,168,67,0.2)] hover:border-[#d4a843] transition-colors"
            >
              <span className="text-sm font-mono uppercase tracking-widest text-[#9baab8]">
                {f.label}
              </span>
              <input
                type="checkbox"
                checked={s[f.key]}
                onChange={(e) => s.set(f.key, e.target.checked)}
                className="size-5 accent-[#d4a843]"
              />
            </label>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
