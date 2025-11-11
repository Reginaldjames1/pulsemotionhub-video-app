// Node.js Backend Proxy for PulseMotionHub
// Runs securely on Google Cloud Run.
// Handles API key and communicates with Gemini API.

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

// The API key is loaded from the Cloud Run environment variable.
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL_NAME = 'gemini-2.5-flash';

// --- MIDDLEWARE ---

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON request bodies
app.use(express.json({ limit: '5mb' })); // Increased limit to handle large image Base64 strings

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- UTILITIES ---

/**
 * Converts a Base64 string and MIME type into a Part object for the Gemini API.
 * @param {string} base64Data - The base64 encoded image data.
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns {object} A Part object for the Gemini API.
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
 * POST /api/generate-script
 * Handles the multimodal request to generate a cinematic script from an image and text prompt.
 */
app.post('/api/generate-script', async (req, res) => {
    try {
        const { prompt, image, mimeType, userId } = req.body;

        // 1. Input Validation
        if (!prompt || !image || !mimeType) {
            return res.status(400).json({ error: 'Missing prompt, image data, or MIME type.' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'User ID is missing. Authentication failed.' });
        }

        // 2. Multimodal Content Preparation
        const imagePart = base64ToGenerativePart(image, mimeType);

        // System Instruction to guide the AI's persona and output quality
        const systemInstruction = `You are PulseMotion, a world-class cinematic AI specializing in generating detailed, 5-second video scripts. Based on the provided image and motion prompt, write a concise, hyper-realistic description of the camera movement, lighting, and mood. Your response MUST only contain the generated script text, formatted for clarity.`;

        const userPrompt = `Analyze this image and apply the following motion and style instructions: "${prompt}". Generate a single, descriptive 5-second cinematic script.`;

        const contents = [
            imagePart,
            { text: userPrompt }
        ];

        // 3. API Call to Gemini
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9, // Higher temperature for creative output
                maxOutputTokens: 500,
            }
        });

        const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
            console.log(`Script generated successfully for User: ${userId}`);
            // 4. Success Response
            return res.status(200).json({ script: generatedText });
        } else {
            console.error(`AI returned empty response for User: ${userId}`);
            // 5. Failure Response
            return res.status(500).json({ error: 'AI generated an empty response or was blocked.' });
        }

    } catch (error) {
        console.error('Gemini API/Server Error:', error);
        // Catch network errors, API quota errors, etc.
        return res.status(500).json({ error: 'Internal Server Error during AI processing.' });
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



export default app;
