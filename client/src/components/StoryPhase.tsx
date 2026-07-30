import { useState } from "react";
import { getCurrentStoryPlayer, getFirstStoryPlayer, getImposterHintTags, isImposter } from "../game/engine";
import type { GameState } from "../game/types";
import { STORY_MAX_WORDS, STORY_MIN_WORDS } from "../game/types";
import { GameImage } from "./GameImage";
import { PassAndPlayGate } from "./PassAndPlayGate";

interface StoryPhaseProps {
  state: GameState;
  onSelectPlayer: (playerId: string) => void;
  onSubmit: (playerId: string, text: string) => void;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function StoryPhase({ state, onSelectPlayer, onSubmit }: StoryPhaseProps) {
  const [text, setText] = useState("");
  const currentTurnPlayer = getCurrentStoryPlayer(state);
  const firstPlayer = getFirstStoryPlayer(state);
  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);
  const wordCount = countWords(text);
  const storyNotStarted = state.story.length === 0;

  if (!state.image) return null;

  const playerIsImposter = activePlayer ? isImposter(state, activePlayer.id) : false;

  return (
    <div className="stack">
      {storyNotStarted && firstPlayer && (
        <div className="card first-player-announcement centered stack">
          <span className="badge badge-success">Everyone has seen the image</span>
          <h2>{firstPlayer.name} goes first!</h2>
          <p className="muted">
            Pass the device to <strong>{firstPlayer.name}</strong> to open the story.
          </p>
        </div>
      )}

      <PassAndPlayGate
        title="Build the story"
        subtitle={
          storyNotStarted && firstPlayer
            ? `Waiting for ${firstPlayer.name} to begin`
            : "Pass the device in turn order"
        }
        players={state.players}
        activePlayerId={state.activePlayerId}
        contentRevealed={state.contentRevealed}
        isPlayerEligible={(player) => player.id === currentTurnPlayer?.id}
        isPlayerDone={(player) => Boolean(player.storyContribution)}
        onSelectPlayer={onSelectPlayer}
        coverMessage={
          currentTurnPlayer
            ? `${currentTurnPlayer.name}, tap your name when you have the device.`
            : "Only the current player should tap their name. Everyone else, look away."
        }
      >
        {activePlayer && (
          <div className="stack">
            <p>
              <strong>{activePlayer.name}</strong>
              {storyNotStarted ? ", start the story" : ", continue the story"} ({STORY_MIN_WORDS}–
              {STORY_MAX_WORDS} words)
            </p>

            <GameImage
              imageUrl={state.image.imageUrl}
              viewMode={playerIsImposter ? "partial" : "full"}
              cropRegion={state.image.cropRegion}
              hintTags={playerIsImposter ? getImposterHintTags(state.image) : null}
            />

            <div className="card stack">
              <h3>Story so far</h3>
              {state.story.length === 0 ? (
                <p className="muted">You&apos;re setting the scene — start the tale!</p>
              ) : (
                state.story.map((segment) => (
                  <div key={segment.order} className="story-block">
                    <strong>{segment.playerName}</strong>
                    <span>{segment.text}</span>
                  </div>
                ))
              )}
            </div>

            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Continue the story with something relevant to what you saw..."
            />

            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted">{wordCount} words</span>
              <button
                className="btn-primary"
                disabled={wordCount < STORY_MIN_WORDS || wordCount > STORY_MAX_WORDS}
                onClick={() => {
                  onSubmit(activePlayer.id, text);
                  setText("");
                }}
              >
                Add to story
              </button>
            </div>
          </div>
        )}
      </PassAndPlayGate>
    </div>
  );
}
