from flask import Flask, request, jsonify, redirect
import os
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

app = Flask(__name__)

# --- Google OAuth 2.0 Setup ---
# IMPORTANT: You must create a client_secrets.json file in the Google Cloud
# Console and place it in the same directory as this file.
CLIENT_SECRETS_FILE = "client_secrets.json"
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar'
]

@app.route('/')
def index():
    return "Assistant Agent MCP is running."

# --- API Endpoints ---

@app.route('/google/auth/url')
def get_google_auth_url():
    """Generates the URL for the Google OAuth 2.0 consent screen."""
    try:
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES)
        flow.redirect_uri = request.host_url + 'google/auth/callback'
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )
        # TODO: Store the 'state' in the user's session for security
        return jsonify({'auth_url': authorization_url})
    except Exception as e:
        return jsonify({"error": f"Could not generate auth URL: {e}"}), 500

@app.route('/google/auth/callback')
def google_auth_callback():
    """Handles the OAuth 2.0 callback from Google."""
    # TODO: Verify the 'state' parameter matches the one from the auth URL
    state = request.args.get('state')
    
    try:
        flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE, scopes=SCOPES)
        flow.redirect_uri = request.host_url + 'google/auth/callback'

        # Use the authorization server's response to fetch the OAuth 2.0 tokens.
        authorization_response = request.url
        flow.fetch_token(authorization_response=authorization_response)

        credentials = flow.credentials
        
        # TODO: Securely store credentials.to_json() for the user in Firestore
        print("Credentials obtained and ready to be stored:")
        print(credentials.to_json())

        return "Authentication successful! You can close this tab."
    except Exception as e:
        return jsonify({"error": f"Could not fetch token: {e}"}), 500

@app.route('/gmail/read')
def read_gmail():
    """Reads the user's recent emails from Gmail."""
    # TODO: Load credentials securely from Firestore
    # For now, we'll use a placeholder for where the credentials would be loaded from.
    creds_json = None # Replace with secure loading
    if not creds_json:
        return jsonify({"error": "User is not authenticated with Google"}), 401

    try:
        credentials = Credentials.from_authorized_user_info(creds_json, SCOPES)
        service = build('gmail', 'v1', credentials=credentials)

        # Call the Gmail API
        results = service.users().messages().list(userId='me', labelIds=['INBOX'], maxResults=10).execute()
        messages = results.get('messages', [])

        return jsonify(messages)
    except Exception as e:
        return jsonify({"error": f"Could not read Gmail: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)