# Picture Imposter

A pass-and-play party game for **one device**. Everyone gathers around a phone or tablet, passes it around, and taps their name when it's their turn. One player is secretly the imposter — they only see a cropped sneak peek of the image instead of the full picture.

## Game flow

1. **Setup** — Choose 2–10 players and enter names (no rooms or accounts).
2. **Image generation** — A surreal scene is generated via Pollinations or Hugging Face.
3. **Viewing (pass-and-play)** — Each player taps their name; the image area stays covered until they do. Innocents see the full image; the imposter sees a crop + hint tags. Tap "Done — pass device" when finished.
4. **Story (pass-and-play)** — Same privacy gate: current player taps their name, adds 3–30 words to the ongoing story, then passes the device.
5. **Discussion** — Everyone reads the full story together and debates who seemed off.
6. **Voting (pass-and-play)** — Each player taps their name privately and votes.
7. **Reveal** — Full image, imposter, votes, and fit scores. Up to 5 rounds.

## Privacy / safety

- Image and vote content are **hidden behind a cover** until the active player taps their name.
- After viewing, players tap **"Done — pass device"** to hide content again before handing off.
- Player names show **Done** / **Viewing** status so the group knows who still needs a turn.

## Image generation

The game uses procedurally built **chaotic scene prompts** and supports multiple free providers. Configure via `.env`:

| Provider | Cost | API key? | Best for |
|---|---|---|---|
| **Pollinations** (default) | Free tier | Optional | Surreal, busy scenes — no setup needed |
| **Hugging Face** | Free tier | `HF_TOKEN` required | SDXL with negative prompts — very chaotic |
| **Placeholder** | Free | No | Offline dev only (random stock photos) |

### Quick start (no API key)

```env
IMAGE_PROVIDER=pollinations
```

Works out of the box. Rate-limited to ~1 image per 15 seconds without a key.

### Recommended for maximum chaos

**Option A — Pollinations (easiest)**

```env
IMAGE_PROVIDER=pollinations
POLLINATIONS_MODEL=flux
```

Optional free key at [enter.pollinations.ai](https://enter.pollinations.ai) removes watermarks.

**Option B — Hugging Face SDXL**

```env
IMAGE_PROVIDER=huggingface
HF_TOKEN=hf_...
HF_MODEL=stabilityai/stable-diffusion-xl-base-1.0
```

SDXL uses a strong negative prompt ("boring, plain, minimal…") and 35 inference steps — much better for crowded surreal scenes than FLUX.1-schnell, which is fast but tends to look polished and tame.

### Why FLUX.1-schnell looked tame

- Only 4 denoising steps (optimized for speed, not detail)
- Hosted models often smooth out weird prompts
- No negative prompt support

Try **SDXL on Hugging Face** or **Pollinations + flux** instead.

List available providers: `GET /api/image-providers`

## Tech stack

- **Client:** React + Vite (local game state, no multiplayer server)
- **Server:** Minimal Express API for image generation
- **Images:** Procedural chaotic prompts + Pollinations or Hugging Face

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm

## Setup

```bash
cd ~/Developer/Scratch/PictureImposterGame
cp .env.example .env
npm install
npm run dev
```

**No API key needed.** The game uses [Pollinations](https://pollinations.ai) for free AI image generation. Open http://localhost:5173 on a phone or tablet.

> Free tier is rate-limited to about one image every 15 seconds. If generation fails, wait a moment and try again.

## Production build

```bash
npm run build
npm start
```

Serves the app at http://localhost:3001 — ideal for a single device on the same machine or LAN.

## Project structure

```
PictureImposterGame/
├── client/
│   └── src/
│       ├── game/       # Local game engine
│       ├── hooks/      # useLocalGame
│       └── components/ # Pass-and-play UI
├── server/
│   └── src/
│       ├── imageService.ts
│       └── imageProviders/  # Pollinations, Hugging Face, placeholder
└── package.json
```

## Provider notes

- **Pollinations:** Free anonymous tier is rate-limited (~15s between requests). Optional key improves limits.
- **Hugging Face:** Free tier has rate limits; server retries on 503 (model loading). First request can take 20–30s.
- Server falls back through providers automatically if the primary fails.

## Roadmap ideas

- [ ] Optional longer viewing timer in setup
- [ ] Sound/haptic cue when it's your turn
- [ ] Package as a PWA for offline shell + cached assets
- [ ] LLM-based fit scores instead of keyword heuristics
