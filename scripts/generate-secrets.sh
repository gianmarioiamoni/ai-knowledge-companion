#!/bin/bash
#
# Generate secrets for Vercel deployment
#
# Usage: ./scripts/generate-secrets.sh
#

set -e

echo "🔐 Generating secrets for AI Knowledge Companion deployment..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate NEXTAUTH_SECRET
echo "📝 NEXTAUTH_SECRET (for NextAuth.js authentication):"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "$NEXTAUTH_SECRET"
echo ""

# Generate BOOTSTRAP_SECRET
echo "📝 BOOTSTRAP_SECRET (for super admin bootstrap):"
BOOTSTRAP_SECRET=$(openssl rand -base64 32)
echo "$BOOTSTRAP_SECRET"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Secrets generated successfully!"
echo ""
echo "💾 SAVE THESE VALUES! You'll need them for:"
echo "   1. Vercel Environment Variables setup"
echo "   2. Super admin bootstrap API call"
echo ""
echo "📋 Next steps:"
echo "   1. Copy these secrets to a secure location"
echo "   2. Add them to Vercel Environment Variables"
echo "   3. Follow the deployment guide: docs/setup/VERCEL_DEPLOY_GUIDE.md"
echo ""

