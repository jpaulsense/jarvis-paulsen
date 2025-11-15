# Family Calendar Assistant - Web UI

Web interface for uploading calendar images and managing extracted events.

## Features

- Google Sign-In authentication
- Drag-and-drop image upload
- Real-time event extraction preview
- Select which events to add to calendar
- Responsive design for desktop and mobile

## Setup

### Prerequisites

- Firebase project with Hosting and Authentication enabled
- Backend API deployed and running
- Google Sign-In configured in Firebase

### Configuration

1. Update Firebase configuration in `app.js`:
```javascript
FIREBASE_CONFIG: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
}
```

2. Update backend API URL in `app.js`:
```javascript
API_URL: 'https://your-backend-url.run.app'
```

### Local Development

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase (if not already done):
```bash
firebase init hosting
```

4. Serve locally:
```bash
firebase serve
```

5. Open http://localhost:5000

### Deployment

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

## Firebase Authentication Setup

1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google sign-in provider
3. Add authorized domains for your app
4. Configure OAuth consent screen in Google Cloud Console

## Allowed Family Emails

To restrict access to specific family members:

1. Create a Cloud Function to check emails on sign-up
2. Or implement email validation in the backend API
3. Update the `ALLOWED_EMAILS` configuration

Example Cloud Function:
```javascript
exports.checkAllowedUser = functions.auth.user().onCreate(async (user) => {
    const allowedEmails = ['family1@gmail.com', 'family2@gmail.com'];
    if (!allowedEmails.includes(user.email)) {
        await admin.auth().deleteUser(user.uid);
        throw new Error('Unauthorized email address');
    }
});
```

## User Flow

1. User signs in with Google account
2. User uploads calendar image (drag-drop or click)
3. Backend processes image with Google Vision API
4. Claude extracts calendar events from OCR text
5. User reviews extracted events
6. User selects events to add
7. Events are added to Google Calendar
8. Success confirmation shown

## TODO

- [ ] Add Firebase config for your project
- [ ] Configure backend API URL
- [ ] Set up email whitelist validation
- [ ] Add loading states and better error handling
- [ ] Implement event editing before adding to calendar
- [ ] Add calendar selection (which calendar to add to)
- [ ] Add timezone selection
- [ ] Implement progressive web app (PWA) features
- [ ] Add image optimization before upload
