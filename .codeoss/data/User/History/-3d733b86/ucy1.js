// Node.js Backend Proxy for PulseMotionHub (VIDEO GENERATION LOGIC)
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
        const { prompt, image, mimeType, userId } = req.body;

        // 1. Input Validation
        if (!prompt || !image || !mimeType) {
            return res.status(400).json({ error: 'Missing prompt, image data, or MIME type.' });
        }
        
        // --- Simulated API Call and Polling ---
        // This is where the real API call and polling would go.
        await new Promise(resolve => setTimeout(resolve, 6000)); // Simulate 6 seconds of processing

        // 3. Success Response: Send back a working placeholder video URL
        const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Stable, working video URL
        
        console.log(`Video simulated and link generated for User: ${userId}`);
        
        return res.status(200).json({ videoUrl: videoUrl });


    } catch (error) {
        console.error('Video Generation Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error during video processing.' });
    }
});

// --- SERVER STARTUP ---

// Catch-all for undefined routes, serving the frontend (index.html is handled by express.static)
app.get('*', (req, res) => {
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

export default app;