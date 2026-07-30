import type { ReactNode } from "react";
import type { Player } from "../game/types";

interface PassAndPlayGateProps {
  title: string;
  subtitle?: string;
  players: Player[];
  activePlayerId: string | null;
  contentRevealed: boolean;
  isPlayerEligible: (player: Player) => boolean;
  isPlayerDone: (player: Player) => boolean;
  onSelectPlayer: (playerId: string) => void;
  coverMessage: string;
  children: ReactNode;
}

export function PassAndPlayGate({
  title,
  subtitle,
  players,
  activePlayerId,
  contentRevealed,
  isPlayerEligible,
  isPlayerDone,
  onSelectPlayer,
  coverMessage,
  children,
}: PassAndPlayGateProps) {
  return (
    <div className="stack">
      <div>
        <h2>{title}</h2>
        {subtitle && !contentRevealed && <p className="muted">{subtitle}</p>}
      </div>

      <div className="privacy-zone">
        <div className={`privacy-cover ${contentRevealed ? "revealed" : ""}`}>
          {!contentRevealed && (
            <div className="privacy-shield">
              <div className="privacy-icon" aria-hidden>
                🔒
              </div>
              <p className="privacy-message">{coverMessage}</p>
              <p className="muted privacy-hint">Only you should see the screen — tap your name below</p>
            </div>
          )}
          <div className={`privacy-content ${contentRevealed ? "visible" : ""}`}>
            {contentRevealed && (
              <p className="private-session-banner">Private session — don&apos;t let others peek</p>
            )}
            {children}
          </div>
        </div>
      </div>

      {contentRevealed ? (
        <p className="muted centered privacy-pass-hint">
          When finished, tap the button above and hand the device to the next player.
        </p>
      ) : (
        <div className="card stack">
          <h3>Who&apos;s holding the device?</h3>
          <p className="muted" style={{ margin: 0 }}>
            Tap your name only. Other players should look away.
          </p>
          <ul className="player-picker">
            {players.map((player) => {
              const eligible = isPlayerEligible(player);
              const done = isPlayerDone(player);
              const active = activePlayerId === player.id;

              return (
                <li key={player.id}>
                  <button
                    type="button"
                    className={`player-pick-btn ${active ? "active" : ""} ${done ? "done" : ""}`}
                    disabled={!eligible || done}
                    onClick={() => onSelectPlayer(player.id)}
                  >
                    <span>{player.name}</span>
                    {done && <span className="pick-status">Finished</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
