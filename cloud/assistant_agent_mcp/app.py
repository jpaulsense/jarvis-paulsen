from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "Assistant Agent MCP is running."

# --- API Endpoints for chat, Google Auth, and OCR will be added below ---

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)