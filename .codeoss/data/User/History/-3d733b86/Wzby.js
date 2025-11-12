import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const app = express();
const PORT = process.env.PORT || 10000;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.post('/api/generate-video', async (req, res) => {
  try {
    if (!STABILITY_API_KEY) {
      return res.status(500).json({ error: 'API key missing' });
    }
    const { prompt, image, mimeType } = req.body;
    if (!image || !mimeType) {
      return res.status(400).json({ error: 'Missing image or mimeType' });
    }

    const imageBuffer = Buffer.from(image, 'base64');
    const form = new FormData();
    form.append('image', imageBuffer, { filename: 'upload', contentType: mimeType });
    if (prompt) form.append('prompt', prompt);

    const submitUrl = 'https://api.stability.ai/v2beta/stable-video/image-to-video';
    console.log('➡️ Hitting Stability API URL:', submitUrl);

    const resp = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        authorization: STABILITY_API_KEY,
        accept: 'application/json',
        ...form.getHeaders(),
      },
      body: form,
      signal: AbortSignal.timeout(30000),
    });

    const text = await resp.text();
    console.log('⬅️ Stability Response:', resp.status, text);

    if (!resp.ok) {
      return res.status(resp.status).json({ error: 'Stability API submit failed', details: text });
    }

    const json = JSON.parse(text);
    if (!json.id) {
      return res.status(500).json({ error: 'No jobId from Stability', details: json });
    }
    console.log('✅ Job submitted:', json.id);
    return res.json({ jobId: json.id, status: 'submitted' });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('/api/video-result/:id', async (req, res) => {
  const { id } = req.params;
  if (!STABILITY_API_KEY) {
    return res.status(500).json({ error: 'API key missing' });
  }
  try {
    const resultUrl = `https://api.stability.ai/v2beta/stable-video/image-to-video/result/${id}`;
    console.log('➡️ Polling Stability API URL:', resultUrl);

    const resp = await fetch(resultUrl, {
      method: 'GET',
      headers: {
        authorization: STABILITY_API_KEY,
        accept: 'video/mp4',
      },
      signal: AbortSignal.timeout(30000),
    });

    console.log('⬅️ Stability result response status:', resp.status);

    if (resp.status === 202) {
      return res.status(202).json({ status: 'processing' });
    }
    if (!resp.ok) {
      const text = await resp.text();
      console.error('❌ Stability result error:', resp.status, text);
      return res.status(resp.status).json({ error: 'Stability result failed', details: text });
    }

    res.setHeader('Content-Type', 'video/mp4');
    return resp.body.pipe(res);
  } catch (err) {
    console.error('Server error polling:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
