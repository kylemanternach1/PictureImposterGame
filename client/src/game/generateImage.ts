import { buildChaoticScenePrompt } from "./promptBuilder";
import type { CropRegion, RoundImage } from "./types";

function pickCropRegion(): CropRegion {
  const width = 22 + Math.floor(Math.random() * 18);
  const height = 22 + Math.floor(Math.random() * 18);
  const x = Math.floor(Math.random() * (100 - width));
  const y = Math.floor(Math.random() * (100 - height));
  return { x, y, width, height };
}

async function fetchPollinationsImage(prompt: string): Promise<string> {
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const params = new URLSearchParams({
    model: "flux",
    width: "1024",
    height: "1024",
    seed: String(seed),
    enhance: "false",
  });

  const encodedPrompt = encodeURIComponent(prompt);
  const urls = [
    `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`,
    `https://gen.pollinations.ai/image/${encodedPrompt}?${params}`,
  ];

  let lastError: Error | null = null;
  for (const url of urls) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Image fetch failed (${response.status})`);
        }
        const blob = await response.blob();
        return await blobToDataUrl(blob);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRateLimited = lastError.message.includes("429");
        if (isRateLimited && attempt === 0) {
          await sleep(16_000);
          continue;
        }
        break;
      }
    }
  }

  throw lastError ?? new Error("Image generation failed");
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateRoundImage(): Promise<RoundImage> {
  const { sceneDescription, imagePrompt, imposterHints } = buildChaoticScenePrompt();
  const imageUrl = await fetchPollinationsImage(imagePrompt);

  return {
    prompt: sceneDescription,
    imageUrl,
    cropRegion: pickCropRegion(),
    hintTags: imposterHints,
  };
}
