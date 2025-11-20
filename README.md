# 🤖 AI Knowledge Companion

> **Your Personal AI Learning Assistant** - Build custom AI tutors powered by your own knowledge base using RAG (Retrieval-Augmented Generation).

🌐 **Link to the website**: [https://ai-knowledge-companion.vercel.app](https://ai-knowledge-companion.vercel.app/en)

A modern, full-stack platform that transforms documents, audio, video, and images into interactive AI tutors. Upload your materials, create specialized AI assistants, and share them in a marketplace.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-purple)](https://openai.com/)
[![LangChain](https://img.shields.io/badge/LangChain-JS-blue)](https://js.langchain.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD)](https://stripe.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000)](https://jwt.io/)
[![i18n](https://img.shields.io/badge/i18n-next--intl-blue)](https://next-intl-docs.vercel.app/)
[![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1)](https://zod.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

<img width="1693" height="921" alt="01 - Homepage" src="https://github.com/user-attachments/assets/7cc293c6-4b0a-42ba-ace5-c5f3ba1e21c6" />


## 📑 Table of Contents

- [✨ Features](#-features)
- [🧠 AI Technology Stack](#-ai-technology-stack)
- [🔧 Technology Stack](#-technology-stack)
- [🎯 Key Characteristics](#-key-characteristics)
- [🚀 Quick Start](#-quick-start)
- [🌐 Deployment](#-deployment)
- [⚙️ Environment Variables](#️-environment-variables)
- [📂 Project Structure](#-project-structure)
- [🏗️ Architecture](#️-architecture)
- [📚 Documentation](#-documentation)
- [🛠️ Development](#️-development)
- [📄 License](#-license)

---

## ✨ Features

### 🎓 Core Features

- **📚 Multi-Format Document Support**
  - PDF, TXT, DOCX, Markdown
  - Audio transcription (MP3, WAV, M4A, OGG, AAC, WebM)
  - Video processing with audio extraction (MP4, MOV, AVI, WebM)
  - Image OCR and analysis (JPG, PNG, GIF, WebP)

- **🤖 AI-Powered Tutors**
  - Create unlimited custom AI tutors
  - Configure personality, tone, and teaching style
  - RAG-based contextual responses from your documents
  - Multi-document knowledge bases per tutor

- **💬 Intelligent Chat Interface**
  - Real-time conversations with AI tutors
  - Source citation and context tracking
  - Conversation history and management
  - Multi-language support (EN/IT)

- **🏪 Marketplace**
  - Share tutors publicly
  - Discover community-created tutors
  - Fork and customize existing tutors
  - Usage tracking and analytics

### 🔐 Platform Features

- **🔒 Authentication & Authorization**
  - Email/password authentication
  - Magic link login
  - Role-based access control (User, Admin, Super Admin)
  - Secure session management with Supabase Auth

- **💳 Subscription & Billing**
  - Stripe integration for payments
  - Multiple subscription tiers (Free, Pro, Enterprise)
  - Usage tracking and limits
  - Automatic proration and plan changes

- **📊 Cost Tracking & Analytics**
  - Real-time OpenAI API cost tracking (per operation)
  - Detailed usage analytics dashboard
  - Per-user cost monitoring (embeddings, chat, transcription, vision)
  - Monthly quota management and enforcement
  - Cost breakdown by operation type and tutor
  - Historical usage trends and statistics
  - Admin dashboard for all users' usage monitoring

- **♿ Accessibility & Compliance**
  - WCAG 2.1 Level AA compliant
  - EAA (European Accessibility Act) ready
  - GDPR compliant with data export/deletion
  - Cookie consent management
  - Multi-language support with next-intl

- **🎨 Modern UI/UX**
  - Responsive design (mobile, tablet, desktop)
  - Dark mode support
  - Accessible navigation with breadcrumbs
  - Beautiful UI with Tailwind CSS and shadcn/ui

---

## 🧠 AI Technology Stack

### Core AI Technologies

#### **OpenAI API Integration**
- **GPT-4/GPT-4 Turbo** for chat completions
- **text-embedding-ada-002** for document embeddings
- **Whisper API** for audio transcription
- **GPT-4 Vision** for image analysis and OCR
- Token usage tracking and cost optimization

#### **RAG (Retrieval-Augmented Generation)**
- Custom RAG pipeline implementation
- Vector similarity search with pgvector
- Context-aware document retrieval
- Configurable similarity thresholds
- Source attribution and citation

#### **LangChain Integration**
- **@langchain/textsplitters** for intelligent document chunking
- Semantic chunking with overlap
- **@langchain/community** for document loaders
- Support for multiple document formats

#### **Vector Database**
- **pgvector** extension on PostgreSQL
- 1536-dimensional embedding vectors
- Cosine similarity search
- Optimized indexing for fast retrieval

#### **Document Processing Pipeline**
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Upload     │───▶│   Parse      │───▶│   Chunk      │
│ (Multi-media)│    │ (Extractors) │    │ (LangChain)  │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                                ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Query     │◀───│   Vector DB  │◀───│  Embeddings  │
│   (Chat)     │    │  (pgvector)  │    │   (OpenAI)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Media Processing

- **Audio**: Automatic transcription with Whisper API
- **Video**: Audio extraction with ffmpeg + Whisper transcription
- **Images**: GPT-4 Vision for OCR and content analysis
- **Documents**: pdf-parse, mammoth, officeparser for text extraction

---

## 🔧 Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Component Library**: [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)

### Backend
- **API**: Next.js API Routes (Server Actions)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL 15)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Vector Search**: pgvector extension

### AI & ML
- **LLM**: [OpenAI API](https://openai.com/) (GPT-4, GPT-4 Turbo)
- **Embeddings**: OpenAI text-embedding-ada-002
- **Transcription**: Whisper API
- **Vision**: GPT-4 Vision API
- **Text Processing**: [LangChain](https://js.langchain.com/)
- **Document Parsing**: pdf-parse, mammoth, officeparser
- **Media Processing**: ffmpeg (fluent-ffmpeg)

### Payments & Subscriptions
- **Payment Gateway**: [Stripe](https://stripe.com/)
- **Subscription Management**: Stripe Subscriptions
- **Webhook Handling**: Stripe webhooks for real-time updates

### DevOps & Tools
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting**: [ESLint 9](https://eslint.org/)
- **Testing**: [Jest](https://jestjs.io/), [React Testing Library](https://testing-library.com/)
- **Git Hooks**: Pre-commit security checks
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

---

## 🎯 Key Characteristics

### 🏛️ Architecture Principles

- **SOLID Principles**: Clean, maintainable, and scalable code
- **Functional Programming**: Pure functions, immutability, no classes
- **Test-Driven Development**: Comprehensive test coverage
- **Single Responsibility**: Modular components with clear responsibilities
- **Type Safety**: Full TypeScript coverage with strict mode

### 🚀 Performance

- **Server-Side Rendering**: Fast initial page loads
- **React Server Components**: Reduced client-side JavaScript
- **Edge Runtime**: Low-latency API responses
- **Optimistic UI Updates**: Smooth user experience
- **Efficient Caching**: Smart data fetching strategies

### 🔒 Security

- **Row-Level Security**: Database-level access control
- **API Key Protection**: Environment variable management
- **Git Hooks**: Automatic secret detection
- **HTTPS Only**: Secure data transmission
- **CSRF Protection**: Built-in security measures

### ♿ Accessibility

- **WCAG 2.1 Level AA**: Full compliance
- **Semantic HTML**: Proper document structure
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Logical tab order

### 🌍 Internationalization

- **Multi-language Support**: English and Italian
- **RTL Support**: Ready for right-to-left languages
- **Localized Content**: Complete translations
- **Dynamic Language Switching**: In-app language selection

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** ([Install](https://pnpm.io/installation))
- **Supabase Account** ([Sign Up](https://supabase.com/))
- **OpenAI API Key** ([Get Key](https://platform.openai.com/api-keys))
- **Stripe Account** ([Sign Up](https://stripe.com/)) - For payments

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-knowledge-companion.git
cd ai-knowledge-companion
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup Git hooks** (security)
```bash
./scripts/setup-git-hooks.sh
```

4. **Configure environment variables**
```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials (see [Environment Variables](#️-environment-variables))

⚠️ **IMPORTANT**: Never commit `.env.local` or API keys to git!

5. **Setup Supabase Database**

a. Create a new project on [Supabase](https://supabase.com/)

b. Enable pgvector extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

c. Run SQL migrations in order:
```bash
# See docs/SQL_MIGRATION_ORDER.md for the correct order
```

Or use the Supabase dashboard SQL editor to run files in `/sql/`

6. **Setup Stripe** (optional, for payments)

a. Create products and prices in [Stripe Dashboard](https://dashboard.stripe.com/)

b. Copy price IDs to `.env.local`

c. Setup webhook endpoint:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

7. **Start development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

The easiest way to deploy AI Knowledge Companion is using [Vercel](https://vercel.com/).

#### Quick Deploy

1. **Generate deployment secrets**
```bash
./scripts/generate-secrets.sh
```

2. **Push to GitHub**
```bash
git push origin main
```

3. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure environment variables (see checklist below)
   - Deploy!

#### 📋 Complete Deployment Guide

For a comprehensive step-by-step deployment guide with all configurations:
- **Quick Reference**: [`DEPLOYMENT_QUICK_REF.md`](./DEPLOYMENT_QUICK_REF.md)
- **Full Guide**: [`docs/setup/VERCEL_DEPLOY_GUIDE.md`](./docs/setup/VERCEL_DEPLOY_GUIDE.md)
- **Checklist**: [`.vercel-deploy-checklist.md`](./.vercel-deploy-checklist.md)

#### 🔐 Generated Secrets (Example)
The `generate-secrets.sh` script will create unique secrets for:
- `NEXTAUTH_SECRET` - Authentication
- `BOOTSTRAP_SECRET` - Super admin creation

#### ⚙️ Post-Deploy Configuration

After deployment, you'll need to:
1. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL` with your Vercel URL
2. Configure Supabase redirect URLs
3. **Activate Stripe Live Mode**: [Quick Checklist](./docs/deployment/STRIPE_LIVE_MODE_CHECKLIST.md) | [Complete Guide](./docs/deployment/STRIPE_PRODUCTION_SETUP.md)
4. Bootstrap super admin account

See the full deployment guide for detailed instructions.

#### 🔄 Continuous Deployment

Once configured, every push to `main` automatically deploys to production:
```bash
git push origin main  # ← Auto-deploys!
```

---

## ⚙️ Environment Variables

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key (public)
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key (secret)

# OpenAI Configuration
OPENAI_API_KEY=                    # Your OpenAI API key

# Next.js Configuration
NEXTAUTH_SECRET=                   # Random secret (generate with: openssl rand -base64 32)
NEXTAUTH_URL=                      # Your app URL (http://localhost:3000 in dev)
NEXT_PUBLIC_SITE_URL=              # Public site URL (same as NEXTAUTH_URL)

# Environment
NODE_ENV=                          # development | production | test
```

### Optional Variables (Payments)

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Stripe publishable key (public)
STRIPE_SECRET_KEY=                   # Stripe secret key (secret)
STRIPE_WEBHOOK_SECRET=               # Stripe webhook signing secret

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_PRO_MONTHLY=            # Pro plan monthly price ID
STRIPE_PRICE_PRO_YEARLY=             # Pro plan yearly price ID
STRIPE_PRICE_ENTERPRISE_MONTHLY=     # Enterprise monthly price ID
STRIPE_PRICE_ENTERPRISE_YEARLY=      # Enterprise yearly price ID
```

### Optional Variables (Admin Setup)

```bash
# Super Admin Configuration (for initial setup)
ADMIN_EMAIL=                       # Super admin email
ADMIN_PASSWORD=                    # Super admin password (secure!)
BOOTSTRAP_SECRET=                  # Secret token for admin creation endpoint
```

### Optional Variables (Monitoring)

```bash
# Analytics & Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=   # Vercel Analytics ID
SENTRY_DSN=                        # Sentry error tracking DSN
```

📖 See [`env.example`](./env.example) for a complete template.

---

## 📂 Project Structure

```
ai-knowledge-companion/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── [locale]/              # Internationalized routes
│   │   │   ├── auth/              # Authentication pages
│   │   │   ├── dashboard/         # User dashboard
│   │   │   ├── tutors/           # Tutor management
│   │   │   ├── documents/        # Document management
│   │   │   ├── multimedia/       # Media files management
│   │   │   ├── marketplace/      # Public marketplace
│   │   │   ├── billing/          # Billing & subscriptions
│   │   │   ├── admin/            # Admin panel
│   │   │   └── profile/          # User profile
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/             # Auth endpoints
│   │   │   ├── chat/             # Chat endpoints
│   │   │   ├── webhooks/         # Webhook handlers
│   │   │   └── ...
│   │   └── globals.css           # Global styles
│   ├── components/               # React components
│   │   ├── auth/                # Auth components
│   │   ├── chat/                # Chat interface
│   │   ├── documents/           # Document components
│   │   ├── tutors/              # Tutor components
│   │   ├── multimedia/          # Media components
│   │   ├── layout/              # Layout components
│   │   ├── ui/                  # Base UI components (shadcn)
│   │   ├── cookies/             # Cookie consent
│   │   └── seo/                 # SEO components
│   ├── lib/                     # Shared utilities
│   │   ├── openai/              # OpenAI API integration
│   │   │   ├── embeddings.ts   # Embedding generation
│   │   │   ├── rag.ts           # RAG implementation
│   │   │   ├── transcription.ts # Whisper API
│   │   │   └── vision.ts        # GPT-4 Vision
│   │   ├── supabase/            # Supabase client & queries
│   │   │   ├── client.ts        # Client initialization
│   │   │   ├── server.ts        # Server-side client
│   │   │   ├── documents.ts     # Document operations
│   │   │   ├── tutors.ts        # Tutor operations
│   │   │   ├── chat.ts          # Chat operations
│   │   │   ├── similarity-search.ts # Vector search
│   │   │   └── multimedia.ts    # Media operations
│   │   ├── stripe/              # Stripe integration
│   │   ├── workers/             # Background jobs
│   │   │   ├── document-parser.ts   # Document parsing
│   │   │   ├── document-chunker.ts  # Text chunking
│   │   │   └── document-processor.ts # Processing pipeline
│   │   ├── seo/                 # SEO utilities
│   │   ├── auth/                # Auth helpers
│   │   └── utils/               # General utilities
│   ├── types/                   # TypeScript types
│   │   ├── database.ts          # Supabase database types
│   │   ├── openai.ts            # OpenAI types
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   ├── i18n/                    # Internationalization
│   └── messages/                # Translation files
├── public/                      # Static files
│   ├── icons/                  # PWA icons
│   └── ...
├── docs/                        # Documentation (organized by category)
│   ├── user/                   # User documentation
│   │   ├── USER_MANUAL.md     # Complete user manual
│   │   └── README.md          # User docs index
│   ├── admin/                  # Admin documentation
│   │   ├── SUPER_ADMIN_SETUP.md
│   │   ├── ADMIN_SUBSCRIPTION_EXEMPTION.md
│   │   └── README.md
│   ├── setup/                  # Setup & deployment guides
│   │   ├── SUPABASE_SETUP.md
│   │   ├── VERCEL_DEPLOY_GUIDE.md
│   │   ├── VERCEL_TROUBLESHOOTING.md
│   │   ├── STRIPE_WEBHOOK_SETUP.md
│   │   └── README.md
│   ├── development/            # Development guides
│   │   ├── API.md             # API documentation
│   │   ├── ADR.md             # Architecture decisions
│   │   ├── TECH_DEBT.md       # Technical debt tracking
│   │   └── README.md
│   ├── security/               # Security documentation
│   │   ├── RATE_LIMITING_GUIDE.md
│   │   ├── SECURITY_AUDIT_RESULTS.md
│   │   └── README.md
│   ├── features/               # Feature implementation docs
│   │   ├── CONTACT_FORM_SETUP.md
│   │   ├── COST_TRACKING_TEST.md
│   │   └── README.md
│   ├── compliance/             # Legal & accessibility compliance
│   │   ├── GDPR_COMPLIANCE.md
│   │   ├── COOKIE_CONSENT.md
│   │   ├── EAA_WCAG_COMPLIANCE.md
│   │   └── README.md
│   ├── implementation/         # Complete implementation summaries
│   ├── refactoring/            # Refactoring documentation
│   └── archive/                # Archived documentation
├── sql/                         # Database migrations
├── scripts/                     # Utility scripts
├── test-files/                  # Test assets
└── ...
```

---

## 🏗️ Architecture

### RAG Pipeline

The Retrieval-Augmented Generation pipeline processes documents in several stages:

```
1. UPLOAD
   ↓
   User uploads file → Supabase Storage

2. PARSE
   ↓
   Extract text from document
   - PDF: pdf-parse
   - DOCX: mammoth / officeparser
   - Audio: Whisper API transcription
   - Video: ffmpeg + Whisper
   - Images: GPT-4 Vision OCR

3. CHUNK
   ↓
   Split text into semantic chunks
   - LangChain RecursiveCharacterTextSplitter
   - 500-800 tokens per chunk
   - 100-200 token overlap
   - Preserve context and meaning

4. EMBED
   ↓
   Generate vector embeddings
   - OpenAI text-embedding-ada-002
   - 1536-dimensional vectors
   - Batch processing for efficiency

5. STORE
   ↓
   Save to PostgreSQL with pgvector
   - document_chunks table
   - Vector index for fast search
   - Metadata and source tracking

6. QUERY (RAG)
   ↓
   a. User asks question
   b. Generate embedding for question
   c. Vector similarity search (pgvector)
   d. Retrieve top-k relevant chunks
   e. Build context from chunks
   f. Send to GPT-4 with system prompt
   g. Return answer with source citations
```

### Database Schema

**Key Tables:**
- `profiles` - User profiles and settings
- `documents` - Uploaded documents metadata (documents + multimedia)
- `document_chunks` - Text chunks with vector embeddings (1536-dim)
- `tutors` - AI tutor configurations
- `conversations` - Chat conversations
- `messages` - Individual messages
- `usage_logs` - API usage tracking
- `subscriptions` - Stripe subscription data
- `message_rag_context` - RAG context per message
- `tutor_documents` - Tutor-document relationships

**📚 Complete Documentation:**
- [**Database Schema**](./docs/development/DATABASE_SCHEMA.md) - Full schema with relationships, examples, and data dictionary
- [`src/types/database.ts`](./src/types/database.ts) - TypeScript types

### Security Architecture

- **Row-Level Security (RLS)**: All tables have RLS policies
- **Service Role**: Used only for admin operations
- **Anon Key**: Public operations with user context
- **API Route Protection**: Middleware for auth checks
- **Environment Variables**: Secrets never exposed to client

---

## 📚 Documentation

### 📖 Core Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Complete project specifications for AI assistants |
| [ADR.md](./docs/development/ADR.md) | Architecture Decision Records |
| [API.md](./docs/development/API.md) | API contracts and endpoint specifications |

---

### 👥 User Documentation

| Document | Description |
|----------|-------------|
| **[📖 User Manual - English](./docs/user/USER_MANUAL.en.md)** | **Complete user guide in English** |
| **[📖 Manuale Utente - Italiano](./docs/user/USER_MANUAL.it.md)** | **Guida completa in italiano** |

Both user manuals include:
- Account management and authentication
- Document and multimedia management
- AI Tutor creation and usage
- Chat functionality
- Marketplace
- Plans, billing, and subscriptions
- Usage monitoring
- Profile and settings
- Admin functions (for admins)
- Comprehensive FAQ (40+ questions)

**📂 Folder**: [`docs/user/`](./docs/user/)

---

### 🔐 Admin Documentation

| Document | Description |
|----------|-------------|
| [Super Admin Setup](./docs/admin/SUPER_ADMIN_SETUP.md) | Creating super admin accounts using bootstrap endpoint |
| [Admin Subscription Exemption](./docs/admin/ADMIN_SUBSCRIPTION_EXEMPTION.md) | Exempting users from subscription requirements |

**📂 Folder**: [`docs/admin/`](./docs/admin/)

---

### 🛠️ Setup Guides

| Guide | Description |
|-------|-------------|
| [Supabase Setup](./docs/setup/SUPABASE_SETUP.md) | Database configuration and migrations |
| [Vercel Deploy Guide](./docs/setup/VERCEL_DEPLOY_GUIDE.md) | Deploy to Vercel step-by-step |
| [Vercel Troubleshooting](./docs/setup/VERCEL_TROUBLESHOOTING.md) | Common deployment issues and solutions |
| [Authorization Setup](./docs/setup/AUTHORIZATION_SETUP.md) | Role-based authorization configuration |
| [Stripe Webhook Setup](./docs/setup/STRIPE_WEBHOOK_SETUP.md) | Configure Stripe webhooks for subscriptions |
| [Upstash Redis Setup](./docs/setup/UPSTASH_REDIS_SETUP.md) | Setup Redis for rate limiting |
| [Images Bucket Setup](./docs/setup/CREATE_IMAGES_BUCKET_MANUAL.md) | Configure Supabase storage for images |
| [Worker Setup](./docs/setup/WORKER_SETUP.md) | Background job configuration |

**📂 Folder**: [`docs/setup/`](./docs/setup/)

---

### 💻 Development

| Document | Description |
|----------|-------------|
| **[Database Schema](./docs/development/DATABASE_SCHEMA.md)** | **Complete database schema with tables, relationships, and examples** |
| [API Documentation](./docs/development/API.md) | API endpoints and usage examples |
| [Architecture Decisions](./docs/development/ADR.md) | Key architectural decisions and rationale |
| [Technical Debt](./docs/development/TECH_DEBT.md) | Code quality improvement plan and tracking |
| [SQL Migration Order](./docs/development/SQL_MIGRATION_ORDER.md) | Database migration dependencies |

**📂 Folder**: [`docs/development/`](./docs/development/)

---

### 🔒 Security

| Document | Description |
|----------|-------------|
| [Rate Limiting Guide](./docs/security/RATE_LIMITING_GUIDE.md) | Rate limiting with Redis/Upstash |
| [Security Audit Results](./docs/security/SECURITY_AUDIT_RESULTS.md) | Security audit findings |
| [Security Fix Summary](./docs/security/SECURITY_FIX_SUMMARY.md) | Summary of vulnerabilities fixed |
| [Security Improvements](./docs/security/SECURITY_IMPROVEMENTS_IMPLEMENTATION.md) | Implementation of security features (headers, rate limiting, log sanitization) |

**📂 Folder**: [`docs/security/`](./docs/security/)

---

### ✨ Features

| Document | Description |
|----------|-------------|
| [Contact Form Setup](./docs/features/CONTACT_FORM_SETUP.md) | Contact form with Nodemailer (email-first approach) |
| [Cost Tracking Test](./docs/features/COST_TRACKING_TEST.md) | Testing cost tracking for multimedia processing |
| [Cost Tracking UI Guide](./docs/features/COST_TRACKING_UI_GUIDE.md) | Usage Dashboard user interface |
| [Video Transcription Setup](./docs/features/VIDEO_TRANSCRIPTION_SETUP.md) | Video/audio transcription with Whisper API |
| [Image Processing](./docs/features/IMAGE_PROCESSING_IMPLEMENTATION.md) | Image processing with GPT-4V Vision API |

**📂 Folder**: [`docs/features/`](./docs/features/)

---

### ⚖️ Compliance

| Document | Description |
|----------|-------------|
| [GDPR Compliance](./docs/compliance/GDPR_COMPLIANCE.md) | GDPR compliance implementation |
| [Cookie Consent](./docs/compliance/COOKIE_CONSENT.md) | Cookie consent banner and management |
| [EAA/WCAG Compliance](./docs/compliance/EAA_WCAG_COMPLIANCE.md) | Accessibility standards compliance |
| [SEO Optimization](./docs/compliance/SEO_OPTIMIZATION.md) | SEO implementation and best practices |

**📂 Folder**: [`docs/compliance/`](./docs/compliance/)

---

### 🚀 Deployment

| Document | Description |
|----------|-------------|
| [**Stripe Live Mode Checklist**](./docs/deployment/STRIPE_LIVE_MODE_CHECKLIST.md) | **Quick checklist to activate Stripe in production (Pro & Enterprise plans)** |
| [**🔐 Stripe Restricted Keys**](./docs/deployment/STRIPE_RESTRICTED_KEY_SETUP.md) | **Security guide for creating restricted API keys (RECOMMENDED)** |
| [Stripe Production Setup](./docs/deployment/STRIPE_PRODUCTION_SETUP.md) | Complete guide for Stripe production activation |

**📂 Folder**: [`docs/deployment/`](./docs/deployment/)

---

### 📦 Implementation & Refactoring

**Implementation Details**: [`docs/implementation/`](./docs/implementation/)
- Complete implementation summaries for major features
- GDPR, SEO, Multimedia, Image Processing, Video/Audio, Breadcrumb

**Refactoring Documentation**: [`docs/refactoring/`](./docs/refactoring/)
- SRP refactoring examples (Cookie Consent, Footer)

**Archived Documentation**: [`docs/archive/`](./docs/archive/)
- Older implementation notes and debug sessions

---

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server (http://localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with sample data

# Utilities
pnpm type-check       # TypeScript type checking
pnpm format           # Format code with Prettier
```

### Code Conventions

#### TypeScript Style
```typescript
// ✅ Good: Function declaration with explicit return type
export function calculateEmbedding(text: string): Promise<number[]> {
  // ...
}

// ✅ Good: React component
export function DocumentCard({ document }: DocumentCardProps): JSX.Element {
  return <div>...</div>
}

// ❌ Bad: Class-based (use functions only)
export class DocumentService { }
```

#### Naming Conventions
- **Components**: PascalCase (`DocumentCard`, `ChatInterface`)
- **Functions**: camelCase (`calculateEmbedding`, `fetchDocuments`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)
- **Directories**: kebab-case (`auth-wizard`, `document-parser`)

#### File Organization
```typescript
// Component file structure
import statements
types/interfaces
helper functions
main component
export statement
```

### Testing Guidelines

- **Unit Tests**: Pure functions and utilities
- **Integration Tests**: API routes and database operations
- **Component Tests**: React components with Testing Library
- **E2E Tests**: Critical user flows with Playwright
- **Target Coverage**: 80%+

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 📧 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/ai-knowledge-companion/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ai-knowledge-companion/discussions)
- **Documentation**: [`/docs`](./docs)
- **Email**: support@ai-knowledge-companion.com

---

## 🌟 Acknowledgments

- [OpenAI](https://openai.com/) for GPT-4 and embeddings API
- [Supabase](https://supabase.com/) for the amazing backend platform
- [Vercel](https://vercel.com/) for seamless deployment
- [Next.js](https://nextjs.org/) team for the fantastic framework
- [LangChain](https://js.langchain.com/) for RAG utilities
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- The open-source community for incredible tools and libraries

---

## 📸 Screenshots

<img width="1685" height="920" alt="02 - Dashboard" src="https://github.com/user-attachments/assets/4ef1ee93-d54d-4e56-bbc7-497a65598fdf" />

**Full accessible dashboard for authenticated users**




<img width="1207" height="918" alt="03 - Storage Documents" src="https://github.com/user-attachments/assets/a9da38ba-af29-4b2c-b8ae-de27f629493d" />

<img width="1207" height="918" alt="03a - Storage Multimedia" src="https://github.com/user-attachments/assets/68c84957-0fa2-460a-8b8e-56d618b2a18b" />

**Rich storage capabilities for documents and multimedia, with automatic processing to enrich your tutors knowledge**




<img width="1207" height="918" alt="04 - Tutors" src="https://github.com/user-attachments/assets/4c17a74a-d203-4425-a998-c2f967ab2248" />

**Create your own tutors and keep them available in a single page**




<img width="1207" height="922" alt="05 - Tutor" src="https://github.com/user-attachments/assets/3022ddcf-cb74-4d2d-a75e-1a06d632fcab" />

**Chat with your tutor and improve your competences thanks to its specific knowledge**




<img width="1207" height="922" alt="06 - Tutor settings" src="https://github.com/user-attachments/assets/9163ab2d-4003-4d81-b6e1-b465aea0d6a3" />


<img width="1207" height="922" alt="06a - Tutor settings" src="https://github.com/user-attachments/assets/e205f412-a69c-47a5-8017-fa9aac9ad86d" />


<img width="1207" height="922" alt="06b - Tutor settings" src="https://github.com/user-attachments/assets/5b7f8489-6ff9-4bf8-8617-7d0f52627a17" />

**Set up your tutors to match your specific needs**




<img width="1194" height="921" alt="07a - Marketplace" src="https://github.com/user-attachments/assets/d6f1a777-049b-47a2-9e9e-bbaaa713010e" />

**Share your tutors in the marketplace and rely on the tutors of other users**




<img width="1207" height="922" alt="08 - Plans" src="https://github.com/user-attachments/assets/932e9292-0ae4-49ea-8b6d-baf10567c525" />


<img width="1207" height="922" alt="09 - Checkout" src="https://github.com/user-attachments/assets/b07f9d77-3106-4bbc-a275-aab973bd3068" />

**3 plans available, to match your specific needs. Different payment methods accepted.**




<img width="1207" height="922" alt="10 - Profile settings" src="https://github.com/user-attachments/assets/276b2679-246e-4bf9-8673-70ed6a531a1b" />

**User profile settings with full control of your data.**




<img width="1207" height="922" alt="11 - Billing" src="https://github.com/user-attachments/assets/317105b0-88e0-48f5-9819-55c85b297104" />

**Usage and billing always under your control.**




<img width="756" height="864" alt="12 - Help Center" src="https://github.com/user-attachments/assets/8167f7e9-5d32-4b23-9bdc-355204378411" />

**A well-structured Help Center for all your questions and needs.**





**Built with ❤️ using Next.js, OpenAI, and Supabase**

⭐ **Star us on GitHub** if you find this project helpful!
