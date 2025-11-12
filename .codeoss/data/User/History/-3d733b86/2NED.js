// PulseMotionHub backend — FAL (Kling v2.1 Standard)
// - Accepts base64 image OR public imageUrl
// - Calls FAL and returns the final video URL
// - Keeps your existing /public frontend

import express from "express";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;
const FAL_API_KEY = process.env.FAL_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "20mb" }));

// Helper: call FAL with JSON (imageUrl)
async function callFalWithUrl({ prompt, imageUrl }) {
  const resp = await fetch("https://fal.run/fal-ai/kling-video/v2.1/standard/image-to-video", {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, image_url: imageUrl }),
  });
  return resp;
}

// Helper: call FAL with multipart (raw image buffer)
async function callFalWithImage({ prompt, imageBuffer, mimeType }) {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("image", imageBuffer, { filename: "input.jpg", contentType: mimeType || "image/jpeg" });

  const resp = await fetch("https://fal.run/fal-ai/kling-video/v2.1/standard/image-to-video", {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });
  return resp;
}

// Main route: /api/generate-video?tier=standard  (premium can be added later)
app.post("/api/generate-video", async (req, res) => {
  if (!FAL_API_KEY) {
    return res.status(500).json({ error: "FAL_API_KEY is missing on server." });
  }

  try {
    const { prompt, image, imageUrl, mimeType } = req.body;
    const tier = (req.query.tier || "standard").toLowerCase();

    if (!prompt) return res.status(400).json({ error: "Missing prompt." });
    if (!image && !imageUrl) return res.status(400).json({ error: "Provide base64 'image' or 'imageUrl'." });
    if (tier !== "standard") return res.status(400).json({ error: "Only 'standard' tier wired for now." });

    // Send to FAL
    let falResp;
    if (imageUrl) {
      falResp = await callFalWithUrl({ prompt, imageUrl });
    } else {
      const buf = Buffer.from(image, "base64");
      falResp = await callFalWithImage({ prompt, imageBuffer: buf, mimeType });
    }

    const text = await falResp.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!falResp.ok) {
      // Handle “locked/exhausted balance” nicely
      const detail = (data && (data.detail || data.message)) || text;
      const isLocked = typeof detail === "string" && detail.toLowerCase().includes("exhausted balance");
      return res.status(isLocked ? 402 : falResp.status).json({
        error: "FAL generation failed",
        status: falResp.status,
        details: data,
      });
    }

    // FAL returns the final link directly (no polling needed)
    const videoUrl =
      data?.video?.url ||
      data?.url ||
      null;

    if (!videoUrl) {
      return res.status(500).json({ error: "FAL response did not include a video URL.", details: data });
    }

    return res.status(200).json({
      tier,
      prompt,
      videoUrl,
      provider: "fal/kling-v2.1-standard",
      filesize: data?.video?.file_size,
      contentType: data?.video?.content_type,
    });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

// Fallback: serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 PulseMotionHub server listening on ${PORT}`);
});
