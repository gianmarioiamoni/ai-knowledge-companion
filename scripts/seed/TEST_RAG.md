# 🧪 Testing RAG Functionality

This guide will help you verify that the seeded data is working correctly, especially the **Retrieval Augmented Generation (RAG)** functionality.

---

## ✅ Prerequisites

- ✅ Seed script executed successfully
- ✅ 5 documents with embeddings created
- ✅ 6 tutors created and linked to documents
- ✅ Server running: `npm run dev`

---

## 🔍 Step 1: Verify Database

Run the verification SQL queries:

```bash
# Open Supabase SQL Editor or use psql
psql <your_database_url> < scripts/seed/verify-seed-data.sql
```

**Expected Results**:
- ✅ 5 documents with status `ready`
- ✅ 12 document chunks
- ✅ All chunks have embeddings (1536 dimensions)
- ✅ 6 tutors
- ✅ 10 tutor-document links
- ✅ 3 conversations with 8 messages

---

## 🧪 Step 2: Manual RAG Test

### **2.1 Login**
1. Open browser: http://localhost:3000
2. Login with: `gia.iamoni@tiscali.it`

### **2.2 Check Documents**
1. Navigate to: **Documents**
2. Verify 5 documents are visible:
   - ✅ Introduction to Calculus
   - ✅ Renaissance and Reformation
   - ✅ Modern JavaScript and TypeScript
   - ✅ Cell Biology and Genetics
   - ✅ Advanced English Grammar
3. All should have status: **Ready**

### **2.3 Check Tutors**
1. Navigate to: **My Tutors**
2. Verify 6 tutors are visible:
   - ✅ Calculus Professor
   - ✅ History Scholar
   - ✅ Full-Stack Coding Mentor
   - ✅ Biology & Genetics Tutor
   - ✅ English Grammar Expert
   - ✅ General Study Assistant (marketplace)

### **2.4 Check Conversations**
1. Navigate to: **Chat**
2. Verify 3 conversations in sidebar:
   - ✅ Understanding Derivatives
   - ✅ The Renaissance Art Revolution
   - ✅ TypeScript Generics Explained
3. Open each conversation and verify messages are displayed

---

## 🎯 Step 3: Test RAG (Critical!)

This is the **most important test** to verify that embeddings and RAG are working.

### **Test 1: Calculus Tutor**

1. **Open Chat** with **Calculus Professor**
2. **Ask a question** from the document:

```
What is the power rule for derivatives? Can you give me an example?
```

3. **Expected Behavior**:
   - ✅ Response references the document content
   - ✅ Response includes the formula: `f'(x) = nxⁿ⁻¹`
   - ✅ Response provides an example (e.g., `f(x) = 3x⁴`)
   - ✅ Response is accurate and detailed

4. **Verify RAG Context** (in browser DevTools → Network):
   - Check POST request to `/api/chat/send`
   - Response should include `rag_context` with document chunks

**Example Expected Response**:
> "Great question! The **power rule** is one of the fundamental derivative rules. According to the power rule: If f(x) = xⁿ, then f'(x) = nxⁿ⁻¹. Let me give you an example from the material: For f(x) = 3x⁴ - 2x² + 5, using the power rule: f'(x) = 12x³ - 4x. Here's how it works..."

---

### **Test 2: History Tutor**

1. **Open Chat** with **History Scholar**
2. **Ask**:

```
What were the key characteristics of Renaissance art?
```

3. **Expected Behavior**:
   - ✅ Mentions perspective, realism, humanism
   - ✅ References specific artists (Leonardo, Michelangelo, Raphael)
   - ✅ Cites techniques from the document (sfumato, chiaroscuro)

---

### **Test 3: Programming Tutor**

1. **Open Chat** with **Full-Stack Coding Mentor**
2. **Ask**:

```
How do TypeScript generics work? Show me an example with an API response.
```

3. **Expected Behavior**:
   - ✅ Explains generics with type parameters (`<T>`)
   - ✅ Shows `ApiResponse<T>` interface example
   - ✅ Includes code snippets from the document

---

### **Test 4: General Study Assistant (Marketplace)**

1. **Navigate to** **Marketplace**
2. **Find** "General Study Assistant" (should be visible)
3. **Open Chat** with this tutor
4. **Ask a cross-subject question**:

```
Can you explain the relationship between calculus derivatives and the concept of rate of change in science?
```

5. **Expected Behavior**:
   - ✅ Draws from both Mathematics and Science documents
   - ✅ Connects concepts across disciplines
   - ✅ Shows RAG is working with multiple documents

---

## ❌ Troubleshooting

### **RAG Not Working (Generic Answers)**

**Symptoms**:
- Tutor gives generic answers
- No specific examples from documents
- No document chunks in DevTools Network response

**Solutions**:

1. **Check Embeddings**:
```sql
SELECT COUNT(*), 
       SUM(CASE WHEN embedding IS NOT NULL THEN 1 ELSE 0 END) as with_embedding
FROM document_chunks dc
JOIN documents d ON d.id = dc.document_id
WHERE d.owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it');
```

If `with_embedding` is 0 → Embeddings not generated!

2. **Check Tutor RAG Config**:
```sql
SELECT name, use_rag, similarity_threshold, max_context_chunks
FROM tutors
WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it');
```

All should have `use_rag = true`.

3. **Check Tutor-Document Links**:
```sql
SELECT t.name, COUNT(td.document_id) as linked_docs
FROM tutors t
LEFT JOIN tutor_documents td ON td.tutor_id = t.id
WHERE t.owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it')
GROUP BY t.id, t.name;
```

Each tutor should have ≥ 1 linked document.

4. **Check OpenAI API Key**:
```bash
echo $OPENAI_API_KEY
# Should NOT be empty
```

5. **Re-run Processing**:
If embeddings are missing, delete documents and re-run seed:
```sql
-- Delete all seed data
DELETE FROM conversations WHERE user_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it');
DELETE FROM tutor_documents WHERE tutor_id IN (SELECT id FROM tutors WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it'));
DELETE FROM tutors WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it');
DELETE FROM document_chunks WHERE document_id IN (SELECT id FROM documents WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it'));
DELETE FROM documents WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it');
```

Then re-run:
```bash
npx tsx scripts/seed/index.ts
```

---

### **Documents Show as "Processing"**

**Cause**: Processing incomplete or failed

**Solution**:
```sql
-- Check document status
SELECT title, status FROM documents 
WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it');

-- If stuck in "processing", update manually
UPDATE documents 
SET status = 'failed' 
WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it')
  AND status = 'processing';
```

Then delete and re-run seed.

---

### **Tutors Not Visible**

**Cause**: Visibility set incorrectly or not linked to documents

**Solution**:
```sql
-- Check tutor visibility
SELECT name, visibility FROM tutors
WHERE owner_id = (SELECT id FROM profiles WHERE email = 'gia.iamoni@tiscali.it');

-- All should be 'private' except "General Study Assistant" (marketplace)
```

---

## ✅ Success Criteria

RAG is working correctly if:

1. ✅ **Specific Content**: Responses include specific formulas, examples, and details from documents
2. ✅ **Accurate Citations**: Responses accurately reflect document content
3. ✅ **Context Awareness**: Tutor knows when information is/isn't in documents
4. ✅ **Network Logs**: `/api/chat/send` response includes `rag_context` with document chunks
5. ✅ **Multi-Document**: General Study Assistant can draw from multiple documents

---

## 📊 Expected Test Results

| Test | Question | Expected RAG Behavior |
|------|----------|----------------------|
| **Calculus** | "What is the power rule?" | ✅ Cites formula `f'(x) = nxⁿ⁻¹` and example from doc |
| **History** | "Renaissance art characteristics?" | ✅ Mentions perspective, sfumato, specific artists |
| **Programming** | "How do generics work?" | ✅ Shows `<T>` syntax and `ApiResponse<T>` example |
| **Science** | "Explain DNA replication?" | ✅ References helicase, polymerase, Okazaki fragments |
| **Language** | "Explain conditionals?" | ✅ Lists zero, first, second, third conditionals with examples |
| **General** | "Derivatives and rate of change?" | ✅ Connects math and science concepts from both docs |

---

## 🎉 Next Steps

Once RAG is verified:
1. ✅ Mark TODO as completed
2. ✅ Document any issues found
3. ✅ Update `README.md` if needed
4. ✅ Celebrate! 🎊 Your AI Knowledge Companion is fully seeded and functional!

---

## 📚 Additional Resources

- **Database Schema**: `docs/development/DATABASE_SCHEMA.md`
- **Seed Configuration**: `scripts/seed/seed-config.ts`
- **Verification SQL**: `scripts/seed/verify-seed-data.sql`
- **Seed README**: `scripts/seed/README.md`

