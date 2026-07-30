import { DiscussionScreen } from "./components/DiscussionScreen";
import { IntroScreen } from "./components/IntroScreen";
import { RevealScreen } from "./components/RevealScreen";
import { SetupScreen } from "./components/SetupScreen";
import { StoryPhase } from "./components/StoryPhase";
import { ViewingPhase } from "./components/ViewingPhase";
import { VotingPhase } from "./components/VotingPhase";
import { useLocalGame } from "./hooks/useLocalGame";

export default function App() {
  const {
    state,
    openSetup,
    startGame,
    startNextRoundFlow,
    tapPlayer,
    completeViewing,
    addStoryContribution,
    castVote,
    advanceToVoting,
    quitToIntro,
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
      ) : state.phase === "story" ? (
        <StoryPhase
          state={state}
          onSelectPlayer={tapPlayer}
          onSubmit={addStoryContribution}
        />
      ) : state.phase === "discussion" ? (
        <DiscussionScreen state={state} onContinue={advanceToVoting} />
      ) : state.phase === "voting" ? (
        <VotingPhase
          state={state}
          onSelectPlayer={tapPlayer}
          onVote={castVote}
        />
      ) : state.phase === "reveal" || state.phase === "ended" ? (
        <RevealScreen
          state={state}
          onNextRound={startNextRoundFlow}
          onQuit={quitToIntro}
        />
      ) : null}
    </main>
  );
}
