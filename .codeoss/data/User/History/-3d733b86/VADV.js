// This file sets up an Express server to securely proxy calls to the Gemini API.
// It is designed to be run in a secure environment like Cloud Run, where the
// GEMINI_API_KEY is available as an environment variable.
const express = require('express');
const fetch = require('node-fetch'); 

// It is critical to set the GEMINI_API_KEY environment variable.
// Cloud Run injects this value from the environment secrets you set during deployment.
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";
…// Simple health check endpoint for Cloud Run
app.get('/', (req, res) => {
    res.status(200).send(`PulseMotionHub Backend is running on port ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`PulseMotionHub Backend listening on port ${PORT}`);
});