cd pulsemotionhub
mkdir pulsemotionhub
cd pulsemotionhub
ls -l
ls -1
ls -l
mv server.js.js server.js
mv Dockerfile.txt Dockerfile
mv server.js.js server.js
mv Dockerfile.txt Dockerfile
gcloud run deploy pulsemotionhub-api   --source .   --region YOUR_REGION   --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_API_KEY"   --allow-unauthenticated   --platform managed
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY=AlzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4   --allow-unauthenticated   --platform managed
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY=AlzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4   --allow-unauthenticated   --platform managed
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/storage.admin'
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/run.admin'
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY=AlzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4   --allow-unauthenticated   --platform managed
gcloud builds list --limit 1 --format 'value(logUrl)'
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/iam.serviceAccountUser'
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY="AIzaSy...yourkey...kBfRlbWcR7f3KqABu4"   --allow-unauthenticated   --platform managed
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY="AIzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4"   --allow-unauthenticated   --platform managed
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/storage.objectViewer'
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/storage.admin'
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY="AIzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4"   --allow-unauthenticated   --platform managed
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/storage.objectViewer'
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/storage.admin'
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY="AIzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4"   --allow-unauthenticated   --platform managed
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/run.admin'
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8 --member='serviceAccount:972836342007-compute@developer.gserviceaccount.com' --role='roles/storage.objectViewer'
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY="AIzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4"   --allow-unauthenticated   --platform managed
npm install
gcloud run deploy pulsemotionhub-api   --source .   --region us-central1   --set-env-vars GEMINI_API_KEY="AIzaSyBbpz4c1slG2nzaBXlwRflbc73ckjoA9u4"   --allow-unauthenticated   --platform managed
python3 -m http.server 8080
python3 -m http.server 8080 &
google-chrome --new-window http://localhost:8080/app.js
# 1. Start the static file server in the background
python3 -m http.server 8080 &
# 2. Open the specific file in a new web preview window
cloudshell preview /app.js
kill $(lsof -t -i:8080)
# 1. Start the static file server on port 8000 in the background
python3 -m http.server 8000 &
# 2. Open the specific file in a new web preview window
cloudshell preview /app.js
# 1. Start the static file server on port 8000 in the background
python3 -m http.server 8000 &
# 2. Open the specific file in a new web preview window
cloudshell web-preview 8000 --url-path /app.js
# 1. Start the static file server on port 8000 in the background
python3 -m http.server 8000 &
# 2. Open the specific file in a new web preview window
cloudshell web-preview 8000 --url-path /app.js
kill $(lsof -t -i:8080)
# 1. Start the static file server on port 8000 in the background
python3 -m http.server 8000 &
# 2. Open the specific file in a new web preview window
cloudshell web-preview 8000 --url-path /app.js
kill $(lsof -t -i:8080)
kill $(lsof -t -i:8000)
# 1. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 2. Open the specific frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
cd pulsemotionhub
python3 -m http.server 9000 &
cloudshell web-preview 9000 --url-path /app.js
# 1. Start the dedicated Cloud Shell static server on the default port (8080)
# This automatically serves files from your current directory.
cloudshell serve
# 2. Open the specific frontend file in the web preview
cloudshell web-preview 8080 --url-path /app.js
# 1. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 2. Open the correct frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
# 1. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 2. Open the correct frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
# 1. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 2. Open the correct frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
# 1. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 2. Open the correct frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
# 1. Navigate to your project folder
cd pulsemotionhub
# 2. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 3. Open the correct frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
killall python3
# 1. Navigate to your project folder
cd pulsemotionhub
# 2. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 3. Open the correct frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
cd pulsemotionhub
# 1. Start the static file server on port 9000 in the background
python3 -m http.server 9000 &
# 2. Open the correct frontend file in a new web preview window
cloudshell web-preview 9000 --url-path /app.js
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --port 8080
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --port 8080
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="[YOUR-GEMINI-API-KEY]" --port 8080
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4" --port 8080
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="[YOUR-GEMINI-API-KEY]" --port 8080
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4" --port 8080
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4" --port 8080
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=pulsemotionhub AND severity=ERROR" --limit 25 --format "value(textPayload)"
gcloud projects add-iam-policy-binding idyllic-journey-475621-j8   --member="serviceAccount:$(gcloud projects describe idyllic-journey-475621-j8 --format='value(projectNumber)')-compute@developer.gserviceaccount.com"   --role="roles/serviceusage.serviceUsageAdmin"
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4" --port 8080 --timeout=300s
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4" --concurrency=10 --timeout=600s
[200~gcloud run services describe pulsemotionhub --region us-central1 --format='value(status.url)'~
gcloud run services describe pulsemotionhub --region us-central1 --format='value(status.url)'
gcloud run services list --filter="SERVICE=pulsemotionhub" --format="value(URL)"
gcloud run services delete pulsemotionhub --region us-central1 --quiet
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4" --concurrency=10 --timeout=600s
gcloud run services list --region us-central1 --format='value(URL)'
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4" --concurrency=10 --timeout=600s
gcloud run services list --region us-central1 --format='value(URL)'
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4" --concurrency=10 --timeout=600s
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4" --concurrency=10 --timeout=600s
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4" --concurrency=10 --timeout=600s
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4" --concurrency=10 --timeout=600s
gcloud run services describe pulsemotionhub --region us-central1 --format='value(status.url)'
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4" --concurrency=10 --timeout=600s
gcloud run services describe pulsemotionhub --region us-central1 --format='value(status.url)'
gcloud run services list --platform managed --region us-central1 --filter="SERVICE=pulsemotionhub"
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub --platform managed --region us-central1 --allow-unauthenticated --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4" --concurrency=10 --timeout=600s
gcloud run services delete pulsemotionhub --region us-central1 --quiet
gcloud run services update pulsemotionhub   --region us-central1   --cpu=1   --memory=1Gi   --no-allow-unauthenticated   --set-traffic=100
gcloud run services update pulsemotionhub   --region us-central1   --cpu=1   --memory=1Gi   --ingress=internal-and-cloud-load-balancing
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub   --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub   --platform managed   --region us-central1   --cpu=1   --memory=1Gi   --ingress=all   --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4"   --concurrency=10   --timeout=600s
gcloud run services delete pulsemotionhub --region us-central1 --quiet
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub   --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub   --platform managed   --region us-central1   --cpu=1   --memory=1Gi   --ingress=all   --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4"   --concurrency=10   --timeout=600s
# 1. Navigate to your functions directory (if needed)
# cd functions 
# 2. Deploy the function. 
# Assuming your function is named 'generateScriptProxy' (as in the file provided earlier):
firebase deploy --only functions
gcloud builds submit --tag gcr.io/idyllic-journey-475621-j8/pulsemotionhub .
gcloud run deploy pulsemotionhub   --image gcr.io/idyllic-journey-475621-j8/pulsemotionhub   --platform managed   --region us-central1   --cpu=1   --memory=1Gi   --ingress=all   --set-env-vars=GEMINI_API_KEY="AIzaSyBzpz4cIs1GZhm2aRwWhRBC7JcKjo9aU4"   --concurrency=10   --timeout=600s
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=60s
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=60s
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080
gcloud auth login
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080
gcloud run deploy pulsemotionhub   --source .   --platform managed   --region us-central1   --allow-unauthenticated   --set-env-vars=GEMINI_API_KEY='AIzaSyBbpz4c1sIG2nzaBXlwRfIbc73ckjoA9u4'   --cpu=1   --memory=1Gi   --concurrency=10   --timeout=600s   --port=8080
If this deployment succeeds, please share the **Service URL**. If it fails again, we will move your application back to **Firebase Cloud Functions** as the last alternative to avoid these container startup headaches!
firebase deploy --only hosting
firebase init
firebase emulators:start --only hosting,functions,firestore
firebase init
firebase init --project idyllic-journey-47562
firebase init
rm .firebaserc
git init
git add .
git commit -m "Finalizing code before moving to Render"
git config --global user.email "wavie3582@gmail.com

 git add .
git add .
git add
git add .
git config --global user.email "wavie3582@gmail.com"
git add .
git init
git add .
git commit -m "Finalizing code before moving to Render"
git config --global user.email "wavie3582@gmail.com"  git config --global user.name "Reginald James"
# Initialize a Git repository in your current folder
git init
# Add all files (the corrected server.js, index.html, package.json, etc.)
git add .
# Commit the final, corrected code
git commit -m "Final fix of file swap and ready for Render"
git config --global user.emai "wavie3582@gmail.com"
git config --global user.name "Reginald James"
git commit --amend -m "Final fix of file swap and ready for Render"
# Set the remote origin (Connects your local folder to your GitHub repo)
git remote add origin https://github.com/ReginaldJames1/pulsemotionhub-video-app.git
# Push the final code to GitHub (Your code is now officially saved)
git push -u origin master
echo "# pulsemotionhub-video-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Reginaldjames1/pulsemotionhub-video-app.git
git push -u origin main
echo "# pulsemotionhub-video-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Reginaldjames1/pulsemotionhub-video-app.git
git push -u origin main
echo "# pulsemotionhub-video-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Reginaldjames1/pulsemotionhub-video-app.git
git push -u origin main
echo "# pulsemotionhub-video-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Reginaldjames1/pulsemotionhub-video-app.git
git push -u origin main
echo "# pulsemotionhub-video-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Reginaldjames1/pulsemotionhub-video-app.git
git push -u origin ma
echo "# pulsemotionhub-video-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Reginaldjames1/pulsemotionhub-video-app.git
git push -u origin main
git add .
git commit -m "Integrate Stability AI SDK and logic"
git push
git push -u origin main
git add .
git commit -m "Final stable code fix for Render deployment"
git push
git add .
git commit -m "Final file swap correction and stable logic deployment"
git push
git log
git add .
git commit -m "Final file swap correction and stable logic deployment"
git push
git add .
git commit -m "Integrate real Stability AI direct fetch logic"
git push
git add .
git commit -m "Final file swap correction and stable logic deployment"
git push
git add .
git commit -m "Final integration of Stability AI fetch logic"
git push
git add server.js
git commit -m "Fix final Stability AI 404 endpoint error"
git push
git add server.js
git commit -m "Fix final SyntaxError: missing quotes on fetch URL"
git push
git add server.js
git commit -m "Fix final SyntaxError: missing quotes on fetch URL"
git push
git add .
git commit -m "Final file sync and Stability AI endpoint fix"
git push
git add .
git commit -m "Final file sync and Stability AI endpoint fix"
git push
git add .
git commit -m "Final file sync and Stability AI endpoint fix"
git push.
git push
git add .
git commit -m "Final file sync and Stability AI endpoint fix"
git push
curl -X POST "https://api.stability.ai/v2beta/engines/stable-diffusion-xl/generate/video"   -H "Authorization: Bearer sk-go00gNnCYdP8qPKVdBFqap1HVriWqk8D4MHzrCWkg0r5xRmN"   -F 'prompt="test"'   --fail -s -o /dev/null -w "%{http_code}\n"
