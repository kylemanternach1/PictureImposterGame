export type GamePhase =
  | "intro"
  | "setup"
  | "generating"
  | "viewing"
  | "handoff"
  | "reveal";

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
  hintTags: string[];
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  roundNumber: number;
  maxRounds: number;
  minPlayers: number;
  maxPlayers: number;
  imposterCount: number;
  imposterIds: string[];
  image: RoundImage | null;
  story: StorySegment[];
  turnOrder: string[];
  currentTurnIndex: number;
  activePlayerId: string | null;
  contentRevealed: boolean;
  winner: "innocents" | "imposters" | null;
  voteResults: Record<string, number> | null;
  generatingError: string | null;
}


export function maxImpostersForPlayers(playerCount: number): number {
  return Math.max(1, playerCount - 1);
}
