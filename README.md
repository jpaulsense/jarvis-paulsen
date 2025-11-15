# Jarvis Paulsen - Family Assistant Project

AI-powered family assistant with calendar image processing, local knowledge base, and integrated family services.

## 🎯 Project Overview

This project implements a hybrid cloud/on-premise architecture for family automation and assistance, with:

- **Cloud Services (GCP)**: Web UI, external integrations (Gmail, Google Calendar, iCloud)
- **On-Premise Services (Mac Studio)**: Local file processing, photography library analysis, sensitive data handling

## 📁 Project Structure

```
jarvis-paulsen/
├── cloud/                          # Cloud-based components (GCP)
│   ├── backend/                    # FastAPI backend service
│   │   ├── main.py                # API endpoints & image processing
│   │   ├── requirements.txt       # Python dependencies
│   │   ├── Dockerfile            # Cloud Run deployment
│   │   └── README.md             # Backend documentation
│   ├── frontend/                  # Web UI (Firebase Hosting)
│   │   ├── index.html            # Main web interface
│   │   ├── app.js                # Client-side logic
│   │   ├── styles.css            # Styling
│   │   ├── manifest.json         # PWA manifest
│   │   ├── sw.js                 # Service worker
│   │   └── README.md             # Frontend documentation
│   ├── README.md                  # Cloud components overview
│   ├── DEPLOYMENT.md              # Complete deployment guide
│   ├── QUICKSTART.md              # Quick setup guide
│   └── APPLE_PHOTOS_GUIDE.md      # iOS integration guide
│
├── on_premise/                    # On-premise components (Mac Studio)
│   └── image_analysis_mcp/       # Image analysis MCP server
│       └── app.py                # (Placeholder for future development)
│
└── Jarvis Paulsen - Overall infrastructure and requirements.md
```

## 🚀 Current Features

### Calendar Image Processing (Completed ✅)

Upload calendar images and automatically extract events to Google Calendar.

**Features:**
- 📸 HEIC/HEIF support (Apple Photos native format)
- 🤖 AI-powered event extraction using Claude
- 📱 iOS Share Sheet integration
- 💻 Progressive Web App (PWA) for iPhone/iPad
- 🔐 Google Sign-In authentication
- 📅 Google Calendar integration (OAuth2 structure ready)

**Technology Stack:**
- Backend: Python FastAPI, Google Vision API, Claude AI
- Frontend: HTML/CSS/JavaScript, Firebase Auth, PWA
- Hosting: Google Cloud Run + Firebase Hosting

**Status:** Fully implemented, ready for deployment

[Quick Start Guide →](cloud/QUICKSTART.md)
[Apple Photos Integration →](cloud/APPLE_PHOTOS_GUIDE.md)
[Deployment Guide →](cloud/DEPLOYMENT.md)

### Planned Features

#### On-Premise Services (Future)
- 📚 Local knowledge base with semantic search
- 🖼️ Photography library analysis (facial recognition, metadata)
- 📄 PDF/Word document processing
- 🔒 Secure local data handling

#### Cloud Integrations (Future)
- 📧 Gmail integration
- 📆 Advanced calendar features
- ☁️ iCloud integration
- 👨‍👩‍👧‍👦 Family member management

## 🔧 Quick Setup

### Prerequisites

- Google Cloud Platform account
- Firebase project
- Anthropic API key (for Claude)
- Python 3.11+ (for backend)
- Firebase CLI (for frontend)

### Local Development

```bash
# Backend
cd cloud/backend
pip install -r requirements.txt
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn main:app --reload

# Frontend
cd cloud/frontend
firebase serve
```

### Deploy to Production

See [cloud/DEPLOYMENT.md](cloud/DEPLOYMENT.md) for complete instructions.

Quick deploy:
```bash
# Backend to Cloud Run
cd cloud/backend
gcloud run deploy calendar-assistant --source .

# Frontend to Firebase
cd cloud/frontend
firebase deploy --only hosting
```

## 📱 Using with Apple Products

The calendar assistant is **fully optimized for Apple's ecosystem**:

✅ **HEIC Support**: Native Apple Photos format (no conversion needed)
✅ **iOS Share Sheet**: Share images directly from Photos app
✅ **PWA Installation**: Install to home screen like a native app
✅ **Safe Areas**: Optimized for iPhone notch/Dynamic Island
✅ **Touch Targets**: iOS-optimized button sizes

[Read the complete Apple Photos guide →](cloud/APPLE_PHOTOS_GUIDE.md)

### Quick iOS Setup

1. Open Safari and navigate to your deployed app
2. Tap Share → Add to Home Screen
3. Open Apple Photos
4. Select a calendar image
5. Tap Share → Calendar
6. Review and add events!

## 🏗️ Architecture

### Current Implementation

```
┌─────────────────┐
│   Web Browser   │  ← User Interface
│  (Firebase UI)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Cloud Run API  │  ← Image Processing
│   (FastAPI)     │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌─────────┐ ┌──────────┐
│ Vision  │ │  Claude  │  ← AI Services
│   API   │ │   API    │
└─────────┘ └──────────┘
         │
         ↓
┌─────────────────┐
│ Google Calendar │  ← Output
│       API       │
└─────────────────┘
```

### Planned Architecture

The complete system will include:
- **Cloud Layer**: Web UI, API gateway, external integrations
- **On-Premise Layer**: Mac Studio with local processing
- **Hybrid Connectivity**: Secure tunnel when on local network

## 📚 Documentation

- [Cloud Components Overview](cloud/README.md)
- [Backend API Documentation](cloud/backend/README.md)
- [Frontend Documentation](cloud/frontend/README.md)
- [Quick Start Guide](cloud/QUICKSTART.md)
- [Complete Deployment Guide](cloud/DEPLOYMENT.md)
- [Apple Photos Integration](cloud/APPLE_PHOTOS_GUIDE.md)
- [Overall Infrastructure Requirements](Jarvis%20Paulsen%20-%20Overall%20infrastructure%20and%20requirements.md)

## 🔐 Security

- **Authentication**: Firebase Auth with Google Sign-In
- **Email Whitelist**: Restrict access to approved family members
- **Data Privacy**: Images processed in real-time, not stored
- **HTTPS**: All traffic encrypted
- **API Keys**: Environment variables, never committed
- **IAM**: Minimal permissions for service accounts

## 💰 Estimated Costs

For typical family use (10-50 calendar images/month):

- Cloud Run: ~$0-5/month (generous free tier)
- Vision API: ~$1-3/month
- Claude API: ~$2-5/month
- Firebase Hosting: Free
- Firebase Auth: Free

**Total: ~$3-13/month**

## 🗺️ Roadmap

### Phase 1: Calendar Processing ✅ (Complete)
- [x] Image upload and processing
- [x] Google Vision OCR integration
- [x] Claude AI event extraction
- [x] Web UI with Firebase Auth
- [x] HEIC/Apple Photos support
- [x] iOS PWA with Share Sheet

### Phase 2: Production Deployment (In Progress)
- [ ] Complete OAuth2 Calendar integration
- [ ] Email whitelist enforcement
- [ ] Production deployment
- [ ] Custom domain setup
- [ ] Monitoring and logging

### Phase 3: Enhanced Features (Planned)
- [ ] Event editing before adding to calendar
- [ ] Multiple calendar support
- [ ] Timezone configuration
- [ ] Recurring event detection
- [ ] Batch processing

### Phase 4: On-Premise Services (Planned)
- [ ] Mac Studio setup
- [ ] Local MCP server for images
- [ ] Photography library integration
- [ ] Local knowledge base
- [ ] Hybrid connectivity

### Phase 5: Family Features (Future)
- [ ] Native iOS/Android apps
- [ ] Family member profiles
- [ ] Shared family calendar view
- [ ] Gmail integration
- [ ] iCloud integration

## 🤝 Contributing

This is a private family project. Changes should be:
1. Tested locally
2. Documented
3. Committed with clear messages
4. Deployed carefully

## 📝 License

Private family project - All rights reserved

## 🆘 Support

For issues or questions:
1. Check the relevant documentation
2. Review deployment guides
3. Check Cloud Run/Firebase logs
4. Contact project maintainer

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [Google Cloud Platform](https://cloud.google.com/)
- [Firebase](https://firebase.google.com/)
- [Anthropic Claude](https://www.anthropic.com/claude)
- [Google Vision API](https://cloud.google.com/vision)

---

**Last Updated:** November 2024
**Current Version:** 1.0.0 (Calendar Processing)
**Status:** Ready for deployment
