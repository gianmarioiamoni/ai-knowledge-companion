#!/bin/bash

echo "🔍 Checking Structured Data on production..."
echo ""

# Fetch page HTML
HTML=$(curl -s https://aiknowledgecompanion.com/en)

# Count JSON-LD scripts
COUNT=$(echo "$HTML" | grep -c 'type="application/ld+json"')

echo "📊 Trovati $COUNT structured data scripts"
echo ""

if [ $COUNT -eq 0 ]; then
  echo "❌ PROBLEMA: Nessun structured data trovato!"
  echo ""
  echo "Possibili cause:"
  echo "  1. Il componente StructuredDataWrapper non renderizza SSR"
  echo "  2. Il page.tsx non include il wrapper"
  echo "  3. Build error durante il deploy"
  exit 1
fi

# Extract and pretty print each JSON-LD
echo "📝 Structured Data trovati:"
echo ""

# Use a simpler approach - just check if they exist
echo "$HTML" | grep -A 1 'type="application/ld+json"' | head -20

echo ""
echo "✅ Structured Data presente!"
echo ""
echo "🔗 Verifica online con:"
echo "   https://search.google.com/test/rich-results?url=https://aiknowledgecompanion.com/en"

