import type { MafiaPlayer, MafiaRole, MafiaState, ModeratorMessage, Player } from "../models";
import { uid } from "./ids";

/**
 * Local Mafia game engine.
 * Drives single-device & AI moderator narration. Pure functions on state.
 */

const NARRATIONS = {
  start: "The town gathers. Strangers among us. The game begins.",
  nightFall: (round: number) =>
    `Night ${round} has fallen. The town sleeps... but not all close their eyes.`,
  mafiaWakes: "The Mafia opens their eyes and choose their target.",
  detectiveWakes: "The Detective investigates one player in the shadows.",
  doctorWakes: "The Doctor moves silently, choosing one soul to protect.",
  dawn: (round: number) => `Dawn breaks on day ${round}. The town awakens.`,
  killed: (name: string) => `${name} was found at sunrise. They will not see another night.`,
  saved: "A scream in the dark — but no body. The Doctor's hand was steady tonight.",
  voting: "The town gathers in the square. Voting begins now.",
  eliminated: (name: string) => `${name} was eliminated by the town's vote.`,
  noKill: "The night passed without bloodshed.",
  mafiaWin: "The Mafia have taken the town. Game over.",
  villagerWin: "The Mafia have been driven out. The town is safe — for now.",
};

export function assignRoles(players: Player[]): MafiaPlayer[] {
  const n = players.length;
  const mafiaCount = Math.max(1, Math.floor(n / 4));
  const hasDetective = n >= 5;
  const hasDoctor = n >= 6;

  const roles: MafiaRole[] = [
    ...Array(mafiaCount).fill("mafia") as MafiaRole[],
    ...(hasDetective ? (["detective"] as MafiaRole[]) : []),
    ...(hasDoctor ? (["doctor"] as MafiaRole[]) : []),
  ];
  while (roles.length < n) roles.push("villager");

  // shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return players.map((p, idx) => ({
    ...p,
    role: roles[idx],
    alive: true,
    votedFor: null,
  }));
}

export function initMafiaGame(gameId: string, players: Player[]): MafiaState {
  return {
    gameId,
    phase: "night",
    round: 1,
    players: assignRoles(players),
    log: [
      mod(NARRATIONS.start, "announcement"),
      mod(NARRATIONS.nightFall(1), "narration"),
      mod(NARRATIONS.mafiaWakes, "rule"),
    ],
    nightActions: {},
    winner: null,
  };
}

export function mod(text: string, kind: ModeratorMessage["kind"] = "narration"): ModeratorMessage {
  return { id: uid("mod"), text, kind, ts: Date.now() };
}

function checkWin(players: MafiaPlayer[]): MafiaState["winner"] {
  const aliveMafia = players.filter((p) => p.alive && p.role === "mafia").length;
  const aliveOther = players.filter((p) => p.alive && p.role !== "mafia").length;
  if (aliveMafia === 0) return "villagers";
  if (aliveMafia >= aliveOther) return "mafia";
  return null;
}

/** Run all AI night actions; resolve into morning. */
export function resolveNight(state: MafiaState): MafiaState {
  const actions = { ...state.nightActions };
  // AI-driven choices for any role that didn't act
  const aliveByRole = (r: MafiaRole) => state.players.filter((p) => p.alive && p.role === r);
  const rndPick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

  // Mafia consensus = first mafia actor's pick, or AI pick a non-mafia
  const mafiaActors = aliveByRole("mafia");
  let mafiaTarget = mafiaActors.map((m) => actions[m.id]).find(Boolean) ?? null;
  if (!mafiaTarget) {
    const targets = state.players.filter((p) => p.alive && p.role !== "mafia");
    mafiaTarget = targets.length ? rndPick(targets).id : null;
  }
  const doctor = aliveByRole("doctor")[0];
  let doctorTarget = doctor ? actions[doctor.id] : null;
  if (doctor && doctor.isAI && !doctorTarget) {
    doctorTarget = rndPick(state.players.filter((p) => p.alive)).id;
  }
  const detective = aliveByRole("detective")[0];
  // detective's result is just narrated to themselves; not used to mutate state here.

  const log: ModeratorMessage[] = [...state.log];
  let players = state.players;

  if (mafiaTarget && mafiaTarget !== doctorTarget) {
    players = players.map((p) => (p.id === mafiaTarget ? { ...p, alive: false } : p));
    const victim = state.players.find((p) => p.id === mafiaTarget);
    log.push(mod(NARRATIONS.dawn(state.round), "narration"));
    if (victim) log.push(mod(NARRATIONS.killed(victim.username), "announcement"));
  } else {
    log.push(mod(NARRATIONS.dawn(state.round), "narration"));
    log.push(mod(mafiaTarget ? NARRATIONS.saved : NARRATIONS.noKill, "announcement"));
  }

  if (detective && actions[detective.id]) {
    const target = state.players.find((p) => p.id === actions[detective.id]);
    if (target) {
      log.push(
        mod(
          `(Detective ${detective.username} learns: ${target.username} is ${target.role === "mafia" ? "MAFIA" : "NOT mafia"}.)`,
          "system",
        ),
      );
    }
  }

  const winner = checkWin(players);
  const phase: MafiaState["phase"] = winner ? "ended" : "day";
  if (winner) {
    log.push(mod(winner === "mafia" ? NARRATIONS.mafiaWin : NARRATIONS.villagerWin, "announcement"));
  } else {
    log.push(mod("Discuss. Suspect. When you're ready, the town will vote.", "rule"));
  }

  return {
    ...state,
    players: players.map((p) => ({ ...p, votedFor: null })),
    phase,
    nightActions: {},
    log,
    winner: winner ?? null,
  };
}

export function beginVoting(state: MafiaState): MafiaState {
  return {
    ...state,
    phase: "voting",
    log: [...state.log, mod(NARRATIONS.voting, "rule")],
  };
}

export function castVote(state: MafiaState, voterId: string, targetId: string): MafiaState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === voterId ? { ...p, votedFor: targetId } : p,
    ),
  };
}

export function resolveVoting(state: MafiaState): MafiaState {
  const tally: Record<string, number> = {};
  state.players.forEach((p) => {
    if (p.alive && p.votedFor) tally[p.votedFor] = (tally[p.votedFor] ?? 0) + 1;
  });
  // AI voters: random alive target (not self) if no vote yet
  const aiVoters = state.players.filter((p) => p.alive && p.isAI && !p.votedFor);
  aiVoters.forEach((ai) => {
    const targets = state.players.filter((p) => p.alive && p.id !== ai.id);
    if (!targets.length) return;
    const t = targets[Math.floor(Math.random() * targets.length)];
    tally[t.id] = (tally[t.id] ?? 0) + 1;
  });

  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const log = [...state.log];
  let players = state.players;

  if (entries.length && entries[0][1] > 0) {
    const [eliminatedId] = entries[0];
    const victim = state.players.find((p) => p.id === eliminatedId);
    players = players.map((p) => (p.id === eliminatedId ? { ...p, alive: false } : p));
    if (victim) log.push(mod(NARRATIONS.eliminated(victim.username), "announcement"));
    log.push(mod(`(${victim?.username} was a ${victim?.role.toUpperCase()}.)`, "system"));
  } else {
    log.push(mod("The town could not agree. No one is eliminated.", "narration"));
  }

  const winner = checkWin(players);
  const round = state.round + 1;
  if (winner) {
    log.push(mod(winner === "mafia" ? NARRATIONS.mafiaWin : NARRATIONS.villagerWin, "announcement"));
    return { ...state, players, phase: "ended", winner, log };
  }

  log.push(mod(NARRATIONS.nightFall(round), "narration"));
  log.push(mod(NARRATIONS.mafiaWakes, "rule"));
  return {
    ...state,
    players: players.map((p) => ({ ...p, votedFor: null })),
    phase: "night",
    round,
    log,
    nightActions: {},
  };
}