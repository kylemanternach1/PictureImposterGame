import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { generateImage, getImageProviderInfo } from "./imageService.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config();

const PORT = Number(process.env.PORT ?? 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const { activeProvider } = getImageProviderInfo();
  res.json({
    ok: true,
    imageProvider: activeProvider,
    hasHfToken: Boolean(process.env.HF_TOKEN?.trim()),
    hasPollinationsKey: Boolean(process.env.POLLINATIONS_API_KEY?.trim()),
  });
});

app.get("/api/image-providers", (_req, res) => {
  res.json(getImageProviderInfo());
});

app.post("/api/generate-image", async (_req, res) => {
  try {
    const image = await generateImage();
    res.json(image);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    res.status(500).json({ error: message });
  }
});

app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (error) => {
    if (error) res.status(404).json({ error: "Client not built" });
  });
});

app.listen(PORT, () => {
  console.log(`Picture Imposter server listening on http://localhost:${PORT}`);
});
