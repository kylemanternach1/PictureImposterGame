import type { GameState } from "../game/types";

interface DiscussionScreenProps {
  state: GameState;
  onContinue: () => void;
}

export function DiscussionScreen({ state, onContinue }: DiscussionScreenProps) {
  return (
    <div className="stack">
      <div>
        <h2>Discussion</h2>
        <p className="muted">
          Read the story together. Who derailed the narrative or fixated on a random detail from
          the image?
        </p>
      </div>

      <div className="card stack">
        <h3>Full story</h3>
        {state.story.map((segment) => (
          <div key={segment.order} className="story-block">
            <strong>{segment.playerName}</strong>
            <span>{segment.text}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>What to look for</h3>
        <ul className="muted">
          <li>Sudden topic shifts that don&apos;t follow the narrative</li>
          <li>Overly specific details nobody else mentioned</li>
          <li>Vague filler that avoids committing to the scene</li>
          <li>Someone who clearly only knew one fragment of the image</li>
        </ul>
      </div>

      <button className="btn-primary" onClick={onContinue}>
        Ready to vote
      </button>
    </div>
  );
}
