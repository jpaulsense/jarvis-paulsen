"""
Family Calendar Assistant - Backend API
Handles image uploads, OCR processing, and Google Calendar integration
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.cloud import vision
from google.oauth2 import service_account
from googleapiclient.discovery import build
from anthropic import Anthropic
import os
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import json
import io
from PIL import Image
from pillow_heif import register_heif_opener

# Register HEIF/HEIC opener for PIL
register_heif_opener()

app = FastAPI(title="Family Calendar Assistant")

# CORS middleware for web UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients
vision_client = None
anthropic_client = None
calendar_service = None


class CalendarEvent(BaseModel):
    """Model for a calendar event"""
    summary: str
    start_datetime: str
    end_datetime: str
    description: str = ""
    location: str = ""


class CalendarEventsResponse(BaseModel):
    """Response model for extracted calendar events"""
    events: List[CalendarEvent]
    ocr_text: str
    image_id: str


def get_vision_client():
    """Initialize Google Vision API client"""
    global vision_client
    if vision_client is None:
        # In production, use service account credentials
        # credentials = service_account.Credentials.from_service_account_file('path/to/key.json')
        # vision_client = vision.ImageAnnotatorClient(credentials=credentials)
        vision_client = vision.ImageAnnotatorClient()
    return vision_client


def get_anthropic_client():
    """Initialize Anthropic Claude client"""
    global anthropic_client
    if anthropic_client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")
        anthropic_client = Anthropic(api_key=api_key)
    return anthropic_client


def get_calendar_service(credentials):
    """Initialize Google Calendar API service"""
    return build('calendar', 'v3', credentials=credentials)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Family Calendar Assistant"}


@app.post("/api/extract-calendar-events", response_model=CalendarEventsResponse)
async def extract_calendar_events(
    file: UploadFile = File(...),
):
    """
    Extract calendar events from an uploaded image

    1. Use Google Vision API to perform OCR on the image
    2. Use Claude to parse the OCR text and extract calendar events
    3. Return structured calendar events
    """
    try:
        # Read the uploaded image
        image_content = await file.read()

        # Validate and process image (including HEIC support)
        try:
            img = Image.open(io.BytesIO(image_content))

            # Convert HEIC/HEIF or any other format to JPEG for Vision API
            # This ensures compatibility with Apple Photos images
            if img.mode in ('RGBA', 'LA', 'P'):
                # Convert images with transparency to RGB
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Convert to JPEG bytes for Vision API
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=95)
            image_content = img_byte_arr.getvalue()

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

        # Step 1: OCR with Google Vision API
        vision_api = get_vision_client()
        image = vision.Image(content=image_content)

        # Perform text detection
        response = vision_api.text_detection(image=image)
        texts = response.text_annotations

        if response.error.message:
            raise HTTPException(
                status_code=500,
                detail=f"Vision API error: {response.error.message}"
            )

        if not texts:
            raise HTTPException(
                status_code=400,
                detail="No text detected in image"
            )

        # Get the full OCR text
        ocr_text = texts[0].description

        # Step 2: Parse with Claude
        claude = get_anthropic_client()

        prompt = f"""You are analyzing text extracted from a calendar image. Your task is to extract calendar events from this text.

OCR Text from Calendar:
{ocr_text}

Please analyze this text and extract all calendar events. For each event, identify:
- summary: The event name/title
- start_datetime: Start date and time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
- end_datetime: End date and time in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
- description: Any additional details about the event
- location: Location if mentioned

If the year is not specified, assume the current year ({datetime.now().year}).
If times are not specified, use reasonable defaults (e.g., 9:00 AM - 10:00 AM for events without times).
If end time is not specified, assume 1 hour duration.

Return ONLY a valid JSON array of events with this exact structure:
[
  {{
    "summary": "Event Name",
    "start_datetime": "2024-01-15T09:00:00",
    "end_datetime": "2024-01-15T10:00:00",
    "description": "Event details",
    "location": "Location name"
  }}
]

Return only the JSON array, no other text."""

        message = claude.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Parse Claude's response
        response_text = message.content[0].text.strip()

        # Extract JSON from response (in case Claude adds any extra text)
        json_start = response_text.find('[')
        json_end = response_text.rfind(']') + 1

        if json_start == -1 or json_end == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse calendar events from image"
            )

        json_text = response_text[json_start:json_end]
        events_data = json.loads(json_text)

        # Validate and convert to CalendarEvent objects
        events = [CalendarEvent(**event) for event in events_data]

        return CalendarEventsResponse(
            events=events,
            ocr_text=ocr_text,
            image_id=f"img_{datetime.now().timestamp()}"
        )

    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse events: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


@app.post("/api/add-to-calendar")
async def add_to_calendar(
    events: List[CalendarEvent],
    calendar_id: str = "primary"
):
    """
    Add extracted events to Google Calendar

    Note: This endpoint requires proper OAuth2 authentication
    In production, this should verify the user's credentials
    """
    try:
        # TODO: Implement proper OAuth2 flow to get user credentials
        # For now, this is a placeholder that shows the structure

        # In production, you would:
        # 1. Get user's OAuth2 credentials from the request
        # 2. Create calendar service with those credentials
        # 3. Add events to their calendar

        created_events = []

        for event in events:
            # Convert our event model to Google Calendar format
            calendar_event = {
                'summary': event.summary,
                'description': event.description,
                'location': event.location,
                'start': {
                    'dateTime': event.start_datetime,
                    'timeZone': 'America/New_York',  # TODO: Make configurable
                },
                'end': {
                    'dateTime': event.end_datetime,
                    'timeZone': 'America/New_York',
                },
            }

            # TODO: Uncomment when OAuth2 is implemented
            # service = get_calendar_service(user_credentials)
            # created = service.events().insert(
            #     calendarId=calendar_id,
            #     body=calendar_event
            # ).execute()
            # created_events.append(created)

            # For now, just return what would be created
            created_events.append(calendar_event)

        return {
            "success": True,
            "events_created": len(created_events),
            "events": created_events,
            "message": "Events ready to be added (OAuth2 authentication needed)"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error adding events to calendar: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
