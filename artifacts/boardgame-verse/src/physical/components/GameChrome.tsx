import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { RULES_SUMMARY } from "../data/catalog";
import { finishGame, setMortgageInterest, undo } from "../engine/engine";
import { downloadName, exportGame, parseImportedGame } from "../persist/exportGame";
import { usePhysicalStore } from "../store/physicalStore";
import type { PhysicalGame } from "../types";
import { Connectivity } from "./HubScreen";
import { BigButton, Sheet } from "./ui";
import "../physical.css";

export function GameChrome({ children }: { children: ReactNode }) {
  const { gameId } = useParams({ from: "/physical/$gameId" });
  const load = usePhysicalStore((state) => state.load);
  const game = usePhysicalStore((state) => state.game);
  const loading = usePhysicalStore((state) => state.loading);
  const error = usePhysicalStore((state) => state.error);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    void load(gameId);
  }, [gameId, load]);

  if (loading || !game || game.id !== gameId) {
    return (
      <div className="physical-app grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="text-lg">{error ?? "Opening the saved game…"}</p>
          {error ? (
            <Link to="/physical" className="mt-4 inline-block text-[#e6b325]">
              Saved games
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="physical-app">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07140f]/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e6b325]">Bharat Business · Physical</p>
            <p className="text-sm text-white/70">
              {game.name} · #{game.id.replace("LOCAL-BB-", "")}
            </p>
          </div>
          <MoreMenu game={game} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg px-4 pt-4 pb-nav">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#07140f]/95 px-2 pt-2 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide">
          <NavLink to="/physical/$gameId" params={{ gameId }} active={pathname.endsWith(gameId) || pathname.endsWith(`${gameId}/`)} label="Game" />
          <NavLink to="/physical/$gameId/money" params={{ gameId }} active={pathname.endsWith("/money")} label="Money" />
          <NavLink to="/physical/$gameId/properties" params={{ gameId }} active={pathname.endsWith("/properties")} label="Properties" />
          <NavLink to="/physical/$gameId/players" params={{ gameId }} active={pathname.endsWith("/players")} label="Players" />
          <NavLink to="/physical/$gameId/history" params={{ gameId }} active={pathname.endsWith("/history")} label="History" />
        </div>
      </nav>
    </div>
  );
}

function NavLink({
  to,
  params,
  active,
  label,
}: {
  to: "/physical/$gameId" | "/physical/$gameId/money" | "/physical/$gameId/properties" | "/physical/$gameId/players" | "/physical/$gameId/history";
  params: { gameId: string };
  active: boolean;
  label: string;
}) {
  return (
    <Link to={to} params={params} className={`rounded-xl px-1 py-2 ${active ? "bg-[#e6b325] text-[#1a1404]" : "text-white/70"}`}>
      {label}
    </Link>
  );
}

function MoreMenu({ game }: { game: PhysicalGame }) {
  const [open, setOpen] = useState<null | "menu" | "rules" | "settings">(null);
  const apply = usePhysicalStore((state) => state.apply);
  const adopt = usePhysicalStore((state) => state.adopt);
  const remove = usePhysicalStore((state) => state.remove);
  const error = usePhysicalStore((state) => state.error);
  const [interest, setInterest] = useState(String(game.mortgageInterestPercent));

  function download() {
    const blob = new Blob([JSON.stringify(exportGame(game), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadName(game);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button type="button" className="min-h-11 rounded-full border border-white/15 px-4 text-sm" onClick={() => setOpen("menu")}>
        More
      </button>
      {open ? (
        <Sheet title={open === "rules" ? "Rules" : open === "settings" ? "Settings" : "More"} onClose={() => setOpen(null)}>
          {open === "menu" ? (
            <div className="flex flex-col gap-2">
              <BigButton tone="ghost" onClick={() => void apply(undo(game))}>
                Undo last action
              </BigButton>
              <BigButton tone="ghost" onClick={download}>
                Export backup
              </BigButton>
              <label className="block">
                <span className="mb-1 block text-center text-sm text-white/60">Import into this device</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  className="w-full text-sm"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const parsed = parseImportedGame(JSON.parse(String(reader.result)));
                        void adopt(parsed);
                        setOpen(null);
                      } catch (reason) {
                        window.alert(reason instanceof Error ? reason.message : "Import failed.");
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
              <Link to="/physical/$gameId/board" params={{ gameId: game.id }} onClick={() => setOpen(null)}>
                <BigButton tone="ghost">Board reference</BigButton>
              </Link>
              <BigButton tone="ghost" onClick={() => setOpen("rules")}>
                Rules
              </BigButton>
              <BigButton tone="ghost" onClick={() => setOpen("settings")}>
                Settings
              </BigButton>
              <BigButton
                tone="danger"
                onClick={() => {
                  if (window.confirm("End the game and rank players by net worth?")) void apply(finishGame(game));
                }}
              >
                End game
              </BigButton>
              <BigButton
                tone="danger"
                onClick={() => {
                  if (window.confirm("Delete this saved game from the device?")) {
                    void remove(game.id).then(() => {
                      window.location.assign("/physical");
                    });
                  }
                }}
              >
                Delete saved game
              </BigButton>
              <Connectivity />
              {import.meta.env.DEV ? <Debug game={game} /> : null}
              {error ? <p className="text-sm text-[#ffb4b4]">{error}</p> : null}
            </div>
          ) : null}
          {open === "rules" ? (
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-white/80">
              {RULES_SUMMARY.map((rule) => (
                <div key={rule.heading}>
                  <p className="font-semibold text-white">{rule.heading}</p>
                  <p>{rule.body}</p>
                </div>
              ))}
              <p>
                Mortgage interest is not printed on the photographed page, so release costs the mortgage value until you set a percent. Income tax, jail fines, and bankruptcy are only partly specified; the console marks those gaps.
              </p>
            </div>
          ) : null}
          {open === "settings" ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white/70">
                Interest added when a mortgage is released. The photographed sheet does not state a rate, so this stays at 0 until the table sets one.
              </p>
              <input
                inputMode="numeric"
                value={interest}
                onChange={(event) => setInterest(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                className="min-h-12 rounded-2xl border border-white/10 bg-black/30 px-3 text-2xl"
              />
              <BigButton onClick={() => void apply(setMortgageInterest(game, Number(interest || 0)))}>Save interest</BigButton>
            </div>
          ) : null}
        </Sheet>
      ) : null}
    </>
  );
}

function Debug({ game }: { game: PhysicalGame }) {
  return (
    <p className="rounded-2xl bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-white/70">
      {game.id}
      <br />
      Turn {game.turnNumber} · pos {game.players[game.currentPlayerIndex]?.position}
      <br />
      IndexedDB bharat-business-physical
      <br />
      Events {game.events.length} · Txn {game.transactions.length}
    </p>
  );
}
