import type { GameState, Player, PlayerRole, RoundImage, StorySegment } from "./types";
import { STORY_MAX_WORDS, STORY_MIN_WORDS } from "./types";

export function createInitialState(): GameState {
  return {
    phase: "setup",
    players: [],
    roundNumber: 0,
    maxRounds: 5,
    minPlayers: 2,
    maxPlayers: 10,
    imposterId: null,
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

export function setupPlayers(names: string[]): GameState {
  const players: Player[] = names.map((name, index) => ({
    id: `player-${index}-${crypto.randomUUID()}`,
    name: name.trim().slice(0, 24) || `Player ${index + 1}`,
    role: "innocent",
    storyContribution: null,
    voteTargetId: null,
    fitScore: null,
    hasViewedImage: false,
  }));

  return {
    ...createInitialState(),
    players,
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

  const imposterIndex = Math.floor(Math.random() * players.length);
  const imposterId = players[imposterIndex]!.id;
  players[imposterIndex]!.role = "imposter";

  const turnOrder = shuffle(players.map((player) => player.id));

  return {
    ...state,
    phase: "viewing",
    roundNumber: state.roundNumber + 1,
    players,
    imposterId,
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
  if (state.phase === "story" && player.storyContribution) return state;
  if (state.phase === "voting" && player.voteTargetId) return state;

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
    return { ...next, phase: "story" };
  }

  return next;
}

export function submitStory(state: GameState, playerId: string, text: string): GameState {
  const trimmed = text.trim();
  const wordCount = countWords(trimmed);
  if (wordCount < STORY_MIN_WORDS || wordCount > STORY_MAX_WORDS) {
    throw new Error(`Contribution must be ${STORY_MIN_WORDS}–${STORY_MAX_WORDS} words`);
  }

  const currentPlayerId = state.turnOrder[state.currentTurnIndex];
  if (playerId !== currentPlayerId) {
    throw new Error("Not your turn");
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error("Player not found");

  const players = state.players.map((p) =>
    p.id === playerId ? { ...p, storyContribution: trimmed } : p,
  );

  const story: StorySegment[] = [
    ...state.story,
    {
      playerId,
      playerName: player.name,
      text: trimmed,
      order: state.story.length,
    },
  ];

  const currentTurnIndex = state.currentTurnIndex + 1;
  const next = {
    ...state,
    players,
    story,
    currentTurnIndex,
    activePlayerId: null,
    contentRevealed: false,
  };

  if (currentTurnIndex >= state.turnOrder.length) {
    return computeFitScores({ ...next, phase: "discussion" });
  }

  return next;
}

export function goToVoting(state: GameState): GameState {
  return {
    ...state,
    phase: "voting",
    activePlayerId: null,
    contentRevealed: false,
  };
}

export function submitVote(state: GameState, voterId: string, targetId: string): GameState {
  if (voterId === targetId) {
    throw new Error("You cannot vote for yourself");
  }

  const players = state.players.map((player) =>
    player.id === voterId ? { ...player, voteTargetId: targetId } : player,
  );

  const next = {
    ...state,
    players,
    activePlayerId: null,
    contentRevealed: false,
  };

  if (players.every((player) => player.voteTargetId)) {
    return resolveVotes(next);
  }

  return next;
}

export function resolveVotes(state: GameState): GameState {
  const tally: Record<string, number> = {};
  for (const player of state.players) {
    if (!player.voteTargetId) continue;
    tally[player.voteTargetId] = (tally[player.voteTargetId] ?? 0) + 1;
  }

  const topVotes = Math.max(0, ...Object.values(tally));
  const topCandidates = Object.entries(tally)
    .filter(([, votes]) => votes === topVotes)
    .map(([playerId]) => playerId);

  const imposterCaught = state.imposterId ? topCandidates.includes(state.imposterId) : false;

  return {
    ...state,
    phase: "reveal",
    voteResults: tally,
    winner: imposterCaught ? "innocents" : "imposter",
    activePlayerId: null,
    contentRevealed: true,
  };
}

export function startNextRound(state: GameState): GameState {
  if (state.roundNumber >= state.maxRounds) {
    return { ...state, phase: "ended" };
  }
  return beginGenerating(state);
}

export function resetGame(): GameState {
  return createInitialState();
}

function computeFitScores(state: GameState): GameState {
  const image = state.image;
  if (!image) return state;

  const players = state.players.map((player) => {
    if (!player.storyContribution) {
      return { ...player, fitScore: 0 };
    }
    return {
      ...player,
      fitScore: computeFitScore(
        player.storyContribution,
        image.prompt,
        image.colorTags,
        image.objectTags,
      ),
    };
  });

  return { ...state, players };
}

function computeFitScore(
  contribution: string,
  prompt: string,
  colorTags: string[],
  objectTags: string[],
): number {
  const words = contribution.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  const haystack = `${prompt} ${colorTags.join(" ")} ${objectTags.join(" ")}`.toLowerCase();
  const promptTokens = new Set(
    haystack.split(/[^a-z0-9]+/).filter((token) => token.length > 3),
  );

  let hits = 0;
  for (const word of words) {
    const cleaned = word.replace(/[^a-z0-9]/g, "");
    if (cleaned.length < 3) continue;
    if (promptTokens.has(cleaned)) hits += 1;
    else if ([...promptTokens].some((token) => token.includes(cleaned) || cleaned.includes(token))) {
      hits += 0.5;
    }
  }

  const relevance = Math.min(1, hits / Math.max(3, words.length * 0.4));
  const lengthPenalty = words.length < 5 ? 0.15 : 0;
  const raw = relevance * 85 + 10 - lengthPenalty * 100;
  return Math.round(Math.max(5, Math.min(98, raw)));
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function getActivePlayer(state: GameState): Player | undefined {
  return state.players.find((player) => player.id === state.activePlayerId);
}

export function getCurrentStoryPlayer(state: GameState): Player | undefined {
  const id = state.turnOrder[state.currentTurnIndex];
  return state.players.find((player) => player.id === id);
}

export function getImposterHintTags(image: RoundImage): string[] {
  return [...image.colorTags, ...image.objectTags.slice(0, 2)];
}
