import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { parseImportedGame } from "../persist/exportGame";
import { usePhysicalStore } from "../store/physicalStore";
import { ago, BigButton, Card } from "./ui";
import "../physical.css";

export function HubScreen() {
  const summaries = usePhysicalStore((state) => state.summaries);
  const refreshList = usePhysicalStore((state) => state.refreshList);
  const adopt = usePhysicalStore((state) => state.adopt);
  const error = usePhysicalStore((state) => state.error);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedId, setImportedId] = useState<string | null>(null);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  const unfinished = summaries.filter((game) => game.status === "active");

  return (
    <div className="physical-app">
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 px-4 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e6b325]">Bharat Business</p>
        <h1 className="display text-5xl uppercase leading-none">Physical board game</h1>
        <p className="text-sm leading-relaxed text-white/70">
          The board, tokens, and dice stay on the table. This phone is the banker. Play continues with no server after the app has loaded.
        </p>
        <Connectivity />
        {error ? <p className="rounded-2xl bg-[#8f2d2d]/40 px-3 py-2 text-sm">{error}</p> : null}
        {importError ? <p className="rounded-2xl bg-[#8f2d2d]/40 px-3 py-2 text-sm">{importError}</p> : null}
        {importedId ? (
          <Link to="/physical/$gameId" params={{ gameId: importedId }}>
            <BigButton>Open imported game</BigButton>
          </Link>
        ) : null}
        <Link to="/physical/setup">
          <BigButton>Start new game</BigButton>
        </Link>
        <label className="block">
          <span className="mb-2 block text-center text-sm text-white/60">Import a backup</span>
          <input
            type="file"
            accept="application/json,.json"
            className="block w-full text-sm"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setImportError(null);
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const parsed = JSON.parse(String(reader.result));
                  const game = parseImportedGame(parsed);
                  void adopt(game).then((ok) => {
                    if (ok) setImportedId(game.id);
                    else setImportError("Unable to save the game locally. Please export a backup before continuing.");
                  });
                } catch (reason) {
                  setImportError(reason instanceof Error ? reason.message : "That file is not a physical game backup.");
                }
              };
              reader.readAsText(file);
            }}
          />
        </label>
        <h2 className="display mt-2 text-2xl uppercase">Saved games</h2>
        {unfinished.length === 0 ? <p className="text-sm text-white/50">No unfinished game on this device.</p> : null}
        {summaries.map((game) => (
          <Link key={game.id} to="/physical/$gameId" params={{ gameId: game.id }}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{game.name}</p>
                  <p className="text-sm text-white/60">
                    {game.playerCount} players · Turn {game.turnNumber}
                  </p>
                  <p className="text-sm text-white/60">Now: {game.currentPlayerName}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{ago(game.updatedAt)}</p>
                </div>
                <span className="rounded-full bg-[#e6b325] px-3 py-1 text-xs font-bold text-[#1a1404]">
                  {game.status === "active" ? "Resume" : "Finished"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
        <Link to="/" className="mt-4 text-center text-sm text-white/50">
          Back to GameHub
        </Link>
      </main>
    </div>
  );
}

export function Connectivity() {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return (
    <p className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm">
      {online ? "Online" : "Offline mode"}
      <span className="mt-1 block text-white/60">
        {online
          ? "Physical play still stays on this device."
          : "All game data is safely stored on this device."}
      </span>
    </p>
  );
}
