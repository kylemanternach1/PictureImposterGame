import type { GameState } from "../game/types";
import { GameImage } from "./GameImage";

interface RevealScreenProps {
  state: GameState;
  onNewGame: () => void;
}

export function RevealScreen({ state, onNewGame }: RevealScreenProps) {
  const imposters = state.players.filter((player) => state.imposterIds.includes(player.id));

  return (
    <div className="stack centered">
      <h2>The imposters were...</h2>

      {imposters.length > 0 ? (
        <div className="card stack" style={{ width: "100%" }}>
          {imposters.map((player) => (
            <div key={player.id} className="row" style={{ justifyContent: "center" }}>
              <span className="badge badge-danger">{player.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No imposters found.</p>
      )}

      {state.image && (
        <>
          <GameImage imageUrl={state.image.imageUrl} viewMode="full" alt="Full round image" />
          <p className="muted" style={{ maxWidth: 520 }}>
            <strong>Scene:</strong> {state.image.prompt}
          </p>
        </>
      )}

      <button className="btn-primary" style={{ width: "100%", maxWidth: 320 }} onClick={onNewGame}>
        New game
      </button>
    </div>
  );
}
