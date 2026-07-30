import { buildChaoticScenePrompt, buildPlaceholderSeed } from "./promptBuilder.js";
import {
  DEFAULT_PROVIDER,
  IMAGE_PROVIDERS,
  type ImageProviderId,
} from "./imageProviders/registry.js";
import { generateWithProvider } from "./imageProviders/generate.js";
import type { CropRegion } from "./types.js";

const COLOR_TAGS = [
  "crimson",
  "azure",
  "emerald",
  "amber",
  "violet",
  "teal",
  "coral",
  "indigo",
  "lime",
  "magenta",
  "ochre",
  "slate",
];

const OBJECT_TAGS = [
  "lantern",
  "umbrella",
  "clock",
  "feather",
  "crystal",
  "rope",
  "mirror",
  "candle",
  "wheel",
  "mask",
  "key",
  "compass",
  "shell",
  "gear",
  "vine",
  "coin",
  "jellybean",
  "carousel",
  "blimp",
  "mannequin",
];

export function pickCropRegion(): CropRegion {
  const width = 22 + Math.floor(Math.random() * 18);
  const height = 22 + Math.floor(Math.random() * 18);
  const x = Math.floor(Math.random() * (100 - width));
  const y = Math.floor(Math.random() * (100 - height));
  return { x, y, width, height };
}

export function pickColorTags(): string[] {
  const shuffled = [...COLOR_TAGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function pickObjectTags(): string[] {
  const shuffled = [...OBJECT_TAGS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export interface GeneratedImage {
  prompt: string;
  imageUrl: string;
  cropRegion: CropRegion;
  colorTags: string[];
  objectTags: string[];
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

  // Only use Hugging Face if explicitly configured and a token is present
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
  const { sceneDescription, imagePrompt, negativePrompt } = buildChaoticScenePrompt();
  const cropRegion = pickCropRegion();
  const colorTags = pickColorTags();
  const objectTags = pickObjectTags();

  const providers = resolveProviderChain();
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const imageUrl = await generateWithProvider(provider, imagePrompt, negativePrompt);
      return {
        prompt: sceneDescription,
        imageUrl,
        cropRegion,
        colorTags,
        objectTags,
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
