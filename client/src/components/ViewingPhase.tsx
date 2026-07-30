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

type ViewStep = "role" | "image";

export function ViewingPhase({ state, onSelectPlayer, onCompleteViewing }: ViewingPhaseProps) {
  const [viewStep, setViewStep] = useState<ViewStep>("role");
  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);

  if (!state.image) return null;

  const playerIsImposter = activePlayer ? isImposter(state, activePlayer.id) : false;

  function handleSelectPlayer(playerId: string) {
    setViewStep("role");
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
          {viewStep === "role" ? (
            <>
              <div className="private-role-card">
                <p className="muted" style={{ margin: 0 }}>
                  {activePlayer.name}, your assignment:
                </p>
                <h3>{playerIsImposter ? "You are an imposter" : "You are innocent"}</h3>
                <p className="muted">
                  {playerIsImposter
                    ? "You will only see a small fragment of the image plus a few hints. Blend into the story without revealing you didn't see the full scene."
                    : "You will see the complete image. Pay attention to every detail — you'll need them to spot imposters later."}
                </p>
              </div>
              <button className="btn-primary" onClick={() => setViewStep("image")}>
                Continue to image
              </button>
            </>
          ) : (
            <>
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
                  setViewStep("role");
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
