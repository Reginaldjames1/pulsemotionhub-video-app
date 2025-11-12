// server.js
// PulseMotionHub backend proxy for Stability AI image-to-video
// Works on Render, uses ESM, serves /public

import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const app = express();
const PORT = process.env.PORT || 10000; // Render will override
const STABILITY_API_KEY = STABILITY API KEY: sk-go00gNnCYdP8qPKVdBFqap1HVriWqk8D4MHzrCWkg0r5xRmN
;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// basic logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// POST /api/generate-video
// 1) takes { prompt, image (base64), mimeType } from frontend
// 2) sends to Stability: https://api.stability.ai/v2beta/image-to-video
// 3) returns { jobId } to frontend
app.post('/api/generate-video', async (req, res) => {
  try {
    if (!STABILITY_API_KEY) {
      return res
        .status(500)
        .json({ error: 'STABILITY_API_KEY missing in environment.' });
    }

    const { prompt, image, mimeType } = req.body || {};
    if (!image || !mimeType) {
      return res
        .status(400)
        .json({ error: 'Missing image or mimeType in request body.' });
    }

    // convert base64 to Buffer
    const imageBuffer = Buffer.from(image, 'base64');

    const form = new FormData();
    // Stability expects the file field to be called "image"
    form.append('image', imageBuffer, {
      filename: 'upload',
      contentType: mimeType,
    });
    if (prompt) {
      form.append('prompt', prompt);
    }
    // you can add model/motion params here if Stability requires

    // IMPORTANT: Stability wants the key directly, not "Bearer ..."
    const stabilityResp = await fetch(
      'https://api.stability.ai/v2beta/image-to-video',
      {
        method: 'POST',
        headers: {
          authorization: STABILITY_API_KEY,
          accept: 'application/json',
          ...form.getHeaders(),
        },
        body: form,
        // 30s is fine for submit
        signal: AbortSignal.timeout(30000),
      }
    );

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
      return res
        .status(500)
        .json({ error: 'Invalid Stability response', details: rawText });
    }

    // should contain { id: "..." }
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

// GET /api/video-result/:id
// polls Stability until video ready
app.get('/api/video-result/:id', async (req, res) => {
  const { id } = req.params;

  if (!STABILITY_API_KEY) {
    return res
      .status(500)
      .json({ error: 'STABILITY_API_KEY missing in environment.' });
  }

  try {
    const resultResp = await fetch(
      `https://api.stability.ai/v2beta/image-to-video/result/${id}`,
      {
        method: 'GET',
        headers: {
          authorization: STABILITY_API_KEY,
          accept: 'video/mp4',
        },
        signal: AbortSignal.timeout(30000),
      }
    );

    // 202 = still processing
    if (resultResp.status === 202) {
      console.log('Stability job still processing:', id);
      return res.status(202).json({ status: 'processing' });
    }

    if (!resultResp.ok) {
      const errText = await resultResp.text();
      console.error(
        'Stability result failed:',
        resultResp.status,
        errText.slice(0, 300)
      );
      return res.status(resultResp.status).json({
        error: 'Stability API result failed',
        details: errText,
      });
    }

    // success, stream mp4
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
