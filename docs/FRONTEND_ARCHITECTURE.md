# **🎨 Front-End Architecture: Detailed Design**

This document outlines the architecture and design of the front-end application for the Family Assistant project.

## **1. Front-End Framework**

*   **Recommendation:** **React** is the recommended front-end framework.
*   **Reasoning:**
    *   **Component-Based Architecture:** React's component model is a natural fit for building a modular and maintainable user interface.
    *   **Rich Ecosystem:** React has a vast ecosystem of libraries and tools, including state management solutions (like Redux or Zustand), routing libraries (React Router), and UI component libraries (like Material-UI or Ant Design).
    *   **Firebase Integration:** There are official and community-supported libraries that make integrating React with Firebase services (Authentication, Firestore, etc.) straightforward.
    *   **Developer Experience:** Tools like Create React App or Vite can be used to quickly set up a modern development environment with features like hot-reloading and optimized builds.

## **2. Component Hierarchy**

The application will be structured as a tree of reusable components.

```
- App
  - Router
    - Header
    - HomePage
      - SearchBar
      - DocumentList
      - ImageGrid
    - LoginPage
    - ProfilePage
    - SettingsPage
  - Footer
```

*   **`App`:** The root component that manages the overall layout and routing.
*   **`Router`:** Handles client-side routing using `react-router-dom`.
*   **`Header`:** Contains the main navigation, user profile information, and a sign-in/sign-out button.
*   **`HomePage`:** The main dashboard of the application.
    *   **`SearchBar`:** A unified search bar for querying both the local knowledge base and the image library.
    *   **`DocumentList`:** Displays results from the local document search.
    *   **`ImageGrid`:** Displays results from the image search.
    *   **`ChatInterface`:** A new component for interacting with the Assistant Agent.
    *   **`ImageUpload`:** A new component for uploading images (e.g., schedules) to the Assistant Agent for processing.
*   **`LoginPage`:** A simple page with a "Sign in with Google" button.
*   **`ProfilePage`:** Allows users to view their profile information.
*   **`SettingsPage`:** Provides application settings, such as managing the paths to local file directories.

## **3. Routing and Navigation**

**`react-router-dom`** will be used to manage the application's routes.

*   **`/` (Home):** The main page, accessible only to authenticated users.
*   **`/login`:** The login page. Unauthenticated users will be redirected here.
*   **`/profile`:** The user's profile page.
*   **`/settings`:** The application settings page.
*   **Protected Routes:** All routes except `/login` will be protected. If a user is not authenticated, they will be automatically redirected to the `/login` page.

## **4. State Management**

*   **Local Component State:** For simple, component-specific state, React's built-in `useState` and `useReducer` hooks will be used.
*   **Global Application State:** For state that needs to be shared across the entire application (e.g., user authentication status, search results), a lightweight global state management library like **Zustand** or **Redux Toolkit** is recommended. This will provide a centralized store for the application's state, making it easier to manage and debug.

This front-end architecture provides a solid foundation for building a responsive, scalable, and maintainable user interface for the Family Assistant project.

## **5. Responsive Design and Mobile Support**

*   **Multi-Device Support:** The application will be designed from the ground up to be fully responsive, providing an optimal user experience on desktops, laptops, and mobile phones.
*   **CSS Strategy:** We will use a mobile-first approach with modern CSS, including media queries, to adapt the layout and components to different screen sizes.
*   **Future Native App Compatibility:** The decoupled API-first architecture ensures that a future native iOS or Android app can be developed to consume the same back-end services (both on-premise and cloud), providing a consistent experience across all platforms.