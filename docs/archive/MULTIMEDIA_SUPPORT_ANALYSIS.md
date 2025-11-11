# 🎬 Multimedia Support - Feasibility Analysis

## 📊 Current State Analysis

### **Existing Architecture**

```
Current Pipeline (Text Documents):
┌──────────┐     ┌────────┐     ┌──────────┐     ┌────────────┐     ┌─────┐
│  Upload  │ --> │ Parse  │ --> │ Chunking │ --> │ Embeddings │ --> │ RAG │
│  (10MB)  │     │ Text   │     │ (tokens) │     │  OpenAI    │     │ GPT │
└──────────┘     └────────┘     └──────────┘     └────────────┘     └─────┘
```

**Supported Formats:**
- ✅ PDF (application/pdf)
- ✅ DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
- ✅ PPTX (application/vnd.openxmlformats-officedocument.presentationml.presentation)
- ✅ TXT (text/plain)
- ✅ MD (text/markdown)

**Current Limits:**
- Max file size: **10MB**
- Max files per upload: **5**
- Storage: Supabase Storage bucket `documents`
- Processing: Synchronous (client-side parsing)

---

## 🎯 Multimedia Support Requirements

### **Target Formats to Support**

#### **1. Video** 🎥
```
Formats: MP4, MOV, AVI, WebM
Size: 50MB - 500MB typical
Processing: Audio extraction → Transcription
```

#### **2. Audio** 🎵
```
Formats: MP3, WAV, M4A, OGG
Size: 1MB - 50MB typical
Processing: Direct transcription
```

#### **3. Images** 🖼️
```
Formats: JPG, PNG, GIF, WebP
Size: 100KB - 10MB typical
Processing: OCR + Vision API description
```

---

## 🏗️ Proposed Architecture

### **New Multimedia Pipeline**

```
┌──────────────┐
│   Upload     │
│  (500MB max) │
└──────┬───────┘
       │
       ├─── Text Documents ──> [Current Pipeline]
       │
       ├─── Video/Audio ────> ┌─────────────┐
       │                      │  Whisper    │ (Transcription)
       │                      │   OpenAI    │
       │                      └──────┬──────┘
       │                             │
       │                             ├──> Chunking ──> Embeddings ──> RAG
       │                             │
       └─── Images ─────────> ┌─────────────┐
                              │  GPT-4V     │ (Vision + OCR)
                              │  OpenAI     │
                              └──────┬──────┘
                                     │
                                     └──> Chunking ──> Embeddings ──> RAG
```

---

## 🔧 Technical Implementation

### **1. Database Schema Extensions**

```sql
-- Extend documents table
ALTER TABLE documents
  ADD COLUMN media_type TEXT DEFAULT 'document', -- 'document', 'video', 'audio', 'image'
  ADD COLUMN duration_seconds INTEGER, -- For video/audio
  ADD COLUMN width INTEGER, -- For images/video
  ADD COLUMN height INTEGER, -- For images/video
  ADD COLUMN transcription_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  ADD COLUMN thumbnail_url TEXT; -- Preview thumbnail

-- New table for media processing queue
CREATE TABLE media_processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  status TEXT DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  progress_percent INTEGER DEFAULT 0,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **2. Storage Configuration**

**Separate Buckets:**
```typescript
Buckets:
- documents (existing) - Text documents, max 50MB
- videos - Video files, max 500MB
- audio - Audio files, max 100MB  
- images - Image files, max 20MB
```

**File Size Limits:**
```typescript
export const MEDIA_FILE_LIMITS = {
  document: 10 * 1024 * 1024,      // 10MB
  image: 20 * 1024 * 1024,         // 20MB
  audio: 100 * 1024 * 1024,        // 100MB
  video: 500 * 1024 * 1024 * 1024, // 500MB
}
```

### **3. Processing Services**

#### **A. Video/Audio Transcription Service**

```typescript
// src/lib/openai/transcription.ts

import OpenAI from 'openai'
import { createReadStream } from 'fs'

interface TranscriptionOptions {
  language?: string
  prompt?: string
  temperature?: number
}

export async function transcribeAudio(
  audioFilePath: string,
  options: TranscriptionOptions = {}
): Promise<{ text: string; error?: string }> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(audioFilePath),
      model: 'whisper-1',
      language: options.language,
      prompt: options.prompt,
      temperature: options.temperature || 0,
      response_format: 'verbose_json' // Get timestamps
    })
    
    return {
      text: transcription.text
    }
  } catch (error) {
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Transcription failed'
    }
  }
}

// Extract audio from video using ffmpeg
export async function extractAudioFromVideo(
  videoPath: string,
  outputPath: string
): Promise<{ success: boolean; error?: string }> {
  // Use ffmpeg to extract audio track
  // ffmpeg -i video.mp4 -vn -acodec libmp3lame audio.mp3
}
```

**Pricing:**
- Whisper API: **$0.006 / minute** of audio
- Example: 10 min video = $0.06

#### **B. Image Analysis Service**

```typescript
// src/lib/openai/vision.ts

import OpenAI from 'openai'

export async function analyzeImage(
  imageUrl: string,
  prompt?: string
): Promise<{ description: string; ocr?: string; error?: string }> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    // GPT-4 Vision for general description
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || 'Describe this image in detail, including any text you can see.'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1000
    })
    
    const description = visionResponse.choices[0]?.message?.content || ''
    
    return {
      description,
      ocr: extractTextFromDescription(description)
    }
  } catch (error) {
    return {
      description: '',
      error: error instanceof Error ? error.message : 'Vision API failed'
    }
  }
}
```

**Pricing:**
- GPT-4 Vision: **$0.01 / image** (1024x1024)
- Example: 10 images = $0.10

#### **C. Background Job Queue**

```typescript
// src/lib/workers/media-processor.ts

interface MediaJob {
  id: string
  documentId: string
  mediaType: 'video' | 'audio' | 'image'
  filePath: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
}

export async function processMediaJob(job: MediaJob) {
  try {
    // Update status to processing
    await updateJobStatus(job.id, 'processing')
    
    let extractedText: string
    
    switch (job.mediaType) {
      case 'video':
        // 1. Extract audio from video
        const audioPath = await extractAudioFromVideo(job.filePath)
        // 2. Transcribe audio
        const { text } = await transcribeAudio(audioPath)
        extractedText = text
        break
        
      case 'audio':
        // Direct transcription
        const { text } = await transcribeAudio(job.filePath)
        extractedText = text
        break
        
      case 'image':
        // Vision API + OCR
        const imageUrl = await getPublicUrl(job.filePath)
        const { description, ocr } = await analyzeImage(imageUrl)
        extractedText = `${description}\n\nExtracted Text: ${ocr}`
        break
    }
    
    // 3. Chunking
    const chunks = await chunkText(extractedText)
    
    // 4. Generate embeddings
    const embeddings = await generateBatchEmbeddings(chunks)
    
    // 5. Save to database
    await saveChunksWithEmbeddings(job.documentId, chunks, embeddings)
    
    // 6. Update status
    await updateJobStatus(job.id, 'completed')
    
  } catch (error) {
    await updateJobStatus(job.id, 'failed', error.message)
  }
}
```

### **4. API Endpoints**

```typescript
// src/app/api/media/upload/route.ts

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const mediaType = detectMediaType(file.type)
  
  // 1. Upload to appropriate bucket
  const { path } = await uploadToMediaBucket(file, mediaType)
  
  // 2. Create document record
  const document = await createMediaDocument({
    media_type: mediaType,
    storage_path: path,
    transcription_status: 'pending'
  })
  
  // 3. Queue processing job
  await queueMediaProcessing(document.id, mediaType, path)
  
  return NextResponse.json({
    success: true,
    documentId: document.id,
    status: 'processing'
  })
}

// src/app/api/media/status/[id]/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const status = await getProcessingStatus(params.id)
  
  return NextResponse.json({
    status: status.transcription_status,
    progress: status.progress_percent,
    chunksGenerated: status.chunks_count
  })
}
```

### **5. Frontend Components**

```typescript
// src/components/media/media-uploader.tsx

export function MediaUploader() {
  const acceptedTypes = {
    'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'],
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  }
  
  return (
    <div>
      <Dropzone
        accept={acceptedTypes}
        maxSize={500 * 1024 * 1024} // 500MB
        onDrop={handleMediaUpload}
      >
        <MediaPreview file={file} />
        <ProcessingStatus status={processingStatus} />
      </Dropzone>
    </div>
  )
}

// src/components/media/processing-status.tsx

export function ProcessingStatus({ documentId }) {
  const { status, progress } = useProcessingStatus(documentId)
  
  return (
    <div>
      {status === 'processing' && (
        <ProgressBar value={progress} />
      )}
      {status === 'completed' && (
        <Badge>Ready for RAG</Badge>
      )}
    </div>
  )
}
```

---

## 💰 Cost Analysis

### **Processing Costs per Media Type**

| Media Type | Size | OpenAI Cost | Notes |
|------------|------|-------------|-------|
| **Video** (10 min) | 50MB | ~$0.06 | Whisper transcription |
| **Audio** (10 min) | 5MB | ~$0.06 | Whisper transcription |
| **Image** (1 file) | 2MB | ~$0.01 | GPT-4 Vision |
| **Text Doc** | 1MB | ~$0.001 | Embeddings only |

**Monthly Estimates:**
```
100 videos (10 min each) = $6.00
500 audio files (10 min) = $30.00
1000 images = $10.00
Total: ~$46/month
```

---

## ⚡ Performance Considerations

### **1. Processing Time**

| Operation | Time |
|-----------|------|
| Video upload (100MB) | 30-60s |
| Audio extraction | 5-10s |
| Whisper transcription (10 min) | 15-30s |
| Image upload (5MB) | 3-5s |
| Vision API | 2-5s |
| Chunking + Embeddings | 5-10s |
| **Total Video** | **60-120s** |
| **Total Audio** | **20-45s** |
| **Total Image** | **10-20s** |

### **2. Storage Requirements**

```
Average sizes:
- Video: 100MB per file
- Audio: 10MB per file
- Image: 2MB per file
- Transcripts: 50KB per 10min

100 users, 50 media files each:
= 5000 files
= 100 videos * 100MB = 10GB
= 300 audio * 10MB = 3GB
= 4600 images * 2MB = 9.2GB
= Total: ~22GB storage needed
```

---

## 🚧 Implementation Challenges

### **1. Long Processing Times** ⏱️

**Problem:** Video transcription can take 60-120 seconds

**Solutions:**
- ✅ Background job queue (BullMQ, Inngest)
- ✅ WebSocket progress updates
- ✅ Email notification when complete
- ✅ Allow partial results (process in chunks)

### **2. Large File Uploads** 📦

**Problem:** 500MB files slow on slow connections

**Solutions:**
- ✅ Resumable uploads (TUS protocol)
- ✅ Chunked multipart uploads
- ✅ Client-side compression
- ✅ CDN for faster upload

### **3. Storage Costs** 💰

**Problem:** Media files are expensive to store

**Solutions:**
- ✅ Delete original after transcription (keep only text)
- ✅ Compress videos before storage
- ✅ Use S3 Glacier for archival
- ✅ Set retention policies

### **4. Error Handling** ⚠️

**Problem:** Transcription can fail for various reasons

**Solutions:**
- ✅ Retry logic (3 attempts)
- ✅ Fallback to simpler models
- ✅ Manual review queue
- ✅ Clear error messages to user

---

## 📋 Implementation Roadmap

### **Phase 1: Foundation** (2-3 weeks)
- [ ] Extend database schema
- [ ] Create separate storage buckets
- [ ] Implement job queue system
- [ ] Add progress tracking

### **Phase 2: Audio/Video** (3-4 weeks)
- [ ] Integrate Whisper API
- [ ] Implement audio extraction (ffmpeg)
- [ ] Build transcription service
- [ ] Create upload UI for media
- [ ] Add processing status dashboard

### **Phase 3: Images** (2 weeks)
- [ ] Integrate GPT-4 Vision
- [ ] Implement OCR extraction
- [ ] Build image analysis UI
- [ ] Add thumbnail generation

### **Phase 4: Testing & Optimization** (2 weeks)
- [ ] Load testing with large files
- [ ] Cost optimization
- [ ] Error handling refinement
- [ ] User experience polish

**Total Estimated Time: 9-11 weeks**

---

## 🎯 Recommended Approach

### **Start Small:**

1. **Phase 1: Audio Only** 🎵
   - Simplest to implement
   - Whisper API is reliable
   - Lower storage costs
   - Immediate value for users

2. **Phase 2: Images** 🖼️
   - Quick processing
   - Low storage needs
   - GPT-4V is excellent

3. **Phase 3: Video** 🎥
   - Most complex
   - Requires ffmpeg
   - Largest files
   - But highest user demand

---

## 🔐 Security Considerations

1. **Content Validation**
   - Scan for malicious files
   - Validate mime types
   - Check for inappropriate content

2. **Access Control**
   - RLS policies for media files
   - Signed URLs with expiration
   - User quota enforcement

3. **Privacy**
   - Optional: Don't send to OpenAI
   - Local transcription (Whisper.cpp)
   - End-to-end encryption

---

## ✅ Conclusion

### **Is it Feasible?**
**YES! ✅** The architecture is solid and OpenAI provides all necessary APIs.

### **Complexity Level:**
**Medium-High** 🟡🟠
- Requires background job queue
- Need video processing (ffmpeg)
- Longer processing times
- Higher costs
- More error cases

### **Recommended Next Step:**
Start with **Audio-only** implementation to:
- Validate the architecture
- Test OpenAI Whisper API
- Build job queue system
- Get user feedback
- Then expand to video and images

### **Estimated Costs:**
- Development: 9-11 weeks
- OpenAI API: $0.01-0.10 per file
- Storage: $0.02/GB/month
- Infrastructure: Background workers needed

---

## 📚 Technologies Required

**New Dependencies:**
```json
{
  "dependencies": {
    "@ffmpeg/ffmpeg": "^0.12.7",      // Video processing
    "fluent-ffmpeg": "^2.1.2",        // ffmpeg wrapper
    "bullmq": "^4.15.0",              // Job queue
    "ioredis": "^5.3.2",              // Redis client
    "sharp": "^0.33.1"                // Image processing
  }
}
```

**Infrastructure:**
- Redis (for job queue)
- More Supabase storage
- Potentially separate worker instances

---

*Analysis completed: November 5, 2025*
*Estimated effort: 9-11 weeks for full implementation*
*Recommended: Start with Audio-only (3-4 weeks)*


