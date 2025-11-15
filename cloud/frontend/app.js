// Configuration
const CONFIG = {
    // TODO: Replace with your actual backend API URL
    API_URL: 'http://localhost:8080',
    // TODO: Replace with your Firebase config
    FIREBASE_CONFIG: {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    },
    ALLOWED_EMAILS: [] // Will be fetched from backend or config
};

// State
let currentUser = null;
let selectedFile = null;
let extractedEvents = [];

// Initialize Firebase
firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
const auth = firebase.auth();

// DOM Elements
const elements = {
    authSection: document.getElementById('auth-section'),
    signedOut: document.getElementById('signed-out'),
    signedIn: document.getElementById('signed-in'),
    signInBtn: document.getElementById('sign-in-btn'),
    signOutBtn: document.getElementById('sign-out-btn'),
    userPhoto: document.getElementById('user-photo'),
    userName: document.getElementById('user-name'),
    userEmail: document.getElementById('user-email'),
    uploadSection: document.getElementById('upload-section'),
    uploadArea: document.getElementById('upload-area'),
    fileInput: document.getElementById('file-input'),
    imagePreview: document.getElementById('image-preview'),
    previewImg: document.getElementById('preview-img'),
    removeImageBtn: document.getElementById('remove-image-btn'),
    processBtn: document.getElementById('process-btn'),
    processingSection: document.getElementById('processing-section'),
    processingStep: document.getElementById('processing-step'),
    resultsSection: document.getElementById('results-section'),
    eventsList: document.getElementById('events-list'),
    addSelectedBtn: document.getElementById('add-selected-btn'),
    uploadAnotherBtn: document.getElementById('upload-another-btn'),
    successSection: document.getElementById('success-section'),
    successMessage: document.getElementById('success-message'),
    doneBtn: document.getElementById('done-btn'),
    errorSection: document.getElementById('error-section'),
    errorMessage: document.getElementById('error-message'),
    retryBtn: document.getElementById('retry-btn')
};

// Handle iOS Share Sheet and Web Share Target API
window.addEventListener('DOMContentLoaded', async () => {
    // Check if the app was launched via share (Web Share Target API)
    if (window.location.search.includes('share-target')) {
        const url = new URL(window.location.href);
        const title = url.searchParams.get('title');
        const text = url.searchParams.get('text');

        // For POST requests with files, check FormData
        if (document.launchQueue) {
            document.launchQueue.setConsumer(async (params) => {
                if (params.files && params.files.length > 0) {
                    const file = params.files[0];
                    handleSharedFile(file);
                }
            });
        }
    }

    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully');
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
});

// Handle file shared from iOS Photos or other apps
async function handleSharedFile(file) {
    // Wait for user to be authenticated
    const checkAuth = setInterval(() => {
        if (currentUser) {
            clearInterval(checkAuth);
            handleFileSelect(file);
        }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkAuth);
        if (!currentUser) {
            showError('Please sign in to upload calendar images.');
        }
    }, 10000);
}

// Authentication State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        showSignedIn(user);
    } else {
        currentUser = null;
        showSignedOut();
    }
});

// Show signed in UI
function showSignedIn(user) {
    elements.signedOut.style.display = 'none';
    elements.signedIn.style.display = 'block';
    elements.userPhoto.src = user.photoURL || 'https://via.placeholder.com/48';
    elements.userName.textContent = user.displayName || 'User';
    elements.userEmail.textContent = user.email;
    elements.uploadSection.style.display = 'block';
}

// Show signed out UI
function showSignedOut() {
    elements.signedOut.style.display = 'block';
    elements.signedIn.style.display = 'none';
    elements.uploadSection.style.display = 'none';
    hideAllSections();
}

// Sign in with Google
elements.signInBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error('Sign in error:', error);
        showError('Failed to sign in. Please try again.');
    }
});

// Sign out
elements.signOutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Sign out error:', error);
    }
});

// Upload Area Click
elements.uploadArea.addEventListener('click', () => {
    elements.fileInput.click();
});

// File Input Change
elements.fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
});

// Drag and Drop
elements.uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.add('drag-over');
});

elements.uploadArea.addEventListener('dragleave', () => {
    elements.uploadArea.classList.remove('drag-over');
});

elements.uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    elements.uploadArea.classList.remove('drag-over');
    handleFileSelect(e.dataTransfer.files[0]);
});

// Handle File Selection
function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file.');
        return;
    }

    selectedFile = file;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImg.src = e.target.result;
        elements.imagePreview.style.display = 'block';
        elements.uploadArea.querySelector('.upload-placeholder').style.display = 'none';
        elements.processBtn.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Remove Image
elements.removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetUpload();
});

// Reset Upload
function resetUpload() {
    selectedFile = null;
    elements.fileInput.value = '';
    elements.imagePreview.style.display = 'none';
    elements.uploadArea.querySelector('.upload-placeholder').style.display = 'block';
    elements.processBtn.style.display = 'none';
}

// Process Image
elements.processBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    hideAllSections();
    elements.processingSection.style.display = 'block';

    try {
        // Step 1: Upload and extract events
        elements.processingStep.textContent = 'Analyzing calendar image...';

        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch(`${CONFIG.API_URL}/api/extract-calendar-events`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        extractedEvents = data.events;

        // Show results
        displayEvents(extractedEvents);
        elements.processingSection.style.display = 'none';
        elements.resultsSection.style.display = 'block';

    } catch (error) {
        console.error('Processing error:', error);
        showError('Failed to process the calendar image. Please try again.');
    }
});

// Display Events
function displayEvents(events) {
    elements.eventsList.innerHTML = '';

    if (events.length === 0) {
        elements.eventsList.innerHTML = '<p>No events found in the image.</p>';
        elements.addSelectedBtn.style.display = 'none';
        return;
    }

    events.forEach((event, index) => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.dataset.index = index;

        const startDate = new Date(event.start_datetime);
        const endDate = new Date(event.end_datetime);

        eventItem.innerHTML = `
            <input type="checkbox" class="event-checkbox" checked data-index="${index}">
            <div class="event-details">
                <div class="event-title">${escapeHtml(event.summary)}</div>
                <div class="event-time">
                    ${formatDateTime(startDate)} - ${formatDateTime(endDate)}
                </div>
                ${event.description ? `<div class="event-description">${escapeHtml(event.description)}</div>` : ''}
                ${event.location ? `<div class="event-location">📍 ${escapeHtml(event.location)}</div>` : ''}
            </div>
        `;

        // Toggle selection
        const checkbox = eventItem.querySelector('.event-checkbox');
        checkbox.addEventListener('change', () => {
            eventItem.classList.toggle('selected', checkbox.checked);
        });
        eventItem.classList.add('selected');

        elements.eventsList.appendChild(eventItem);
    });

    elements.addSelectedBtn.style.display = 'block';
}

// Add Selected Events to Calendar
elements.addSelectedBtn.addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.event-checkbox:checked');
    const selectedEvents = Array.from(checkboxes).map(cb => {
        const index = parseInt(cb.dataset.index);
        return extractedEvents[index];
    });

    if (selectedEvents.length === 0) {
        showError('Please select at least one event to add.');
        return;
    }

    elements.resultsSection.style.display = 'none';
    elements.processingSection.style.display = 'block';
    elements.processingStep.textContent = 'Adding events to your calendar...';

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/add-to-calendar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                events: selectedEvents,
                calendar_id: 'primary'
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();

        // Show success
        elements.processingSection.style.display = 'none';
        elements.successSection.style.display = 'block';
        elements.successMessage.textContent = `Successfully added ${selectedEvents.length} event(s) to your calendar!`;

    } catch (error) {
        console.error('Add to calendar error:', error);
        showError('Failed to add events to calendar. Please try again.');
    }
});

// Upload Another
elements.uploadAnotherBtn.addEventListener('click', () => {
    resetUpload();
    hideAllSections();
    elements.uploadSection.style.display = 'block';
});

// Done
elements.doneBtn.addEventListener('click', () => {
    resetUpload();
    hideAllSections();
    elements.uploadSection.style.display = 'block';
});

// Retry
elements.retryBtn.addEventListener('click', () => {
    hideAllSections();
    elements.uploadSection.style.display = 'block';
});

// Show Error
function showError(message) {
    elements.processingSection.style.display = 'none';
    elements.resultsSection.style.display = 'none';
    elements.errorSection.style.display = 'block';
    elements.errorMessage.textContent = message;
}

// Hide All Sections
function hideAllSections() {
    elements.processingSection.style.display = 'none';
    elements.resultsSection.style.display = 'none';
    elements.successSection.style.display = 'none';
    elements.errorSection.style.display = 'none';
}

// Utility Functions
function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
