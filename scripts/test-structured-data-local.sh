#!/bin/bash

echo "🧪 Testing Structured Data Locally..."
echo ""
echo "⚠️  Assicurati che il dev server sia attivo (npm run dev)"
echo ""

# Wait a moment for user to read
sleep 2

# Fetch page HTML
echo "📥 Fetching http://localhost:3000/en..."
HTML=$(curl -s http://localhost:3000/en)

# Count JSON-LD scripts
COUNT=$(echo "$HTML" | grep -c 'type="application/ld+json"')

echo "📊 Trovati $COUNT structured data scripts"
echo ""

if [ $COUNT -eq 0 ]; then
  echo "❌ PROBLEMA: Nessun structured data trovato!"
  echo ""
  echo "Verifica che:"
  echo "  1. Dev server sia attivo (npm run dev)"
  echo "  2. La pagina si carichi correttamente"
  echo "  3. Il componente StructuredDataWrapper sia importato"
  exit 1
fi

# Extract JSON-LD (first 50 lines for preview)
echo "📝 Preview Structured Data:"
echo ""
echo "$HTML" | grep -A 5 'type="application/ld+json"' | head -30

echo ""
echo "✅ Structured Data presente!"
echo ""
echo "🎯 Prossimi passi:"
echo "   1. Verifica manualmente: Ctrl+U su http://localhost:3000/en"
echo "   2. Cerca: 'application/ld+json'"
echo "   3. Dovresti vedere 3 script JSON-LD"
echo ""
echo "📋 Schema che dovresti vedere:"
echo "   - Organization (AI Knowledge Companion)"
echo "   - WebSite (con SearchAction)"
echo "   - SoftwareApplication (Educational)"

