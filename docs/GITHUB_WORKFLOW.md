# **👨‍💻 GitHub Workflow and Commit Strategy**

This document outlines the GitHub workflow and commit strategy for the Family Assistant project to ensure a clean, manageable, and revertible development process.

## **1. Repository**

*   A new, dedicated GitHub repository will be created for this project.
*   All project code, documentation, and configuration files will be stored in this repository.

## **2. Directory Structure**

The repository will be organized with the following top-level directories:

*   **`/docs`**: Contains all the Markdown design and architecture documents.
*   **`/on_premise`**: Contains the source code for all on-premise services (Image Analysis MCP, Knowledge Base MCP).
*   **`/cloud`**: Contains the source code for all cloud-based services (Assistant Agent, back-end API).
*   **`/frontend`**: Contains the source code for the React front-end application.

## **3. Branching Strategy**

*   **`main`**: The `main` branch will always represent the most stable, production-ready version of the code.
*   **Feature Branches**: All new development will be done on separate feature branches (e.g., `feature/image-analysis-api`, `feature/frontend-login`). This keeps the `main` branch clean and allows for code review before merging.

## **4. Commit Strategy (Breakpoints)**

To create clear, revertible breakpoints, commits will be made at logical intervals. Each commit will represent a single, complete piece of work.

*   **Atomic Commits:** Each commit should be as small as possible while encapsulating a single logical change.
*   **Commit Message Format:** Commit messages will be clear and descriptive, following a consistent format (e.g., `feat: Add database schema for image analysis`).
*   **Commit Frequency:** I will make a commit after completing each significant, testable step. For example:
    1.  Initial project setup and directory structure.
    2.  Boilerplate for the Image Analysis server.
    3.  Implementation of the database logic.
    4.  Addition of the facial recognition service.
    5.  Setup of the React front-end.

This strategy will ensure that we have a clean and professional version control history, making the project easy to manage and maintain.