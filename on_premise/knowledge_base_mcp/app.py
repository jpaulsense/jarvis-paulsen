from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "Knowledge Base MCP is running."

# --- API Endpoints for semantic search will be added below ---

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)