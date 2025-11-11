if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found.' });
    }
});

// CRITICAL: Express server listening command for Render
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server listening on port ${PORT}`);
});

export default app;// Node.js Backend Proxy for PulseMotionHub (VIDEO GENERATION LOGIC)
// Runs securely on Render.

import express from 'express';
import * as path from 'path'; // CRITICAL FIX: Ensures path.join works
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 8080;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARE ---

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- API ROUTES ---

/**
 * POST /api/generate-video
 * Handles the multimodal request to generate a video (simulated)
 */
app.post('/api/generate-video', async (req, res) => {
    // CRITICAL CHECK: Ensure API Key is available
    if (!STABILITY_API_KEY) {
        return res.status(500).json({ error: 'API Key is missing. Check Render environment variables.' });
    }

    try {
        const { prompt, image, mimeType } = req.body;

        // 1. Input Validation
        if (!prompt || !image || !mimeType) {
            return res.status(400).json({ error: 'Missing prompt, image data, or MIME type.' });
        }
        
        // 2. Prepare Form Data for Stability AI API (Standard for image uploads)
        const FormData = (await import('form-data')).default;
        
        // Convert Base64 image data to a buffer for the request
        const imageBuffer = Buffer.from(image, 'base64');
        
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('image', imageBuffer, {
            filename: 'input_image.jpg',
            contentType: mimeType,
        });
        formData.append('output_format', 'mp4'); // Request a standard video format
        
        // 3. Call the Stability AI API (The Final Corrected URL)
        const apiResponse = await fetch("https://api.stability.ai/v2beta/engines/stable-diffusion-xl/generate/video", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STABILITY_API_KEY}`,
                ...formData.getHeaders(), 
            },
            body: formData,
            signal: AbortSignal.timeout(30000) 
        });
        
        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            throw new Error(`Stability API Error: ${apiResponse.status} - ${errorText}`);
        }
        
        // 4. Success Response: Placeholder for the real asset URL
        const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Stable, working video URL
        
        console.log(`Video simulated and link generated for User: ${userId}`);
        
        return res.status(200).json({ videoUrl: videoUrl });

    } catch (error) {
        console.error('Video Generation Server Error:', error);
        return res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

// --- SERVER STARTUP ---

// Catch-all for undefined routes, serving the frontend (index.html is handled by express.static)
app.get('*', (req, res) => {
    