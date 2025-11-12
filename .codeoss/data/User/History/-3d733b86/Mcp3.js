// server.js
// PulseMotionHub backend proxy for Stability AI image-to-video
// ESM + Express + Render-friendly

import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const app = express();
const PORT = process.env.PORT || 10000;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// simple logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * 1) submit job to Stability
 */
app.post('/api/generate-video', async (req, res) => {
  try {
    if (!STABILITY_API_KEY) {
      return res.status(500).json({ error: 'STABILITY_API_KEY missing in environment.' });
    }

    const { prompt, image, mimeType } = req.body || {};
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Missing image or mimeType in request body.' });
    }

    const imageBuffer = Buffer.from(image, 'base64');

    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'upload',
      contentType: mimeType,
    });
    if (prompt) {
      form.append('prompt', prompt);
    }

    // NEW: use /v2beta/stable-video/...
    const submitUrl = 'https://api.stability.ai/v2beta/stable-video/image-to-video';

    const stabilityResp = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        // Stability wants the key directly, no "Bearer "
        authorization: STABILITY_API_KEY,
        accept: 'application/json',
        ...form.getHeaders(),
      },
      body: form,
      signal: AbortSignal.timeout(30000),
    });

    const rawText = await stabilityResp.text();

    if (!stabilityResp.ok) {
      console.error('Stability submit failed:', stabilityResp.status, rawText);
      return res.status(stabilityResp.status).json({
        error: 'Stability API submit failed',
        details: rawText,
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      console.error('Could not parse Stability JSON:', rawText);
      return res.status(500).json({ error: 'Invalid Stability response', details: rawText });
    }

    if (!parsed.id) {
      console.error('Stability response missing id:', parsed);
      return res.status(500).json({
        error: 'Stability did not return a job id.',
        details: parsed,
      });
    }

    console.log('Stability job submitted:', parsed.id);
    return res.json({ jobId: parsed.id, status: 'submitted' });
  } catch (err) {
    console.error('Video Generation Server Error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err.message,
    });
  }
});

/**
 * 2) poll for result
 */
app.get('/api/video-result/:id', async (req, res) => {
  const { id } = req.params;

  if (!STABILITY_API_KEY) {
    return res.status(500).json({ error: 'STABILITY_API_KEY missing in environment.' });
  }

  try {
    // NEW: matching result path
    const resultUrl = `https://api.stability.ai/v2beta/stable-video/image-to-video/result/${id}`;

    const resultResp = await fetch(resultUrl, {
      method: 'GET',
      headers: {
        authorization: STABILITY_API_KEY,
        accept: 'video/mp4',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (resultResp.status === 202) {
      console.log('Stability job still processing:', id);
      return res.status(202).json({ status: 'processing' });
    }

    if (!resultResp.ok) {
      const errText = await resultResp.text();
      console.error('Stability result failed:', resultResp.status, errText.slice(0, 300));
      return res.status(resultResp.status).json({
        error: 'Stability API result failed',
        details: errText,
      });
    }

    res.setHeader('Content-Type', 'video/mp4');
    return resultResp.body.pipe(res);
  } catch (err) {
    console.error('Result poll error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err.message,
    });
  }
});

// SPA fallback
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
