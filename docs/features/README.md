# ✨ Features Documentation

Documentation for specific features and their implementation.

## Documents

### Contact & Support
- **[CONTACT_FORM_SETUP.md](CONTACT_FORM_SETUP.md)** - Contact form implementation with Nodemailer (email-first approach)

### Cost Tracking & Billing
- **[COST_TRACKING_TEST.md](COST_TRACKING_TEST.md)** - How to test cost tracking for multimedia processing
- **[COST_TRACKING_UI_GUIDE.md](COST_TRACKING_UI_GUIDE.md)** - User interface for cost tracking (Usage Dashboard)

### Multimedia Processing
- **[VIDEO_TRANSCRIPTION_SETUP.md](VIDEO_TRANSCRIPTION_SETUP.md)** - Video/audio transcription using Whisper API
- **[IMAGE_PROCESSING_IMPLEMENTATION.md](IMAGE_PROCESSING_IMPLEMENTATION.md)** - Image processing with GPT-4V Vision API

## Key Features

### AI Tutor System
- Create custom AI tutors with personality and instructions
- Link documents and multimedia to tutors
- RAG (Retrieval-Augmented Generation) for context-aware responses
- Multiple AI models support (GPT-3.5, GPT-4, GPT-4-turbo)

### Document Management
- Upload and process PDF, DOCX, PPTX, TXT
- Automatic chunking and embedding generation
- Similarity search for RAG
- Link/unlink to tutors

### Multimedia Support
- **Audio**: MP3, WAV, M4A (transcription with Whisper)
- **Video**: MP4, MOV, AVI (transcription with Whisper)
- **Images**: JPG, PNG, GIF, WebP (analysis with GPT-4V)
- Automatic processing and embedding generation

### Chat System
- Real-time chat with AI tutors
- Multiple conversations per tutor
- Conversation history
- RAG-powered responses with source citations

### Marketplace
- Share public tutors
- Discover tutors created by others
- Use community tutors

### Subscription & Billing
- Multiple plans (Trial, Starter, Pro, Enterprise)
- Stripe integration for payments
- Proration for upgrades
- Scheduled downgrades
- Subscription cancellation

### Usage Monitoring
- Real-time tracking of API calls, tokens, costs
- Per-user quota management
- Alerts when approaching limits
- Admin dashboard for all users (super admin only)

## Related Documentation

- **Setup**: See [../setup/](../setup/) for feature setup guides
- **User Manual**: See [../user/](../user/) for user-facing documentation
- **Development**: See [../development/](../development/) for technical implementation

