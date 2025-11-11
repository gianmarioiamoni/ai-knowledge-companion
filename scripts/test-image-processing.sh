#!/bin/bash

# Test Image Processing Script
# Run this after uploading an image to test the processing pipeline

echo "🧪 Testing Image Processing Pipeline"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Worker Status
echo "1️⃣  Checking worker status..."
WORKER_STATUS=$(curl -s http://localhost:3000/api/multimedia/worker)
echo "$WORKER_STATUS" | jq '.'

# Extract queue counts
QUEUED=$(echo "$WORKER_STATUS" | jq -r '.queue.queued // 0')
PROCESSING=$(echo "$WORKER_STATUS" | jq -r '.queue.processing // 0')

echo ""
if [ "$QUEUED" -gt 0 ]; then
    echo -e "${YELLOW}⏳ $QUEUED job(s) queued${NC}"
elif [ "$PROCESSING" -gt 0 ]; then
    echo -e "${YELLOW}⚙️  $PROCESSING job(s) processing${NC}"
else
    echo -e "${GREEN}✅ No jobs in queue${NC}"
fi

echo ""
echo "===================================="
echo ""

# 2. Trigger Processing if there are queued jobs
if [ "$QUEUED" -gt 0 ]; then
    echo "2️⃣  Triggering worker to process queued jobs..."
    PROCESS_RESULT=$(curl -s -X POST http://localhost:3000/api/multimedia/worker)
    echo "$PROCESS_RESULT" | jq '.'
    
    SUCCESS=$(echo "$PROCESS_RESULT" | jq -r '.success // false')
    
    echo ""
    if [ "$SUCCESS" = "true" ]; then
        echo -e "${GREEN}✅ Processing completed successfully!${NC}"
        
        # Extract results
        CHUNKS=$(echo "$PROCESS_RESULT" | jq -r '.chunks // 0')
        EMBEDDINGS=$(echo "$PROCESS_RESULT" | jq -r '.embeddings // 0')
        COST=$(echo "$PROCESS_RESULT" | jq -r '.cost // 0')
        
        echo ""
        echo "📊 Results:"
        echo "   • Chunks created: $CHUNKS"
        echo "   • Embeddings generated: $EMBEDDINGS"
        echo "   • Processing cost: \$$COST"
    else
        ERROR=$(echo "$PROCESS_RESULT" | jq -r '.error // "Unknown error"')
        echo -e "${RED}❌ Processing failed: $ERROR${NC}"
    fi
else
    echo "2️⃣  No jobs to process"
fi

echo ""
echo "===================================="
echo ""

# 3. Instructions for database verification
echo "3️⃣  Verify in database:"
echo ""
echo "Run this query in Supabase SQL Editor:"
echo ""
echo -e "${YELLOW}-- Check last processed image"
echo "SELECT "
echo "  title,"
echo "  transcription_status,"
echo "  LEFT(transcription_text, 100) as analysis_preview,"
echo "  transcription_cost,"
echo "  status,"
echo "  created_at"
echo "FROM documents"
echo "WHERE media_type = 'image'"
echo "ORDER BY created_at DESC"
echo -e "LIMIT 1;${NC}"
echo ""
echo "===================================="
echo ""

# 4. Instructions for testing with AI tutor
echo "4️⃣  Test with AI Tutor:"
echo ""
echo "1. Go to your AI Tutor in the app"
echo "2. Associate the uploaded image with the tutor"
echo "3. Ask questions about the image content"
echo "4. The tutor should be able to answer based on the Vision API analysis!"
echo ""
echo "===================================="
echo ""
echo "✅ Test script complete!"

