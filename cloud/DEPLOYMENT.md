# Deployment Guide - Family Calendar Assistant

Complete guide for deploying the Family Calendar Assistant to Google Cloud Platform.

## Prerequisites

1. Google Cloud Platform account
2. Firebase project
3. Anthropic API key for Claude
4. gcloud CLI installed
5. Firebase CLI installed

## Step 1: Set Up GCP Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
    vision.googleapis.com \
    calendar-json.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    storage.googleapis.com
```

## Step 2: Set Up Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase in the frontend directory
cd cloud/frontend
firebase init hosting

# Select your Firebase project
# Choose 'cloud/frontend' as the public directory
# Configure as single-page app: Yes
# Don't overwrite index.html: No
```

## Step 3: Configure Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Authentication > Sign-in method
4. Enable Google as a sign-in provider
5. Add your authorized domains

## Step 4: Create Service Account for Backend

```bash
# Create service account
gcloud iam service-accounts create calendar-assistant \
    --display-name="Calendar Assistant Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:calendar-assistant@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/vision.user"

# Create and download key
gcloud iam service-accounts keys create ~/calendar-assistant-key.json \
    --iam-account=calendar-assistant@$PROJECT_ID.iam.gserviceaccount.com
```

## Step 5: Deploy Backend API to Cloud Run

```bash
cd cloud/backend

# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/calendar-assistant

gcloud run deploy calendar-assistant \
    --image gcr.io/$PROJECT_ID/calendar-assistant \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars ANTHROPIC_API_KEY=your_anthropic_api_key \
    --set-env-vars GCP_PROJECT_ID=$PROJECT_ID \
    --service-account calendar-assistant@$PROJECT_ID.iam.gserviceaccount.com

# Note the service URL that's output
```

## Step 6: Configure Frontend

1. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the Firebase config object

2. Update `cloud/frontend/app.js`:
   - Replace `FIREBASE_CONFIG` with your config
   - Replace `API_URL` with your Cloud Run service URL

## Step 7: Deploy Frontend to Firebase Hosting

```bash
cd cloud/frontend

# Deploy
firebase deploy --only hosting

# Note the hosting URL that's output
```

## Step 8: Set Up OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > OAuth consent screen
3. Configure consent screen with app name, support email, etc.
4. Add authorized domains (your Firebase hosting domain)

## Step 9: Configure CORS for Backend

Update `cloud/backend/main.py` CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.web.app",
        "https://your-app.firebaseapp.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy backend:
```bash
cd cloud/backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/calendar-assistant
gcloud run deploy calendar-assistant \
    --image gcr.io/$PROJECT_ID/calendar-assistant \
    --platform managed \
    --region us-central1
```

## Step 10: Set Up Email Whitelist (Optional)

Create a Cloud Function to restrict access:

```bash
cd cloud
mkdir functions
cd functions
npm init -y
npm install firebase-functions firebase-admin
```

Create `index.js`:
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
        // Delete unauthorized user
        await admin.auth().deleteUser(user.uid);
        console.log(`Deleted unauthorized user: ${user.email}`);
        throw new functions.https.HttpsError(
            'permission-denied',
            'This email is not authorized to access the application.'
        );
    }
    console.log(`Authorized user signed up: ${user.email}`);
});
```

Deploy:
```bash
firebase deploy --only functions
```

## Step 11: Test the Application

1. Open your Firebase Hosting URL
2. Sign in with a Google account
3. Upload a calendar image
4. Verify events are extracted
5. Check that events would be added to calendar

## Environment Variables Reference

### Backend (.env)
```
ANTHROPIC_API_KEY=your_key_here
GCP_PROJECT_ID=your_project_id
ENVIRONMENT=production
ALLOWED_EMAILS=email1@gmail.com,email2@gmail.com
```

### Frontend (app.js)
```javascript
API_URL: 'https://your-service-url.run.app'
FIREBASE_CONFIG: { /* your config */ }
```

## Monitoring and Logs

View backend logs:
```bash
gcloud run logs read calendar-assistant --limit 50
```

View Firebase logs:
```bash
firebase functions:log
```

## Cost Optimization

1. Set up Cloud Run autoscaling:
```bash
gcloud run services update calendar-assistant \
    --min-instances=0 \
    --max-instances=10
```

2. Use Cloud Storage for image uploads (instead of direct upload):
   - Reduces Cloud Run memory usage
   - Enables async processing

3. Monitor API usage:
   - Vision API calls
   - Claude API calls
   - Calendar API calls

## Troubleshooting

### CORS Errors
- Verify CORS settings in backend
- Check authorized domains in Firebase

### Authentication Errors
- Verify OAuth consent screen is configured
- Check authorized domains
- Ensure redirect URIs are correct

### API Errors
- Check service account permissions
- Verify API keys are set correctly
- Review Cloud Run logs

### Vision API Errors
- Ensure Vision API is enabled
- Check service account has vision.user role
- Verify image format is supported

## Security Checklist

- [ ] Email whitelist implemented
- [ ] CORS properly configured
- [ ] Service accounts have minimal permissions
- [ ] API keys stored in environment variables
- [ ] HTTPS enforced
- [ ] OAuth consent screen configured
- [ ] Rate limiting implemented (optional)
- [ ] Error messages don't leak sensitive info
