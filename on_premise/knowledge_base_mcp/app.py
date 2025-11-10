from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def index():
    return "Knowledge Base MCP is running."

# --- API Endpoints ---

@app.route('/scan', methods=['POST'])
def scan_documents():
    """
    Scans a directory for documents and prepares them for indexing.
    Expects a JSON body with a "path" key.
    """
    data = request.get_json()
    if not data or 'path' not in data:
        return jsonify({"error": "Missing 'path' in request body"}), 400

    doc_path = data['path']
    if not os.path.isdir(doc_path):
        return jsonify({"error": f"Directory not found: {doc_path}"}), 400

    found_count = 0
    for root, _, files in os.walk(doc_path):
        for file in files:
            if file.lower().endswith(('.pdf', '.docx', '.txt', '.md')):
                file_path = os.path.join(root, file)
                print(f"Found document: {file_path}")
                # TODO: Add logic to generate embeddings and store them
                found_count += 1

    return jsonify({
        "status": "scan_complete",
        "found_files": found_count
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)