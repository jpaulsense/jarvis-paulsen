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
    Scans the document repositories defined in repositories.json.
    """
    try:
        with open('../repositories.json', 'r') as f:
            repos = json.load(f)
        doc_paths = repos.get("document_repositories", [])
    except FileNotFoundError:
        return jsonify({"error": "repositories.json not found"}), 500

    found_count = 0
    for doc_path in doc_paths:
        if not os.path.isdir(doc_path):
            print(f"Warning: Directory not found, skipping: {doc_path}")
            continue

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

@app.route('/search', methods=['GET'])
def search_documents():
    """Performs semantic search on the indexed documents."""
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Missing 'query' query parameter"}), 400

    try:
        # --- Generate Embedding for Query ---
        response = requests.post(
            "http://localhost:11434/api/embeddings",
            json={"model": "mxbai-embed-large", "prompt": query}
        )
        response.raise_for_status()
        query_embedding = response.json()["embedding"]
        # ------------------------------------

        # --- Query ChromaDB ---
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5 # Return the top 5 results
        )
        # --------------------

        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)