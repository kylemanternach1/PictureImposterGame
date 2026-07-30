import { useState } from "react";
import { getCurrentStoryPlayer, getImposterHintTags } from "../game/engine";
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
  const activePlayer = state.players.find((player) => player.id === state.activePlayerId);
  const wordCount = countWords(text);
  const contributedCount = state.story.length;

  if (!state.image) return null;

  const isImposter = activePlayer?.role === "imposter";

  return (
    <PassAndPlayGate
      title="Build the story"
      subtitle={`${contributedCount}/${state.players.length} contributions · pass the device in turn`}
      players={state.players}
      activePlayerId={state.activePlayerId}
      contentRevealed={state.contentRevealed}
      isPlayerEligible={(player) => player.id === currentTurnPlayer?.id}
      isPlayerDone={(player) => Boolean(player.storyContribution)}
      onSelectPlayer={onSelectPlayer}
      coverMessage={
        currentTurnPlayer
          ? `${currentTurnPlayer.name}, tap your name when you have the device.`
          : "Waiting for the next player..."
      }
    >
      {activePlayer && (
        <div className="stack">
          <p>
            <strong>{activePlayer.name}</strong>, continue the story ({STORY_MIN_WORDS}–
            {STORY_MAX_WORDS} words)
          </p>

          <GameImage
            imageUrl={state.image.imageUrl}
            viewMode={isImposter ? "partial" : "full"}
            cropRegion={state.image.cropRegion}
            colorTags={isImposter ? getImposterHintTags(state.image) : null}
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
  );
}
