export type ImageProviderId = "pollinations" | "huggingface" | "placeholder";

export interface ImageProviderInfo {
  id: ImageProviderId;
  name: string;
  requiresApiKey: boolean;
  description: string;
  models: string[];
  notes: string;
}

export const IMAGE_PROVIDERS: ImageProviderInfo[] = [
  {
    id: "pollinations",
    name: "Pollinations",
    requiresApiKey: false,
    description: "Free tier with no key required (rate-limited). Good for surreal prompts.",
    models: ["flux", "turbo", "gptimage"],
    notes: "Optional POLLINATIONS_API_KEY removes watermarks and raises limits.",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    requiresApiKey: true,
    description: "Free inference with HF_TOKEN. Best chaos results with SDXL + negative prompts.",
    models: [
      "stabilityai/stable-diffusion-xl-base-1.0",
      "black-forest-labs/FLUX.1-dev",
      "black-forest-labs/FLUX.1-schnell",
      "runwayml/stable-diffusion-v1-5",
    ],
    notes: "Use SDXL for maximalist chaos; FLUX.1-dev is higher quality but slower.",
  },
  {
    id: "placeholder",
    name: "Placeholder",
    requiresApiKey: false,
    description: "Random stock photos — for offline dev only.",
    models: ["picsum"],
    notes: "Not AI-generated.",
  },
];

export const DEFAULT_PROVIDER: ImageProviderId = "pollinations";

export const DEFAULT_HF_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
export const HF_MODEL_FALLBACKS = [
  "black-forest-labs/FLUX.1-dev",
  "black-forest-labs/FLUX.1-schnell",
  "runwayml/stable-diffusion-v1-5",
];

export const DEFAULT_POLLINATIONS_MODEL = "flux";
