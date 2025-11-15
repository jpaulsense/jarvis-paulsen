// This module will handle the dynamic routing of API requests.

const ON_PREM_IMAGE_ANALYSIS_URL = "http://localhost:5001"; // Replace with your Mac Studio's local IP
const ON_PREM_KNOWLEDGE_BASE_URL = "http://localhost:5002"; // Replace with your Mac Studio's local IP

// Calendar Assistant Backend (Cloud Run)
const CALENDAR_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

let isOnPrem = false;

export const checkOnPremStatus = async () => {
  try {
    // A simple health check to the on-prem service
    const response = await fetch(ON_PREM_IMAGE_ANALYSIS_URL);
    if (response.ok) {
      isOnPrem = true;
      console.log("On-premise services detected.");
    }
  } catch (error) {
    isOnPrem = false;
    console.log("On-premise services not detected. Using cloud gateway.");
  }
};

export const getApiEndpoints = () => {
  if (isOnPrem) {
    return {
      imageAnalysis: ON_PREM_IMAGE_ANALYSIS_URL,
      knowledgeBase: ON_PREM_KNOWLEDGE_BASE_URL,
      calendarAssistant: CALENDAR_API_URL,
    };
  } else {
    // TODO: Replace with the URL of your GCP API Gateway
    return {
      imageAnalysis: "https://your-cloud-gateway-url.run.app/image-analysis",
      knowledgeBase: "https://your-cloud-gateway-url.run.app/knowledge-base",
      calendarAssistant: CALENDAR_API_URL,
    };
  }
};

/**
 * Calendar Assistant API Functions
 */

/**
 * Extract calendar events from an image
 * Supports HEIC/HEIF and all standard image formats
 * @param {File} imageFile - The calendar image file
 * @returns {Promise<Object>} - Extracted events and OCR text
 */
export const extractCalendarEvents = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

  const response = await fetch(`${CALENDAR_API_URL}/api/extract-calendar-events`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to extract calendar events');
  }

  return response.json();
};

/**
 * Add events to Google Calendar
 * @param {Array} events - Array of calendar events
 * @param {String} calendarId - Calendar ID (default: "primary")
 * @returns {Promise<Object>} - Result of calendar addition
 */
export const addEventsToCalendar = async (events, calendarId = 'primary') => {
  const response = await fetch(`${CALENDAR_API_URL}/api/add-to-calendar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      events,
      calendar_id: calendarId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to add events to calendar');
  }

  return response.json();
};

/**
 * Health check for calendar assistant backend
 * @returns {Promise<Boolean>} - True if backend is healthy
 */
export const checkCalendarBackendHealth = async () => {
  try {
    const response = await fetch(`${CALENDAR_API_URL}/`);
    if (response.ok) {
      const data = await response.json();
      return data.status === 'healthy';
    }
    return false;
  } catch (error) {
    console.error('Calendar backend health check failed:', error);
    return false;
  }
};