from flask import Flask, request, jsonify, redirect
import os
import google_auth_oauthlib.flow

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)