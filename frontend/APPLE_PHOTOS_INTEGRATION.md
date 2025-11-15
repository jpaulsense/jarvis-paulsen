# Apple Photos Integration - React Frontend

This React app now has full Apple Photos and iOS support integrated.

## What's Been Added

### 1. PWA Manifest (`/public/manifest.json`)
- Web app can be installed to iOS home screen
- Share target integration for receiving images from Apple Photos
- App shortcuts and icons configuration

### 2. Service Worker (`/public/sw.js`)
- Offline functionality
- Caching for faster load times
- Handles shared images from iOS Share Sheet

### 3. iOS Meta Tags (`index.html`)
- Apple-specific meta tags for PWA
- Safe area support for iPhone notch/Dynamic Island
- Proper status bar styling

### 4. PWA Utilities (`src/pwa.js`)
- `initializePWA()` - Initialize all PWA features
- `checkSharedImage()` - Detect images shared from Apple Photos
- `isIOS()` - Detect iOS devices
- `isStandalone()` - Check if installed to home screen
- `isHEICFile()` - Detect HEIC format files
- `enableFilePaste()` - Support paste from clipboard

### 5. iOS Optimizations (`src/ios.css`)
- Safe area insets for iPhone X and newer
- Touch target optimizations (44px minimum)
- Responsive design for all iOS devices
- Dark mode support
- Reduced motion support

### 6. API Integration (`src/api.js`)
- `extractCalendarEvents(imageFile)` - Upload and process calendar images
- `addEventsToCalendar(events)` - Add events to Google Calendar
- `checkCalendarBackendHealth()` - Health check

## How to Use in Your React Components

### Initialize PWA on App Load

```jsx
import { useEffect, useState } from 'react';
import { initializePWA } from './pwa.js';

function App() {
  const [pwaStatus, setPwaStatus] = useState(null);

  useEffect(() => {
    initializePWA().then(setPwaStatus);
  }, []);

  // Show install prompt for iOS users
  if (pwaStatus?.installPrompt?.canInstall) {
    return (
      <div className="install-banner">
        <p>{pwaStatus.installPrompt.message}</p>
      </div>
    );
  }

  return <YourApp />;
}
```

### Handle Shared Images from Apple Photos

```jsx
import { useEffect } from 'react';

function CalendarUpload() {
  useEffect(() => {
    // Check if image was shared from Apple Photos
    const pwaStatus = window.__PWA_STATUS__;

    if (pwaStatus?.sharedFile) {
      // Automatically process the shared image
      handleImageUpload(pwaStatus.sharedFile);
    }
  }, []);

  return <UploadComponent />;
}
```

### Upload Calendar Image with HEIC Support

```jsx
import { extractCalendarEvents } from './api.js';
import { isHEICFile } from './pwa.js';

async function handleImageUpload(file) {
  // Check if HEIC (informational - backend handles conversion)
  if (isHEICFile(file)) {
    console.log('HEIC file detected - backend will convert');
  }

  try {
    const result = await extractCalendarEvents(file);

    console.log('Extracted events:', result.events);
    console.log('OCR text:', result.ocr_text);

    // Display events to user for review
    setEvents(result.events);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Add Events to Calendar

```jsx
import { addEventsToCalendar } from './api.js';

async function handleAddToCalendar(selectedEvents) {
  try {
    const result = await addEventsToCalendar(selectedEvents);

    if (result.success) {
      alert(`Added ${result.events_created} events to calendar!`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### File Upload Component with iOS Support

```jsx
function FileUploader() {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <input
      type="file"
      accept="image/*,.heic,.heif"
      capture="environment"
      onChange={handleFileChange}
      className="haptic-feedback"
    />
  );
}
```

### Enable Paste Support (Desktop/iPad)

```jsx
import { useEffect } from 'react';
import { enableFilePaste } from './pwa.js';

function CalendarPage() {
  useEffect(() => {
    // Enable paste support
    const cleanup = enableFilePaste((file) => {
      console.log('File pasted:', file.name);
      handleImageUpload(file);
    });

    // Cleanup on unmount
    return cleanup;
  }, []);

  return <div>Paste an image to upload</div>;
}
```

## CSS Classes for iOS

Use these CSS classes from `ios.css`:

```jsx
// Safe area support
<div className="safe-area-top">Content respects notch</div>
<div className="safe-area-bottom">Content respects home indicator</div>

// iOS-only content
<div className="ios-only">Only visible on iOS</div>

// Haptic feedback visual
<button className="haptic-feedback">Tap me</button>

// Sticky header with safe area
<header className="sticky-header">App Header</header>

// Bottom action bar with safe area
<div className="bottom-action-bar">
  <button>Add to Calendar</button>
</div>
```

## Environment Variables

Create `.env` file:

```bash
# Backend API URL (Cloud Run)
VITE_API_URL=https://your-backend.run.app

# Or for local development
VITE_API_URL=http://localhost:8080
```

## User Flow Example

Here's a complete example component:

```jsx
import { useState, useEffect } from 'react';
import { extractCalendarEvents, addEventsToCalendar } from './api.js';
import { isHEICFile } from './pwa.js';

function CalendarAssistant() {
  const [file, setFile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState(new Set());

  // Check for shared image on mount
  useEffect(() => {
    const sharedFile = window.__PWA_STATUS__?.sharedFile;
    if (sharedFile) {
      handleUpload(sharedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (uploadFile) => {
    setFile(uploadFile);
    setLoading(true);

    try {
      const result = await extractCalendarEvents(uploadFile);
      setEvents(result.events);
      // Select all events by default
      setSelectedEvents(new Set(result.events.map((_, i) => i)));
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    const eventsToAdd = events.filter((_, i) => selectedEvents.has(i));

    try {
      await addEventsToCalendar(eventsToAdd);
      alert('Events added successfully!');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const toggleEvent = (index) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEvents(newSelected);
  };

  return (
    <div className="safe-area-top safe-area-bottom">
      <h1>Calendar Assistant</h1>

      <input
        type="file"
        accept="image/*,.heic,.heif"
        capture="environment"
        onChange={handleFileSelect}
        className="haptic-feedback"
      />

      {loading && <div className="loading-spinner-mobile" />}

      {events.length > 0 && (
        <>
          <h2>Found {events.length} events</h2>
          {events.map((event, i) => (
            <div key={i} onClick={() => toggleEvent(i)}>
              <input
                type="checkbox"
                checked={selectedEvents.has(i)}
                onChange={() => toggleEvent(i)}
              />
              <div>
                <h3>{event.summary}</h3>
                <p>{event.start_datetime}</p>
              </div>
            </div>
          ))}

          <div className="bottom-action-bar">
            <button onClick={handleAddToCalendar} className="haptic-feedback">
              Add {selectedEvents.size} Events to Calendar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CalendarAssistant;
```

## Installation Instructions for Users

### iOS (iPhone/iPad)

1. Open Safari and go to your app URL
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" in top right
5. App icon appears on home screen

### Using from Apple Photos

1. Open Photos app
2. Select a calendar image
3. Tap Share button
4. Find and tap "Calendar" in share sheet
5. App opens with image ready to process

## Testing Checklist

- [ ] PWA installs to home screen on iOS
- [ ] Share from Photos app works
- [ ] HEIC files upload successfully
- [ ] Events extract correctly
- [ ] Safe areas work on iPhone with notch
- [ ] Dark mode adapts to system setting
- [ ] Touch targets are at least 44px
- [ ] Works in standalone mode
- [ ] Service worker caches properly
- [ ] Paste support works on iPad

## Troubleshooting

### Share Sheet doesn't show app
- Make sure app is installed to home screen
- Check manifest.json is accessible at /manifest.json
- Verify service worker is registered

### HEIC files fail to upload
- Backend should handle conversion automatically
- Check backend logs for errors
- Verify pillow-heif is installed on backend

### Safe areas not working
- Ensure `viewport-fit=cover` is in viewport meta tag
- Check iOS version (requires iOS 11+)
- Verify CSS uses `env(safe-area-inset-*)`

## Next Steps

1. **Deploy backend** with HEIC support (already built in `cloud/backend/`)
2. **Deploy frontend** to Firebase Hosting
3. **Generate app icons** using `cloud/frontend/generate-icons.py`
4. **Test on real iOS device**
5. **Complete OAuth2 flow** for Calendar API

See `cloud/DEPLOYMENT.md` for deployment instructions.
