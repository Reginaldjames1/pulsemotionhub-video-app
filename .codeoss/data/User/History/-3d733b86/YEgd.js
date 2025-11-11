// Node.js Backend Proxy for PulseMotionHub (VIDEO GENERATION LOGIC)
// Runs securely on Google Cloud Run.
// Handles API key and communicates with Gemini API for async video generation.

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
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

// NOTE: For real video generation (e.g., using Veo), you would use a specific Google Cloud endpoint (like Vertex AI).
// For this simulation, we use a placeholder model name and simulate the async behavior.
const MODEL_NAME = 'veo-3.1-generate-preview'; 

// --- MIDDLEWARE ---

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' })); // Increased limit for video payloads

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

/**
 * Simulates an Asynchronous API call with Polling.
 * NOTE: In a real Vertex AI environment, this would hit the Operation Service
 * with the operationId to check the status.
 */
async function pollForVideoCompletion(operationId) {
    console.log(`Polling started for operation: ${operationId}`);
    
    // Simulate latency and processing time (15 seconds total)
    const MAX_POLLS = 5;
    for (let i = 0; i < MAX_POLLS; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        
        if (i === MAX_PSOLS - 1) {
            // Success on the final poll
            console.log(`Operation ${operationId} complete.`);
            return {
                videoUrl: "https://d36j.run.app/final_cinematic_video.mp4", // Simulated video URL
                status: 'DONE'
            };
        } else {
            console.log(`Operation ${operationId} status: IN_PROGRESS (${i + 1}/${MAX_POLLS})`);
        }
    }
}


// --- API ROUTES ---

/**
 * POST /api/generate-video
 * Handles the multimodal request to generate a video from an image and text prompt.
 * Switches to asynchronous generation logic.
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

        // Simulated API Call:
        // In a real scenario, this would initiate the video generation job.
        console.log(`Initiating video generation job for User: ${userId}`);
        const operationId = `veo-op-${Date.now()}`;
        
        // 3. Polling for Completion
        const result = await pollForVideoCompletion(operationId);

        if (result.status === 'DONE' && result.videoUrl) {
            console.log(`Video generated successfully at: ${result.videoUrl}`);
            // 4. Success Response
            return res.status(200).json({ videoUrl: result.videoUrl });
        } else {
            console.error(`Video generation failed for Operation: ${operationId}`);
            // 5. Failure Response
            return res.status(500).json({ error: 'Video generation failed or returned an empty result.' });
        }

    } catch (error) {
        console.error('Video Generation Server Error:', error);
        // Catch network errors, API quota errors, etc.
        return res.status(500).json({ error: 'Internal Server Error during video processing.' });
    }
});

// --- SERVER STARTUP ---

// Catch-all for undefined routes, serving the frontend (index.html is handled by express.static)
app.get('*', (req, res) => {
    // Check if the request is for an API endpoint
    if (!req.path.startsWith('/api')) {
        // Serve the static index.html file
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        // Handle undefined API endpoint
        res.status(404).json({ error: 'API endpoint not found.' });
    }
});

export default app;