import type { GameState } from "../game/types";
import { PassAndPlayGate } from "./PassAndPlayGate";

interface VotingPhaseProps {
  state: GameState;
  onSelectPlayer: (playerId: string) => void;
  onVote: (voterId: string, targetId: string) => void;
}

export function VotingPhase({ state, onSelectPlayer, onVote }: VotingPhaseProps) {
  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);
  const votedCount = state.players.filter((player) => player.voteTargetId).length;

  return (
    <PassAndPlayGate
      title="Vote out the imposter"
      subtitle={`${votedCount}/${state.players.length} votes cast`}
      players={state.players}
      activePlayerId={state.activePlayerId}
      contentRevealed={state.contentRevealed}
      isPlayerEligible={(player) => !player.voteTargetId}
      isPlayerDone={(player) => Boolean(player.voteTargetId)}
      onSelectPlayer={onSelectPlayer}
      coverMessage="Pass the device. Tap your name to cast your secret vote."
    >
      {activePlayer && (
        <div className="stack">
          <p>
            <strong>{activePlayer.name}</strong>, who seems most suspicious?
          </p>

          <ul className="player-list">
            {state.players
              .filter((player) => player.id !== activePlayer.id)
              .map((player) => {
                const segment = state.story.find((s) => s.playerId === player.id);
                return (
                  <li key={player.id}>
                    <div className="stack" style={{ gap: "0.35rem", flex: 1 }}>
                      <strong>{player.name}</strong>
                      {segment && <span className="muted">&ldquo;{segment.text}&rdquo;</span>}
                    </div>
                    <button
                      className="btn-secondary"
                      onClick={() => onVote(activePlayer.id, player.id)}
                    >
                      Vote
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </PassAndPlayGate>
  );
}
