#!/bin/bash
#
# Setup git hooks for the project
#

echo "🔧 Setting up git hooks..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

echo "✅ Git hooks installed successfully!"
echo ""
echo "The pre-commit hook will now:"
echo "- Prevent committing .env.local and other sensitive files"
echo "- Warn about potential API keys in staged changes"
echo "- Help maintain security best practices"
echo ""
echo "To bypass the hook in emergencies (not recommended):"
echo "git commit --no-verify"
