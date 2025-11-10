# **🤖 Assistant Agent MCP: Detailed Design**

This document outlines the design for the cloud-based Assistant Agent, which will provide chat functionality and integration with Google services like Gmail and Google Calendar.

## **1. Overall Design**

The Assistant Agent will be a dedicated microservice running on **Google Cloud Run**. It will handle all interactions with Google APIs and the core language model, providing a secure and scalable chat back-end for the front-end application.

## **2. Google API Integration (OAuth 2.0)**

To securely access user data, the agent will use the OAuth 2.0 protocol.

*   **Authentication Flow:**
    1.  The user will initiate the connection from the front-end application.
    2.  The front-end will redirect the user to Google's OAuth 2.0 consent screen, requesting permissions (scopes) for reading/writing emails and calendar events.
    3.  After the user grants consent, Google will redirect back to the application with an authorization code.
    4.  The front-end will send this code to the Assistant Agent MCP.
    5.  The agent will exchange the code for an **access token** and a **refresh token**.
*   **Token Storage:**
    *   The **refresh token** is long-lived and will be securely stored in **Cloud Firestore**, encrypted, and associated with the user's UID. This allows the agent to obtain new access tokens without requiring the user to log in repeatedly.
    *   Access tokens are short-lived and will be used to make API calls.

## **3. Core Functionality**

*   **Gmail Integration:**
    *   **Read Emails:** Use the Gmail API to fetch and list recent emails.
    *   **Summarize Emails:** Pass the content of emails to the Gemini API for summarization.
    *   **Draft Responses:** Allow the user to provide prompts to the Gemini API to generate draft email replies.
*   **Google Calendar Integration:**
    *   **View Events:** Fetch and display upcoming calendar events.
    *   **Create Events:** Allow users to create new calendar events using natural language (e.g., "Schedule a meeting with John tomorrow at 2 PM").

*   **OCR and Calendar Creation from Images (NEW):**
    *   **Image Upload:** The front-end will allow users to upload images.
    *   **Text Extraction:** The agent will use the **Google Cloud Vision API** to perform OCR on the uploaded image and extract raw text.
    *   **Semantic Analysis:** The extracted text will be sent to the **Gemini API** with a prompt to identify and structure calendar events (e.g., `[{ "summary": "Team Practice", "date": "2023-11-15", "time": "18:00" }]`).
    *   **Event Creation:** The agent will parse the structured data from Gemini and use the **Google Calendar API** to create the events.

## **4. API Endpoints**

The Assistant Agent will expose the following RESTful API endpoints:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/chat` | Sends a message to the chat agent and gets a response. |
| `POST` | `/upload/image_schedule` | Uploads an image of a schedule for OCR and calendar creation. |
| `GET` | `/google/auth/url` | Gets the URL for the Google OAuth 2.0 consent screen. |
| `POST` | `/google/auth/callback` | Handles the callback from Google after user consent. |

This design provides a secure and robust way to integrate powerful chat and assistant features into the application.