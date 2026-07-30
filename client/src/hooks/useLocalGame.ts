import { useCallback, useState } from "react";
import {
  beginGenerating,
  beginRound,
  createInitialState,
  finishViewing,
  goToSetup,
  goToVoting,
  resetGame,
  selectActivePlayer,
  setupPlayers,
  startNextRound,
  submitStory,
  submitVote,
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

  const startNextRoundFlow = useCallback(async () => {
    let shouldGenerate = false;
    setState((current) => {
      if (current.roundNumber >= current.maxRounds) {
        return { ...current, phase: "ended" };
      }
      shouldGenerate = true;
      return beginGenerating(startNextRound(current));
    });

    if (!shouldGenerate) return;

    try {
      const image = await generateRoundImage();
      setState((current) => beginRound(current, image));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image generation failed";
      setState((current) => ({
        ...current,
        phase: "reveal",
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

  const addStoryContribution = useCallback((playerId: string, text: string) => {
    setState((current) => submitStory(current, playerId, text));
  }, []);

  const castVote = useCallback((voterId: string, targetId: string) => {
    setState((current) => submitVote(current, voterId, targetId));
  }, []);

  const advanceToVoting = useCallback(() => {
    setState((current) => goToVoting(current));
  }, []);

  const quitToIntro = useCallback(() => {
    setState(resetGame());
  }, []);

  return {
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
  };
}
