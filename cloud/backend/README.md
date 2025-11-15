# Family Calendar Assistant - Backend API

Backend service for processing calendar images and integrating with Google Calendar.

## Features

- Image upload and OCR processing using Google Vision API
- AI-powered calendar event extraction using Claude
- Google Calendar integration (OAuth2 flow to be implemented)
- RESTful API with FastAPI

## Setup

### Prerequisites

- Python 3.11+
- Google Cloud Platform account with Vision API enabled
- Anthropic API key for Claude
- Google Calendar API credentials (for calendar integration)

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file from template:
```bash
cp .env.example .env
```

3. Configure environment variables:
   - Add your `ANTHROPIC_API_KEY`
   - Set up Google Cloud credentials
   - Configure allowed family emails

4. Run the development server:
```bash
uvicorn main:app --reload --port 8080
```

5. API will be available at `http://localhost:8080`
   - API docs: `http://localhost:8080/docs`

## API Endpoints

### `POST /api/extract-calendar-events`

Upload a calendar image and extract events.

**Request:**
- `file`: Image file (multipart/form-data)

**Response:**
```json
{
  "events": [
    {
      "summary": "Team Meeting",
      "start_datetime": "2024-01-15T09:00:00",
      "end_datetime": "2024-01-15T10:00:00",
      "description": "Weekly team sync",
      "location": "Conference Room A"
    }
  ],
  "ocr_text": "Full OCR text...",
  "image_id": "img_123456"
}
```

### `POST /api/add-to-calendar`

Add extracted events to Google Calendar.

**Request:**
```json
{
  "events": [...],
  "calendar_id": "primary"
}
```

**Response:**
```json
{
  "success": true,
  "events_created": 3,
  "message": "Events added successfully"
}
```

## Deployment to GCP Cloud Run

1. Build and push Docker image:
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/calendar-assistant
```

2. Deploy to Cloud Run:
```bash
gcloud run deploy calendar-assistant \
  --image gcr.io/YOUR_PROJECT_ID/calendar-assistant \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## TODO

- [ ] Implement OAuth2 flow for Google Calendar authentication
- [ ] Add Firebase Authentication integration
- [ ] Implement email whitelist validation
- [ ] Add rate limiting
- [ ] Add error logging and monitoring
- [ ] Add image storage (Cloud Storage)
- [ ] Add event confirmation/editing before adding to calendar
