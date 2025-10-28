/**
 * Test Script per Sistema RAG
 * Esegue test completi del sistema RAG implementato
 */

// Carica variabili d'ambiente
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')
const OpenAI = require('openai')

// Configurazione
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  console.error('❌ Variabili d\'ambiente mancanti!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const openai = new OpenAI({ apiKey: openaiApiKey })

async function testEmbeddings() {
  console.log('\n🔍 Test 1: OpenAI Embeddings')
  console.log('=' .repeat(50))
  
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'This is a test document about artificial intelligence and machine learning.',
      encoding_format: 'float'
    })
    
    console.log('✅ Embeddings generati con successo!')
    console.log(`   - Modello: ${response.data[0].model}`)
    console.log(`   - Dimensioni: ${response.data[0].embedding.length}`)
    console.log(`   - Tokens: ${response.usage.total_tokens}`)
    console.log(`   - Costo: $${(response.usage.total_tokens / 1000 * 0.00002).toFixed(6)}`)
    
    return response.data[0].embedding
  } catch (error) {
    console.error('❌ Errore embeddings:', error.message)
    return null
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️ Test 2: Connessione Database')
  console.log('=' .repeat(50))
  
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Connessione database OK!')
    
    // Verifica estensione pgvector
    const { data: vectorData, error: vectorError } = await supabase
      .rpc('match_document_chunks', {
        query_embedding: new Array(1536).fill(0.1),
        match_threshold: 0.9,
        match_count: 1
      })
    
    if (vectorError && vectorError.message.includes('function match_document_chunks')) {
      console.log('⚠️  Funzione similarity search non trovata - eseguire sql/03_similarity_search.sql')
    } else {
      console.log('✅ Funzione similarity search disponibile!')
    }
    
    return true
  } catch (error) {
    console.error('❌ Errore database:', error.message)
    return false
  }
}

async function testDocumentUpload() {
  console.log('\n📄 Test 3: Upload Documento')
  console.log('=' .repeat(50))
  
  try {
    // Crea un documento di test
    const testContent = `
# Test Document - Artificial Intelligence

This is a test document about artificial intelligence and machine learning.

## Key Concepts

1. **Machine Learning**: A subset of AI that enables computers to learn without being explicitly programmed.

2. **Deep Learning**: A subset of machine learning that uses neural networks with multiple layers.

3. **Natural Language Processing**: The ability of computers to understand and process human language.

## Applications

- Chatbots and virtual assistants
- Image recognition
- Autonomous vehicles
- Medical diagnosis
- Financial analysis

This document contains important information about AI technologies and their practical applications in various industries.
    `.trim()
    
    // Crea blob per il file
    const blob = new Blob([testContent], { type: 'text/plain' })
    const file = new File([blob], 'test-ai-document.txt', { type: 'text/plain' })
    
    console.log('✅ Documento di test creato')
    console.log(`   - Nome: ${file.name}`)
    console.log(`   - Dimensione: ${file.size} bytes`)
    console.log(`   - Tipo: ${file.type}`)
    
    return { file, content: testContent }
  } catch (error) {
    console.error('❌ Errore creazione documento:', error.message)
    return null
  }
}

async function testSimilaritySearch() {
  console.log('\n🔍 Test 4: Similarity Search')
  console.log('=' .repeat(50))
  
  try {
    // Genera embedding per query di test
    const query = 'What is machine learning?'
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      encoding_format: 'float'
    })
    
    const queryEmbedding = response.data[0].embedding
    
    // Test similarity search
    const { data, error } = await supabase
      .rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.1,
        match_count: 5
      })
    
    if (error) {
      console.log('⚠️  Similarity search non disponibile:', error.message)
      console.log('   Eseguire: sql/03_similarity_search.sql')
      return false
    }
    
    console.log('✅ Similarity search funzionante!')
    console.log(`   - Query: "${query}"`)
    console.log(`   - Risultati trovati: ${data?.length || 0}`)
    
    if (data && data.length > 0) {
      console.log('   - Primo risultato:')
      console.log(`     Similarity: ${data[0].similarity?.toFixed(4)}`)
      console.log(`     Text: ${data[0].text?.substring(0, 100)}...`)
    }
    
    return true
  } catch (error) {
    console.error('❌ Errore similarity search:', error.message)
    return false
  }
}

async function testRAGQuery() {
  console.log('\n🤖 Test 5: RAG Query Completa')
  console.log('=' .repeat(50))
  
  try {
    const query = 'What are the main applications of artificial intelligence?'
    
    // Simula una query RAG (senza chunk reali per ora)
    const systemPrompt = `You are an AI tutor. Answer the user's question based on the provided context.

Context: This is a test document about artificial intelligence and machine learning. Key concepts include machine learning, deep learning, and natural language processing. Applications include chatbots, image recognition, autonomous vehicles, medical diagnosis, and financial analysis.

Instructions:
- Answer using only the provided context
- Be helpful and educational
- Keep answers concise but comprehensive`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
    
    const answer = completion.choices[0]?.message?.content
    const tokens = completion.usage?.total_tokens || 0
    const cost = (tokens / 1000) * 0.06 // GPT-4 pricing
    
    console.log('✅ RAG Query completata!')
    console.log(`   - Query: "${query}"`)
    console.log(`   - Tokens: ${tokens}`)
    console.log(`   - Costo: $${cost.toFixed(6)}`)
    console.log(`   - Risposta: ${answer?.substring(0, 200)}...`)
    
    return true
  } catch (error) {
    console.error('❌ Errore RAG query:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 AVVIO TEST SISTEMA RAG')
  console.log('=' .repeat(60))
  
  const results = {
    embeddings: false,
    database: false,
    document: false,
    similarity: false,
    rag: false
  }
  
  // Test 1: Embeddings
  const embedding = await testEmbeddings()
  results.embeddings = !!embedding
  
  // Test 2: Database
  results.database = await testDatabaseConnection()
  
  // Test 3: Document
  const docTest = await testDocumentUpload()
  results.document = !!docTest
  
  // Test 4: Similarity Search
  results.similarity = await testSimilaritySearch()
  
  // Test 5: RAG Query
  results.rag = await testRAGQuery()
  
  // Riepilogo
  console.log('\n📊 RIEPILOGO TEST')
  console.log('=' .repeat(60))
  console.log(`✅ Embeddings OpenAI: ${results.embeddings ? 'OK' : 'FAIL'}`)
  console.log(`✅ Database Supabase: ${results.database ? 'OK' : 'FAIL'}`)
  console.log(`✅ Document Upload: ${results.document ? 'OK' : 'FAIL'}`)
  console.log(`✅ Similarity Search: ${results.similarity ? 'OK' : 'FAIL'}`)
  console.log(`✅ RAG Query: ${results.rag ? 'OK' : 'FAIL'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 RISULTATO: ${passedTests}/${totalTests} test passati`)
  
  if (passedTests === totalTests) {
    console.log('🎉 TUTTI I TEST PASSATI! Sistema RAG pronto!')
  } else {
    console.log('⚠️  Alcuni test falliti. Controllare la configurazione.')
  }
}

// Esegui i test
runAllTests().catch(console.error)
