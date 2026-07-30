import { HandoffScreen } from "./components/HandoffScreen";
import { IntroScreen } from "./components/IntroScreen";
import { RevealScreen } from "./components/RevealScreen";
import { SetupScreen } from "./components/SetupScreen";
import { ViewingPhase } from "./components/ViewingPhase";
import { useLocalGame } from "./hooks/useLocalGame";

export default function App() {
  const {
    state,
    openSetup,
    startGame,
    tapPlayer,
    completeViewing,
    revealImposters,
    newGame,
  } = useLocalGame();

  if (state.phase === "generating") {
    return (
      <main className="app-shell centered">
        <div className="card centered stack">
          <h2>Generating image...</h2>
          <p className="muted">Generating a surreal scene — this can take up to 30 seconds.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      {state.phase === "intro" ? (
        <IntroScreen onBegin={openSetup} />
      ) : state.phase === "setup" ? (
        <SetupScreen state={state} onStart={startGame} />
      ) : state.phase === "viewing" ? (
        <ViewingPhase
          state={state}
          onSelectPlayer={tapPlayer}
          onCompleteViewing={completeViewing}
        />
      ) : state.phase === "handoff" ? (
        <HandoffScreen state={state} onRevealImposters={revealImposters} />
      ) : state.phase === "reveal" ? (
        <RevealScreen state={state} onNewGame={newGame} />
      ) : null}
    </main>
  );
}
