# Guida al Testing SEO 🔍

## Test Immediati (Locali)

### 1. **Verifica Sitemap.xml** ✅

**URL**: http://localhost:3000/sitemap.xml

**Cosa verificare**:
- ✅ Il file si apre correttamente
- ✅ Contiene tutti gli URL (20+ pagine)
- ✅ Ha link EN e IT per ogni pagina
- ✅ Include priorità e changefreq
- ✅ Mostra alternate languages

**Esempio output**:
```xml
<url>
  <loc>https://aiknowledgecompanion.com/en</loc>
  <lastmod>2024-01-15</lastmod>
  <changefreq>daily</changefreq>
  <priority>1.0</priority>
  <xhtml:link rel="alternate" hreflang="en" href=".../en"/>
  <xhtml:link rel="alternate" hreflang="it" href=".../it"/>
</url>
```

### 2. **Verifica Robots.txt** 🤖

**URL**: http://localhost:3000/robots.txt

**Cosa verificare**:
- ✅ Il file si apre correttamente
- ✅ Ha regole per User-agent: *
- ✅ Ha regole per Googlebot
- ✅ Disallow per /api/, /dashboard/, etc.
- ✅ Include sitemap URL

**Esempio output**:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Sitemap: https://aiknowledgecompanion.com/sitemap.xml
```

### 3. **Verifica Metadata nelle Pagine** 📝

**Apri qualsiasi pagina** (es. http://localhost:3000/en)

**Chrome DevTools**:
1. Tasto destro → "Ispeziona" (o F12)
2. Tab "Elements"
3. Cerca `<head>` nell'HTML
4. Verifica che ci siano:

```html
<!-- Title -->
<title>Your Personal AI Learning Assistant | AI Knowledge Companion</title>

<!-- Meta Description -->
<meta name="description" content="Create personalized AI tutors..." />

<!-- Canonical URL -->
<link rel="canonical" href="https://aiknowledgecompanion.com/en" />

<!-- Alternate Languages -->
<link rel="alternate" hreflang="en" href=".../en" />
<link rel="alternate" hreflang="it" href=".../it" />

<!-- Open Graph (Facebook/LinkedIn) -->
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_US" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content=".../og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
```

### 4. **Verifica Structured Data (JSON-LD)** 🏗️

**Nella stessa pagina** (Elements tab):

Cerca `<script type="application/ld+json">`

Dovresti vedere 3 script per la landing page:

**Organization Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Knowledge Companion",
  "url": "https://aiknowledgecompanion.com/en",
  "logo": "https://aiknowledgecompanion.com/logo.png"
}
```

**WebSite Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AI Knowledge Companion",
  "url": "https://aiknowledgecompanion.com/en",
  "potentialAction": {
    "@type": "SearchAction",
    ...
  }
}
```

**SoftwareApplication Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AI Knowledge Companion",
  "applicationCategory": "EducationalApplication"
}
```

---

## Test Online (Produzione)

### 1. **Google Rich Results Test** ⭐

**URL**: https://search.google.com/test/rich-results

**Come usare**:
1. Inserisci URL della tua pagina (es. https://aiknowledgecompanion.com/en)
2. Clicca "Test URL"
3. Attendi risultati

**Cosa verificare**:
- ✅ Nessun errore
- ✅ Rich results detected
- ✅ Organization schema valido
- ✅ WebSite schema valido
- ✅ SoftwareApplication schema valido

### 2. **Schema Markup Validator** 📊

**URL**: https://validator.schema.org/

**Come usare**:
1. Copia il JSON-LD dalla pagina
2. Incolla nel validator
3. Clicca "Validate"

**Cosa verificare**:
- ✅ No errors
- ✅ No warnings (idealmente)
- ✅ Schema type riconosciuto

### 3. **Open Graph Debugger** 🖼️

**Facebook Debugger**:
- URL: https://developers.facebook.com/tools/debug/

**LinkedIn Inspector**:
- URL: https://www.linkedin.com/post-inspector/

**Open Graph XYZ**:
- URL: https://www.opengraph.xyz/

**Come usare**:
1. Inserisci URL della pagina
2. Clicca "Scrape" o "Inspect"
3. Verifica anteprima

**Cosa verificare**:
- ✅ Titolo corretto
- ✅ Descrizione corretta
- ✅ Immagine mostrata (1200x630)
- ✅ Nessun errore o warning

### 4. **Twitter Card Validator** 🐦

**URL**: https://cards-dev.twitter.com/validator

**Come usare**:
1. Inserisci URL della pagina
2. Clicca "Preview card"
3. Verifica anteprima

**Cosa verificare**:
- ✅ Card type: summary_large_image
- ✅ Titolo corretto
- ✅ Descrizione corretta
- ✅ Immagine mostrata

### 5. **Google PageSpeed Insights** 🚀

**URL**: https://pagespeed.web.dev/

**Come usare**:
1. Inserisci URL della pagina
2. Clicca "Analyze"
3. Attendi risultati

**Cosa verificare**:
- ✅ Performance score > 90
- ✅ SEO score = 100
- ✅ Best Practices score > 90
- ✅ Accessibility score > 90

### 6. **Mobile-Friendly Test** 📱

**URL**: https://search.google.com/test/mobile-friendly

**Come usare**:
1. Inserisci URL della pagina
2. Clicca "Test URL"
3. Verifica risultato

**Cosa verificare**:
- ✅ "Page is mobile friendly"
- ✅ Nessun problema rilevato

---

## Comandi CLI per Test Rapidi

### Test Sitemap
```bash
# Verifica sitemap esiste e è valido XML
curl http://localhost:3000/sitemap.xml | head -50

# Produzione
curl https://aiknowledgecompanion.com/sitemap.xml | head -50
```

### Test Robots.txt
```bash
# Verifica robots.txt
curl http://localhost:3000/robots.txt

# Produzione
curl https://aiknowledgecompanion.com/robots.txt
```

### Test Metadata con curl
```bash
# Verifica meta tags
curl http://localhost:3000/en | grep -i "meta\|title\|canonical"

# Produzione
curl https://aiknowledgecompanion.com/en | grep -i "meta\|title"
```

### Test Structured Data
```bash
# Estrai JSON-LD
curl http://localhost:3000/en | grep -A 10 "application/ld+json"
```

---

## Checklist Completa SEO ✅

### Metadata
- [ ] Title tag presente e ottimizzato (50-60 caratteri)
- [ ] Meta description presente (150-160 caratteri)
- [ ] Canonical URL presente
- [ ] Alternate language links (hreflang) presenti
- [ ] Keywords definite

### Open Graph
- [ ] og:type presente
- [ ] og:title presente
- [ ] og:description presente
- [ ] og:image presente (1200x630)
- [ ] og:url presente
- [ ] og:locale presente

### Twitter Cards
- [ ] twitter:card presente
- [ ] twitter:title presente
- [ ] twitter:description presente
- [ ] twitter:image presente

### Structured Data
- [ ] JSON-LD presente
- [ ] Schema valido (no errori)
- [ ] Organization schema sulla home
- [ ] WebSite schema sulla home
- [ ] Altri schema appropriati per pagina

### Files
- [ ] sitemap.xml accessibile
- [ ] robots.txt accessibile
- [ ] 20+ URLs nel sitemap
- [ ] Sitemap referenziato in robots.txt

### Performance
- [ ] PageSpeed > 90
- [ ] Mobile-friendly
- [ ] Core Web Vitals OK

---

## Strumenti Browser Extensions

### Chrome Extensions Utili

1. **SEO Meta in 1 Click**
   - Mostra tutti i meta tag
   - Verifica structured data
   - Controlla social tags

2. **Lighthouse**
   - Già integrato in Chrome DevTools
   - F12 → Lighthouse tab → Generate report

3. **Detailed SEO Extension**
   - Analisi SEO completa
   - Suggerimenti miglioramento

4. **Wappalyzer**
   - Rileva tecnologie usate
   - Verifica framework e librerie

---

## Testing Workflow Consigliato

### 1. Test Locale (Prima del Deploy)
```bash
1. Avvia dev server: npm run dev
2. Test sitemap: http://localhost:3000/sitemap.xml ✓
3. Test robots: http://localhost:3000/robots.txt ✓
4. Test home: http://localhost:3000/en
   - Apri DevTools
   - Verifica metadata in <head>
   - Verifica JSON-LD
5. Test pagina piani: http://localhost:3000/en/plans
   - Verifica Offer schema presente
6. Cambia lingua: http://localhost:3000/it
   - Verifica traduzione funziona
   - Verifica metadata in italiano
```

### 2. Test Produzione (Dopo il Deploy)
```bash
1. Google Rich Results Test
   - URL home
   - URL /plans
   - Verifica no errori

2. Schema Validator
   - Copia JSON-LD
   - Valida ogni schema

3. Open Graph Debugger
   - Test condivisione Facebook
   - Test condivisione LinkedIn

4. Twitter Card Validator
   - Test condivisione Twitter

5. PageSpeed Insights
   - Verifica performance
   - Verifica SEO score = 100

6. Google Search Console
   - Invia sitemap
   - Monitora indicizzazione
```

---

## Problemi Comuni e Soluzioni

### Problema: Sitemap 404
**Soluzione**:
```bash
# Verifica file esiste
ls -la src/app/sitemap.ts

# Verifica export default presente
cat src/app/sitemap.ts | grep "export default"
```

### Problema: Metadata non appare
**Soluzione**:
- Verifica `generateMetadata` sia async
- Verifica `params` sia passato e await-ato
- Verifica traduzioni esistano in messages/*.json

### Problema: Structured Data invalido
**Soluzione**:
- Usa Schema Validator
- Verifica sintassi JSON
- Verifica tutti i campi required presenti

### Problema: Open Graph non funziona
**Soluzione**:
- Verifica immagine sia accessibile pubblicamente
- Verifica dimensioni 1200x630
- Usa Facebook Debugger per "Scrape Again"

---

## Script di Test Automatico

Crea un file `test-seo.sh`:

```bash
#!/bin/bash

echo "🔍 Testing SEO..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test Sitemap
echo "Testing sitemap.xml..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/sitemap.xml)
if [ $STATUS -eq 200 ]; then
  echo -e "${GREEN}✓ Sitemap OK${NC}"
else
  echo -e "${RED}✗ Sitemap FAILED (Status: $STATUS)${NC}"
fi

# Test Robots
echo "Testing robots.txt..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/robots.txt)
if [ $STATUS -eq 200 ]; then
  echo -e "${GREEN}✓ Robots.txt OK${NC}"
else
  echo -e "${RED}✗ Robots.txt FAILED (Status: $STATUS)${NC}"
fi

# Test Home EN
echo "Testing home page EN..."
CONTENT=$(curl -s http://localhost:3000/en)
if echo "$CONTENT" | grep -q "application/ld+json"; then
  echo -e "${GREEN}✓ Structured Data presente${NC}"
else
  echo -e "${RED}✗ Structured Data mancante${NC}"
fi

if echo "$CONTENT" | grep -q 'og:title'; then
  echo -e "${GREEN}✓ Open Graph presente${NC}"
else
  echo -e "${RED}✗ Open Graph mancante${NC}"
fi

# Test Home IT
echo "Testing home page IT..."
CONTENT=$(curl -s http://localhost:3000/it)
if echo "$CONTENT" | grep -q "application/ld+json"; then
  echo -e "${GREEN}✓ Structured Data IT presente${NC}"
else
  echo -e "${RED}✗ Structured Data IT mancante${NC}"
fi

echo ""
echo "✅ Test completati!"
```

**Uso**:
```bash
chmod +x test-seo.sh
./test-seo.sh
```

---

## Monitoring Post-Deploy

### Google Search Console
1. Aggiungi proprietà: https://search.google.com/search-console
2. Verifica proprietà (DNS o file HTML)
3. Invia sitemap: `/sitemap.xml`
4. Monitora:
   - Coverage (pagine indicizzate)
   - Enhancements (rich results)
   - Performance (impressioni, clic)

### Bing Webmaster Tools
1. Aggiungi sito: https://www.bing.com/webmasters
2. Verifica proprietà
3. Invia sitemap
4. Monitora indicizzazione

---

## Metriche da Monitorare

### Immediate (Prime 24h)
- ✅ Sitemap submitted
- ✅ No errori validazione
- ✅ No errori console

### Breve Termine (1-7 giorni)
- 📊 Pagine indicizzate
- 📊 Rich results detected
- 📊 Mobile usability OK

### Lungo Termine (1-3 mesi)
- 📈 Impressioni in crescita
- 📈 Click-through rate
- 📈 Posizioni ranking
- 📈 Traffico organico

---

## ✅ Conclusione

Per verificare il SEO:

1. **Test Locali** (5 minuti)
   - Sitemap.xml
   - Robots.txt
   - Metadata in DevTools
   - Structured Data in DevTools

2. **Test Online** (10 minuti)
   - Google Rich Results Test
   - Schema Validator
   - Open Graph Debugger
   - PageSpeed Insights

3. **Monitoring** (Continuo)
   - Google Search Console
   - Bing Webmaster Tools

**Se tutti i test passano, il tuo SEO è perfettamente configurato!** 🎉

---

**Ultima verifica**: {Current Date}  
**Status**: ✅ Pronto per testing

