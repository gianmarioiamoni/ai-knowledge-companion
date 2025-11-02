import type { Tutor } from '@/types/tutors'

interface WelcomeMessageParams {
  tutor: Tutor
  userEmail?: string
  locale?: string
}

/**
 * Generates a welcome message for a tutor conversation
 * The message is personalized based on tutor configuration and user info
 */
export function generateWelcomeMessage({ 
  tutor, 
  userEmail, 
  locale = 'en' 
}: WelcomeMessageParams): string {
  const userName = userEmail?.split('@')[0] || 'there'
  
  // Use tutor's system prompt as base, or generate a default one
  const tutorPersonality = tutor.system_prompt || generateDefaultPersonality(tutor)
  
  const messages = {
    en: {
      greeting: `Hello ${userName}! 👋`,
      intro: `I'm **${tutor.name}**, your AI assistant.`,
      capabilities: generateCapabilities(tutor, 'en'),
      closing: `How can I help you today?`
    },
    it: {
      greeting: `Ciao ${userName}! 👋`,
      intro: `Sono **${tutor.name}**, il tuo assistente AI.`,
      capabilities: generateCapabilities(tutor, 'it'),
      closing: `Come posso aiutarti oggi?`
    }
  }
  
  const msg = messages[locale as keyof typeof messages] || messages.en
  
  return `${msg.greeting}

${msg.intro}

${tutor.description || tutorPersonality}

${msg.capabilities}

${msg.closing}`
}

/**
 * Generates default personality based on tutor config
 */
function generateDefaultPersonality(tutor: Tutor): string {
  const traits: string[] = []
  
  if (tutor.use_rag) {
    traits.push('I have access to specialized documents to provide accurate, contextual answers')
  }
  
  if (tutor.temperature && tutor.temperature > 1) {
    traits.push('I approach topics creatively and explore diverse perspectives')
  } else if (tutor.temperature && tutor.temperature < 0.5) {
    traits.push('I provide precise, factual responses')
  }
  
  return traits.length > 0 
    ? traits.join('. ') + '.'
    : 'I\'m here to assist you with your questions.'
}

/**
 * Generates capabilities description based on tutor settings
 */
function generateCapabilities(tutor: Tutor, locale: string): string {
  const capabilities: string[] = []
  
  const labels = {
    en: {
      ragTitle: `📚 **Knowledge Base**`,
      documentsCount: `I have access to ${tutor.total_documents || 0} specialized document${(tutor.total_documents || 0) !== 1 ? 's' : ''}`,
      documentsAbout: `My expertise covers`,
      model: `🤖 **AI Model**: Powered by ${tutor.model}`,
      conversations: tutor.total_conversations 
        ? `💬 **Experience**: ${tutor.total_conversations} conversations completed`
        : null
    },
    it: {
      ragTitle: `📚 **Base di Conoscenza**`,
      documentsCount: `Ho accesso a ${tutor.total_documents || 0} documento${(tutor.total_documents || 0) !== 1 ? 'i' : ''} specializzato${(tutor.total_documents || 0) !== 1 ? 'i' : ''}`,
      documentsAbout: `Le mie competenze coprono`,
      model: `🤖 **Modello AI**: Alimentato da ${tutor.model}`,
      conversations: tutor.total_conversations
        ? `💬 **Esperienza**: ${tutor.total_conversations} conversazioni completate`
        : null
    }
  }
  
  const l = labels[locale as keyof typeof labels] || labels.en
  
  // RAG capabilities with document details
  if (tutor.use_rag && tutor.total_documents && tutor.total_documents > 0) {
    const ragInfo: string[] = [l.ragTitle]
    ragInfo.push(`   ${l.documentsCount}`)
    
    // Add document names/topics if available
    if (tutor.tutor_documents && tutor.tutor_documents.length > 0) {
      const documentNames = tutor.tutor_documents
        .slice(0, 3) // Show max 3 documents
        .map(td => td.documents?.name)
        .filter(Boolean)
      
      if (documentNames.length > 0) {
        ragInfo.push(`   ${l.documentsAbout}:`)
        documentNames.forEach(name => {
          ragInfo.push(`   • ${name}`)
        })
        
        if (tutor.tutor_documents.length > 3) {
          const remaining = tutor.tutor_documents.length - 3
          ragInfo.push(`   • ${locale === 'it' ? 'e altri' : 'and'} ${remaining} ${locale === 'it' ? 'altri' : 'more'}...`)
        }
      }
    }
    
    capabilities.push(ragInfo.join('\n'))
  }
  
  // AI Model
  if (tutor.model) {
    capabilities.push(l.model)
  }
  
  // Experience
  if (l.conversations) {
    capabilities.push(l.conversations)
  }
  
  return capabilities.length > 0 
    ? '**My Capabilities:**\n' + capabilities.join('\n\n')
    : ''
}

/**
 * Creates a system message object for the welcome message
 */
export function createWelcomeMessageObject(tutor: Tutor, userEmail?: string, locale?: string) {
  return {
    role: 'system' as const,
    sender: 'assistant' as const,
    content: generateWelcomeMessage({ tutor, userEmail, locale }),
    metadata: {
      isWelcome: true,
      generatedAt: new Date().toISOString(),
      tutorId: tutor.id
    }
  }
}

