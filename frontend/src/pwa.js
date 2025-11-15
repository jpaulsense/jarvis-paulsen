/**
 * PWA and iOS Integration Utilities
 * Handles service worker registration, share sheet, and iOS-specific features
 */

/**
 * Register service worker for PWA functionality
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

/**
 * Check if app was launched via iOS Share Sheet (Web Share Target API)
 * @returns {Promise<File|null>} Shared file if available
 */
export async function checkSharedImage() {
  // Check if launched with share-target parameter
  if (window.location.search.includes('share-target')) {
    try {
      // Try to get shared image from cache (set by service worker)
      const cache = await caches.open('shared-images');
      const response = await cache.match('/shared-image');

      if (response) {
        const blob = await response.blob();
        const file = new File([blob], 'shared-image.jpg', { type: blob.type });

        // Clean up
        await cache.delete('/shared-image');

        // Clean URL
        window.history.replaceState({}, document.title, '/');

        return file;
      }
    } catch (error) {
      console.error('Error retrieving shared image:', error);
    }
  }

  return null;
}

/**
 * Check if app is running in standalone mode (installed to home screen)
 */
export function isStandalone() {
  return (
    window.navigator.standalone === true || // iOS
    window.matchMedia('(display-mode: standalone)').matches // Android/Desktop
  );
}

/**
 * Check if running on iOS
 */
export function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) // iPad Pro
  );
}

/**
 * Prompt user to install PWA (iOS instructions or native prompt)
 */
export function showInstallPrompt() {
  if (isIOS() && !isStandalone()) {
    // iOS doesn't support beforeinstallprompt, show manual instructions
    return {
      canInstall: true,
      platform: 'ios',
      message: 'To install: Tap the Share button, then "Add to Home Screen"'
    };
  }

  return {
    canInstall: false,
    platform: 'other',
    message: null
  };
}

/**
 * Request notification permission (for future features)
 */
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/**
 * Check if HEIC files are supported
 * Note: Backend handles HEIC conversion, but this checks browser support
 */
export function supportsHEIC() {
  // Most browsers don't natively support HEIC, but our backend converts it
  // This is mainly for informational purposes
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.heic';
  return input.accept.includes('heic');
}

/**
 * Detect if file is HEIC/HEIF format
 */
export function isHEICFile(file) {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

/**
 * Handle file paste (for desktop/iPad with keyboard)
 */
export function enableFilePaste(callback) {
  const handler = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file && callback) {
          callback(file);
        }
        break;
      }
    }
  };

  document.addEventListener('paste', handler);

  // Return cleanup function
  return () => document.removeEventListener('paste', handler);
}

/**
 * Initialize PWA features
 * Call this once when app loads
 */
export async function initializePWA() {
  // Register service worker
  await registerServiceWorker();

  // Check for shared image (from iOS Share Sheet)
  const sharedFile = await checkSharedImage();

  return {
    isStandalone: isStandalone(),
    isIOS: isIOS(),
    sharedFile,
    installPrompt: showInstallPrompt()
  };
}

export default {
  registerServiceWorker,
  checkSharedImage,
  isStandalone,
  isIOS,
  showInstallPrompt,
  requestNotificationPermission,
  supportsHEIC,
  isHEICFile,
  enableFilePaste,
  initializePWA
};
