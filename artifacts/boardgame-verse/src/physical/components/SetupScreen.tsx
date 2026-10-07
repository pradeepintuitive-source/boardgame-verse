import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  DEFAULT_STARTING_CAPITAL,
  MAX_STARTING_CAPITAL,
  MIN_STARTING_CAPITAL,
  PLAYER_COLOR_OPTIONS,
} from "../data/catalog";
import { createGame } from "../engine/engine";
import { formatInr } from "../money";
import { usePhysicalStore } from "../store/physicalStore";
import { BigButton, Card, FieldLabel, playerHex } from "./ui";
import "../physical.css";

interface DraftPlayer {
  name: string;
  color: string;
}

export function SetupScreen() {
  const navigate = useNavigate();
  const adopt = usePhysicalStore((state) => state.adopt);
  const [name, setName] = useState("Saturday Game");
  const [capital, setCapital] = useState(DEFAULT_STARTING_CAPITAL);
  const [players, setPlayers] = useState<DraftPlayer[]>([
    { name: "", color: "green" },
    { name: "", color: "blue" },
  ]);
  const [first, setFirst] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rolls, setRolls] = useState<number[]>([0, 0]);

  function addPlayer() {
    if (players.length >= 6) return;
    const used = new Set(players.map((player) => player.color));
    const color = PLAYER_COLOR_OPTIONS.find((option) => !used.has(option.id))?.id ?? "purple";
    setPlayers([...players, { name: "", color }]);
    setRolls([...rolls, 0]);
  }

  function highestRoller() {
    let best = 0;
    rolls.forEach((roll, index) => {
      if (roll > (rolls[best] ?? 0)) best = index;
    });
    if (Math.max(...rolls) > 0) setFirst(best);
  }

  async function start() {
    const result = createGame({
      name,
      startingCapital: capital,
      firstPlayerIndex: first,
      players,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const saved = await adopt(result.state);
    if (!saved) {
      setError("Unable to save the game locally. Please export a backup before continuing.");
      return;
    }
    await navigate({ to: "/physical/$gameId", params: { gameId: result.state.id } });
  }

  return (
    <div className="physical-app">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6 pb-10">
        <h1 className="display text-4xl uppercase">Physical game</h1>
        <Card>
          <FieldLabel>Game name</FieldLabel>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-3 text-lg"
          />
        </Card>
        <Card>
          <FieldLabel>Starting capital</FieldLabel>
          <p className="mb-3 text-3xl font-semibold text-[#e6b325]">{formatInr(capital)}</p>
          <input
            type="range"
            min={MIN_STARTING_CAPITAL}
            max={MAX_STARTING_CAPITAL}
            step={5000}
            value={capital}
            onChange={(event) => setCapital(Number(event.target.value))}
            className="w-full"
          />
          <p className="mt-2 text-xs text-white/50">The rule sheet allows ₹30,000 to ₹50,000, the same for every player.</p>
        </Card>
        {players.map((player, index) => (
          <Card key={index}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/50">Player {index + 1}</p>
              {players.length > 2 ? (
                <button
                  type="button"
                  className="text-sm text-white/50"
                  onClick={() => {
                    setPlayers(players.filter((_, item) => item !== index));
                    setFirst(0);
                  }}
                >
                  Remove
                </button>
              ) : null}
            </div>
            <input
              value={player.name}
              placeholder="Name"
              onChange={(event) => {
                const next = [...players];
                const current = next[index];
                if (!current) return;
                next[index] = { ...current, name: event.target.value };
                setPlayers(next);
              }}
              className="mb-3 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-3 text-lg"
            />
            <div className="flex flex-wrap gap-2">
              {PLAYER_COLOR_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={option.label}
                  onClick={() => {
                    const next = [...players];
                    const current = next[index];
                    if (!current) return;
                    next[index] = { ...current, color: option.id };
                    setPlayers(next);
                  }}
                  className={`h-11 w-11 rounded-full border-2 ${player.color === option.id ? "border-white" : "border-transparent"}`}
                  style={{ background: option.hex }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <FieldLabel>Opening roll</FieldLabel>
              <input
                inputMode="numeric"
                value={rolls[index] ?? ""}
                onChange={(event) => {
                  const next = [...rolls];
                  next[index] = Number(event.target.value.replace(/[^\d]/g, "").slice(0, 2));
                  setRolls(next);
                }}
                className="h-11 w-20 rounded-xl border border-white/10 bg-black/30 text-center text-lg"
              />
            </div>
          </Card>
        ))}
        {players.length < 6 ? (
          <BigButton tone="ghost" onClick={addPlayer}>
            Add player
          </BigButton>
        ) : null}
        <BigButton tone="ghost" onClick={highestRoller}>
          Highest roll starts
        </BigButton>
        <Card>
          <FieldLabel>First player</FieldLabel>
          <div className="flex flex-col gap-2">
            {players.map((player, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setFirst(index)}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left ${first === index ? "bg-white/10" : ""}`}
              >
                <span className="h-4 w-4 rounded-full" style={{ background: playerHex(player.color) }} />
                {player.name || `Player ${index + 1}`}
              </button>
            ))}
          </div>
        </Card>
        {error ? <p className="rounded-2xl bg-[#8f2d2d]/40 px-3 py-2 text-sm">{error}</p> : null}
        <BigButton onClick={() => void start()}>Start game</BigButton>
      </main>
    </div>
  );
}
