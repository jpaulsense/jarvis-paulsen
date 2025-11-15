# Step-by-Step Deployment Guide

Follow these steps to deploy the Family Calendar Assistant to production.

## Prerequisites Checklist

- [ ] Google Cloud Platform account
- [ ] Firebase project created
- [ ] Anthropic API key
- [ ] `gcloud` CLI installed and configured
- [ ] `firebase` CLI installed
- [ ] Node.js 18+ installed

## Part 1: Backend Deployment to Cloud Run

### Step 1: Set Up GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
    run.googleapis.com \
    vision.googleapis.com \
    cloudbuild.googleapis.com \
    calendar-json.googleapis.com
```

### Step 2: Create Backend Environment File

```bash
cd cloud/backend

# Create .env file
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GCP_PROJECT_ID=your-gcp-project-id
ENVIRONMENT=production
EOF
```

### Step 3: Deploy Backend to Cloud Run

```bash
# Deploy (this will build and deploy in one command)
gcloud run deploy calendar-assistant \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=sk-ant-your-key-here,GCP_PROJECT_ID=$PROJECT_ID

# Note the service URL that's output!
# It will look like: https://calendar-assistant-xxxxx-uc.a.run.app
```

**Save this URL!** You'll need it for the frontend configuration.

### Step 4: Test Backend

```bash
# Test health endpoint
curl https://calendar-assistant-xxxxx-uc.a.run.app/

# Should return: {"status":"healthy","service":"Family Calendar Assistant"}
```

## Part 2: Frontend Deployment to Firebase

### Step 5: Initialize Firebase (if not already done)

```bash
cd frontend

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Use existing project: Select your Firebase project
# - Public directory: dist
# - Single-page app: Yes
# - GitHub deploys: No
```

### Step 6: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click Settings ⚙️ > Project settings
4. Scroll to "Your apps" section
5. If no web app exists, click "Add app" > Web
6. Copy the Firebase configuration object

### Step 7: Configure Environment Variables

```bash
# Create .env file for production
cat > .env << 'EOF'
# Replace these with your actual values from Firebase Console
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Backend URL from Step 3
VITE_API_URL=https://calendar-assistant-xxxxx-uc.a.run.app
EOF
```

### Step 8: Enable Google Sign-In

1. Go to Firebase Console > Authentication
2. Click "Get started" (if first time)
3. Click "Sign-in method" tab
4. Click "Google"
5. Toggle "Enable"
6. Set support email
7. Click "Save"

### Step 9: Build and Deploy Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Note the hosting URL that's output!
# It will look like: https://your-project.web.app
```

### Step 10: Update Backend CORS

```bash
cd cloud/backend

# Edit main.py and update CORS origins
# Change this:
#   allow_origins=["*"]
# To:
#   allow_origins=[
#       "https://your-project.web.app",
#       "https://your-project.firebaseapp.com"
#   ]

# Redeploy backend
gcloud run deploy calendar-assistant --source .
```

## Part 3: PWA Icons and Manifest

### Step 11: Generate PWA Icons

```bash
cd frontend/public

# Create a source icon (512x512 PNG recommended)
# You can use any design tool or online generator

# Generate all icon sizes
cd ../..
python cloud/frontend/generate-icons.py path/to/your-source-icon.png

# Move generated icons to frontend/public
mv cloud/frontend/icons frontend/public/
```

### Step 12: Update Manifest Colors (Optional)

Edit `frontend/public/manifest.json` to match your brand colors:

```json
{
  "theme_color": "#667eea",
  "background_color": "#667eea"
}
```

### Step 13: Redeploy Frontend with Icons

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## Part 4: Testing

### Step 14: Test on Desktop

1. Visit your Firebase Hosting URL
2. Sign in with Google
3. Upload a calendar image
4. Verify events are extracted
5. Check browser console for errors

### Step 15: Test on iOS

1. Open Safari on iPhone/iPad
2. Visit your Firebase Hosting URL
3. Sign in with Google
4. Tap Share → Add to Home Screen
5. Open app from home screen
6. Test uploading from camera
7. Open Apple Photos
8. Select calendar image
9. Tap Share → Calendar (your app)
10. Verify auto-upload works

## Part 5: Security and Configuration

### Step 16: Set Up Email Whitelist (Optional)

Create a Cloud Function to restrict access:

```bash
cd cloud
mkdir functions
cd functions
firebase init functions

# Select JavaScript or TypeScript
# Install dependencies

# Edit functions/index.js
```

Add this code:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const ALLOWED_EMAILS = [
  'family1@gmail.com',
  'family2@gmail.com',
  'family3@gmail.com'
];

exports.checkAllowedUser = functions.auth.user().onCreate(async (user) => {
  if (!ALLOWED_EMAILS.includes(user.email)) {
    await admin.auth().deleteUser(user.uid);
    throw new functions.https.HttpsError(
      'permission-denied',
      'Email not authorized'
    );
  }
});
```

Deploy:

```bash
firebase deploy --only functions
```

### Step 17: Configure OAuth2 for Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Create OAuth 2.0 Client ID
4. Application type: Web application
5. Authorized redirect URIs:
   - `https://your-project.web.app`
   - `https://your-project.firebaseapp.com`
6. Note the Client ID and Secret (for future Calendar API integration)

## Verification Checklist

After deployment, verify:

- [ ] Backend health check returns success
- [ ] Frontend loads without console errors
- [ ] Google Sign-In works
- [ ] Image upload works (desktop and mobile)
- [ ] HEIC files upload successfully (iOS)
- [ ] Events are extracted correctly
- [ ] PWA installs on iOS home screen
- [ ] Share Sheet works from Apple Photos
- [ ] Safe areas display correctly on iPhone
- [ ] Dark mode adapts properly
- [ ] Offline mode works (after first load)

## Troubleshooting

### Backend Issues

**CORS errors:**
```bash
# Verify CORS settings in cloud/backend/main.py
# Redeploy backend after changes
```

**Vision API errors:**
```bash
# Ensure API is enabled
gcloud services enable vision.googleapis.com

# Check service account permissions
```

### Frontend Issues

**Firebase not initializing:**
- Check all environment variables are set
- Verify Firebase config is correct
- Check browser console for specific errors

**Share Sheet not showing app:**
- Verify PWA is installed to home screen
- Check manifest.json is accessible
- Ensure service worker is registered

## Monitoring

### View Backend Logs

```bash
gcloud run logs read calendar-assistant --limit 50
```

### View Frontend Logs

Check Firebase Console > Hosting section

### Monitor API Usage

- Cloud Run metrics in GCP Console
- Vision API usage in GCP Console
- Anthropic API usage in Anthropic dashboard

## Cost Estimates

For 50 calendar images/month:

- Cloud Run: $0-3/month
- Vision API: $1-2/month
- Claude API: $2-5/month
- Firebase Hosting: Free
- Firebase Auth: Free

**Total: ~$3-10/month**

## Next Steps

1. Set up monitoring alerts
2. Configure backup/disaster recovery
3. Add analytics (Google Analytics)
4. Implement Calendar OAuth2 flow
5. Add more family features

## Support

Issues? Check:
1. This deployment guide
2. Main README.md
3. cloud/DEPLOYMENT.md (comprehensive guide)
4. Component documentation in frontend/APPLE_PHOTOS_INTEGRATION.md

---

**Deployment Complete!** 🎉

Your Family Calendar Assistant is now live and ready to use!
