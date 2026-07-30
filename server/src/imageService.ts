import { buildChaoticScenePrompt, buildPlaceholderSeed } from "./promptBuilder.js";
import {
  DEFAULT_PROVIDER,
  IMAGE_PROVIDERS,
  type ImageProviderId,
} from "./imageProviders/registry.js";
import { generateWithProvider } from "./imageProviders/generate.js";
import type { CropRegion } from "./types.js";

export function pickCropRegion(): CropRegion {
  const width = 22 + Math.floor(Math.random() * 18);
  const height = 22 + Math.floor(Math.random() * 18);
  const x = Math.floor(Math.random() * (100 - width));
  const y = Math.floor(Math.random() * (100 - height));
  return { x, y, width, height };
}

export interface GeneratedImage {
  prompt: string;
  imageUrl: string;
  cropRegion: CropRegion;
  hintTags: string[];
  provider: ImageProviderId;
}

function resolveProvider(): ImageProviderId {
  const configured = process.env.IMAGE_PROVIDER?.trim().toLowerCase();
  if (configured === "pollinations" || configured === "huggingface" || configured === "placeholder") {
    return configured;
  }
  return DEFAULT_PROVIDER;
}

function resolveProviderChain(): ImageProviderId[] {
  const primary = resolveProvider();
  const chain: ImageProviderId[] = [primary];

  if (primary === "pollinations" && process.env.HF_TOKEN?.trim()) {
    chain.push("huggingface");
  } else if (primary !== "pollinations") {
    chain.push("pollinations");
    if (primary !== "huggingface" && process.env.HF_TOKEN?.trim()) {
      chain.push("huggingface");
    }
  }

  chain.push("placeholder");
  return [...new Set(chain)];
}

export async function generateImage(): Promise<GeneratedImage> {
  const { sceneDescription, imagePrompt, negativePrompt, imposterHints } = buildChaoticScenePrompt();
  const cropRegion = pickCropRegion();

  const providers = resolveProviderChain();
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const imageUrl = await generateWithProvider(provider, imagePrompt, negativePrompt);
      return {
        prompt: sceneDescription,
        imageUrl,
        cropRegion,
        hintTags: imposterHints,
        provider,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Provider ${provider} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("Image generation failed");
}

export function getImageProviderInfo() {
  return {
    activeProvider: resolveProvider(),
    providers: IMAGE_PROVIDERS,
  };
}

export function buildPlaceholderImageUrl(sceneDescription: string): string {
  const seed = buildPlaceholderSeed(sceneDescription);
  return `https://picsum.photos/seed/${seed}/1024/1024`;
}
