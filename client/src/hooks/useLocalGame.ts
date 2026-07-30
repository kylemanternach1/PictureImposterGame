import { useCallback, useState } from "react";
import {
  beginGenerating,
  beginRound,
  createInitialState,
  finishViewing,
  goToVoting,
  resetGame,
  selectActivePlayer,
  setupPlayers,
  startNextRound,
  submitStory,
  submitVote,
} from "../game/engine";
import type { GameState, RoundImage } from "../game/types";

async function fetchRoundImage(): Promise<RoundImage> {
  const response = await fetch("/api/generate-image", { method: "POST" });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to generate image");
  }
  return response.json() as Promise<RoundImage>;
}

export function useLocalGame() {
  const [state, setState] = useState<GameState>(createInitialState);

  const startGame = useCallback(async (names: string[]) => {
    setState(beginGenerating(setupPlayers(names)));
    try {
      const image = await fetchRoundImage();
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
      const image = await fetchRoundImage();
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

  const quitToSetup = useCallback(() => {
    setState(resetGame());
  }, []);

  return {
    state,
    startGame,
    startNextRoundFlow,
    tapPlayer,
    completeViewing,
    addStoryContribution,
    castVote,
    advanceToVoting,
    quitToSetup,
  };
}
