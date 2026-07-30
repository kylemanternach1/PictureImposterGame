import type { GameState, Player, PlayerRole, RoundImage } from "./types";
import { maxImpostersForPlayers } from "./types";

export function createInitialState(): GameState {
  return {
    phase: "intro",
    players: [],
    roundNumber: 0,
    maxRounds: 5,
    minPlayers: 2,
    maxPlayers: 10,
    imposterCount: 1,
    imposterIds: [],
    image: null,
    story: [],
    turnOrder: [],
    currentTurnIndex: 0,
    activePlayerId: null,
    contentRevealed: false,
    winner: null,
    voteResults: null,
    generatingError: null,
  };
}

export function goToSetup(state: GameState): GameState {
  return {
    ...state,
    phase: "setup",
    generatingError: null,
  };
}

export function setupPlayers(names: string[], imposterCount: number): GameState {
  const players: Player[] = names.map((name, index) => ({
    id: `player-${index}-${crypto.randomUUID()}`,
    name: name.trim().slice(0, 24) || `Player ${index + 1}`,
    role: "innocent",
    storyContribution: null,
    voteTargetId: null,
    fitScore: null,
    hasViewedImage: false,
  }));

  const safeImposterCount = Math.min(
    Math.max(1, imposterCount),
    maxImpostersForPlayers(players.length),
  );

  return {
    ...createInitialState(),
    players,
    imposterCount: safeImposterCount,
    phase: "setup",
  };
}

export function beginGenerating(state: GameState): GameState {
  return {
    ...state,
    phase: "generating",
    generatingError: null,
  };
}

export function beginRound(state: GameState, image: RoundImage): GameState {
  const players = state.players.map((player) => ({
    ...player,
    role: "innocent" as PlayerRole,
    storyContribution: null,
    voteTargetId: null,
    fitScore: null,
    hasViewedImage: false,
  }));

  const shuffledIds = shuffle(players.map((player) => player.id));
  const imposterIds = shuffledIds.slice(0, state.imposterCount);
  for (const player of players) {
    if (imposterIds.includes(player.id)) {
      player.role = "imposter";
    }
  }

  const turnOrder = buildStoryTurnOrder(
    players.map((player) => player.id),
    imposterIds,
  );

  return {
    ...state,
    phase: "viewing",
    roundNumber: state.roundNumber + 1,
    players,
    imposterIds,
    image,
    story: [],
    turnOrder,
    currentTurnIndex: 0,
    activePlayerId: null,
    contentRevealed: false,
    winner: null,
    voteResults: null,
    generatingError: null,
  };
}

export function selectActivePlayer(state: GameState, playerId: string): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  if (state.phase === "viewing" && player.hasViewedImage) return state;

  return {
    ...state,
    activePlayerId: playerId,
    contentRevealed: true,
  };
}

export function finishViewing(state: GameState, playerId: string): GameState {
  const players = state.players.map((player) =>
    player.id === playerId ? { ...player, hasViewedImage: true } : player,
  );

  const next = {
    ...state,
    players,
    activePlayerId: null,
    contentRevealed: false,
  };

  if (players.every((player) => player.hasViewedImage)) {
    return { ...next, phase: "handoff" };
  }

  return next;
}

export function revealImposters(state: GameState): GameState {
  return {
    ...state,
    phase: "reveal",
    activePlayerId: null,
    contentRevealed: false,
  };
}

export function returnToSetup(state: GameState): GameState {
  return {
    ...state,
    phase: "setup",
    roundNumber: 0,
    generatingError: null,
    activePlayerId: null,
    contentRevealed: false,
  };
}

export function resetGame(): GameState {
  return createInitialState();
}

export function isImposter(state: GameState, playerId: string): boolean {
  return state.imposterIds.includes(playerId);
}

function buildStoryTurnOrder(playerIds: string[], imposterIds: string[]): string[] {
  const innocents = playerIds.filter((id) => !imposterIds.includes(id));
  const imposters = playerIds.filter((id) => imposterIds.includes(id));

  if (innocents.length === 0) {
    return shuffle(playerIds);
  }

  const firstPlayerId = innocents[Math.floor(Math.random() * innocents.length)]!;
  const remaining = shuffle([
    ...innocents.filter((id) => id !== firstPlayerId),
    ...imposters,
  ]);

  return [firstPlayerId, ...remaining];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function getActivePlayer(state: GameState): Player | undefined {
  return state.players.find((player) => player.id === state.activePlayerId);
}

export function getFirstStoryPlayer(state: GameState): Player | undefined {
  const id = state.turnOrder[0];
  return state.players.find((player) => player.id === id);
}

export function getImposterHintTags(image: RoundImage): string[] {
  return image.hintTags;
}
