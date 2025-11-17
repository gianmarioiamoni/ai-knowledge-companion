#!/bin/bash

# Test script for Cost Tracking implementation
# Usage: ./scripts/test-cost-tracking.sh

echo "🧪 Testing Cost Tracking Implementation"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq is not installed. Install it for better output: brew install jq${NC}"
    JQ_AVAILABLE=false
else
    JQ_AVAILABLE=true
fi

echo "📋 Step 1: Check environment variables"
echo "--------------------------------------"
if grep -q "OPENAI_API_KEY" .env.local; then
    echo -e "${GREEN}✅ OPENAI_API_KEY found${NC}"
else
    echo -e "${RED}❌ OPENAI_API_KEY not found in .env.local${NC}"
    echo "   Add: OPENAI_API_KEY=sk-..."
    exit 1
fi

if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo -e "${GREEN}✅ SUPABASE_URL found${NC}"
else
    echo -e "${RED}❌ SUPABASE_URL not found${NC}"
    exit 1
fi
echo ""

echo "📋 Step 2: Check if server is running"
echo "--------------------------------------"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Server is not running${NC}"
    echo "   Start it with: npm run dev"
    exit 1
fi
echo ""

echo "📋 Step 3: Check worker status"
echo "--------------------------------------"
WORKER_STATUS=$(curl -s http://localhost:3000/api/multimedia/worker)

if [ "$JQ_AVAILABLE" = true ]; then
    echo "$WORKER_STATUS" | jq '.'
else
    echo "$WORKER_STATUS"
fi
echo ""

echo "📋 Step 4: Instructions for manual test"
echo "--------------------------------------"
echo -e "${YELLOW}Manual test steps:${NC}"
echo ""
echo "1. Go to: http://localhost:3000/en/multimedia"
echo "2. Login with your account"
echo "3. Upload a test audio file (30 seconds max)"
echo "4. Watch the terminal for processing logs"
echo ""
echo -e "${YELLOW}Expected logs:${NC}"
echo "  ✅ Generated X embeddings, Y tokens, cost: \$Z"
echo "  📊 Usage logged. Quota: X/Y"
echo ""
echo -e "${YELLOW}5. Verify in Supabase:${NC}"
echo ""
echo "Query 1 - Check billing_tracking:"
echo "------------------------------------"
echo "SELECT created_at, action, tokens_used, cost_estimate, metadata"
echo "FROM billing_tracking"
echo "WHERE action = 'embedding'"
echo "ORDER BY created_at DESC"
echo "LIMIT 5;"
echo ""
echo "Query 2 - Check user quota:"
echo "------------------------------------"
echo "SELECT current_tokens, current_cost, max_tokens_per_month"
echo "FROM user_quotas"
echo "WHERE user_id = auth.uid();"
echo ""
echo "Query 3 - Check processing cost:"
echo "------------------------------------"
echo "SELECT status, processing_cost, chunks_created, embeddings_generated"
echo "FROM media_processing_queue"
echo "ORDER BY created_at DESC"
echo "LIMIT 5;"
echo ""

echo -e "${GREEN}📊 Test setup complete!${NC}"
echo ""
echo "To run actual test:"
echo "1. Upload a file via UI"
echo "2. Check logs in terminal"
echo "3. Run SQL queries in Supabase"

