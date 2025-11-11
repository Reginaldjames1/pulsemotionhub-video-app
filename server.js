// Node.js Backend Proxy for PulseMotionHub (VIDEO GENERATION LOGIC)
// Runs securely on Google Cloud Run.

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import * as path from 'path'; // CRITICAL FIX: Ensures path.join works
import { fileURLToPath } from 'url';

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 8080;

// Get the directory name of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly pull the key from the process environment
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

// Initialize the Gemini AI client (Force key usage)
const gemini = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

// NOTE: Using a generic model name for the simulation
const MODEL_NAME = 'gemini-2.5-flash'; 

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

// --- UTILITIES ---

/**
 * Converts a Base64 string and MIME type into a Part object for the Gemini API.
 */
function base64ToGenerativePart(base64Data, mimeType) {
    if (!base64Data || !mimeType) {
        return null;
    }
    return {
        inlineData: {
            data: base64Data,
            mimeType,
        },
    };
}


// --- API ROUTES ---

/**
 * POST /api/generate-video
 * Handles the multimodal request to generate a video (simulated)
 */
app.post('/api/generate-video', async (req, res) => {
    try {
        const { prompt, image, mimeType, userId } = req.body;

        // 1. Input Validation
        if (!prompt || !image || !mimeType) {
            return res.status(400).json({ error: 'Missing prompt, image data, or MIME type.' });
        }
        
        // 2. Multimodal Content Preparation
        const imagePart = base64ToGenerativePart(image, mimeType);

        // --- Simulated API Call and Polling ---
        // Replace this entire section with the STABILITY AI or RUNWAY API call later
        await new Promise(resolve => setTimeout(resolve, 6000)); // Simulate 6 seconds of processing

        // 3. Success Response: Send back a placeholder video URL
        const videoUrl = "https://pulsemotionhub-video.storage.googleapis.com/final_video.mp4";
        
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

// CRITICAL: Render looks for the port variable
app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server listening on port ${PORT}`);
});

export default app;