import { useCallback, useState } from "react";
import {
  beginGenerating,
  beginRound,
  createInitialState,
  finishViewing,
  goToSetup,
  resetGame,
  returnToSetup,
  revealImposters,
  selectActivePlayer,
  setupPlayers,
} from "../game/engine";
import type { GameState } from "../game/types";
import { generateRoundImage } from "../game/generateImage";

export function useLocalGame() {
  const [state, setState] = useState<GameState>(createInitialState);

  const openSetup = useCallback(() => {
    setState((current) => goToSetup(current));
  }, []);

  const startGame = useCallback(async (names: string[], imposterCount: number) => {
    setState(beginGenerating(setupPlayers(names, imposterCount)));
    try {
      const image = await generateRoundImage();
      setState((current) => beginRound(current, image));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image generation failed";
      setState((current) => ({
        ...current,
        phase: "setup",
        generatingError: message,
      }));
    }
  }, []);

  const tapPlayer = useCallback((playerId: string) => {
    setState((current) => selectActivePlayer(current, playerId));
  }, []);

  const completeViewing = useCallback((playerId: string) => {
    setState((current) => finishViewing(current, playerId));
  }, []);

  const revealImpostersFlow = useCallback(() => {
    setState((current) => revealImposters(current));
  }, []);

  const newGame = useCallback(() => {
    setState((current) => returnToSetup(current));
  }, []);

  const quitToIntro = useCallback(() => {
    setState(resetGame());
  }, []);

  return {
    state,
    openSetup,
    startGame,
    tapPlayer,
    completeViewing,
    revealImposters: revealImpostersFlow,
    newGame,
    quitToIntro,
  };
}
