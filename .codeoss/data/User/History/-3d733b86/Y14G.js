// Node.js Backend Proxy for PulseMotionHub (VIDEO GENERATION LOGIC)
// Runs securely on Render.

import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data'; // move import up so we can reuse

const app = express();
const PORT = process.env.PORT || 8080;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static + json
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// simple logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * 1) START IMAGE→VIDEO JOB
 * frontend calls this with { prompt, image, mimeType }
 */
app.post('/api/generate-video', async (req, res) => {
  if (!STABILITY_API_KEY) {
    return res.status(500).json({ error: 'API Key is missing. Check Render environment variables.' });
  }

  try {
    const { prompt, image, mimeType } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Missing image data or MIME type.' });
    }

    // base64 → buffer
    const imageBuffer = Buffer.from(image, 'base64');

    const formData = new FormData();
    // Stability mainly cares about the image
    formData.append('image', imageBuffer, {
      filename: 'input_image',
      contentType: mimeType,
    });

    // extra fields — some SDKs include motion / seed, but they’re optional
    if (prompt) {
      formData.append('prompt', prompt);
    }

    // call Stability
    const apiResp = await fetch('https://api.stability.ai/v2beta/image-to-video', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        ...formData.getHeaders(),
        Accept: 'application/json',
      },
      body: formData,
      signal: AbortSignal.timeout(30000),
    });

    const text = await apiResp.text();
    if (!apiResp.ok) {
      console.error('Stability submit failed:', apiResp.status, text);
      return res.status(apiResp.status).json({
        error: 'Stability API submit failed',
        details: text,
      });
    }

    // Stability should give you JSON with an id (the generation/job id)
    // example: { "id": "60cfdc1b..." }
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error('Could not parse Stability JSON:', text);
      return res.status(500).json({ error: 'Unexpected Stability response' });
    }

    // send the id to the frontend so it can poll
    return res.status(200).json({
      jobId: json.id,
      status: 'submitted',
    });
  } catch (err) {
    console.error('Video Generation Server Error:', err);
    return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
});

/**
 * 2) POLL FOR RESULT
 * frontend calls /api/video-result/:id until it’s ready
 */
app.get('/api/video-result/:id', async (req, res) => {
  if (!STABILITY_API_KEY) {
    return res.status(500).json({ error: 'API Key is missing. Check Render environment variables.' });
  }

  const { id } = req.params;

  try {
    const resultResp = await fetch(`https://api.stability.ai/v2beta/image-to-video/result/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${STABILITY_API_KEY}`,
        // if we want the actual mp4:
        Accept: 'video/mp4',
      },
      signal: AbortSignal.timeout(30000),
    });

    // If it’s still cooking, Stability often answers 202
    if (resultResp.status === 202) {
      return res.status(202).json({ status: 'processing' });
    }

    if (!resultResp.ok) {
      const errText = await resultResp.text();
      console.error('Stability result failed:', resultResp.status, errText);
      return res.status(resultResp.status).json({
        error: 'Stability API result failed',
        details: errText,
      });
    }

    // success — stream mp4 back
    res.setHeader('Content-Type', 'video/mp4');
    return resultResp.body.pipe(res);
  } catch (err) {
    console.error('Result poll error:', err);
    return res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
});

// catch-all for SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
