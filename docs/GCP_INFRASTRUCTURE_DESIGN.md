# **☁️ GCP Infrastructure: Detailed Design**

This document outlines the design and configuration of the Google Cloud Platform (GCP) services that will host the front-end application, back-end API, and user authentication for the Family Assistant project.

## **1. GCP Project Setup and Configuration**

A new GCP project should be created for this application to ensure proper resource isolation and billing.

*   **Project Name:** `Family Assistant` (or similar)
*   **Enabled APIs:**
    *   **Firebase Hosting API:** For deploying the front-end.
    *   **Cloud Run API:** For the back-end service.
    *   **Cloud Build API:** For automating container builds.
    *   **Identity and Access Management (IAM) API:** For managing permissions.
    *   **Cloud Firestore API:** For the user database.
    *   **Firebase Authentication:** (Enabled via Firebase console).
*   **Billing:** A billing account must be associated with the project.
*   **IAM Roles:**
    *   **Firebase Admin:** For managing Firebase services.
    *   **Cloud Run Admin:** For deploying and managing the Cloud Run service.
    *   **Cloud Build Editor:** For the CI/CD pipeline to build and deploy the application.

## **2. Cloud Run Service (Back-End API)**

The back-end API will be a containerized application running on Cloud Run. This provides a scalable, serverless platform for our API.

*   **Runtime:** Python 3.10+ with Flask or FastAPI.
*   **Containerization:** A `Dockerfile` will be created to package the Python application.
    ```Dockerfile
    # Use the official lightweight Python image.
    FROM python:3.10-slim

    # Set the working directory
    WORKDIR /app

    # Copy local code to the container image.
    COPY . .

    # Install production dependencies.
    RUN pip install --no-cache-dir -r requirements.txt

    # Run the web service on container startup.
    CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]
    ```
*   **CI/CD:** Google Cloud Build will be configured to automatically build the Docker image from the source repository (e.g., GitHub) and deploy it to Cloud Run on every push to the `main` branch.
*   **Environment Variables:**
    *   `ON_PREM_API_URL`: The secure URL or IP address of the on-premise network's entry point.
    *   `ON_PREM_API_KEY`: A secret key for authenticating requests to the on-premise MCP servers.
*   **Security:**
    *   The Cloud Run service will be configured to allow ingress traffic only from Firebase Hosting and authenticated users.
    *   It will act as a secure proxy to the on-premise services, adding an authentication layer to prevent direct unauthorized access from the internet.

## **3. Firestore Database (User Data)**

Cloud Firestore will be used to store user information and the list of authorized family members.

*   **Data Model:**
    *   **`users` collection:**
        *   Each document will have a UID matching the Firebase Authentication UID.
        *   Fields: `email`, `displayName`, `photoURL`, `createdAt`.
    *   **`family` collection:**
        *   A single document, e.g., `members`, will contain the list of authorized emails.
        *   This makes it easy to manage the list and secure it with Firestore security rules.
*   **Security Rules:**
    Firestore security rules will be implemented to enforce access control:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Users can only read their own data.
        match /users/{userId} {
          allow read, write: if request.auth.uid == userId;
        }

        // Only authenticated family members can read the family list.
        match /family/members {
          allow read: if request.auth.token.isFamilyMember == true;
          allow write: if false; // Should be updated manually in the console.
        }
      }
    }
    ```

This design provides a secure and scalable cloud infrastructure that integrates seamlessly with the on-premise services.