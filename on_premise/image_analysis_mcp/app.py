from flask import Flask, request, jsonify
import os
import sqlite3
import json
import hashlib
from datetime import datetime
import face_recognition

app = Flask(__name__)

DB_PATH = 'image_metadata.db'

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if it doesn't exist."""
    if os.path.exists(DB_PATH):
        return

    print("Initializing database...")
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE images (
            id INTEGER PRIMARY KEY,
            file_path TEXT UNIQUE,
            file_hash TEXT,
            last_modified DATETIME,
            exif_data TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE persons (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE
        )
    ''')

    cursor.execute('''
        CREATE TABLE faces (
            id INTEGER PRIMARY KEY,
            image_id INTEGER,
            person_id INTEGER,
            bounding_box TEXT,
            encoding TEXT,
            confidence REAL,
            FOREIGN KEY (image_id) REFERENCES images (id),
            FOREIGN KEY (person_id) REFERENCES persons (id)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized.")

@app.route('/')
def index():
    return "Image Analysis MCP is running."

# --- API Endpoints ---

def hash_file(filepath):
    """Calculates the SHA256 hash of a file."""
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

@app.route('/scan', methods=['POST'])
def scan_library():
    """
    Scans a directory for images, extracts metadata, and indexes them.
    Expects a JSON body with a "path" key.
    """
    data = request.get_json()
    if not data or 'path' not in data:
        return jsonify({"error": "Missing 'path' in request body"}), 400

    library_path = data['path']
    if not os.path.isdir(library_path):
        return jsonify({"error": f"Directory not found: {library_path}"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    
    indexed_count = 0
    for root, _, files in os.walk(library_path):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.heic')):
                file_path = os.path.join(root, file)
                
                # Check if the file is already indexed and unchanged
                cursor.execute("SELECT file_hash FROM images WHERE file_path = ?", (file_path,))
                result = cursor.fetchone()
                
                file_hash = hash_file(file_path)
                
                if result and result['file_hash'] == file_hash:
                    continue # Skip if unchanged

                # --- Facial Recognition ---
                try:
                    image = face_recognition.load_image_file(file_path)
                    face_locations = face_recognition.face_locations(image)
                    face_encodings = face_recognition.face_encodings(image, face_locations)

                    if face_encodings:
                        print(f"Found {len(face_encodings)} face(s) in {file_path}")
                        
                        # Get the image ID
                        cursor.execute("SELECT id FROM images WHERE file_path = ?", (file_path,))
                        image_row = cursor.fetchone()
                        if not image_row:
                            continue
                        image_id = image_row['id']

                        for i, face_encoding in enumerate(face_encodings):
                            # TODO: Implement logic to find or create a person record
                            person_id = None # Placeholder

                            bounding_box = json.dumps(face_locations[i])
                            encoding = json.dumps(face_encoding.tolist())

                            cursor.execute(
                                "INSERT INTO faces (image_id, person_id, bounding_box, encoding) VALUES (?, ?, ?, ?)",
                                (image_id, person_id, bounding_box, encoding)
                            )
                except Exception as e:
                    print(f"Could not process {file_path} for faces: {e}")
                # -------------------------

                # TODO: Add EXIF data extraction here
                
                cursor.execute(
                    "INSERT OR REPLACE INTO images (file_path, file_hash, last_modified, exif_data) VALUES (?, ?, ?, ?)",
                    (file_path, file_hash, datetime.now(), json.dumps({}))
                )
                indexed_count += 1

    conn.commit()
    conn.close()

    return jsonify({
        "status": "scan_complete",
        "indexed_files": indexed_count
    })

@app.route('/search/person', methods=['GET'])
def search_by_person():
    """Searches for images containing a specific person."""
    name = request.args.get('name')
    if not name:
        return jsonify({"error": "Missing 'name' query parameter"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM persons WHERE name = ?", (name,))
    person = cursor.fetchone()

    if not person:
        return jsonify({"error": "Person not found"}), 404

    person_id = person['id']
    
    cursor.execute('''
        SELECT i.file_path, f.bounding_box
        FROM images i
        JOIN faces f ON i.id = f.image_id
        WHERE f.person_id = ?
    ''', (person_id,))
    
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(results)

@app.route('/search/metadata', methods=['GET'])
def search_by_metadata():
    """Searches for images based on metadata (currently filepath)."""
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Missing 'query' query parameter"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT file_path, exif_data FROM images WHERE file_path LIKE ?", (f"%{query}%",))
    
    results = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify(results)

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5001, debug=True)