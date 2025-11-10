# Video Transcription Setup

## Overview

The application supports video transcription by extracting audio from video files before sending them to OpenAI's Whisper API. This allows processing videos larger than Whisper's 25MB direct limit.

## Architecture

```
Video File (up to 500MB)
    ↓
Extract Audio (FFmpeg)
    ↓
Audio File (MP3, 128kbps)
    ↓
Whisper API (<25MB)
    ↓
Transcription Text
    ↓
RAG (Chunking + Embeddings)
```

## Requirements

### FFmpeg Installation

FFmpeg must be installed on the server where the application runs.

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Linux (CentOS/RHEL)
```bash
sudo yum install ffmpeg
```

#### Docker
Add to your Dockerfile:
```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

#### Vercel/Serverless
For Vercel deployment, you need to use a custom FFmpeg layer:

1. Add `@ffmpeg-installer/ffmpeg` package:
```bash
pnpm add @ffmpeg-installer/ffmpeg
```

2. Update `fluent-ffmpeg` configuration to use the portable version.

Or alternatively, use `@ffmpeg/ffmpeg` (WASM version, slower but works everywhere).

### Verify Installation

Run the verification script:
```bash
node scripts/verify-ffmpeg.js
```

Or check manually:
```bash
ffmpeg -version
```

## Implementation Details

### Audio Extraction

- **Format**: MP3
- **Bitrate**: 128 kbps
- **Sample Rate**: 44.1 kHz
- **Codec**: libmp3lame

### File Size Limits

| Type | Upload Limit | Processing Limit | Notes |
|------|--------------|------------------|-------|
| Video Upload | 50MB (Free)<br>500MB (Pro/Enterprise) | N/A | Supabase bucket limit |
| Extracted Audio | N/A | 25MB | Whisper API limit |
| Audio Compression | ~10:1 ratio | Depends on video length | 48MB video → ~5MB audio |

### Typical Compression Ratios

- **48MB video** → **~5MB audio** (MP3 128kbps)
- **100MB video** → **~10MB audio** (MP3 128kbps)
- **500MB video** → **~50MB audio** (may exceed Whisper limit)

For very long videos (>2 hours), the extracted audio might still exceed 25MB. In this case:
1. Use lower bitrate (96kbps or 64kbps)
2. Split video into smaller chunks
3. Process only segments of interest

## Error Handling

### "FFmpeg not found"
```
Error: FFmpeg not available
```
**Solution**: Install FFmpeg on the server (see Requirements above)

### "Extracted audio exceeds Whisper limit"
```
Error: Extracted audio (28 MB) exceeds Whisper API limit (25 MB)
```
**Solution**: 
- Use a shorter video
- Compress video before upload
- Lower audio extraction bitrate

### "Audio extraction failed"
```
Error: Failed to extract audio from video
```
**Possible Causes**:
- Corrupted video file
- Unsupported video format
- FFmpeg not properly installed
- Insufficient disk space for temp files

**Solution**: Check FFmpeg installation and video file integrity

## API Routes

### Upload Video
```http
POST /api/multimedia/upload
Content-Type: multipart/form-data

file: <video file>
mediaType: "video"
```

### Process Video (Worker)
```http
POST /api/multimedia/worker
```

The worker automatically:
1. Downloads video from Supabase storage
2. Extracts audio using FFmpeg
3. Transcribes audio using Whisper
4. Chunks and embeds transcription
5. Makes content searchable for AI tutors

## Testing

### 1. Verify FFmpeg
```bash
node scripts/verify-ffmpeg.js
```

### 2. Upload Test Video
Upload a small video (<20MB) through the UI:
- Navigate to `/en/multimedia`
- Go to "Video" tab
- Upload a test video
- Wait for processing (~1-2 minutes)

### 3. Check Transcription
```sql
SELECT
  id,
  title,
  transcription_status,
  transcription_cost,
  LENGTH(transcription_text) as text_length
FROM documents
WHERE media_type = 'video'
ORDER BY created_at DESC
LIMIT 5;
```

### 4. Test AI Tutor
- Create or use existing tutor
- Associate video with tutor
- Ask question about video content
- Tutor should respond using transcription

## Performance Considerations

### Processing Time

| Video Size | Audio Extraction | Whisper Transcription | Total |
|-----------|------------------|----------------------|-------|
| 10MB (5 min) | ~5-10 seconds | ~20-30 seconds | ~30-40 sec |
| 50MB (25 min) | ~20-30 seconds | ~60-90 seconds | ~90-120 sec |
| 100MB (50 min) | ~40-60 seconds | ~120-180 seconds | ~3-4 min |

### Resource Usage

- **CPU**: High during audio extraction (FFmpeg)
- **Memory**: ~2x video size during processing
- **Disk**: Temporary files (~1x video + audio size)
- **Network**: Upload to OpenAI (~audio size)

### Optimization Tips

1. **Queue Processing**: Use background worker (current implementation)
2. **Async Processing**: Don't block main thread
3. **Cleanup**: Remove temp files after processing
4. **Caching**: Don't re-process if already transcribed
5. **Error Recovery**: Retry failed jobs with exponential backoff

## Deployment

### Local Development
FFmpeg should be installed locally (see Requirements).

### Production (VPS/VM)
Install FFmpeg in your deployment script:
```bash
apt-get update && apt-get install -y ffmpeg
```

### Vercel/Serverless
Use `@ffmpeg-installer/ffmpeg` or `@ffmpeg/ffmpeg` (WASM).

See: https://github.com/ffmpegwasm/ffmpeg.wasm

### Docker
```dockerfile
FROM node:20-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Rest of Dockerfile...
```

## Troubleshooting

### Check FFmpeg Path
```bash
which ffmpeg
# Expected: /usr/bin/ffmpeg or /opt/homebrew/bin/ffmpeg
```

### Check FFmpeg Version
```bash
ffmpeg -version
# Expected: ffmpeg version 4.x or higher
```

### Check Codecs
```bash
ffmpeg -codecs | grep mp3
# Expected: libmp3lame encoder available
```

### Test Audio Extraction Manually
```bash
ffmpeg -i test-video.mp4 -vn -acodec libmp3lame -b:a 128k output.mp3
```

## Future Enhancements

- [ ] Support for video chunking (long videos >2 hours)
- [ ] Multiple quality levels for audio extraction
- [ ] GPU acceleration for faster processing
- [ ] Real-time transcription streaming
- [ ] Speaker diarization (who said what)
- [ ] Timestamp-based video navigation
- [ ] Video subtitle generation (.srt/.vtt)

## References

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [fluent-ffmpeg npm](https://www.npmjs.com/package/fluent-ffmpeg)
- [Video File Size Limits](./IMAGE_FILES_SUPPORT.md)

