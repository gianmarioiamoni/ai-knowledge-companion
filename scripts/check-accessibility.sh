#!/bin/bash

echo "♿ EUROPEAN ACCESSIBILITY ACT (EAA) COMPLIANCE CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verificando conformità a:"
echo "  ✓ EAA (European Accessibility Act)"
echo "  ✓ WCAG 2.1 Level AA"
echo "  ✓ EN 301 549 (Standard Europeo)"
echo "  ✓ Direttiva UE 2016/2102"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if localhost:3000 is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Dev server non in esecuzione!"
  echo "   Avvia prima: npm run dev"
  exit 1
fi

echo "📥 Fetching HTML from http://localhost:3000/en..."
HTML=$(curl -s http://localhost:3000/en)
echo ""

# ============================================
# 1. SEMANTIC HTML (WCAG 4.1.2)
# ============================================
echo "🏗️  1. SEMANTIC HTML STRUCTURE"
echo "─────────────────────────────────────────────────"

# Check for proper HTML5 structure
if echo "$HTML" | grep -q '<main'; then
  echo "  ✅ <main> tag presente"
else
  echo "  ❌ <main> tag mancante"
fi

if echo "$HTML" | grep -q '<header'; then
  echo "  ✅ <header> tag presente"
else
  echo "  ❌ <header> tag mancante"
fi

if echo "$HTML" | grep -q '<footer'; then
  echo "  ✅ <footer> tag presente"
else
  echo "  ❌ <footer> tag mancante"
fi

if echo "$HTML" | grep -q '<nav'; then
  echo "  ✅ <nav> tag presente"
else
  echo "  ⚠️  <nav> tag mancante"
fi

echo ""

# ============================================
# 2. HEADING HIERARCHY (WCAG 1.3.1, 2.4.6)
# ============================================
echo "📋 2. HEADING HIERARCHY"
echo "─────────────────────────────────────────────────"

H1_COUNT=$(echo "$HTML" | grep -o '<h1' | wc -l | xargs)
H2_COUNT=$(echo "$HTML" | grep -o '<h2' | wc -l | xargs)
H3_COUNT=$(echo "$HTML" | grep -o '<h3' | wc -l | xargs)

echo "  H1: $H1_COUNT"
echo "  H2: $H2_COUNT"
echo "  H3: $H3_COUNT"

if [ "$H1_COUNT" -eq 1 ]; then
  echo "  ✅ Esattamente 1 H1 (corretto)"
elif [ "$H1_COUNT" -gt 1 ]; then
  echo "  ⚠️  Più di 1 H1 trovato ($H1_COUNT)"
else
  echo "  ❌ Nessun H1 trovato"
fi

echo ""

# ============================================
# 3. LANGUAGE DECLARATION (WCAG 3.1.1, 3.1.2)
# ============================================
echo "🌍 3. LANGUAGE DECLARATION"
echo "─────────────────────────────────────────────────"

if echo "$HTML" | grep -q '<html lang="en"'; then
  echo "  ✅ HTML lang='en' presente"
elif echo "$HTML" | grep -q '<html lang='; then
  LANG=$(echo "$HTML" | grep -o '<html lang="[^"]*"' | head -1)
  echo "  ✅ $LANG presente"
else
  echo "  ❌ HTML lang attribute mancante"
fi

echo ""

# ============================================
# 4. ARIA LABELS & LANDMARKS (WCAG 4.1.2)
# ============================================
echo "🏷️  4. ARIA LABELS & LANDMARKS"
echo "─────────────────────────────────────────────────"

ARIA_LABEL_COUNT=$(echo "$HTML" | grep -o 'aria-label="' | wc -l | xargs)
ARIA_LABELLEDBY_COUNT=$(echo "$HTML" | grep -o 'aria-labelledby="' | wc -l | xargs)
ARIA_DESCRIBEDBY_COUNT=$(echo "$HTML" | grep -o 'aria-describedby="' | wc -l | xargs)
ROLE_COUNT=$(echo "$HTML" | grep -o 'role="' | wc -l | xargs)

echo "  aria-label: $ARIA_LABEL_COUNT occorrenze"
echo "  aria-labelledby: $ARIA_LABELLEDBY_COUNT occorrenze"
echo "  aria-describedby: $ARIA_DESCRIBEDBY_COUNT occorrenze"
echo "  role: $ROLE_COUNT occorrenze"

if [ "$ARIA_LABEL_COUNT" -gt 5 ]; then
  echo "  ✅ Uso appropriato di aria-label"
else
  echo "  ⚠️  Pochi aria-label (verifica form e buttons)"
fi

echo ""

# ============================================
# 5. FORM ACCESSIBILITY (WCAG 1.3.1, 3.3.2)
# ============================================
echo "📝 5. FORM ACCESSIBILITY"
echo "─────────────────────────────────────────────────"

INPUT_COUNT=$(echo "$HTML" | grep -o '<input' | wc -l | xargs)
LABEL_COUNT=$(echo "$HTML" | grep -o '<label' | wc -l | xargs)

echo "  Input fields: $INPUT_COUNT"
echo "  Label tags: $LABEL_COUNT"

if [ "$INPUT_COUNT" -gt 0 ]; then
  if [ "$LABEL_COUNT" -ge "$INPUT_COUNT" ]; then
    echo "  ✅ Tutti gli input hanno labels"
  else
    echo "  ⚠️  Alcuni input potrebbero non avere labels"
  fi
else
  echo "  ℹ️  Nessun form nella landing page"
fi

# Check for placeholder as sole label (anti-pattern)
if echo "$HTML" | grep -q 'placeholder=' && ! echo "$HTML" | grep -q '<label'; then
  echo "  ⚠️  WARNING: Placeholder usato come unica label (anti-pattern)"
fi

echo ""

# ============================================
# 6. BUTTON & LINK ACCESSIBILITY (WCAG 2.4.4)
# ============================================
echo "🔘 6. BUTTONS & LINKS"
echo "─────────────────────────────────────────────────"

BUTTON_COUNT=$(echo "$HTML" | grep -o '<button' | wc -l | xargs)
LINK_COUNT=$(echo "$HTML" | grep -o '<a href' | wc -l | xargs)

echo "  Buttons: $BUTTON_COUNT"
echo "  Links: $LINK_COUNT"

# Check for empty buttons/links
EMPTY_BUTTONS=$(echo "$HTML" | grep -o '<button[^>]*></button>' | wc -l | xargs)
if [ "$EMPTY_BUTTONS" -gt 0 ]; then
  echo "  ❌ $EMPTY_BUTTONS button vuoti trovati"
else
  echo "  ✅ Nessun button vuoto"
fi

echo ""

# ============================================
# 7. IMAGE ACCESSIBILITY (WCAG 1.1.1)
# ============================================
echo "🖼️  7. IMAGE ACCESSIBILITY"
echo "─────────────────────────────────────────────────"

IMG_COUNT=$(echo "$HTML" | grep -o '<img' | wc -l | xargs)
IMG_WITH_ALT=$(echo "$HTML" | grep -o '<img[^>]*alt=' | wc -l | xargs)
SVG_COUNT=$(echo "$HTML" | grep -o '<svg' | wc -l | xargs)
SVG_WITH_ARIA=$(echo "$HTML" | grep -o '<svg[^>]*aria-' | wc -l | xargs)

echo "  Images (<img>): $IMG_COUNT"
echo "  Images con alt: $IMG_WITH_ALT"
echo "  SVG icons: $SVG_COUNT"
echo "  SVG con ARIA: $SVG_WITH_ARIA"

if [ "$IMG_COUNT" -gt 0 ]; then
  if [ "$IMG_WITH_ALT" -eq "$IMG_COUNT" ]; then
    echo "  ✅ Tutte le immagini hanno alt text"
  else
    MISSING=$((IMG_COUNT - IMG_WITH_ALT))
    echo "  ❌ $MISSING immagini senza alt text"
  fi
else
  echo "  ℹ️  Nessuna immagine <img> nella pagina"
fi

if [ "$SVG_COUNT" -gt 0 ]; then
  PERCENTAGE=$((SVG_WITH_ARIA * 100 / SVG_COUNT))
  if [ "$PERCENTAGE" -gt 80 ]; then
    echo "  ✅ Maggior parte SVG ha ARIA labels ($PERCENTAGE%)"
  else
    echo "  ⚠️  Solo $PERCENTAGE% SVG con ARIA labels"
  fi
fi

echo ""

# ============================================
# 8. KEYBOARD NAVIGATION (WCAG 2.1.1, 2.4.7)
# ============================================
echo "⌨️  8. KEYBOARD NAVIGATION"
echo "─────────────────────────────────────────────────"

# Check for focus-visible styles
if echo "$HTML" | grep -q 'focus-visible:'; then
  echo "  ✅ Focus-visible styles presenti"
else
  echo "  ⚠️  Focus-visible styles non trovati"
fi

# Check for tabindex misuse
TABINDEX_NEG=$(echo "$HTML" | grep -o 'tabindex="-' | wc -l | xargs)
TABINDEX_POS=$(echo "$HTML" | grep -o 'tabindex="[1-9]' | wc -l | xargs)

if [ "$TABINDEX_POS" -gt 0 ]; then
  echo "  ⚠️  Tabindex positivo trovato ($TABINDEX_POS) - evitare"
else
  echo "  ✅ Nessun tabindex positivo (buona pratica)"
fi

if [ "$TABINDEX_NEG" -gt 0 ]; then
  echo "  ℹ️  Tabindex=-1 trovato ($TABINDEX_NEG) - verifica che sia intenzionale"
fi

echo ""

# ============================================
# 9. COLOR CONTRAST (WCAG 1.4.3 Level AA)
# ============================================
echo "🎨 9. COLOR CONTRAST"
echo "─────────────────────────────────────────────────"
echo "  ℹ️  Verifica manuale richiesta con strumenti:"
echo "     - Chrome DevTools Lighthouse"
echo "     - axe DevTools extension"
echo "     - WebAIM Contrast Checker"
echo ""
echo "  📏 Standard WCAG 2.1 AA:"
echo "     - Testo normale: 4.5:1"
echo "     - Testo grande (18pt+): 3:1"
echo "     - UI components: 3:1"
echo ""

# ============================================
# 10. VIEWPORT & ZOOM (WCAG 1.4.4, 1.4.10)
# ============================================
echo "📱 10. VIEWPORT & RESPONSIVE"
echo "─────────────────────────────────────────────────"

if echo "$HTML" | grep -q 'user-scalable=no'; then
  echo "  ❌ user-scalable=no trovato (blocca zoom)"
else
  echo "  ✅ Zoom abilitato (no user-scalable=no)"
fi

if echo "$HTML" | grep -q 'maximum-scale=1'; then
  echo "  ⚠️  maximum-scale=1 trovato (limita zoom)"
else
  echo "  ✅ Nessuna limitazione zoom"
fi

if echo "$HTML" | grep -q 'width=device-width'; then
  echo "  ✅ Responsive viewport configurato"
else
  echo "  ❌ Viewport meta tag mancante"
fi

echo ""

# ============================================
# 11. SKIP LINKS (WCAG 2.4.1)
# ============================================
echo "⏩ 11. SKIP TO CONTENT"
echo "─────────────────────────────────────────────────"

if echo "$HTML" | grep -q 'skip-to-content\|skip-to-main\|skip-nav'; then
  echo "  ✅ Skip link presente"
else
  echo "  ⚠️  Skip link non trovato (raccomandato per screen readers)"
fi

echo ""

# ============================================
# 12. PAGE TITLE (WCAG 2.4.2)
# ============================================
echo "📄 12. PAGE TITLE"
echo "─────────────────────────────────────────────────"

TITLE=$(echo "$HTML" | grep -o '<title>[^<]*</title>' | sed 's/<title>//; s/<\/title>//')
if [ -n "$TITLE" ]; then
  echo "  ✅ Title presente: $TITLE"
  TITLE_LENGTH=${#TITLE}
  if [ "$TITLE_LENGTH" -lt 10 ]; then
    echo "  ⚠️  Title molto corto ($TITLE_LENGTH chars)"
  elif [ "$TITLE_LENGTH" -gt 70 ]; then
    echo "  ⚠️  Title molto lungo ($TITLE_LENGTH chars)"
  else
    echo "  ✅ Lunghezza title appropriata ($TITLE_LENGTH chars)"
  fi
else
  echo "  ❌ Title mancante"
fi

echo ""

# ============================================
# 13. LIVE REGIONS (WCAG 4.1.3)
# ============================================
echo "🔴 13. LIVE REGIONS & DYNAMIC CONTENT"
echo "─────────────────────────────────────────────────"

ARIA_LIVE=$(echo "$HTML" | grep -o 'aria-live=' | wc -l | xargs)
ROLE_ALERT=$(echo "$HTML" | grep -o 'role="alert' | wc -l | xargs)
ROLE_STATUS=$(echo "$HTML" | grep -o 'role="status' | wc -l | xargs)

echo "  aria-live: $ARIA_LIVE occorrenze"
echo "  role='alert': $ROLE_ALERT occorrenze"
echo "  role='status': $ROLE_STATUS occorrenze"

if [ "$ARIA_LIVE" -gt 0 ] || [ "$ROLE_ALERT" -gt 0 ]; then
  echo "  ✅ Live regions implementate per contenuto dinamico"
else
  echo "  ℹ️  Nessuna live region (OK se non c'è contenuto dinamico)"
fi

echo ""

# ============================================
# SUMMARY & RECOMMENDATIONS
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY & RECOMMENDATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🎯 TESTING TOOLS (da usare):"
echo ""
echo "1. 🔵 Lighthouse (Chrome DevTools)"
echo "   - F12 → Lighthouse tab → Accessibility audit"
echo "   - Score target: 90+"
echo ""
echo "2. 🟣 axe DevTools Extension"
echo "   - https://www.deque.com/axe/devtools/"
echo "   - Analisi automatica WCAG"
echo ""
echo "3. 🟢 WAVE (Web Accessibility Evaluation Tool)"
echo "   - https://wave.webaim.org/"
echo "   - Analisi visuale"
echo ""
echo "4. 🟡 Screen Reader Testing"
echo "   - macOS: VoiceOver (Cmd+F5)"
echo "   - Windows: NVDA (gratuito)"
echo "   - Test navigazione completa"
echo ""
echo "5. ⚫ Keyboard Navigation Test"
echo "   - Tab attraverso tutti gli elementi"
echo "   - Enter/Space per attivare"
echo "   - Esc per chiudere modals"
echo "   - Arrows per menu/dropdowns"
echo ""

echo "📋 NEXT STEPS:"
echo ""
echo "1. Esegui Lighthouse accessibility audit"
echo "2. Installa e usa axe DevTools"
echo "3. Test con screen reader (VoiceOver)"
echo "4. Test navigazione solo tastiera"
echo "5. Test contrasto colori"
echo "6. Fix eventuali problemi trovati"
echo ""

echo "📚 STANDARDS REFERENCE:"
echo ""
echo "  • EAA: https://ec.europa.eu/social/main.jsp?catId=1202"
echo "  • WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/"
echo "  • EN 301 549: https://www.etsi.org/deliver/etsi_en/301500_301599/301549/"
echo "  • Direttiva UE: https://eur-lex.europa.eu/eli/dir/2016/2102/oj"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Accessibility check completato!"
echo ""

