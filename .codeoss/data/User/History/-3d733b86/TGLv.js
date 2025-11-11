<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PulseMotionHub - Cinematic AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Custom Neon Green Theme */
        :root {
            --neon-green: #39FF14;
            --dark-bg: #111827;
            --dark-card: #1f2937;
        }
        body {
            background-color: var(--dark-bg);
            color: #f3f4f6;
        }
        .text-neon {
            color: var(--neon-green);
        }
        .border-neon {
            border-color: var(--neon-green);
        }
        .bg-card {
            background-color: var(--dark-card);
        }
        .btn-neon {
            background-color: var(--neon-green);
            color: var(--dark-bg);
            transition: all 0.2s;
        }
        .btn-neon:hover {
            background-color: #5dff4d;
            box-shadow: 0 0 10px var(--neon-green);
        }
        /* Style for the drag-and-drop area */
        #drop-area {
            border: 2px dashed var(--neon-green);
            background-color: rgba(57, 255, 20, 0.1);
        }
        /* Style for the generated script */
        #script-output {
            white-space: pre-wrap; 
            font-family: monospace;
            padding: 1rem;
            border-left: 5px solid var(--neon-green);
            background-color: #0b111a;
        }
    </style>
</head>
<body class="min-h-screen p-4 md:p-8">

    <header class="text-center mb-10">
        <h1 class="text-4xl md:text-6xl font-extrabold text-white">
            Pulse<span class="text-neon">Motion</span>Hub
        </h1>
        <p class="text-lg text-gray-400 mt-2">
            AI-Powered Cinematic Video Generator
        </p>
    </header>

    <main class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <section class="bg-card p-6 rounded-lg shadow-2xl">
            <h2 class="text-2xl font-bold mb-5 text-white">1. Input Image & Motion Prompt</h2>

            <div id="drop-area" class="flex flex-col items-center justify-center p-6 mb-5 rounded-lg h-48 cursor-pointer">
                <input type="file" id="image-upload" accept="image/*" class="hidden" />
                <p id="drop-text" class="text-gray-400 text-center">
                    Drag & Drop your image here, or <span class="text-neon font-semibold">Click to Upload</span>
                </p>
                <img id="image-preview" class="hidden max-h-full max-w-full rounded mt-3" src="" alt="Image Preview" />
            </div>

            <div class="mb-5">
                <label for="prompt" class="block text-sm font-medium text-gray-300 mb-2">Motion Prompt (Describe the desired video motion)</label>
                <textarea id="prompt" rows="3" class="w-full bg-gray-700 text-white rounded-lg p-3 focus:ring-neon focus:border-neon border border-gray-600" placeholder="Example: A slow 360-degree orbit around the subject with soft, morning light..."></textarea>
            </div>

            <button id="generate-btn" class="btn-neon w-full py-3 rounded-lg text-xl font-semibold disabled:opacity-50" disabled>
                Generate Video
            </button>
        </section>

        <section class="bg-card p-6 rounded-lg shadow-2xl">
            <h2 class="text-2xl font-bold mb-5 text-white">2. Video Generation Output</h2>

            <div id="status-area" class="mb-5 h-6">
                <p id="status-text" class="text-gray-400">Ready to receive input.</p>
            </div>

            <div id="progress-container" class="w-full bg-gray-700 rounded-full h-2.5 mb-5 hidden">
                <div id="progress-bar" class="bg-neon h-2.5 rounded-full transition-all duration-300 ease-linear" style="width: 0%"></div>
            </div>

            <h3 class="text-lg font-semibold text-gray-300 mb-2">RESULT:</h3>
            <div id="script-output" class="bg-gray-800 rounded-lg h-96 overflow-y-auto text-sm text-gray-200">
                // Your video URL will appear here after processing.
            </div>

        </section>
    </main>

    <footer class="text-center mt-12 text-gray-500 text-sm">
        <p>&copy; 2025 PulseMotionHub. All rights reserved. Powered by Gemini.</p>
    </footer>

    <script>
        // --- CLIENT-SIDE JAVASCRIPT LOGIC ---

        const dropArea = document.getElementById('drop-area');
        const imageUpload = document.getElementById('image-upload');
        const imagePreview = document.getElementById('image-preview');
        const generateBtn = document.getElementById('generate-btn');
        const promptInput = document.getElementById('prompt');
        const statusText = document.getElementById('status-text');
        const progressBar = document.getElementById('progress-bar');
        const progressContainer = document.getElementById('progress-container');
        const scriptOutput = document.getElementById('script-output');

        let base64Image = null;
        let mimeType = null;

        function handleFile(file) {
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imagePreview.classList.remove('hidden');
                    dropArea.classList.remove('border-neon');
                    document.getElementById('drop-text').classList.add('hidden');

                    const [type, data] = e.target.result.split(',');
                    mimeType = type.split(':')[1].split(';')[0];
                    base64Image = data;
                    
                    generateBtn.disabled = !(base64Image && promptInput.value.trim());
                    statusText.textContent = `Image loaded: ${file.name}`;
                };
                reader.readAsDataURL(file);
            } else {
                alert("Please upload a valid image file.");
            }
        }

        // --- Event Listeners for File Input ---
        dropArea.addEventListener('click', () => imageUpload.click());
        imageUpload.addEventListener('change', (e) => handleFile(e.target.files[0]));
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(eventName => { dropArea.addEventListener(eventName, () => dropArea.classList.add('border-neon'), false); });
        ['dragleave', 'drop'].forEach(eventName => { dropArea.addEventListener(eventName, () => dropArea.classList.remove('border-neon'), false); });
        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            handleFile(file);
        }, false);
        promptInput.addEventListener('input', () => {
            generateBtn.disabled = !(base64Image && promptInput.value.trim());
        });

        // --- API Call and Processing (Video Logic) ---

        generateBtn.addEventListener('click', async () => {
            if (!base64Image) {
                alert("Please upload an image first.");
                return;
            }

            generateBtn.disabled = true;
            scriptOutput.textContent = '// Sending request to AI server...';
            progressContainer.classList.remove('hidden');
            progressBar.style.width = '10%';
            statusText.textContent = 'Contacting AI endpoint...';
            
            const payload = {
                prompt: promptInput.value.trim(),
                image: base64Image,
                mimeType: mimeType,
                userId: 'anonymous-user-001'
            };

            try {
                // IMPORTANT: The fetch URL calls the backend's /api/generate-video route
                const response = await fetch('/api/generate-video', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                // Simulate progressive loading while waiting for the response
                const interval = setInterval(() => {
                    const currentWidth = parseInt(progressBar.style.width);
                    if (currentWidth < 90) {
                        progressBar.style.width = `${currentWidth + 5}%`;
                        statusText.textContent = `Processing video... (${currentWidth + 5}%)`;
                    }
                }, 500);
                
                // --- Handle Response ---
                
                clearInterval(interval);
                progressBar.style.width = '100%';

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                // Display the video URL
                if (data.videoUrl) {
                    scriptOutput.innerHTML = `<p class="text-white mb-2">Video created successfully! Click the link to view:</p><a href="${data.videoUrl}" target="_blank" class="text-neon underline hover:text-white">${data.videoUrl}</a>`;
                    statusText.textContent = '✅ Video Generation Complete!';