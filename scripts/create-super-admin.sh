#!/bin/bash

###############################################################################
# Create Super Admin Script
# 
# This script creates the super admin account by calling the bootstrap API.
# Make sure you have set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local first!
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "🔐 Super Admin Bootstrap Script"
echo "================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Development server is not running!${NC}"
    echo -e "${YELLOW}   Please start it with: npm run dev${NC}"
    exit 1
fi

# Check current status
echo "📊 Checking current super admin status..."
STATUS=$(curl -s http://localhost:3000/api/admin/bootstrap)
echo "$STATUS" | jq . 2>/dev/null || echo "$STATUS"
echo ""

# Ask for confirmation
read -p "Do you want to create/verify super admin? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 0
fi

# Create super admin
echo ""
echo "🚀 Creating super admin..."
RESULT=$(curl -s -X POST http://localhost:3000/api/admin/bootstrap)

# Check if successful
if echo "$RESULT" | jq -e '.success == true' > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Success!${NC}"
    echo ""
    echo "$RESULT" | jq .
    echo ""
    echo -e "${GREEN}Super admin is ready to use!${NC}"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Go to: http://localhost:3000/auth/sign-in"
    echo "   2. Login with your ADMIN_EMAIL and ADMIN_PASSWORD"
    echo "   3. Access: http://localhost:3000/admin/users"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Error creating super admin${NC}"
    echo ""
    echo "$RESULT" | jq . 2>/dev/null || echo "$RESULT"
    echo ""
    echo "Troubleshooting:"
    echo "   - Check that ADMIN_EMAIL and ADMIN_PASSWORD are set in .env.local"
    echo "   - Check the console logs of the dev server"
    echo "   - Make sure Supabase is properly configured"
    exit 1
fi

