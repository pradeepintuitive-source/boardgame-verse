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
      <div className="mx-auto min-h-screen max-w-2xl px-6 pb-20 pt-28">
        <p className="eyebrow">Preferences</p>
        <h1 className="page-title mb-8">Settings</h1>

        <div className="space-y-4">
          {[
            { key: "sfxVolume" as const, label: "SFX Volume", type: "range" as const },
            { key: "musicVolume" as const, label: "Music Volume", type: "range" as const },
          ].map((f) => (
            <div
              key={f.key}
              className="glass-panel p-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"
            >
              <span className="text-sm font-medium text-white/80">{f.label}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={s[f.key]}
                onChange={(e) => s.set(f.key, Number(e.target.value))}
                className="w-40 accent-[var(--accent-cyan)]"
              />
            </div>
          ))}
          {[
            { key: "reducedMotion" as const, label: "Reduced Motion" },
            { key: "showLatency" as const, label: "Show Server Latency" },
          ].map((f) => (
            <label
              key={f.key}
              className="glass-panel p-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 cursor-pointer"
            >
              <span className="text-sm font-medium text-white/80">{f.label}</span>
              <input
                type="checkbox"
                checked={s[f.key]}
                onChange={(e) => s.set(f.key, e.target.checked)}
                className="size-5 accent-[var(--accent-cyan)]"
              />
            </label>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
