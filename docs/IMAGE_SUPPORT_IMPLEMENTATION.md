# Image Support Implementation Guide

Complete guide for the image file support feature in the AI Knowledge Companion.

## Overview

This feature enables users to upload and manage image files that can be associated with AI tutors. Images are stored in Supabase Storage and can be used to enhance the tutor's knowledge base.

## Architecture

### Database Layer

**Storage Bucket:** `images`
- Public: `false`
- File size limit: `10MB`
- Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`

**Table:** `multimedia_documents`
- Uses existing table with `media_type = 'image'`
- Stores metadata: file_name, file_path, file_size, mime_type, status

**New SQL Functions:**
```sql
get_user_images(p_user_id UUID)
```
- Returns all image files for a specific user
- Ordered by creation date (descending)

### Storage Structure

```
images/
└── {user_id}/
    ├── {uuid}_image1.jpg
    ├── {uuid}_image2.png
    └── {uuid}_image3.webp
```

### API Endpoints

#### Upload Image
```
POST /api/multimedia/upload
Content-Type: multipart/form-data

Body:
{
  file: File
  mediaType: 'image'
}

Response:
{
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  status: 'completed'
}
```

#### Get Images
```
GET /api/multimedia?mediaType=image

Response:
{
  files: MultimediaDocument[]
}
```

#### Get Image Preview
```
GET /api/multimedia/{id}/preview

Response:
Binary image data with appropriate Content-Type header
```

#### Delete Image
```
DELETE /api/multimedia/{id}

Response:
{
  success: true
}
```

#### Associate Image with Tutor
```
POST /api/tutors/{tutorId}/multimedia

Body:
{
  documentIds: string[]  // Array of image IDs
}

Response:
{
  success: true
  count: number
}
```

#### Unlink Image from Tutor
```
DELETE /api/tutors/{tutorId}/multimedia/{documentId}

Response:
{
  success: true
}
```

## Frontend Components

### 1. ImageUploader
**Location:** `src/components/multimedia/ui/image-uploader.tsx`

**Features:**
- Drag-and-drop upload
- Click-to-browse
- Multiple file selection
- Image preview thumbnails
- Progress tracking
- File size validation (max 10MB)
- Format validation (JPG, PNG, GIF, WebP)

**Usage:**
```tsx
<ImageUploader onUploadComplete={() => refetch()} />
```

### 2. ImageFilesSection
**Location:** `src/components/multimedia/sections/image-files-section.tsx`

**Features:**
- Grid display of uploaded images
- Image preview thumbnails
- Status badges (completed, processing, failed)
- View full image in new tab
- Delete images with confirmation
- Responsive grid layout (1-3 columns based on screen size)

### 3. ImageUploadSection
**Location:** `src/components/multimedia/sections/image-upload-section.tsx`

**Features:**
- Combines ImageUploader and ImageFilesSection
- Manages upload-complete refresh
- Orchestrates the upload/display flow

### 4. MultimediaPageClient (Updated)
**Location:** `src/components/multimedia/pages/multimedia-page-client.tsx`

**Features:**
- Tabs for Audio, Video, Images
- Images tab now active (not disabled)
- Renders ImageUploadSection for images tab

### 5. MultimediaPickerDialog (Enhanced)
**Location:** `src/components/multimedia/ui/multimedia-picker-dialog.tsx`

**Features:**
- Shows all multimedia files (audio, images, video)
- Color-coded icons:
  - Blue: Audio files
  - Green: Image files
  - Purple: Video files
- Allows selecting multiple files of any type
- Associates selected files with tutors

### 6. TutorMultimediaSection (Compatible)
**Location:** `src/components/multimedia/sections/tutor-multimedia-section.tsx`

**Features:**
- Lists all multimedia associated with tutor
- Supports images, audio, video
- Shows media-type-specific icons
- Allows unlinking multimedia files

## Custom Hooks

### useImageFiles
**Location:** `src/hooks/use-image-files.ts`

**Features:**
- Fetches user's image files
- Polls for updates every 5 seconds if files are processing
- Auto-retry for stuck files (>5 minutes old)
- Provides delete functionality
- Error handling

**Usage:**
```tsx
const { files, loading, error, refetch, deleteFile, hasProcessingFiles } = useImageFiles()
```

### useTutorMultimedia (Compatible)
**Location:** `src/hooks/use-tutor-multimedia.ts`

**Features:**
- Works with all media types (audio, images, video)
- Fetches multimedia associated with a tutor
- Provides add/remove functionality

## Processing Pipeline

### Current Implementation
Images are **uploaded and marked as completed** immediately. No transcription or OCR is required for basic functionality.

### Future Enhancements (Optional)
The processing metadata structure supports:
```typescript
{
  "ocr_text": "extracted text from image",
  "vision_analysis": "AI-generated description",
  "dimensions": { "width": 1920, "height": 1080 },
  "format": "jpeg",
  "has_transparency": false
}
```

To implement OCR/Vision:
1. Add processing worker logic in `/api/multimedia/worker`
2. Use OpenAI Vision API or OCR service
3. Store results in `processing_metadata` JSON column
4. Update status from `pending` → `processing` → `completed`

## Translations

### English (`messages/en.json`)
```json
{
  "multimedia": {
    "image": {
      "title": "Upload Images",
      "description": "Upload and manage your image files for AI analysis",
      "dragDrop": "Drag and drop images here",
      "or": "or",
      "browse": "Browse Files",
      "dropHere": "Drop images here",
      "supportedFormats": "Supported formats",
      "uploading": "Uploading...",
      "uploadAll": "Upload All",
      "yourImages": "Your Images",
      "noImages": "No images",
      "imagesCount": "images",
      "noImagesYet": "No images uploaded yet",
      "uploadFirst": "Upload your first image to get started",
      "processingNotice": "Some images are being processed...",
      "deleteConfirmTitle": "Delete Image",
      "deleteConfirmDescription": "Are you sure? This cannot be undone."
    }
  }
}
```

### Italian (`messages/it.json`)
```json
{
  "multimedia": {
    "image": {
      "title": "Carica Immagini",
      "description": "Carica e gestisci i tuoi file immagine per l'analisi AI",
      "dragDrop": "Trascina le immagini qui",
      "or": "oppure",
      "browse": "Sfoglia File",
      // ... (complete translations provided)
    }
  }
}
```

## Subscription Limits

Images are tracked separately from audio and documents.

### Plan Limits
- **Trial**: 1 tutor, 3 documents, 0 audio, **0 images**
- **Pro**: 5 tutors, unlimited docs, 50 audio, **100 images**
- **Enterprise**: 20 tutors, unlimited docs, unlimited audio, **unlimited images**

### Enforcement
Limits are checked in `/api/multimedia/upload` via:
```typescript
await enforceUsageLimit(user.id, 'image')
```

If limit exceeded:
```json
{
  "error": "Image upload limit reached for your plan",
  "limit": 100,
  "current": 100,
  "plan": "pro"
}
```

## Setup Instructions

### 1. Database Migration

Run the SQL migration script:
```bash
# In Supabase SQL Editor
sql/31_image_support.sql
```

### 2. Storage Bucket Creation

**Manual Setup (Supabase Dashboard):**
1. Go to **Storage** section
2. Click **Create Bucket**
3. Name: `images`
4. Public: `false`
5. File size limit: `10485760` (10MB)
6. Allowed MIME types:
   ```
   image/jpeg
   image/jpg
   image/png
   image/gif
   image/webp
   ```

**Storage Policies** (auto-created by SQL script):
- `Users can view own images` (SELECT)
- `Users can upload own images` (INSERT)
- `Users can delete own images` (DELETE)

### 3. Frontend Integration

The frontend is already integrated. Just ensure:
- All components are imported correctly
- Translations are loaded
- `/api/multimedia` endpoints are accessible

### 4. Test the Feature

1. **Upload Image:**
   - Go to `/multimedia`
   - Click **Images** tab
   - Drag-drop or select image file
   - Click **Upload All**

2. **View Images:**
   - Images appear in grid below uploader
   - Click **View** to open full size
   - Check status badge (should be "Completed")

3. **Associate with Tutor:**
   - Go to tutor edit page
   - Scroll to **Multimedia** section
   - Click **Add Multimedia**
   - Select images from picker
   - Click **Add (N)**

4. **Delete Image:**
   - Click trash icon on image card
   - Confirm deletion
   - Image removed from storage and database

## Security Considerations

### Row Level Security (RLS)
All image operations are protected by RLS:
- Users can only access their own images
- File paths include user ID: `{user_id}/{filename}`
- Storage policies enforce user ownership

### File Validation
- MIME type checked on upload
- File size limited to 10MB
- Only allowed formats: JPG, PNG, GIF, WebP

### API Protection
- All endpoints require authentication
- User ID verified from session
- Cross-user access prevented

## Performance Optimizations

### Image Preview
- Images served via `/api/multimedia/{id}/preview`
- Appropriate Content-Type headers
- Cache-Control: `public, max-age=31536000`
- Lazy loading in frontend

### Grid Display
- Responsive grid (1-3 columns)
- `aspect-video` maintains consistent sizing
- `object-cover` for proper cropping
- Lazy loading with `loading="lazy"`

### Polling Optimization
- Only poll if `hasProcessingFiles === true`
- Poll every 5 seconds
- Auto-stop when all files complete
- Background worker trigger for stuck files

## Troubleshooting

### Images Not Appearing After Upload
1. Check browser console for errors
2. Verify `/api/multimedia?mediaType=image` returns files
3. Check Supabase Storage bucket for files
4. Verify RLS policies are active

### Upload Fails with 403
1. Check authentication status
2. Verify storage bucket exists
3. Check RLS policies allow INSERT
4. Ensure user_id matches session

### Preview Not Loading
1. Check `/api/multimedia/{id}/preview` endpoint
2. Verify file exists in storage
3. Check Content-Type header
4. Verify user owns the file

### Can't Associate with Tutor
1. Check `/api/tutors/{tutorId}/multimedia` endpoint
2. Verify user owns both tutor and images
3. Check `tutor_multimedia_documents` table
4. Verify image status is "completed"

## Future Enhancements

### Optional: OCR/Vision Processing
Add text extraction and AI analysis:
1. Install Tesseract.js or use OpenAI Vision API
2. Create processing worker for images
3. Extract text and store in `processing_metadata`
4. Use extracted text for RAG context

### Optional: Image Optimization
Add automatic image optimization:
1. Resize large images (max 1920x1080)
2. Convert to WebP for better compression
3. Generate thumbnails for faster loading
4. Store original and optimized versions

### Optional: Advanced Features
- Image tagging/categorization
- Facial recognition (privacy considerations)
- Object detection
- Caption generation

## Files Changed/Created

### Database
- `sql/31_image_support.sql` (NEW)

### API Routes
- `src/app/api/multimedia/[id]/preview/route.ts` (NEW)

### Components
- `src/components/multimedia/ui/image-uploader.tsx` (NEW)
- `src/components/multimedia/sections/image-files-section.tsx` (NEW)
- `src/components/multimedia/sections/image-upload-section.tsx` (NEW)
- `src/components/multimedia/pages/multimedia-page-client.tsx` (UPDATED)
- `src/components/multimedia/ui/multimedia-picker-dialog.tsx` (UPDATED)

### Hooks
- `src/hooks/use-image-files.ts` (NEW)

### Translations
- `messages/en.json` (UPDATED)
- `messages/it.json` (UPDATED)

### Documentation
- `docs/IMAGE_SUPPORT_IMPLEMENTATION.md` (NEW - this file)

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images
- [ ] View image in grid
- [ ] Open full image in new tab
- [ ] Delete image
- [ ] Associate image with tutor
- [ ] Unlink image from tutor
- [ ] Check storage bucket
- [ ] Verify RLS policies
- [ ] Test with different image formats (JPG, PNG, GIF, WebP)
- [ ] Test file size limit (try >10MB)
- [ ] Test invalid format (try .txt)
- [ ] Check translations (English/Italian)
- [ ] Test on mobile/tablet/desktop
- [ ] Verify subscription limits enforcement

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Check Supabase logs
4. Verify SQL migrations ran successfully
5. Contact development team

---

**Implementation Status:** ✅ Complete
**Version:** 1.0
**Last Updated:** 2025-11-10

