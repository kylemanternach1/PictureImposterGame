import type { GameState } from "../game/types";
import { GameImage } from "./GameImage";

interface RevealScreenProps {
  state: GameState;
  onNextRound: () => void;
  onQuit: () => void;
}

export function RevealScreen({ state, onNextRound, onQuit }: RevealScreenProps) {
  const imposters = state.players.filter((player) => state.imposterIds.includes(player.id));
  const hasMoreRounds = state.roundNumber < state.maxRounds;

  return (
    <div className="stack centered">
      <h2>Round {state.roundNumber} reveal</h2>

      {state.winner && (
        <span className={`badge ${state.winner === "innocents" ? "badge-success" : "badge-danger"}`}>
          {state.winner === "innocents" ? "Innocents win!" : "Imposters win!"}
        </span>
      )}

      {state.image && (
        <GameImage imageUrl={state.image.imageUrl} viewMode="full" alt="Full round image" />
      )}

      {state.image && (
        <p className="muted" style={{ maxWidth: 520 }}>
          <strong>Prompt:</strong> {state.image.prompt}
        </p>
      )}

      {imposters.length > 0 && (
        <div className="card" style={{ width: "100%" }}>
          <p>
            The imposter{imposters.length === 1 ? " was" : "s were"}{" "}
            <strong>{imposters.map((p) => p.name).join(", ")}</strong>
          </p>
        </div>
      )}

      {state.voteResults && (
        <div className="card stack" style={{ width: "100%" }}>
          <h3>Vote tally</h3>
          {Object.entries(state.voteResults).map(([playerId, votes]) => {
            const player = state.players.find((p) => p.id === playerId);
            return (
              <div key={playerId} className="row" style={{ justifyContent: "space-between" }}>
                <span>{player?.name ?? "Unknown"}</span>
                <span className="badge">
                  {votes} vote{votes === 1 ? "" : "s"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="card stack" style={{ width: "100%" }}>
        <h3>Fit scores</h3>
        <p className="muted">How well each contribution matched the image.</p>
        {state.players.map((player) => (
          <div key={player.id} className="row" style={{ justifyContent: "space-between" }}>
            <span>{player.name}</span>
            <span className="badge">{player.fitScore ?? 0}%</span>
          </div>
        ))}
      </div>

      {state.generatingError && <div className="error-banner">{state.generatingError}</div>}

      {state.phase === "ended" ? (
        <div className="stack centered">
          <p className="muted">Game over — thanks for playing!</p>
          <button className="btn-primary" onClick={onQuit}>
            Play again
          </button>
        </div>
      ) : (
        <div className="row centered">
          {hasMoreRounds && (
            <button className="btn-primary" onClick={onNextRound}>
              Next round
            </button>
          )}
          <button className="btn-secondary" onClick={onQuit}>
            End game
          </button>
        </div>
      )}
    </div>
  );
}
