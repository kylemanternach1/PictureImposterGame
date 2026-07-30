import { useState } from "react";
import { getImposterHintTags, isImposter } from "../game/engine";
import type { GameState } from "../game/types";
import { GameImage } from "./GameImage";
import { PassAndPlayGate } from "./PassAndPlayGate";

interface ViewingPhaseProps {
  state: GameState;
  onSelectPlayer: (playerId: string) => void;
  onCompleteViewing: (playerId: string) => void;
}

type ViewStep = "ready" | "revealed";

export function ViewingPhase({ state, onSelectPlayer, onCompleteViewing }: ViewingPhaseProps) {
  const [viewStep, setViewStep] = useState<ViewStep>("ready");
  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);

  if (!state.image) return null;

  const playerIsImposter = activePlayer ? isImposter(state, activePlayer.id) : false;

  function handleSelectPlayer(playerId: string) {
    setViewStep("ready");
    onSelectPlayer(playerId);
  }

  return (
    <PassAndPlayGate
      title="Private viewing"
      subtitle="Pass the device one player at a time"
      players={state.players}
      activePlayerId={state.activePlayerId}
      contentRevealed={state.contentRevealed}
      isPlayerEligible={(player) => !player.hasViewedImage}
      isPlayerDone={(player) => player.hasViewedImage}
      onSelectPlayer={handleSelectPlayer}
      coverMessage="Look away, then hand the device to the next player. They tap their name when ready."
    >
      {activePlayer && (
        <div className="stack centered">
          {viewStep === "ready" ? (
            <>
              <p className="muted" style={{ margin: 0 }}>
                {activePlayer.name}, tap when you&apos;re ready to peek.
              </p>
              <button className="btn-primary" onClick={() => setViewStep("revealed")}>
                Reveal
              </button>
            </>
          ) : (
            <>
              {playerIsImposter && <span className="badge badge-danger">Imposter</span>}

              <GameImage
                imageUrl={state.image.imageUrl}
                viewMode={playerIsImposter ? "partial" : "full"}
                cropRegion={state.image.cropRegion}
                hintTags={playerIsImposter ? getImposterHintTags(state.image) : null}
              />

              <p className="muted" style={{ maxWidth: 420 }}>
                {playerIsImposter
                  ? "Memorize what you can from this fragment."
                  : "Memorize the full scene before you pass the device."}
              </p>

              <button
                className="btn-primary"
                onClick={() => {
                  setViewStep("ready");
                  onCompleteViewing(activePlayer.id);
                }}
              >
                Done — pass device
              </button>
            </>
          )}
        </div>
      )}
    </PassAndPlayGate>
  );
}
