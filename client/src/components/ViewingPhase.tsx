import { useEffect } from "react";
import { getImposterHintTags } from "../game/engine";
import type { GameState } from "../game/types";
import { VIEWING_DURATION_MS } from "../game/types";
import { GameImage } from "./GameImage";
import { PassAndPlayGate } from "./PassAndPlayGate";

interface ViewingPhaseProps {
  state: GameState;
  onSelectPlayer: (playerId: string) => void;
  onCompleteViewing: (playerId: string) => void;
}

export function ViewingPhase({ state, onSelectPlayer, onCompleteViewing }: ViewingPhaseProps) {
  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);
  const viewedCount = state.players.filter((player) => player.hasViewedImage).length;

  useEffect(() => {
    if (!state.contentRevealed || !activePlayer) return;

    const timer = setTimeout(() => {
      onCompleteViewing(activePlayer.id);
    }, VIEWING_DURATION_MS);

    return () => clearTimeout(timer);
  }, [state.contentRevealed, activePlayer, onCompleteViewing]);

  if (!state.image) return null;

  const isImposter = activePlayer?.role === "imposter";

  return (
    <PassAndPlayGate
      title="Study the image"
      subtitle={`Round ${state.roundNumber} · ${viewedCount}/${state.players.length} players have looked`}
      players={state.players}
      activePlayerId={state.activePlayerId}
      contentRevealed={state.contentRevealed}
      isPlayerEligible={(player) => !player.hasViewedImage}
      isPlayerDone={(player) => player.hasViewedImage}
      onSelectPlayer={onSelectPlayer}
      coverMessage="Pass the device. Only tap your name when you're ready to look."
    >
      {activePlayer && (
        <div className="stack centered">
          <p>
            <strong>{activePlayer.name}</strong>
            {isImposter ? (
              <span className="badge badge-danger" style={{ marginLeft: "0.5rem" }}>
                Imposter — sneak peek only
              </span>
            ) : (
              <span className="badge badge-success" style={{ marginLeft: "0.5rem" }}>
                Innocent — full image
              </span>
            )}
          </p>

          <GameImage
            imageUrl={state.image.imageUrl}
            viewMode={isImposter ? "partial" : "full"}
            cropRegion={state.image.cropRegion}
            colorTags={isImposter ? getImposterHintTags(state.image) : null}
          />

          <p className="muted" style={{ maxWidth: 420 }}>
            {isImposter
              ? "You only see a fragment. Memorize what you can — you'll need to blend into the story."
              : "Memorize the scene. You'll build a story together — watch for odd tangents later."}
          </p>

          <button className="btn-primary" onClick={() => onCompleteViewing(activePlayer.id)}>
            Done — pass device
          </button>
        </div>
      )}
    </PassAndPlayGate>
  );
}
