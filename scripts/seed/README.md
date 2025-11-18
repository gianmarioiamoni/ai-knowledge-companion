# 🌱 Seed Data Scripts

Automated scripts to populate the AI Knowledge Companion database with realistic demo data.

## 📋 What Gets Created

### 📄 Documents (5 total)
1. **Introduction to Calculus** - Mathematics guide (limits, derivatives, integration)
2. **Renaissance and Reformation** - European history (1300-1600)
3. **Modern JavaScript and TypeScript** - Web development guide
4. **Cell Biology and Genetics** - Science curriculum
5. **Advanced English Grammar** - Language learning resource

### 🤖 Tutors (6 total)
1. **Calculus Professor** - Mathematics tutor (linked to Calculus doc)
2. **History Scholar** - History tutor (linked to History doc)
3. **Full-Stack Coding Mentor** - Programming tutor (linked to Programming doc)
4. **Biology & Genetics Tutor** - Science tutor (linked to Science doc)
5. **English Grammar Expert** - Language tutor (linked to Language doc)
6. **General Study Assistant** - Multi-subject tutor (linked to ALL docs, marketplace visible)

### 💬 Demo Conversations (3 total)
1. Calculus: Understanding Derivatives
2. History: Renaissance Art Revolution
3. Programming: TypeScript Generics Explained

---

## 🚀 Quick Start

### Prerequisites

1. **Environment Variables** (`.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your deployed URL
```

2. **Target User**: Must exist in the database
   - Create user via signup or admin bootstrap
   - Default: `gia.iamoni@tiscali.it` (configurable in `seed-config.ts`)

3. **Server Running**: For document processing
   - Local: `npm run dev` on http://localhost:3000
   - Production: Use deployed URL in `NEXT_PUBLIC_APP_URL`

### Run the Script

```bash
# Install dependencies (if not already installed)
npm install

# Run seed script (uses default email from seed-config.ts)
tsx scripts/seed/index.ts

# Or specify a different user
tsx scripts/seed/index.ts user@example.com
```

---

## 📂 File Structure

```
scripts/seed/
├── content/              # Document content files
│   ├── mathematics.md
│   ├── history.md
│   ├── programming.md
│   ├── science.md
│   └── language.md
├── seed-config.ts        # Configuration (documents, tutors, conversations)
├── upload-documents.ts   # Step 1: Upload and process documents
├── create-tutors.ts      # Step 2: Create tutors and link documents
├── create-demo-chats.ts  # Step 3: Create demo conversations
├── index.ts              # Main orchestrator
└── README.md             # This file
```

---

## 🔄 Seed Process

### Step 1: Upload and Process Documents ⏱️ ~5-10 minutes

1. Reads markdown files from `content/` directory
2. Uploads to Supabase Storage (`documents` bucket)
3. Creates document records in database
4. **Triggers processing API** → Extracts text, chunks, generates embeddings
5. Waits for processing to complete (polls status every 2 seconds)

**Cost**: ~$0.50-1.00 in OpenAI API (embeddings)

### Step 2: Create Tutors and Link Documents ⏱️ ~10 seconds

1. Creates tutor records with AI configurations
2. Links each tutor to relevant documents via `tutor_documents` table
3. Sets up RAG configuration (similarity threshold, max chunks, etc.)

### Step 3: Create Demo Conversations ⏱️ ~5 seconds

1. Creates conversation records
2. Adds pre-written messages (user and assistant)
3. Updates conversation metadata

**Total Duration**: ~6-12 minutes (depending on document processing)

---

## 💡 Customization

### Change Target User

Edit `scripts/seed/seed-config.ts`:
```typescript
export const TARGET_USER_EMAIL = 'your-email@example.com';
```

Or pass as argument:
```bash
tsx scripts/seed/index.ts your-email@example.com
```

### Add More Documents

1. Create markdown file in `content/` directory
2. Add configuration to `SEED_DOCUMENTS` in `seed-config.ts`:
```typescript
{
  filename: 'new-document.md',
  title: 'Document Title',
  description: 'Document description',
  category: 'NewCategory',
  visibility: 'private'
}
```

### Add More Tutors

Add configuration to `SEED_TUTORS` in `seed-config.ts`:
```typescript
{
  name: 'New Tutor',
  description: 'Tutor description',
  system_prompt: 'You are...',
  temperature: 0.5,
  model: 'gpt-4o-mini',
  use_rag: true,
  max_context_chunks: 5,
  similarity_threshold: 0.7,
  visibility: 'private',
  documentCategories: ['CategoryName'] // Links to documents
}
```

### Add More Conversations

Add configuration to `SEED_CONVERSATIONS` in `seed-config.ts`:
```typescript
{
  tutorName: 'Tutor Name', // Must match existing tutor
  title: 'Conversation Title',
  messages: [
    { role: 'user', content: '...' },
    { role: 'assistant', content: '...' }
  ]
}
```

---

## 🔧 Run Individual Steps

### Upload Documents Only
```bash
tsx scripts/seed/upload-documents.ts user@example.com
```

### Create Tutors Only
```bash
# Requires userId and documentMap JSON
tsx scripts/seed/create-tutors.ts <userId> '<documentMapJson>'
```

### Create Conversations Only
```bash
# Requires userId and tutorMap JSON
tsx scripts/seed/create-demo-chats.ts <userId> '<tutorMapJson>'
```

---

## ✅ Verification

After running the seed script, verify the data:

### 1. Check Documents
```sql
SELECT id, title, status, media_type 
FROM documents 
WHERE owner_id = 'USER_ID';
```

### 2. Check Document Chunks (Embeddings)
```sql
SELECT d.title, COUNT(dc.id) as chunk_count
FROM documents d
LEFT JOIN document_chunks dc ON dc.document_id = d.id
WHERE d.owner_id = 'USER_ID'
GROUP BY d.id, d.title;
```

### 3. Check Tutors
```sql
SELECT id, name, visibility, use_rag 
FROM tutors 
WHERE owner_id = 'USER_ID';
```

### 4. Check Tutor-Document Links
```sql
SELECT t.name, d.title
FROM tutor_documents td
JOIN tutors t ON t.id = td.tutor_id
JOIN documents d ON d.id = td.document_id
WHERE t.owner_id = 'USER_ID';
```

### 5. Check Conversations
```sql
SELECT c.title, t.name as tutor_name, c.message_count
FROM conversations c
JOIN tutors t ON t.id = c.tutor_id
WHERE c.user_id = 'USER_ID';
```

---

## 🧪 Testing RAG Functionality

After seeding, test that RAG is working:

1. **Login** as the seeded user
2. **Navigate to Chat** → Select "Calculus Professor"
3. **Ask a question** related to the document:
   - "What is the power rule for derivatives?"
   - "Can you explain integration by parts?"
4. **Verify RAG context**: The response should reference specific content from the calculus document

---

## ⚠️ Troubleshooting

### Error: "User not found"
- Ensure the user exists in the database
- Check email spelling
- Verify user has completed signup

### Error: "Missing environment variables"
- Check `.env.local` has all required variables
- Restart the script after adding variables

### Error: "Document processing timeout"
- Server may be slow or not running
- Check server logs: `npm run dev`
- Verify `OPENAI_API_KEY` is valid
- Increase timeout in `upload-documents.ts`

### Error: "Storage upload failed"
- Check Supabase Storage bucket exists: `documents`
- Verify RLS policies allow service role access
- Check storage quota

### Documents processed but RAG not working
- Verify embeddings were created:
  ```sql
  SELECT COUNT(*) FROM document_chunks WHERE document_id = 'DOC_ID';
  ```
- Check embedding column is not NULL:
  ```sql
  SELECT id, embedding IS NOT NULL as has_embedding 
  FROM document_chunks 
  WHERE document_id = 'DOC_ID';
  ```

---

## 🧹 Cleanup

To remove all seeded data:

```sql
-- Delete conversations and messages (cascade)
DELETE FROM conversations WHERE user_id = 'USER_ID';

-- Delete tutor links and tutors (cascade)
DELETE FROM tutor_documents WHERE tutor_id IN (
  SELECT id FROM tutors WHERE owner_id = 'USER_ID'
);
DELETE FROM tutors WHERE owner_id = 'USER_ID';

-- Delete document chunks and documents (cascade)
DELETE FROM document_chunks WHERE document_id IN (
  SELECT id FROM documents WHERE owner_id = 'USER_ID'
);
DELETE FROM documents WHERE owner_id = 'USER_ID';

-- Delete files from Supabase Storage (manual via dashboard or API)
```

---

## 📊 Expected Output

```
╔════════════════════════════════════════════════════╗
║     AI Knowledge Companion - Seed Data Script     ║
╚════════════════════════════════════════════════════╝

📧 Target User: gia.iamoni@tiscali.it
📅 Date: ...

🔍 Checking environment variables...
  ✅ NEXT_PUBLIC_SUPABASE_URL
  ✅ SUPABASE_SERVICE_ROLE_KEY
  ✅ OPENAI_API_KEY
  ℹ️  NEXT_PUBLIC_APP_URL: http://localhost:3000

─────────────────────────────────────────────────────

📚 STEP 1: Upload and Process Documents
─────────────────────────────────────────────────────

🚀 Starting document upload...
📧 Target user: gia.iamoni@tiscali.it
👤 User ID: ...

📄 Uploading: Introduction to Calculus...
  ✅ Uploaded to storage: ...
  ✅ Created DB record: ...
  ✅ Processing triggered
  ✅ Processing completed: Introduction to Calculus

[... more documents ...]

📊 Upload Summary:
✅ Successful: 5/5

─────────────────────────────────────────────────────

🤖 STEP 2: Create Tutors and Link Documents
─────────────────────────────────────────────────────

🤖 Creating tutor: Calculus Professor...
  ✅ Created tutor: ...
  ✅ Linked document: Mathematics
  ✅ Completed: Calculus Professor (1 documents linked)

[... more tutors ...]

📊 Tutor Creation Summary:
✅ Successful: 6/6
🔗 Total documents linked: 11

─────────────────────────────────────────────────────

💬 STEP 3: Create Demo Conversations
─────────────────────────────────────────────────────

💬 Creating conversation: Understanding Derivatives...
  ✅ Created conversation: ...
  ✅ Added user message
  ✅ Added assistant message
  ✅ Added user message
  ✅ Added assistant message
  ✅ Completed: Understanding Derivatives (4 messages)

[... more conversations ...]

📊 Conversation Creation Summary:
✅ Successful: 3/3
💬 Total messages: 9

─────────────────────────────────────────────────────

╔════════════════════════════════════════════════════╗
║              SEED DATA SUMMARY                     ║
╚════════════════════════════════════════════════════╝

👤 User: gia.iamoni@tiscali.it
🆔 User ID: ...

📊 Results:
  📄 Documents: 5 uploaded, 0 failed
  🤖 Tutors: 6 created, 0 failed
  💬 Conversations: 3 created, 0 failed
  ✉️  Messages: 9 total

💰 Estimated OpenAI Cost: ~$0.50
⏱️  Duration: 360s (6m 0s)

╔════════════════════════════════════════════════════╗
║              ✅ SEED COMPLETED SUCCESSFULLY!       ║
╚════════════════════════════════════════════════════╝

🎉 Next steps:
  1. Login as: gia.iamoni@tiscali.it
  2. Navigate to "My Tutors" to see the created tutors
  3. Navigate to "Documents" to see uploaded files
  4. Navigate to "Chat" to see demo conversations
  5. Test the RAG functionality by asking questions!
```

---

## 📝 Notes

- **Embeddings**: Each document generates ~10-30 chunks with OpenAI embeddings
- **Cost**: ~$0.10-0.20 per document (varies by length)
- **Time**: Processing is the slowest part (text extraction + embeddings)
- **Idempotency**: Script can be run multiple times (creates new records each time)
- **Cleanup**: Remember to delete test data before production deploy
- **RAG**: Only works if embeddings are successfully generated

---

## 🆘 Support

If you encounter issues:
1. Check server logs: `npm run dev`
2. Check Supabase logs: Dashboard → Logs
3. Verify API keys are valid
4. Test individual steps (upload, tutors, chats separately)
5. Check database constraints and RLS policies

