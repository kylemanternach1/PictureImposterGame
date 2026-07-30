export type GamePhase =
  | "setup"
  | "generating"
  | "viewing"
  | "story"
  | "discussion"
  | "voting"
  | "reveal"
  | "ended";

export type PlayerRole = "innocent" | "imposter";

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  storyContribution: string | null;
  voteTargetId: string | null;
  fitScore: number | null;
  hasViewedImage: boolean;
}

export interface StorySegment {
  playerId: string;
  playerName: string;
  text: string;
  order: number;
}

export interface RoundImage {
  prompt: string;
  imageUrl: string;
  cropRegion: CropRegion;
  colorTags: string[];
  objectTags: string[];
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  roundNumber: number;
  maxRounds: number;
  minPlayers: number;
  maxPlayers: number;
  imposterId: string | null;
  image: RoundImage | null;
  story: StorySegment[];
  turnOrder: string[];
  currentTurnIndex: number;
  activePlayerId: string | null;
  contentRevealed: boolean;
  winner: "innocents" | "imposter" | null;
  voteResults: Record<string, number> | null;
  generatingError: string | null;
}

export const STORY_MIN_WORDS = 3;
export const STORY_MAX_WORDS = 30;
export const VIEWING_DURATION_MS = 10_000;
