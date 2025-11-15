import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ios.css'
import App from './App.jsx'
import { initializePWA } from './pwa.js'

// Initialize PWA features (service worker, check for shared images, etc.)
initializePWA().then((pwaStatus) => {
  console.log('PWA initialized:', pwaStatus);

  // Store PWA status for app to use
  window.__PWA_STATUS__ = pwaStatus;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
