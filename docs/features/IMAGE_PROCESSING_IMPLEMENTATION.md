# 🖼️ Image Processing Implementation

## Overview

Image processing is now fully implemented! When you upload an image, it goes through an automated pipeline that:

1. **Analyzes** the image using GPT-4 Vision API
2. **Extracts** meaningful content and text
3. **Chunks** the analysis text
4. **Generates** embeddings for semantic search
5. **Stores** everything in the database for querying by AI tutors

## 🔄 Processing Flow

```
Upload Image
    ↓
Queue Processing Job
    ↓
GPT-4 Vision Analysis
    ↓
Extract Content + Text
    ↓
Chunk Text
    ↓
Generate Embeddings
    ↓
Save to Database
    ↓
Ready for AI Tutor Queries
```

## 🛠️ Implementation Details

### 1. Vision API (`src/lib/openai/vision.ts`)

New file that provides three main functions:

#### `analyzeImage(imageUrl, options)`
Performs comprehensive image analysis:
- Describes main content
- Transcribes any visible text (OCR)
- Identifies relevant elements
- Provides context and meaning

**Options:**
- `detail`: `'low'` | `'high'` | `'auto'` (default: `'high'`)
- `maxTokens`: Max response length (default: `1000`)
- `language`: `'en'` | `'it'` (default: `'en'`)

#### `analyzeImageFromStorage(supabase, bucket, path, options)`
Same as above but works directly with Supabase Storage files.

#### `extractTextFromImage(imageUrl, language)`
Focused text extraction (OCR-like) for images that contain primarily text.

### 2. Worker Update (`src/app/api/multimedia/worker/route.ts`)

Added `case "image"` that:
1. Gets signed URL from Supabase Storage
2. Calls GPT-4 Vision API
3. Stores analysis result
4. Creates chunks and embeddings
5. Makes content searchable

### 3. Processing Pipeline

The same pipeline used for audio also works for images:

```typescript
Image Upload
  → Queue Job (status: 'queued')
  → Worker Process:
      1. Vision Analysis (25% complete)
      2. Text Chunking (50% complete)
      3. Generate Embeddings (75% complete)
      4. Save Chunks (90% complete)
      5. Mark Complete (100%)
  → Image Ready for Queries
```

## 💰 Cost Estimation

### GPT-4 Vision API Pricing

**Input Tokens**: $0.01 per 1K tokens
**Output Tokens**: $0.03 per 1K tokens

**Image Tokens** (varies by detail level):
- `low`: 85 tokens
- `high`: 170 tokens per 512x512 tile

**Typical Cost per Image**:
- Simple image (low detail): ~$0.005 - $0.01
- Complex image (high detail): ~$0.02 - $0.05
- Text extraction: ~$0.01 - $0.03

**Example**: A high-detail image analysis with 1500 token response:
- Input: ~500 tokens = $0.005
- Output: ~800 tokens = $0.024
- **Total**: ~$0.029 per image

## 🧪 Testing

### Test Upload

1. Upload an image via the UI (`Multimedia → Images`)
2. The worker will automatically process it
3. Check processing status:

```bash
curl http://localhost:3000/api/multimedia/worker
```

Response:
```json
{
  "status": "online",
  "queue": {
    "queued": 0,
    "processing": 0,
    "total": 0
  }
}
```

### Manual Trigger Processing

```bash
curl -X POST http://localhost:3000/api/multimedia/worker
```

### Check Processing Results

In Supabase SQL Editor:

```sql
-- Check image document status
SELECT 
  id,
  title,
  media_type,
  transcription_status,
  LENGTH(transcription_text) as analysis_length,
  transcription_cost,
  status,
  created_at
FROM documents
WHERE media_type = 'image'
ORDER BY created_at DESC
LIMIT 5;

-- Check processing queue
SELECT 
  id,
  document_id,
  media_type,
  status,
  progress_percent,
  chunks_created,
  embeddings_generated,
  processing_cost,
  created_at
FROM media_processing_queue
WHERE media_type = 'image'
ORDER BY created_at DESC
LIMIT 5;

-- View image analysis
SELECT 
  id,
  title,
  transcription_text as vision_analysis
FROM documents
WHERE media_type = 'image'
  AND transcription_status = 'completed'
ORDER BY created_at DESC
LIMIT 1;
```

## 📊 What GPT-4 Vision Extracts

### For Photos/Images
- Subject matter and composition
- Objects, people, scenes
- Colors, style, mood
- Any visible text or signs
- Context and setting

### For Screenshots/Documents
- All visible text (transcribed)
- UI elements and layout
- Data in tables/charts
- Document structure
- Key information

### For Diagrams/Charts
- Type of visualization
- Data points and values
- Labels and legends
- Relationships shown
- Insights and patterns

## 🎯 Use Cases

### 1. **Educational Content**
Upload diagrams, infographics, or presentation slides. AI tutors can explain the concepts shown in the images.

### 2. **Document Scanning**
Upload photos of documents or handwritten notes. The AI can extract and search the text content.

### 3. **Technical Documentation**
Upload architecture diagrams, flowcharts, or code screenshots. AI tutors can reference and explain them.

### 4. **Visual Data**
Upload charts, graphs, or data visualizations. AI can interpret and discuss the insights.

## ⚙️ Configuration

### Environment Variables Required

```env
OPENAI_API_KEY=sk-...  # Required for Vision API
```

### Adjust Analysis Detail

In `worker/route.ts`, you can modify:

```typescript
const visionResult = await analyzeImageFromStorage(
  supabase,
  "images",
  storage_path,
  {
    detail: "high",      // Change to "low" for faster/cheaper
    maxTokens: 1500,     // Adjust based on expected complexity
    language: "en",      // "it" for Italian analysis
  }
);
```

### Cron Job (Vercel)

To process images automatically, the worker is triggered after upload. For batch processing:

**`vercel-cron.json`:**
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

This runs every 5 minutes to process any queued images.

## 🐛 Troubleshooting

### Issue: "Image processing not yet implemented"

**Solution**: Make sure you've updated the `worker/route.ts` file with the image processing case.

### Issue: "Failed to get signed URL for image"

**Solution**: 
1. Check bucket name is correct (`images`)
2. Verify storage path format: `{user_id}/{filename}`
3. Check RLS policies allow worker access

### Issue: "Vision API error"

**Solution**:
1. Verify `OPENAI_API_KEY` is set
2. Check OpenAI account has GPT-4 Vision access
3. Verify image URL is accessible
4. Check image format is supported (JPG, PNG, GIF, WebP)

### Issue: No chunks created

**Solution**: Image analysis might have returned empty text. Check:
```sql
SELECT transcription_text FROM documents WHERE id = 'your-document-id';
```

## 📈 Monitoring

### Track Processing Costs

```sql
-- Total processing cost by media type
SELECT 
  media_type,
  COUNT(*) as files_processed,
  SUM(processing_cost) as total_cost,
  AVG(processing_cost) as avg_cost_per_file
FROM media_processing_queue
WHERE status = 'completed'
GROUP BY media_type
ORDER BY total_cost DESC;

-- Recent image processing costs
SELECT 
  d.title,
  mpq.processing_cost,
  mpq.chunks_created,
  mpq.embeddings_generated,
  mpq.created_at
FROM media_processing_queue mpq
JOIN documents d ON d.id = mpq.document_id
WHERE mpq.media_type = 'image'
  AND mpq.status = 'completed'
ORDER BY mpq.created_at DESC
LIMIT 10;
```

## 🚀 Next Steps

### Potential Enhancements

1. **Multi-language Support**: Auto-detect image language
2. **Batch Processing**: Process multiple images in parallel
3. **Custom Prompts**: Let users specify what to extract
4. **Image Preprocessing**: Optimize images before Vision API call
5. **Caching**: Cache analysis results for identical images
6. **Quality Metrics**: Track Vision API accuracy

### Advanced Features

1. **Image Similarity**: Find similar images using embeddings
2. **Visual Q&A**: Answer questions directly about images
3. **Image Comparison**: Compare multiple images
4. **Object Detection**: Identify specific objects in images

## ✅ Verification

After implementing, verify with:

```bash
# 1. Upload test image
# 2. Check queue
curl http://localhost:3000/api/multimedia/worker

# 3. Trigger processing
curl -X POST http://localhost:3000/api/multimedia/worker

# 4. Check results
# Run SQL queries above to verify chunks and embeddings
```

---

**Implementation Status**: ✅ **COMPLETE**

Image processing is now fully functional and ready for production use!

