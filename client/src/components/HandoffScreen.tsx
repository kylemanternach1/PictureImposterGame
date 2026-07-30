import { getFirstStoryPlayer } from "../game/engine";
import type { GameState } from "../game/types";

interface HandoffScreenProps {
  state: GameState;
  onRevealImposters: () => void;
}

export function HandoffScreen({ state, onRevealImposters }: HandoffScreenProps) {
  const firstPlayer = getFirstStoryPlayer(state);

  return (
    <div className="stack centered">
      <div className="card first-player-announcement centered stack" style={{ width: "100%" }}>
        <span className="badge badge-success">Everyone has seen the image</span>
        <h2>{firstPlayer?.name ?? "Someone"} goes first!</h2>
        <p className="muted">
          Play out the story together out loud. When you&apos;re ready to end the round, reveal
          who the imposters were.
        </p>
      </div>

      <button className="btn-primary" style={{ width: "100%", maxWidth: 320 }} onClick={onRevealImposters}>
        Reveal imposters
      </button>
    </div>
  );
}
