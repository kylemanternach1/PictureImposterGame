import {
  DEFAULT_HF_MODEL,
  DEFAULT_POLLINATIONS_MODEL,
  HF_MODEL_FALLBACKS,
  type ImageProviderId,
} from "./registry.js";

const HF_ROUTER_BASE = "https://router.huggingface.co/hf-inference/models";
const LEGACY_HF_BASE = "https://api-inference.huggingface.co/models";

export async function generateWithProvider(
  provider: ImageProviderId,
  imagePrompt: string,
  negativePrompt: string,
): Promise<string> {
  switch (provider) {
    case "pollinations":
      return generatePollinationsImage(imagePrompt);
    case "huggingface":
      return generateHuggingFaceImage(imagePrompt, negativePrompt);
    case "placeholder":
      return buildPlaceholderUrl(imagePrompt);
    default:
      throw new Error(`Unknown image provider: ${provider}`);
  }
}

async function generatePollinationsImage(prompt: string): Promise<string> {
  const model = process.env.POLLINATIONS_MODEL?.trim() || DEFAULT_POLLINATIONS_MODEL;
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  const seed = Math.floor(Math.random() * 1_000_000_000);
  const params = new URLSearchParams({
    model,
    width: "1024",
    height: "1024",
    seed: String(seed),
    enhance: "false",
  });

  if (apiKey) {
    params.set("key", apiKey);
    params.set("nologo", "true");
  }

  const encodedPrompt = encodeURIComponent(prompt);
  const urls = [
    `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`,
    `https://gen.pollinations.ai/image/${encodedPrompt}?${params}`,
  ];

  let lastError: Error | null = null;
  for (const url of urls) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await fetchImageAsDataUrl(url);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const isRateLimited =
          lastError.message.includes("429") || lastError.message.includes("rate");
        if (isRateLimited && attempt === 0) {
          console.log("Pollinations rate limit hit, waiting 16s before retry...");
          await sleep(16_000);
          continue;
        }
        console.error(`Pollinations URL failed (${url}):`, lastError.message);
        break;
      }
    }
  }

  throw lastError ?? new Error("Pollinations image generation failed");
}

async function generateHuggingFaceImage(prompt: string, negativePrompt: string): Promise<string> {
  const token = process.env.HF_TOKEN?.trim();
  if (!token) {
    throw new Error("HF_TOKEN is required for Hugging Face image generation");
  }

  const models = [process.env.HF_MODEL?.trim() || DEFAULT_HF_MODEL, ...HF_MODEL_FALLBACKS];
  let lastError: Error | null = null;

  for (const model of [...new Set(models)]) {
    try {
      return await generateHuggingFaceModelImage(prompt, negativePrompt, token, model);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Hugging Face model ${model} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("All Hugging Face models failed");
}

async function generateHuggingFaceModelImage(
  prompt: string,
  negativePrompt: string,
  token: string,
  model: string,
): Promise<string> {
  const maxAttempts = 4;
  const endpoints = [
    `${HF_ROUTER_BASE}/${model}`,
    `${LEGACY_HF_BASE}/${model}`,
  ];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildModelRequestBody(prompt, negativePrompt, model)),
        });

        if (response.status === 503) {
          const body = (await response.json().catch(() => ({}))) as { estimated_time?: number };
          const waitMs = Math.min((body.estimated_time ?? 10) * 1000, 30_000);
          await sleep(waitMs);
          continue;
        }

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`${response.status}: ${body}`);
        }

        return await responseToDataUrl(response);
      } catch (error) {
        if (endpoint === endpoints[endpoints.length - 1]) {
          throw error instanceof Error ? error : new Error(String(error));
        }
      }
    }
  }

  throw new Error(`Model ${model} is still loading. Try again in a moment.`);
}

function buildModelRequestBody(
  prompt: string,
  negativePrompt: string,
  model: string,
): { inputs: string; parameters?: Record<string, unknown> } {
  const lowerModel = model.toLowerCase();
  const isFlux = lowerModel.includes("flux");

  if (isFlux) {
    return {
      inputs: prompt,
      parameters: {
        guidance_scale: 3.5,
        num_inference_steps: lowerModel.includes("schnell") ? 4 : 28,
        width: 1024,
        height: 1024,
      },
    };
  }

  return {
    inputs: prompt,
    parameters: {
      negative_prompt: negativePrompt,
      guidance_scale: 11,
      num_inference_steps: 35,
      width: 1024,
      height: 1024,
    },
  };
}

async function fetchImageAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Image fetch failed ${response.status}: ${body.slice(0, 200)}`);
  }
  return responseToDataUrl(response);
}

async function responseToDataUrl(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "image/png";
  if (contentType.includes("application/json")) {
    const body = await response.json();
    throw new Error(`Unexpected JSON response: ${JSON.stringify(body)}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const base64 = buffer.toString("base64");
  return `data:${contentType};base64,${base64}`;
}

function buildPlaceholderUrl(prompt: string): string {
  const seed = encodeURIComponent(prompt.slice(0, 60));
  return `https://picsum.photos/seed/${seed}/1024/1024`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
