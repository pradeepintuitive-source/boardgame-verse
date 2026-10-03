import { i as uid } from "./router-CrXfqMs4.mjs";
import { c as create } from "../_libs/zustand.mjs";
const useGameStore = create((set) => ({
  mafia: {},
  setMafia: (gameId, state) => set((s) => ({ mafia: { ...s.mafia, [gameId]: state } })),
  patchMafia: (gameId, patch) => set((s) => {
    const cur = s.mafia[gameId];
    if (!cur) return s;
    return { mafia: { ...s.mafia, [gameId]: { ...cur, ...patch } } };
  }),
  clear: (gameId) => set((s) => {
    const { [gameId]: _drop, ...rest } = s.mafia;
    return { mafia: rest };
  })
}));
const NARRATIONS = {
  start: "The town gathers. Strangers among us. The game begins.",
  nightFall: (round) => `Night ${round} has fallen. The town sleeps... but not all close their eyes.`,
  mafiaWakes: "The Mafia opens their eyes and choose their target.",
  detectiveWakes: "The Detective investigates one player in the shadows.",
  doctorWakes: "The Doctor moves silently, choosing one soul to protect.",
  dawn: (round) => `Dawn breaks on day ${round}. The town awakens.`,
  killed: (name) => `${name} was found at sunrise. They will not see another night.`,
  saved: "A scream in the dark — but no body. The Doctor's hand was steady tonight.",
  voting: "The town gathers in the square. Voting begins now.",
  eliminated: (name) => `${name} was eliminated by the town's vote.`,
  noKill: "The night passed without bloodshed.",
  mafiaWin: "The Mafia have taken the town. Game over.",
  villagerWin: "The Mafia have been driven out. The town is safe — for now."
};
function assignRoles(players) {
  const n = players.length;
  const mafiaCount = Math.max(1, Math.floor(n / 4));
  const hasDetective = n >= 5;
  const hasDoctor = n >= 6;
  const roles = [
    ...Array(mafiaCount).fill("mafia"),
    ...hasDetective ? ["detective"] : [],
    ...hasDoctor ? ["doctor"] : []
  ];
  while (roles.length < n) roles.push("villager");
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return players.map((p, idx) => ({
    ...p,
    role: roles[idx],
    alive: true,
    votedFor: null
  }));
}
function initMafiaGame(gameId, players) {
  return {
    gameId,
    phase: "night",
    round: 1,
    players: assignRoles(players),
    log: [
      mod(NARRATIONS.start, "announcement"),
      mod(NARRATIONS.nightFall(1), "narration"),
      mod(NARRATIONS.mafiaWakes, "rule")
    ],
    nightActions: {},
    winner: null
  };
}
function mod(text, kind = "narration") {
  return { id: uid("mod"), text, kind, ts: Date.now() };
}
function checkWin(players) {
  const aliveMafia = players.filter((p) => p.alive && p.role === "mafia").length;
  const aliveOther = players.filter((p) => p.alive && p.role !== "mafia").length;
  if (aliveMafia === 0) return "villagers";
  if (aliveMafia >= aliveOther) return "mafia";
  return null;
}
function resolveNight(state) {
  const actions = { ...state.nightActions };
  const aliveByRole = (r) => state.players.filter((p) => p.alive && p.role === r);
  const rndPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
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
  const log = [...state.log];
  let players = state.players;
  if (mafiaTarget && mafiaTarget !== doctorTarget) {
    players = players.map((p) => p.id === mafiaTarget ? { ...p, alive: false } : p);
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
          "system"
        )
      );
    }
  }
  const winner = checkWin(players);
  const phase = winner ? "ended" : "day";
  if (winner) {
    log.push(
      mod(winner === "mafia" ? NARRATIONS.mafiaWin : NARRATIONS.villagerWin, "announcement")
    );
  } else {
    log.push(mod("Discuss. Suspect. When you're ready, the town will vote.", "rule"));
  }
  return {
    ...state,
    players: players.map((p) => ({ ...p, votedFor: null })),
    phase,
    nightActions: {},
    log,
    winner: winner ?? null
  };
}
function beginVoting(state) {
  return {
    ...state,
    phase: "voting",
    log: [...state.log, mod(NARRATIONS.voting, "rule")]
  };
}
function castVote(state, voterId, targetId) {
  return {
    ...state,
    players: state.players.map((p) => p.id === voterId ? { ...p, votedFor: targetId } : p)
  };
}
function resolveVoting(state) {
  const tally = {};
  state.players.forEach((p) => {
    if (p.alive && p.votedFor) tally[p.votedFor] = (tally[p.votedFor] ?? 0) + 1;
  });
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
    players = players.map((p) => p.id === eliminatedId ? { ...p, alive: false } : p);
    if (victim) log.push(mod(NARRATIONS.eliminated(victim.username), "announcement"));
    log.push(mod(`(${victim?.username} was a ${victim?.role.toUpperCase()}.)`, "system"));
  } else {
    log.push(mod("The town could not agree. No one is eliminated.", "narration"));
  }
  const winner = checkWin(players);
  const round = state.round + 1;
  if (winner) {
    log.push(
      mod(winner === "mafia" ? NARRATIONS.mafiaWin : NARRATIONS.villagerWin, "announcement")
    );
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
    nightActions: {}
  };
}
export {
  resolveVoting as a,
  beginVoting as b,
  castVote as c,
  initMafiaGame as i,
  resolveNight as r,
  useGameStore as u
};
