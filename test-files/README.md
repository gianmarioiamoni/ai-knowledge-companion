# Test Files per AI Knowledge Companion

Questa cartella contiene file di test per validare il parsing e il processing dei documenti.

## File Disponibili

### 📄 File di Testo
- **simple-text.txt** - File di testo semplice
- **simple-markdown.md** - File Markdown con formattazione

### 📊 Altri Formati
- **simple-json.json** - File JSON di esempio

### 📝 Documenti Word (da generare)
Per creare i file DOCX di test, esegui:

```bash
cd test-files
pip install python-docx
python3 create-word-docs.py
```

Questo creerà:
- **test-document.docx** - Documento completo con headers, liste, formattazione
- **simple-test.docx** - Documento semplice per test rapidi

### 📑 Formato DOC (vecchio formato Word)
Per creare file .doc:
1. Apri i file .docx con Microsoft Word o LibreOffice
2. Salva come formato "Word 97-2003 Document (.doc)"

## Testing del Sistema

### 1. Test di Parsing
Carica ogni tipo di file nell'applicazione per verificare:
- ✅ Estrazione del testo corretta
- ✅ Preservazione della struttura (headers, liste, paragrafi)
- ✅ Gestione dei caratteri speciali

### 2. Test di Chunking
Verifica che i documenti vengano divisi in chunk:
- Dimensione: ~1000 caratteri
- Overlap: 120 caratteri
- Preservazione del contesto semantico

### 3. Test RAG
1. Carica i documenti
2. Associali a un tutor
3. Fai domande pertinenti al contenuto
4. Verifica che il tutor risponda usando il contenuto dei documenti

## Esempi di Domande per Test RAG

Per `test-document.docx`:
- "What technologies does the AI Knowledge Companion use?"
- "Describe the document processing pipeline"
- "What file formats are supported?"
- "How does the RAG system work?"
- "What is the chunking strategy used?"

## Troubleshooting

### Python-docx non installato
```bash
pip install python-docx
# oppure
pip3 install python-docx
```

### Errore durante la creazione dei file
Assicurati di avere i permessi di scrittura nella cartella test-files.

### File DOC non supportati
Il formato .doc (Word 97-2003) richiede `word-extractor` che è già incluso nelle dipendenze del progetto.

## Note Tecniche

### Parser Utilizzati
- **TXT/MD**: Parser nativo Node.js
- **PDF**: LangChain `WebPDFLoader` + `pdf-parse@1.1.1`
- **DOCX**: LangChain `DocxLoader` + `mammoth@1.11.0`
- **DOC**: LangChain `DocxLoader` + `word-extractor@1.0.4`

### Librerie LangChain
```typescript
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
```

## Aggiungere Nuovi File di Test

Per aggiungere nuovi file di test:
1. Crea il file in questa cartella
2. Assicurati che il contenuto sia significativo per il test RAG
3. Documenta il tipo di test e le domande di esempio
4. Aggiorna questo README

---

**Ultimo aggiornamento**: Ottobre 2025
**Formati supportati**: TXT, MD, PDF, DOC, DOCX

