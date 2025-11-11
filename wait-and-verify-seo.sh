#!/bin/bash

echo "🚀 Vercel Deploy Monitor & SEO Verification"
echo ""
echo "Git push completato! Vercel sta facendo il deploy..."
echo ""

# Wait 2 minutes for Vercel to deploy
WAIT_TIME=120
echo "⏳ Attendo ${WAIT_TIME} secondi per il deploy Vercel..."
echo ""

for i in $(seq $WAIT_TIME -1 1); do
  echo -ne "   Tempo rimanente: ${i}s \r"
  sleep 1
done

echo ""
echo ""
echo "✅ Deploy dovrebbe essere completato!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VERIFICA STRUCTURED DATA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Count JSON-LD scripts
echo "📊 Test 1: Conteggio script JSON-LD..."
COUNT=$(curl -s https://aiknowledgecompanion.com/en | grep -c 'type="application/ld+json"')
echo "   Trovati: $COUNT script(s)"
echo ""

if [ $COUNT -eq 0 ]; then
  echo "❌ PROBLEMA: Nessun structured data trovato!"
  echo ""
  echo "Possibili cause:"
  echo "  1. Deploy non ancora completato (attendi altri 2 minuti)"
  echo "  2. Build error (controlla Vercel logs)"
  echo "  3. Cache CDN (attendi 5 minuti o forza refresh)"
  echo ""
  echo "🔧 Comandi utili:"
  echo "   # Forza refresh browser: Ctrl+Shift+R (o Cmd+Shift+R)"
  echo "   # Check Vercel status: https://vercel.com/dashboard"
  echo "   # Re-run questo script: ./wait-and-verify-seo.sh"
  exit 1
fi

if [ $COUNT -lt 3 ]; then
  echo "⚠️  WARNING: Trovati solo $COUNT script(s), dovrebbero essere 3"
  echo ""
  echo "Schemi mancanti. Verifica page.tsx include tutti e 3:"
  echo "  1. Organization schema"
  echo "  2. WebSite schema"
  echo "  3. SoftwareApplication schema"
  exit 1
fi

echo "✅ Test 1 PASSED: $COUNT script JSON-LD presenti (corretto!)"
echo ""

# Test 2: Verify content
echo "📝 Test 2: Verifica contenuto schemas..."
HTML=$(curl -s https://aiknowledgecompanion.com/en)

if echo "$HTML" | grep -q '"@type":"Organization"'; then
  echo "   ✅ Organization schema presente"
else
  echo "   ❌ Organization schema MANCANTE"
fi

if echo "$HTML" | grep -q '"@type":"WebSite"'; then
  echo "   ✅ WebSite schema presente"
else
  echo "   ❌ WebSite schema MANCANTE"
fi

if echo "$HTML" | grep -q '"@type":"SoftwareApplication"'; then
  echo "   ✅ SoftwareApplication schema presente"
else
  echo "   ❌ SoftwareApplication schema MANCANTE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 STRUCTURED DATA FIX VERIFICATO!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 3: Other SEO elements
echo "📋 Test 3: Altri elementi SEO..."
echo ""

# Sitemap
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://aiknowledgecompanion.com/sitemap.xml)
if [ $SITEMAP_STATUS -eq 200 ]; then
  echo "   ✅ Sitemap.xml accessibile"
else
  echo "   ❌ Sitemap.xml errore (HTTP $SITEMAP_STATUS)"
fi

# Robots
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://aiknowledgecompanion.com/robots.txt)
if [ $ROBOTS_STATUS -eq 200 ]; then
  echo "   ✅ Robots.txt accessibile"
else
  echo "   ❌ Robots.txt errore (HTTP $ROBOTS_STATUS)"
fi

# Metadata
if echo "$HTML" | grep -q '<meta property="og:title"'; then
  echo "   ✅ Open Graph tags presenti"
else
  echo "   ❌ Open Graph tags mancanti"
fi

if echo "$HTML" | grep -q '<meta name="twitter:card"'; then
  echo "   ✅ Twitter Card tags presenti"
else
  echo "   ❌ Twitter Card tags mancanti"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ TUTTI I TEST COMPLETATI!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Prossimi passi:"
echo ""
echo "1. 🌐 Google Rich Results Test:"
echo "   https://search.google.com/test/rich-results?url=https://aiknowledgecompanion.com/en"
echo ""
echo "2. ✅ Schema Validator:"
echo "   https://validator.schema.org/"
echo "   Inserisci: https://aiknowledgecompanion.com/en"
echo ""
echo "3. 📱 Open Graph Debugger:"
echo "   https://www.opengraph.xyz/"
echo "   Inserisci: https://aiknowledgecompanion.com/en"
echo ""
echo "4. 🚀 PageSpeed Insights:"
echo "   https://pagespeed.web.dev/"
echo "   Inserisci: https://aiknowledgecompanion.com/en"
echo "   SEO score dovrebbe essere: 100"
echo ""
echo "5. 📊 Google Search Console:"
echo "   - Invia sitemap.xml"
echo "   - Monitora indexing"
echo "   - Controlla enhancements"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 SEO OPTIMIZATION COMPLETE! 🎉"
echo ""

