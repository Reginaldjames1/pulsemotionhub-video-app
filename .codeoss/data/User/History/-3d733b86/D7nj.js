// 1. Import required libraries
const express = require('express');
const { GoogleGenAI } = require('@google/genai');

// 2. Initialize the Express app
const app = express();

// 3. Middlewares
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Cloud Run requires the port to be set from the environment variable PORT, default is 8080
const PORT = process.env.PORT || 8080; 

// --- Configuration ---
// Note: This assumes GEMINI_API_KEY is set in your Cloud Run Environment Variables
const API_KEY = process.env.GEMINI_API_KEY; 
const ai = new GoogleGenAI(API_KEY);

// --- 4. Define the API Endpoint (The Proxy Logic) ---

// Use app.post() instead of a function handler, matching the client fetch path
app.post('/api/models/gemini-2.5-flash-preview-image:generateContent', async (req, res) => {
    // Set CORS headers for security/cross-domain communication
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { prompt, image, mimeType } = req.body;

        if (!API_KEY) {
            return res.status(500).send({ error: 'Server configuration error: Gemini API Key is missing.' });
        }
        if (!prompt || !image || !mimeType) {
            return res.status(400).send({ error: 'Missing prompt, image data, or mimeType in request body.' });
        }

        // System instruction for the Gemini model
        const systemPrompt = "You are an expert cinematic director. Given an image and a user's desired motion, write a detailed, visually rich 5-second video script (around 50 words maximum) focusing on camera movement (like Dolly, Zoom, Tilt, Pan) and emotional tone, suitable for a text-to-video AI model.";
        
        const fullPrompt = `The source image describes a scene. The user wants the following motion and style applied: ${prompt}. Based on the image content and this motion request, write the 5-second cinematic script.`;
        
        const geminiPayload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: fullPrompt },
                        { inlineData: { mimeType, data: image } }
                    ]
                }
            ],
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        // Call the Gemini API securely
        const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash-preview-image', 
             ...geminiPayload
        });

        const generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedText) {
            res.status(200).send({ script: generatedText });
        } else {
            res.status(500).send({ error: 'AI generation failed to produce valid text.', details: response });
        }
        
    } catch (error) {
        console.error('API Proxy Error:', error);
        res.status(500).send({ error: 'Internal Server Error during AI call.', details: error.message });
    }
});

// --- 5. Start the Express server and listen on the required port ---
app.listen(PORT, () => {
    console.log(`PulseMotionHub Proxy Server running and listening on port ${PORT}`);
});
