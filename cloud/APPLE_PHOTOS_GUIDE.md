# Using Family Calendar Assistant with Apple Photos

Complete guide for using the Calendar Assistant with Apple Photos on iPhone, iPad, and Mac.

## Overview

The Family Calendar Assistant now has full support for Apple's ecosystem:
- ✅ HEIC/HEIF image format support
- ✅ iOS Share Sheet integration
- ✅ Progressive Web App (PWA) for iPhone/iPad
- ✅ Optimized mobile interface
- ✅ Safe area support for modern iPhones

## Installation on iOS (iPhone/iPad)

### Method 1: Add to Home Screen (Recommended)

1. **Open Safari** on your iPhone or iPad
2. **Navigate** to your deployed app URL (e.g., `https://your-app.web.app`)
3. **Sign in** with your Google account
4. **Tap the Share button** (square with arrow pointing up)
5. **Scroll down** and tap "Add to Home Screen"
6. **Name the app** (default: "Calendar")
7. **Tap "Add"** in the top right

The app icon will appear on your home screen and will work like a native app!

### Method 2: Direct Link

Simply bookmark the web app in Safari for quick access.

## Using with Apple Photos

### Option 1: Share from Photos App (iOS)

1. **Open Apple Photos** app
2. **Select a calendar image** (photo of a calendar, screenshot, etc.)
3. **Tap the Share button** (square with arrow)
4. **Scroll down** and find "Calendar" (if you added to home screen)
   - First time: You may need to tap "More" to find it
5. **Tap Calendar** - the app will open with your image ready to process

### Option 2: Upload from Within App

1. **Open the Calendar Assistant** app
2. **Sign in** with your Google account
3. **Tap "Click to upload"** button
4. Choose from:
   - **Photo Library**: Browse and select from your photos
   - **Take Photo**: Take a new picture of a calendar
   - **Browse**: Select from Files app or iCloud Drive

### Option 3: Copy & Paste (iOS 16+)

1. **Open Apple Photos** and select an image
2. **Long press** the image and select "Copy"
3. **Open Calendar Assistant** app
4. **Long press** in the upload area and select "Paste"

## Supported Image Formats

The app supports all Apple Photos formats:
- **HEIC** (High Efficiency Image Format) - Default on iPhone
- **HEIF** (High Efficiency Image Format)
- **JPEG/JPG** - Standard photos
- **PNG** - Screenshots and graphics
- **Live Photos** - Will use the still image

## Using on Mac

### From Photos App

1. **Open Photos** on your Mac
2. **Select a calendar image**
3. **Right-click** and select "Share"
4. **Choose "Mail"** or drag to desktop
5. **Upload to Calendar Assistant** via web browser

### Direct Upload

1. **Open Safari** (or any browser)
2. **Navigate** to your Calendar Assistant URL
3. **Sign in** with your Google account
4. **Click to upload** or drag-and-drop the image

## Tips for Best Results

### Taking Photos of Calendars

1. **Lighting**: Ensure good, even lighting
2. **Angle**: Take photo straight-on (not at an angle)
3. **Focus**: Make sure text is clear and in focus
4. **Crop**: Try to include only the calendar (minimize background)
5. **Resolution**: Use normal photo resolution (HEIC works great)

### Screenshots

- Calendar apps (Apple Calendar, Google Calendar, etc.)
- Email calendar invites
- PDF calendars opened in Files app
- Web-based calendars

### What Works Well

✅ Monthly calendar pages
✅ Weekly schedule layouts
✅ Event lists
✅ School/sports schedules
✅ Work shift calendars
✅ Printed calendar photos

### What May Need Adjustment

⚠️ Handwritten calendars (try to write clearly)
⚠️ Very small text (take closer photo)
⚠️ Low contrast (increase brightness/contrast in Photos first)
⚠️ Angled photos (retake straight-on)

## Editing Photos Before Upload

You can use Apple Photos editing tools to improve OCR accuracy:

1. **Open the image** in Photos
2. **Tap "Edit"**
3. **Adjust**:
   - Brightness: Make text more visible
   - Contrast: Improve text clarity
   - Crop: Remove unnecessary parts
   - Straighten: Ensure calendar is level

4. **Tap "Done"** to save
5. **Share** or upload to Calendar Assistant

## Workflow Examples

### Example 1: School Calendar

1. Take a photo of kids' school calendar with iPhone
2. Open Calendar Assistant from home screen
3. Upload the photo (it's already in HEIC format - no conversion needed!)
4. Review extracted events
5. Add to family Google Calendar

### Example 2: Email Calendar

1. Receive PDF calendar via email
2. Open PDF and take screenshot (Volume + Power button)
3. Screenshot automatically saved to Photos in HEIC
4. Share screenshot to Calendar Assistant from Photos
5. Extract and add events

### Example 3: Work Schedule

1. Photo your work schedule board with iPhone
2. Edit in Photos to crop and enhance
3. Share from Photos to Calendar Assistant
4. Review events
5. Add to personal calendar

## Troubleshooting

### "Invalid image file" Error

- Make sure you're selecting an image (not a video or document)
- Try converting HEIC to JPEG in Photos first (Edit > Save As > JPEG)
- Check file isn't corrupted

### Image Upload Doesn't Work

- Check internet connection
- Make sure you're signed in
- Try refreshing the page
- Clear Safari cache: Settings > Safari > Clear History

### Share Sheet Doesn't Show App

- Make sure you added the app to home screen
- Try removing and re-adding to home screen
- Check that PWA installation was successful

### Events Not Extracted Correctly

- Retake photo with better lighting/angle
- Try editing image to increase contrast
- Ensure calendar text is clearly visible
- Crop image to show only calendar

### iOS App Not Installing

- Use **Safari** browser (not Chrome or others)
- Update iOS to latest version
- Clear Safari cache and try again
- Make sure you're on the deployed URL (not localhost)

## iOS-Specific Features

### Haptic Feedback

The app uses iOS haptic feedback when:
- File is selected
- Processing starts/completes
- Events are added to calendar

### Dark Mode

The app automatically adapts to iOS dark mode settings.

### Shortcuts Integration (Future)

Coming soon: Siri Shortcuts integration for:
- "Hey Siri, add calendar image"
- Automation workflows
- Quick actions from home screen

## Privacy & Storage

- Images are **not stored** on the server
- Processing happens in real-time
- HEIC images are converted server-side (not uploaded to third parties)
- All data transmitted over HTTPS
- Only authenticated family members can access

## Performance on iOS

### Image Processing Speed

- HEIC images: ~2-5 seconds upload + processing
- Screenshots: ~1-3 seconds upload + processing
- Network dependent (faster on WiFi)

### Battery Usage

- Minimal battery impact
- Image conversion done server-side
- PWA uses less power than full browser

## iCloud Photos Integration

The app works seamlessly with iCloud Photos:

1. Photos from any device sync via iCloud
2. Upload from iPhone, access on iPad/Mac
3. Shared albums also accessible
4. Automatically uses optimized images if storage is low

## Apple Watch (Future)

Potential future features:
- View recently added events
- Quick access from watch face
- Notifications when events are added

## Advanced: Files App Integration

1. Save calendar images to Files app
2. Organize in folders (e.g., "School", "Work", "Sports")
3. Upload directly from Files app via Calendar Assistant
4. Works with iCloud Drive and third-party storage

## Keyboard Shortcuts (iPad)

When using external keyboard with iPad:

- **Cmd + O**: Open file picker
- **Cmd + V**: Paste image
- **Cmd + R**: Refresh page
- **Esc**: Cancel/close dialogs

## Summary

The Family Calendar Assistant is fully optimized for Apple's ecosystem:

✅ Native HEIC support (no conversion needed on device)
✅ Share from Photos app seamlessly
✅ Install as PWA on home screen
✅ Works offline (cached for quick loading)
✅ iOS safe area support (notch/Dynamic Island)
✅ Optimized touch targets for iOS
✅ Haptic feedback integration
✅ Dark mode support

Simply install to your home screen and share calendar images directly from Apple Photos!
