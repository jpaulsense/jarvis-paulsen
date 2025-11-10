from flask import Flask, request, jsonify
import os
import sqlite3
import json
import hashlib
from datetime import datetime

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

# --- API Endpoints will be added below ---

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5001, debug=True)