import { useState } from "react";
import { GAME_NAME } from "../game/branding";
import type { GameState } from "../game/types";
import { maxImpostersForPlayers } from "../game/types";

interface SetupScreenProps {
  state: GameState;
  onStart: (names: string[], imposterCount: number) => void;
}

export function SetupScreen({ state, onStart }: SetupScreenProps) {
  const [playerCount, setPlayerCount] = useState(state.players.length || state.minPlayers);
  const [imposterCount, setImposterCount] = useState(state.imposterCount || 1);
  const [names, setNames] = useState<string[]>(
    state.players.length > 0
      ? state.players.map((player) => player.name)
      : Array.from({ length: state.minPlayers }, () => ""),
  );

  const maxImposters = maxImpostersForPlayers(playerCount);

  function updateCount(count: number) {
    setPlayerCount(count);
    const newMax = maxImpostersForPlayers(count);
    if (imposterCount > newMax) {
      setImposterCount(newMax);
    }
    setNames((current) => {
      if (count > current.length) {
        return [...current, ...Array.from({ length: count - current.length }, () => "")];
      }
      return current.slice(0, count);
    });
  }

  function updateName(index: number, value: string) {
    setNames((current) => current.map((name, i) => (i === index ? value : name)));
  }

  function handleStart() {
    const resolvedNames = names.map((name, index) => name.trim() || `Player ${index + 1}`);
    onStart(resolvedNames, imposterCount);
  }

  return (
    <div className="stack centered">
      <div className="stack centered" style={{ marginBottom: "0.5rem" }}>
        <p className="game-tagline muted">{GAME_NAME}</p>
        <h1 className="hero-title">Game setup</h1>
        <p className="hero-subtitle">Choose players and imposters, then enter everyone&apos;s names.</p>
      </div>

      {state.generatingError && <div className="error-banner">{state.generatingError}</div>}

      <div className="card stack" style={{ width: "100%", maxWidth: 480 }}>
        <label className="stack" style={{ gap: "0.4rem" }}>
          <span>Number of players ({state.minPlayers}–{state.maxPlayers})</span>
          <input
            type="range"
            min={state.minPlayers}
            max={state.maxPlayers}
            value={playerCount}
            onChange={(e) => updateCount(Number(e.target.value))}
          />
          <span className="muted centered">{playerCount} players</span>
        </label>

        <label className="stack" style={{ gap: "0.4rem" }}>
          <span>Number of imposters (1–{maxImposters})</span>
          <input
            type="range"
            min={1}
            max={maxImposters}
            value={Math.min(imposterCount, maxImposters)}
            onChange={(e) => setImposterCount(Number(e.target.value))}
          />
          <span className="muted centered">
            {Math.min(imposterCount, maxImposters)} imposter
            {Math.min(imposterCount, maxImposters) === 1 ? "" : "s"}
          </span>
        </label>

        <div className="stack">
          <span>Player names</span>
          {names.map((name, index) => (
            <input
              key={index}
              value={name}
              onChange={(e) => updateName(index, e.target.value)}
              placeholder={`Player ${index + 1}`}
              maxLength={24}
            />
          ))}
        </div>

        <button className="btn-primary" onClick={handleStart}>
          Start game
        </button>
      </div>
    </div>
  );
}
