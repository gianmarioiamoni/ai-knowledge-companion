# 📖 AI Knowledge Companion - User Manual

**Version**: 1.0  
**Date**: November 2025  
**Supported Languages**: 🇬🇧 English, 🇮🇹 Italiano

---

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Document Management](#document-management)
4. [Multimedia Files](#multimedia-files)
5. [Creating AI Tutors](#creating-ai-tutors)
6. [Chatting with Tutors](#chatting-with-tutors)
7. [Marketplace](#marketplace)
8. [Plans and Subscriptions](#plans-and-subscriptions)
9. [Usage Monitoring](#usage-monitoring)
10. [Profile and Settings](#profile-and-settings)
11. [Admin Functions](#admin-functions-super-admin)
12. [FAQ](#faq)

---

## 🎯 Introduction

**AI Knowledge Companion** is a platform that allows you to:
- 📄 Upload and manage documents (PDF, DOCX, PPTX, TXT)
- 🎬 Process multimedia files (audio, video, images)
- 🤖 Create personalized AI Tutors powered by your content
- 💬 Chat with tutors using RAG (Retrieval-Augmented Generation) technology
- 🏪 Share tutors in the Marketplace
- 📊 Monitor API usage and costs

---

## 🚀 Getting Started

### 1. Registration

1. Go to **`/signup`**
2. Choose between:
   - **Email/Password**: Fill out the form and confirm your email
   - **Google Sign-Up**: Quick access with Google account
3. Automatically receive the **Trial Plan** (30 days free)

### 2. Login

1. Go to **`/login`**
2. Login with:
   - Email and Password
   - Google Sign-In
3. You'll be redirected to the **Dashboard**

### 3. Dashboard

**Access**: Main menu → **Dashboard**

The Dashboard shows:
- 📊 **Statistics**: Number of tutors, documents, conversations
- 🤖 **Recent Tutors**: Latest created tutors
- 📄 **Recent Documents**: Latest uploaded documents
- ⚡ **Quick Actions**: Create tutor, upload document, new chat

---

## 📄 Document Management

### Uploading a Document

**Access**: Menu → **Storage** → **Documents**

1. Click on **"Upload Document"**
2. Select file:
   - **PDF** (up to 10MB)
   - **DOCX** (Word)
   - **PPTX** (PowerPoint)
   - **TXT** (text)
3. Click **"Upload"**
4. The document will be:
   - ✅ Uploaded to Supabase Storage
   - ✂️ Split into chunks
   - 🧠 Processed for embeddings (automatic)
   - ✅ Ready to be used by tutors

### Managing Documents

**In the Documents page**:
- 🔍 **Search**: Filter documents by name
- 👁️ **View**: See preview and details
- 🔗 **Link**: Associate with a tutor
- 🗑️ **Delete**: Remove document (unlink from tutors first)

### Linking Document-Tutor

1. Open a document
2. Click **"Link to Tutor"**
3. Select one or more tutors
4. Confirm
5. The tutor can now respond using this document

---

## 🎬 Multimedia Files

### Supported Types

**Access**: Menu → **Storage** → **Multimedia**

- **🎵 Audio**: MP3, WAV, M4A (max 25MB)
- **🎥 Video**: MP4, MOV, AVI (max 100MB)
- **🖼️ Images**: JPG, PNG, GIF, WebP (max 5MB)

### Uploading Multimedia Files

1. Go to **Multimedia**
2. Choose type:
   - **Upload Audio**
   - **Upload Video**
   - **Upload Image**
3. Select file
4. Click **"Upload"**

### Automatic Processing

**Audio/Video**:
1. ✅ Upload to Supabase Storage
2. 🎤 Automatic transcription (Whisper API)
3. ✂️ Text chunking
4. 🧠 Embedding generation
5. ✅ Ready for RAG

**Images**:
1. ✅ Upload to Supabase Storage
2. 👁️ Analysis with Vision API (GPT-4V)
3. 📝 Generated description
4. 🧠 Embeddings for semantic search

### Managing Multimedia Files

- 🔍 **Search**: Filter by name or type
- 👁️ **View**: Preview and transcription (audio/video)
- 🔗 **Link**: Associate with tutors (like documents)
- 🗑️ **Delete**: Remove files

---

## 🤖 Creating AI Tutors

### Creating a New Tutor

**Access**: Menu → **Tutors** → **"Create New Tutor"**

#### Step 1: Basic Information

- **Name**: Tutor's name (e.g., "Python Expert")
- **Description**: What the tutor does
- **Instructions**: System prompt (personality, behavior)
- **Visibility**:
  - 🔒 **Private**: Only you
  - 🔗 **Unlisted**: Anyone with the link
  - 🌐 **Public**: Everyone (visible in Marketplace)

#### Step 2: AI Configuration

- **Model**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **Temperature**: 0.0 (precise) - 1.0 (creative)
- **Max Tokens**: Response limit (default: 2000)
- **Top P**: Sampling (default: 1.0)

#### Step 3: RAG Configuration

- **Enabled**: On/Off
- **Chunk Limit**: How many chunks to use (default: 5)
- **Similarity Threshold**: Similarity threshold (0.0-1.0)

#### Step 4: Documents

- Select documents to link
- You can also link after creation

### Editing a Tutor

1. Go to **Tutors**
2. Click on the tutor
3. Click **"Edit"**
4. Modify fields
5. **Save Changes**

### Deleting a Tutor

1. Go to **Tutors**
2. Click on the tutor
3. Click **"Delete"**
4. Confirm

⚠️ **Warning**: This also deletes all associated conversations!

---

## 💬 Chatting with Tutors

### Starting a Chat

**Option 1**: From Tutors page
1. Click on a tutor
2. Click **"Start Chat"**

**Option 2**: From menu
1. Menu → **Chat**
2. Select tutor from sidebar
3. Start chatting

### Chat Interface

**Sidebar (left)**:
- 🔍 Search conversations
- 📋 List conversations
- ➕ New conversation

**Main area**:
- 💬 Messages
- 📝 Text input
- 🎤 Voice input (if enabled)
- 📎 Attach files

**Header**:
- 🤖 Tutor name
- ⚙️ Conversation settings
- 🗑️ Delete conversation

### Chat Features

#### Messages
- **Text**: Write and send
- **Multiline**: Shift+Enter for new line
- **Markdown**: Supported in responses

#### RAG (if enabled)
- The tutor searches linked documents
- Shows relevant chunks
- Cites sources

#### Conversations
- **Multiple**: Multiple conversations per tutor
- **History**: All saved
- **Search**: Find old chats
- **Delete**: Remove conversations

---

## 🏪 Marketplace

**Access**: Menu → **Marketplace**

### What is the Marketplace

Platform for:
- 🔍 **Discover**: Public tutors created by other users
- 📥 **Use**: Chat with marketplace tutors
- 📤 **Share**: Publish your tutors

### Using a Marketplace Tutor

1. Go to **Marketplace**
2. Browse or search tutors
3. Click on a tutor for details
4. Click **"Start Chat"** or **"Use This Tutor"**
5. Start chatting

### Publishing a Tutor

1. Create a tutor
2. Set **Visibility**: **Public**
3. Save
4. The tutor appears in the Marketplace

⚠️ **Note**: Only public tutors are visible in the Marketplace

---

## 💳 Plans and Subscriptions

**Access**: Menu → **Plans**

### Available Plans

| Plan | Price | API Calls | Tokens | Cost Limit |
|------|-------|-----------|--------|------------|
| **Trial** | €0/month (30 days) | 100 | 50,000 | €5 |
| **Starter** | €9/month | 1,000 | 500,000 | €20 |
| **Pro** | €29/month | 10,000 | 2,000,000 | €100 |
| **Enterprise** | €99/month | 100,000 | 10,000,000 | €500 |

### Changing Plans

#### Upgrade

1. Go to **Plans**
2. Select higher plan
3. Click **"Subscribe"**
4. Complete Stripe payment
5. Immediate activation
6. **Proration**: Credit for unused days of previous plan

#### Downgrade

1. Go to **Plans**
2. Select lower plan
3. Click **"Subscribe"**
4. **Scheduled Change**: Active from next billing cycle
5. See banner with change date

### Canceling Subscription

1. Go to **Plans**
2. Click **"Cancel Subscription"**
3. Confirm
4. Access until end of paid period
5. Then automatically switches to Trial (if available)

### Payment History

1. Profile menu → **Usage** → "Billing History" section
2. See all Stripe transactions

---

## 📊 Usage Monitoring

**Access**: Profile menu → **Usage**

### Usage Dashboard

Shows:

#### 1. API Calls
- **Current**: Current API calls
- **Max**: Monthly limit
- **Progress Bar**: % usage visualization
- **Color Coding**:
  - 🟢 Green: 0-60%
  - 🟡 Yellow: 61-80%
  - 🔴 Red: 81-100%

#### 2. Tokens
- **Current**: Consumed tokens
- **Max**: Monthly limit
- **Progress Bar**: % usage

#### 3. Cost (💰 API Cost)
- **Current**: Actual OpenAI API cost
- **Max**: Monthly budget
- **Progress Bar**: % spending
- **Includes**:
  - Chat completions (GPT-4, GPT-3.5)
  - Embeddings (documents, multimedia)
  - Transcription (Whisper)
  - Vision (GPT-4V)

#### 4. Last 30 Days Summary
- Total API Calls
- Total Tokens
- **Total Cost**

#### 5. Alerts
- ⚠️ Warning if approaching limits (>80%)
- 🚨 Critical if exceeding limits

#### 6. Reset Date
- Quota reset date (start of new cycle)

### What is Tracked

**Chat Operations**:
- Chat completions (input/output tokens)
- RAG embeddings for similarity search

**Multimedia Processing**:
- Audio/Video transcription (Whisper API)
- Audio/Video embeddings
- Image analysis (Vision API)
- Image embeddings

**Document Processing**:
- Document embeddings (chunking + embeddings)

### Quota Exceeded

If you exceed limits:
1. Receive alert in dashboard
2. Some operations may be blocked
3. **Solution**:
   - Upgrade plan
   - Wait for monthly reset

---

## 👤 Profile and Settings

### User Profile

**Access**: Profile menu (top right) → **Profile**

**Information**:
- 📧 Email
- 👤 Display Name
- 📅 Registration date
- 🎫 Current plan
- 🔑 Role (user, admin, super_admin)

**Actions**:
- ✏️ **Edit Profile**: Change name, email
- 🔒 **Change Password**: Only for email/password accounts
- 🗑️ **Delete Account**: Remove account (irreversible)

### Settings

**Language**:
- Click on language icon (🌐)
- Choose between English 🇬🇧 and Italiano 🇮🇹
- Interface changes immediately

**Cookie Consent**:
- Banner on first access
- Manage cookie preferences
- Categories: Necessary, Analytics, Preferences, Marketing

---

## 🔐 Admin Functions (Super Admin)

**Access**: Menu → **Admin** (only for admin/super_admin)

### Admin Dashboard

**Path**: `/admin/dashboard`

**Shows**:
- 📊 **System Stats**: Total users, tutors, documents
- 💰 **Billing Overview**: Total costs, revenue
- 📈 **Top Users**: Users with highest usage
- 🔔 **Alerts**: System notifications

### User Management

**Path**: `/admin/users`

**Features**:
- 📋 **User List**: All registered users
- 🔍 **Search**: Filter by email, name, role, status
- 👁️ **View**: User details
- ✏️ **Edit**:
  - Change role (user, admin, super_admin)
  - Change status (active, suspended, banned)
  - Exempt from subscription (subscription_exempt)
- 🗑️ **Delete**: Remove user (soft delete)

**Roles**:
- **user**: Normal user
- **admin**: Access admin dashboard, user management
- **super_admin**: Full access, including Usage for all users

**Status**:
- **active**: Active user
- **suspended**: Temporarily suspended
- **banned**: Banned (no access)

### Billing Admin

**Path**: `/admin/billing`

**Shows**:
- 💰 **Total Revenue**: Total earnings
- 📊 **Costs Overview**: Total API costs
- 👥 **Top Users by Cost**: Users with highest API spending
- 📈 **Trend**: Timeline trend
- 🔔 **Alerts**: Users exceeding limits

**Features**:
- Filter by period (day, week, month, year)
- Export reports (CSV)
- View details per user

### Usage for All Users

**Path**: `/admin/usage` (super_admin only)

**Shows**:
- 👥 **Total Users**: Total users (+ active)
- 📞 **Total API Calls**: Sum of all calls
- 🔢 **Total Tokens**: Sum of all tokens
- 💰 **Total Cost**: Total API cost
- 📊 **Avg Cost/User**: Average per user

**User List**:
- Email, role, status
- Current usage (API calls, tokens, cost)
- Max limits
- Progress bars (visual)
- Last 30 days stats

**Sort**:
- By Cost (default)
- By Tokens
- By API Calls

---

## ❓ FAQ

### Account and Authentication

**Q: Can I change my email?**  
A: Yes, go to Profile → Edit Profile → Change email → Confirm new address.

**Q: I forgot my password?**  
A: Click "Forgot Password?" on login page → Enter email → Receive reset link.

**Q: Can I use both Google and Email/Password?**  
A: No, choose one method at registration. If you registered with email, you can't then use Google for the same account.

### Plans and Payments

**Q: What happens after Trial?**  
A: You must choose a paid plan or lose access to premium features. You can still access your account.

**Q: Can I cancel anytime?**  
A: Yes, instant cancellation. Access until end of paid period.

**Q: What does proration include?**  
A: When upgrading, you receive a proportional credit for unused days of the previous plan, applied immediately to the new plan.

**Q: Do you accept PayPal?**  
A: Currently only credit/debit cards via Stripe.

### Documents and Multimedia

**Q: Can I upload scanned PDFs?**  
A: Yes, but text extraction may be limited. For best results, use text-based PDFs.

**Q: Are files deleted automatically?**  
A: No, they remain until you manually delete them.

**Q: Can I re-process a document?**  
A: No, processing is automatic on upload. If needed, delete and re-upload.

**Q: How many documents can I upload?**  
A: Depends on plan. The limit is in terms of processing cost (embeddings), not number of files.

### AI Tutors

**Q: How many tutors can I create?**  
A: No fixed limit, but each tutor consumes quota for embeddings of linked documents.

**Q: Can I share a private tutor?**  
A: Yes, set "Unlisted" and share the direct link.

**Q: Can I transfer a tutor to another user?**  
A: No, currently not possible. The user must recreate it.

### Chat and Conversations

**Q: Are chats saved?**  
A: Yes, all conversations are saved and accessible anytime.

**Q: Can I export chats?**  
A: Not directly from interface. Contact support for bulk exports.

**Q: Can the tutor "forget" information?**  
A: No, RAG context is always available. But conversation context has a limit (max tokens).

### Usage and Costs

**Q: Why is my cost high?**  
A: Depends on:
- Model used (GPT-4 costs more)
- Response length (max tokens)
- Number of documents (embeddings)
- Number of multimedia processed

**Tips to reduce costs**:
- Use GPT-3.5 when possible
- Reduce max_tokens
- Limit number of RAG chunks
- Avoid reprocessing same files

**Q: When does quota reset?**  
A: At the start of each monthly billing cycle (see date on Usage dashboard).

### Marketplace

**Q: Are Marketplace tutors free?**  
A: Using the tutor is free, but you consume your API quota. The creator doesn't earn (currently).

**Q: Can I sell my tutors?**  
A: No, currently Marketplace is only for free sharing.

### Security and Privacy

**Q: Is my data safe?**  
A: Yes, we use:
- Encryption at rest (Supabase)
- HTTPS/TLS
- RLS (Row Level Security)
- JWT authentication
- Rate limiting

**Q: Do you delete my data if I delete my account?**  
A: Yes, complete deletion (hard delete) of all data within 30 days.

**Q: Do you use my data to train AI?**  
A: No, your data is NOT used for training. See Privacy Policy.

### Support

**Q: How do I contact support?**  
A: Menu → **Contact** → Fill form → Receive confirmation email.

**Q: Response times?**  
A: Usually within 2 business days.

**Q: Is there technical documentation?**  
A: Yes, see `/docs` in GitHub repository.

---

## 📞 Support and Contact

**Email**: support@aiknowledgecompanion.com  
**Contact Form**: `/contact`  
**Documentation**: [docs/](../docs/)  
**GitHub**: [Repository](https://github.com/your-repo)

---

## 📝 Legal Notes

- 📄 [Privacy Policy](/privacy-policy)
- 📜 [Terms of Service](/terms-of-service)
- 🍪 [Cookie Policy](/cookie-policy)

---

## 🔄 Changelog

**v1.0** (November 2025)
- ✅ First complete version of user manual
- ✅ Coverage of all features
- ✅ Extended FAQ
- ✅ EN/IT support

---

**End of User Manual**  
_Last updated: November 2025_

