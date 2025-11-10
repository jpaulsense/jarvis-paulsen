# **📷 Image Analysis MCP: Detailed Design**

This document outlines the technical design for the on-premise Model Context Protocol (MCP) server responsible for image analysis, including facial recognition and metadata extraction.

## **1. Core ML Integration**

The key requirement is to leverage the Mac Studio's Apple Silicon for high-performance machine learning. This will be achieved using Core ML.

*   **Facial Recognition Library:** As per your preference, we will use the **`dlib`** library. It is a powerful and highly accurate toolkit for facial recognition.
*   **Model:** We will use `dlib`'s pre-trained facial recognition model, which is based on deep learning and provides high-accuracy face embeddings.
*   **Implementation Strategy:**
    1.  Install `dlib` and `face_recognition` (a user-friendly wrapper around `dlib`) in the Python environment.
    2.  Develop a Python service that:
        a.  Loads images from the library.
        b.  Uses `dlib` to detect the locations of faces in each image.
        c.  Computes a 128-point facial embedding for each detected face.
        d.  Stores these embeddings in the database, associated with a person's name.
    3.  For searching, the service will compute the embedding for a target face and find the closest matches in the database.

## **2. API Endpoints**

The Image Analysis MCP will expose a RESTful API for the front-end and other services to interact with. The API will be built using **Flask** or **FastAPI**.

| Method | Endpoint | Description | Request Body | Success Response (200) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/scan` | Triggers a full scan and indexing of the photo library. | `{ "path": "/path/to/photos" }` | `{ "status": "scan_started", "job_id": "uuid" }` |
| `GET` | `/scan/status/{job_id}` | Checks the status of a running scan. | (None) | `{ "status": "in_progress", "progress": 0.75 }` |
| `GET` | `/search/person` | Searches for images containing a specific person. | `{ "name": "John Doe" }` | `[{ "image_path": "...", "bounding_box": [...] }]` |
| `GET` | `/search/metadata` | Searches for images based on metadata criteria. | `{ "date": "2023-10-27", "camera": "Canon" }` | `[{ "image_path": "...", "metadata": {...} }]` |
| `GET` | `/image/metadata` | Retrieves all metadata for a specific image. | `{ "path": "/path/to/image.jpg" }` | `{ "exif": {...}, "faces": [...] }` |

## **3. Database Schema**

A local SQLite database is recommended for its simplicity and file-based nature, which is suitable for this on-premise application.

**`images` table:**
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key |
| `file_path` | TEXT | Absolute path to the image file. (UNIQUE) |
| `file_hash` | TEXT | SHA256 hash of the file to detect changes. |
| `last_modified` | DATETIME | Last modified timestamp of the file. |
| `exif_data` | JSON | A JSON blob containing all extracted EXIF data. |

**`faces` table:**
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key |
| `image_id` | INTEGER | Foreign Key to `images.id`. |
| `person_id` | INTEGER | Foreign Key to `persons.id`. |
| `bounding_box` | JSON | JSON object with `[x, y, width, height]`. |
| `confidence` | REAL | The model's confidence score for the recognition. |

**`persons` table:**
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | INTEGER | Primary Key |
| `name` | TEXT | The name of the person. (UNIQUE) |

This schema allows for efficient querying of images based on the people in them and their associated metadata.