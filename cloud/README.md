# Family Calendar Assistant - Cloud Components

AI-powered calendar assistant that extracts events from calendar images and adds them to Google Calendar.

## Overview

This application allows family members to:
1. Upload photos of calendars (paper calendars, screenshots, etc.)
2. Automatically extract calendar events using AI
3. Review and select events to add
4. Add selected events to their Google Calendar

## Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (Firebase UI)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Cloud Run API  │
│   (FastAPI)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────┐
│ Vision  │ │  Claude  │
│   API   │ │   API    │
└─────────┘ └──────────┘
         │
         ↓
┌─────────────────┐
│ Google Calendar │
│       API       │
└─────────────────┘
```

## Components

### Backend (`/backend`)
- **Technology**: FastAPI (Python)
- **Hosting**: Google Cloud Run
- **Features**:
  - Image upload endpoint
  - Google Vision API integration for OCR
  - Claude AI for event extraction
  - Google Calendar API integration
  - RESTful API

### Frontend (`/frontend`)
- **Technology**: HTML, CSS, JavaScript
- **Hosting**: Firebase Hosting
- **Features**:
  - Google Sign-In authentication
  - Drag-and-drop image upload
  - Event preview and selection
  - Responsive design

## Quick Start

### Prerequisites

1. Google Cloud Platform account
2. Firebase project
3. Anthropic API key
4. gcloud CLI and Firebase CLI installed

### Local Development

#### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
firebase serve
```

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick deploy:
```bash
# Deploy backend
cd backend
gcloud run deploy calendar-assistant \
    --source . \
    --region us-central1

# Deploy frontend
cd ../frontend
firebase deploy --only hosting
```

## Features

### Current Features
- ✅ Image upload (drag-drop or click)
- ✅ OCR with Google Vision API
- ✅ AI event extraction with Claude
- ✅ Event preview and selection
- ✅ Google Sign-In authentication
- ✅ Responsive web design
- ✅ Basic error handling

### Planned Features
- ⏳ OAuth2 flow for Calendar API
- ⏳ Email whitelist enforcement
- ⏳ Event editing before adding to calendar
- ⏳ Multiple calendar support
- ⏳ Timezone configuration
- ⏳ Recurring event detection
- ⏳ Image quality optimization
- ⏳ Batch processing
- ⏳ Mobile app (iOS/Android)

## API Documentation

Once the backend is running, visit:
- API docs: `http://localhost:8080/docs`
- OpenAPI spec: `http://localhost:8080/openapi.json`

### Main Endpoints

#### `POST /api/extract-calendar-events`
Extract calendar events from an uploaded image.

**Request:** Multipart form data with image file

**Response:**
```json
{
  "events": [
    {
      "summary": "Team Meeting",
      "start_datetime": "2024-01-15T09:00:00",
      "end_datetime": "2024-01-15T10:00:00",
      "description": "Weekly sync",
      "location": "Conference Room"
    }
  ],
  "ocr_text": "Full OCR text...",
  "image_id": "img_123456"
}
```

#### `POST /api/add-to-calendar`
Add events to Google Calendar (OAuth2 required).

**Request:**
```json
{
  "events": [...],
  "calendar_id": "primary"
}
```

## Configuration

### Backend Environment Variables
```bash
ANTHROPIC_API_KEY=your_key_here
GCP_PROJECT_ID=your_project_id
ENVIRONMENT=production
ALLOWED_EMAILS=email1@gmail.com,email2@gmail.com
```

### Frontend Configuration
Update `app.js` with:
- Firebase configuration
- Backend API URL
- Allowed family emails (optional)

## Security

### Authentication
- Google Sign-In via Firebase Authentication
- Email whitelist validation (via Cloud Function)
- Service account for backend API access

### Best Practices
- API keys stored in environment variables
- CORS properly configured
- HTTPS enforced in production
- Minimal IAM permissions
- Input validation on all endpoints

## Monitoring

### Cloud Run Logs
```bash
gcloud run logs read calendar-assistant
```

### Firebase Logs
```bash
firebase functions:log
```

### Cost Monitoring
Monitor usage of:
- Cloud Run requests
- Vision API calls
- Claude API calls
- Calendar API calls

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
Open in browser and test:
1. Sign in with Google
2. Upload test calendar image
3. Verify events extracted correctly
4. Test event selection
5. Verify calendar integration

### Test Images
Create test images with:
- Simple monthly calendar
- Weekly schedule
- Event list format
- Handwritten calendar
- Different languages

## Troubleshooting

### Common Issues

**"No text detected in image"**
- Ensure image has clear, readable text
- Try different image formats
- Check image lighting/quality

**"Failed to parse events"**
- Claude may need clearer OCR text
- Try images with standard calendar formats
- Check Claude API key and quota

**"CORS error"**
- Verify backend CORS settings
- Check frontend URL is authorized
- Clear browser cache

**"Authentication failed"**
- Verify Firebase config
- Check OAuth consent screen
- Ensure email is whitelisted

## Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit pull request

## License

Private family project - All rights reserved

## Support

For issues or questions:
1. Check [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Review API documentation
3. Check Cloud Run/Firebase logs
4. Contact family admin

## Roadmap

### Phase 1 (Complete)
- ✅ Basic image upload
- ✅ OCR integration
- ✅ Event extraction
- ✅ Web UI

### Phase 2 (In Progress)
- ⏳ OAuth2 Calendar integration
- ⏳ Email whitelist
- ⏳ Event editing

### Phase 3 (Planned)
- 📋 Mobile apps
- 📋 Recurring events
- 📋 Multiple calendars
- 📋 Event categories
- 📋 Batch processing

### Phase 4 (Future)
- 📋 Natural language event creation
- 📋 Smart suggestions
- 📋 Integration with other family services
- 📋 Shared family calendar view
