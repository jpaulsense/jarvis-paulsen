from flask import Flask, request, jsonify
import os
import requests
import chromadb

app = Flask(__name__)

# --- ChromaDB Setup ---
client = chromadb.Client()
collection = client.get_or_create_collection("knowledge_base")

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
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # --- Generate Embedding with Ollama ---
                    response = requests.post(
                        "http://localhost:11434/api/embeddings",
                        json={"model": "mxbai-embed-large", "prompt": content}
                    )
                    response.raise_for_status()
                    embedding = response.json()["embedding"]
                    # ------------------------------------

                    # --- Store in ChromaDB ---
                    collection.add(
                        embeddings=[embedding],
                        documents=[content],
                        metadatas=[{"source": file_path}],
                        ids=[file_path] # Use file path as a unique ID
                    )
                    # -------------------------
                    found_count += 1
                except Exception as e:
                    print(f"Could not process {file_path}: {e}")

    return jsonify({
        "status": "scan_complete",
        "found_files": found_count
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)