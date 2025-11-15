import { useState, useEffect } from 'react';
import { isIOS, isStandalone } from '../pwa.js';
import './InstallPrompt.css';

function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if should show install prompt
    const shouldShow = isIOS() && !isStandalone() && !dismissed;

    // Also check if user has dismissed before
    const hasAppinstalled = localStorage.getItem('pwa-dismissed');

    if (shouldShow && !hasDismissed) {
      // Show after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-dismissed', 'true');
  };

  const handleInstall = () => {
    // Scroll to make sure share button is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // User will need to manually tap share button
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="install-prompt ios-only">
      <div className="install-content">
        <div className="install-icon">📱</div>
        <div className="install-text">
          <h3>Install Calendar Assistant</h3>
          <p>Add to your home screen for easy access and offline use</p>
          <div className="install-instructions">
            <ol>
              <li>
                Tap the <strong>Share</strong> button{' '}
                <span className="share-icon">
                  <svg
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="currentColor"
                  >
                    <path d="M8 0L8 12M8 0L4 4M8 0L12 4M1 14L1 18C1 19.1 1.9 20 3 20L13 20C14.1 20 15 19.1 15 18L15 14" />
                  </svg>
                </span>
              </li>
              <li>
                Select <strong>"Add to Home Screen"</strong>
              </li>
              <li>Tap <strong>"Add"</strong> in the top right</li>
            </ol>
          </div>
        </div>
        <div className="install-actions">
          <button
            className="install-btn haptic-feedback"
            onClick={handleInstall}
          >
            Show Me How
          </button>
          <button
            className="dismiss-btn"
            onClick={handleDismiss}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
