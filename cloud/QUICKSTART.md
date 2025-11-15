# Quick Start Guide

Get the Family Calendar Assistant running in under 15 minutes.

## Prerequisites Checklist

- [ ] Google Cloud Platform account
- [ ] Firebase project created
- [ ] Anthropic API key
- [ ] `gcloud` CLI installed
- [ ] `firebase` CLI installed

## Step-by-Step Setup

### 1. Clone and Navigate
```bash
cd "Jarvis Paulsen/cloud"
```

### 2. Set Up Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and add your Anthropic API key
nano .env  # or use your preferred editor
```

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Test Backend Locally

```bash
# Run the server
uvicorn main:app --reload --port 8080

# Test in another terminal
curl http://localhost:8080
# Should return: {"status":"healthy","service":"Family Calendar Assistant"}
```

### 4. Set Up Frontend

```bash
cd ../frontend

# Initialize Firebase
firebase login
firebase init hosting

# When prompted:
# - Use existing project or create new one
# - Public directory: . (current directory)
# - Single-page app: Yes
# - GitHub deploys: No
```

### 5. Configure Frontend

Edit `app.js` and update:

1. Get Firebase config from Firebase Console > Project Settings
2. Replace the `FIREBASE_CONFIG` object
3. Set `API_URL` to `http://localhost:8080` for local testing

### 6. Enable Google Sign-In

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Authentication > Sign-in method
4. Enable Google
5. Save

### 7. Test Frontend Locally

```bash
# Start Firebase local server
firebase serve

# Open in browser
open http://localhost:5000
```

### 8. Test the Full Flow

1. Sign in with Google
2. Upload a test calendar image
3. See if events are extracted
4. Note: Calendar integration won't work yet (needs OAuth2 setup)

## Deploy to Production

### Deploy Backend to Cloud Run

```bash
cd backend

# Set project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com vision.googleapis.com

# Deploy
gcloud run deploy calendar-assistant \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=your_key_here

# Note the URL that's printed
```

### Deploy Frontend to Firebase

```bash
cd ../frontend

# Update app.js with your Cloud Run URL
# Change API_URL from localhost to your Cloud Run URL

# Deploy
firebase deploy --only hosting

# Note the hosting URL that's printed
```

### Update CORS

Edit `backend/main.py` and update CORS settings:
```python
allow_origins=[
    "https://your-project.web.app",
    "https://your-project.firebaseapp.com"
]
```

Redeploy backend:
```bash
cd backend
gcloud run deploy calendar-assistant --source .
```

## Verify Production

1. Visit your Firebase Hosting URL
2. Sign in with Google
3. Upload a calendar image
4. Verify events are extracted

## Next Steps

- [ ] Set up OAuth2 for Calendar API (see DEPLOYMENT.md)
- [ ] Configure email whitelist (see DEPLOYMENT.md)
- [ ] Add custom domain
- [ ] Set up monitoring
- [ ] Configure backups

## Troubleshooting

### Backend won't start
```bash
# Check Python version (need 3.11+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Firebase deploy fails
```bash
# Make sure you're logged in
firebase login --reauth

# Check project
firebase projects:list
firebase use YOUR_PROJECT_ID
```

### CORS errors
- Verify CORS origins in backend match your frontend URL
- Redeploy backend after changes
- Clear browser cache

### Vision API errors
```bash
# Enable Vision API
gcloud services enable vision.googleapis.com

# Check quota
gcloud alpha billing quotas list \
  --service=vision.googleapis.com
```

## Support Files

- Full deployment guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Backend docs: [backend/README.md](./backend/README.md)
- Frontend docs: [frontend/README.md](./frontend/README.md)
- Main README: [README.md](./README.md)

## Quick Commands Reference

```bash
# Backend local
cd backend && uvicorn main:app --reload

# Frontend local
cd frontend && firebase serve

# Backend deploy
cd backend && gcloud run deploy calendar-assistant --source .

# Frontend deploy
cd frontend && firebase deploy --only hosting

# View backend logs
gcloud run logs read calendar-assistant --limit 50

# View frontend logs
firebase functions:log
```

## Estimated Costs

For typical family use (10-50 images/month):

- Cloud Run: ~$0-5/month (generous free tier)
- Vision API: ~$1-3/month
- Claude API: ~$2-5/month
- Firebase Hosting: Free
- Firebase Auth: Free

**Total: ~$3-13/month**

## Done!

You now have a working calendar assistant. Next, complete the OAuth2 setup to enable adding events to Google Calendar (see DEPLOYMENT.md Step 8-9).
