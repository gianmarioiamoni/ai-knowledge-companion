# 🔄 Background Worker Setup Guide

## **Overview**

The multimedia processing system includes a background worker that automatically processes queued audio/video/image files.

---

## **🎯 Processing Flow**

```
Upload → Queue → Worker → Transcription → Chunking → Embeddings → Ready!
```

1. User uploads multimedia file
2. File queued in `media_processing_queue`
3. Worker picks up next queued job
4. Transcription via Whisper API (audio/video) or GPT-4V (images)
5. Text chunking (500-800 tokens)
6. Embeddings generation
7. Document marked as "ready" for RAG

---

## **📋 Prerequisites**

### **FFmpeg (Required for Video Transcription)**

Video transcription requires FFmpeg to extract audio from video files before sending to Whisper API.

**Check if installed**:
```bash
node scripts/verify-ffmpeg.js
```

**Install FFmpeg**:

- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt install ffmpeg`
- **CentOS/RHEL**: `sudo yum install ffmpeg`
- **Docker**: Add `RUN apt-get install -y ffmpeg` to Dockerfile

**Why needed?**
- Whisper API has a 25MB file size limit
- Videos are often 50-500MB
- FFmpeg extracts audio (~5-10MB) which fits under the limit
- 48MB video → 5MB audio (MP3, 128kbps)

For detailed setup, see [`docs/VIDEO_TRANSCRIPTION_SETUP.md`](docs/VIDEO_TRANSCRIPTION_SETUP.md).

---

## **🚀 Setup Options**

### **Option 1: Development - Auto-Processing Hook** ⚡

Enable automatic processing during development:

**File**: `src/app/[locale]/multimedia/page.tsx`

```typescript
import { useAutoProcessing } from '@/hooks/use-auto-processing'

export function MultimediaPageClient() {
  // Enable auto-processing (checks every 10 seconds)
  useAutoProcessing({ 
    enabled: true,  // Set to false to disable
    intervalMs: 10000  // Check every 10s
  })
  
  // ... rest of component
}
```

**⚠️ Warning**: Only enable in development! In production, use Option 2 or 3.

---

### **Option 2: Production - Vercel Cron** ⏰

Automatically process every 5 minutes on Vercel:

**1. Vercel Cron is already configured** (`vercel-cron.json`):

```json
{
  "crons": [
    {
      "path": "/api/multimedia/worker",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**2. Deploy to Vercel**:
```bash
vercel --prod
```

**3. Verify in Vercel Dashboard**:
- Go to Project Settings → Cron Jobs
- You should see: `POST /api/multimedia/worker` (every 5 minutes)

**Pricing**: Free tier includes 1 cron job.

---

### **Option 3: Production - Manual Trigger via API** 🔧

Call the worker manually or from external cron:

```bash
# Process next job in queue
curl -X POST https://your-app.vercel.app/api/multimedia/worker

# Check worker status
curl https://your-app.vercel.app/api/multimedia/worker
```

**Examples**:

**GitHub Actions** (every 10 minutes):

```yaml
# .github/workflows/multimedia-worker.yml
name: Multimedia Worker

on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Worker
        run: |
          curl -X POST https://your-app.vercel.app/api/multimedia/worker
```

**Cron job on server**:

```bash
# Add to crontab
*/5 * * * * curl -X POST https://your-app.vercel.app/api/multimedia/worker
```

---

### **Option 4: Production - BullMQ (Advanced)** 🔥

For high-volume production with Redis:

**1. Install dependencies**:
```bash
pnpm install bullmq ioredis
```

**2. Setup Redis** (Upstash, Redis Cloud, or self-hosted)

**3. Create queue worker**:

```typescript
// src/lib/workers/multimedia-queue.ts
import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

const connection = new Redis(process.env.REDIS_URL!)

export const multimediaQueue = new Queue('multimedia', { connection })

export const createWorker = () => {
  return new Worker(
    'multimedia',
    async (job) => {
      const { documentId, queueId } = job.data
      
      // Call your processing function
      const response = await fetch('http://localhost:3000/api/multimedia/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, queueId }),
      })
      
      return response.json()
    },
    { connection }
  )
}
```

**4. Start worker**:
```bash
# Separate process or server
node -r esbuild-register src/lib/workers/multimedia-queue.ts
```

---

### **Option 5: Production - Inngest (Easiest)** 🌟

**Recommended for production** - no Redis required!

**1. Install Inngest**:
```bash
pnpm install inngest
```

**2. Create function**:

```typescript
// src/inngest/functions/process-multimedia.ts
import { inngest } from '../client'

export const processMultimedia = inngest.createFunction(
  { id: 'process-multimedia' },
  { event: 'multimedia/uploaded' },
  async ({ event }) => {
    const { documentId, queueId } = event.data
    
    const response = await fetch('http://localhost:3000/api/multimedia/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, queueId }),
    })
    
    return response.json()
  }
)
```

**3. Send event on upload**:

```typescript
// After upload
await inngest.send({
  name: 'multimedia/uploaded',
  data: { documentId, queueId }
})
```

**4. Run Inngest dev server**:
```bash
pnpm inngest-cli dev
```

---

## **📊 Worker API**

### **POST /api/multimedia/worker**

Process next job in queue.

**Response (Success)**:
```json
{
  "success": true,
  "processed": 1,
  "queueId": "...",
  "documentId": "...",
  "chunks": 15,
  "embeddings": 15,
  "cost": 0.0642
}
```

**Response (No Jobs)**:
```json
{
  "message": "No jobs in queue",
  "processed": 0
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Processing failed",
  "queueId": "...",
  "documentId": "..."
}
```

### **GET /api/multimedia/worker**

Check worker status and queue info.

**Response**:
```json
{
  "status": "online",
  "queue": {
    "queued": 3,
    "processing": 1,
    "total": 4
  }
}
```

---

## **🧪 Testing**

### **Test Worker Manually**

1. **Upload audio file** via `/multimedia` page
2. **Note the document ID** from response or database
3. **Trigger worker manually**:

```bash
curl -X POST http://localhost:3000/api/multimedia/worker
```

4. **Check status**:

```bash
curl http://localhost:3000/api/multimedia/worker
```

5. **Verify in database**:

```sql
-- Check processing queue
SELECT * FROM media_processing_queue ORDER BY created_at DESC LIMIT 5;

-- Check document status
SELECT id, title, transcription_status, status FROM documents 
WHERE media_type = 'audio' ORDER BY created_at DESC LIMIT 5;

-- Check chunks created
SELECT COUNT(*) FROM document_chunks WHERE document_id = 'your-doc-id';
```

### **Test Auto-Processing**

1. Enable in `multimedia-page-client.tsx`:

```typescript
useAutoProcessing({ enabled: true })
```

2. Upload file
3. Watch console logs - should auto-process within 10 seconds
4. Refresh page - file should show "Completed"

---

## **🔍 Monitoring**

### **Check Queue Status**

```sql
-- Queue summary
SELECT 
  status, 
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_age_seconds
FROM media_processing_queue
GROUP BY status;

-- Recent jobs
SELECT 
  id,
  media_type,
  status,
  progress_percent,
  error_message,
  created_at,
  processing_started_at,
  processing_completed_at
FROM media_processing_queue
ORDER BY created_at DESC
LIMIT 10;

-- Failed jobs
SELECT * FROM media_processing_queue 
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### **Processing Metrics**

```sql
-- Average processing time by media type
SELECT 
  media_type,
  AVG(EXTRACT(EPOCH FROM (processing_completed_at - processing_started_at))) as avg_duration_seconds,
  AVG(processing_cost) as avg_cost,
  COUNT(*) as total_processed
FROM media_processing_queue
WHERE status = 'completed'
GROUP BY media_type;

-- Total costs
SELECT 
  SUM(processing_cost) as total_cost,
  COUNT(*) as total_jobs
FROM media_processing_queue
WHERE status = 'completed';
```

---

## **⚡ Performance Tips**

### **Batch Processing**

Modify worker to process multiple jobs:

```typescript
// Process up to 5 jobs at once
const BATCH_SIZE = 5

for (let i = 0; i < BATCH_SIZE; i++) {
  const jobs = await getNextJob()
  if (!jobs) break
  await processJob(jobs[0])
}
```

### **Parallel Processing**

Process multiple jobs in parallel:

```typescript
const jobs = await getNextJobs(3)
await Promise.all(jobs.map(processJob))
```

### **Priority Queue**

Add priority field to queue:

```sql
ALTER TABLE media_processing_queue 
ADD COLUMN priority INTEGER DEFAULT 0;

CREATE INDEX idx_queue_priority 
ON media_processing_queue(status, priority DESC, created_at ASC);
```

---

## **🐛 Troubleshooting**

### **Worker not processing**

1. Check if jobs are in queue:
   ```sql
   SELECT * FROM media_processing_queue WHERE status = 'queued';
   ```

2. Check worker logs:
   ```bash
   # Vercel logs
   vercel logs
   ```

3. Manually trigger:
   ```bash
   curl -X POST http://localhost:3000/api/multimedia/worker
   ```

### **Processing stuck**

Jobs stuck in "processing" status:

```sql
-- Reset stuck jobs (processing for > 10 minutes)
UPDATE media_processing_queue
SET status = 'queued',
    processing_started_at = NULL
WHERE status = 'processing'
  AND processing_started_at < NOW() - INTERVAL '10 minutes';
```

### **High costs**

Monitor and limit costs:

```sql
-- Daily cost summary
SELECT 
  DATE(processing_completed_at) as date,
  SUM(processing_cost) as daily_cost,
  COUNT(*) as jobs_processed
FROM media_processing_queue
WHERE status = 'completed'
GROUP BY DATE(processing_completed_at)
ORDER BY date DESC;
```

---

## **📝 Recommendations**

### **For Development**:
- ✅ Use `useAutoProcessing` hook with `enabled: true`
- ✅ Or manually trigger via API

### **For Production (Low Volume < 100 files/day)**:
- ✅ Vercel Cron (easiest, free)
- ✅ GitHub Actions

### **For Production (Medium Volume < 1000 files/day)**:
- ✅ Inngest (no Redis, easy setup)
- ✅ Vercel Cron with batch processing

### **For Production (High Volume > 1000 files/day)**:
- ✅ BullMQ with Redis (most scalable)
- ✅ Separate worker instance
- ✅ Horizontal scaling

---

## **🎯 Quick Start Checklist**

- [ ] Run database migrations (`sql/19_multimedia_schema.sql`)
- [ ] Choose processing option (Auto-Hook / Cron / Manual)
- [ ] Test with sample audio file
- [ ] Verify processing completes successfully
- [ ] Check chunks and embeddings created
- [ ] Monitor costs and performance
- [ ] Set up alerts for failed jobs

---

**Implementation Status**: ✅ Complete
**Ready for Production**: ✅ Yes (with Vercel Cron or Inngest)
**Estimated Processing Time**: 30-60 seconds per 10-minute audio file

🎉 **Your multimedia processing system is ready to go!**

