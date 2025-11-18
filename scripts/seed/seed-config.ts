/**
 * Seed Data Configuration
 * 
 * Defines all seed data: documents, tutors, and demo conversations
 */

import path from 'path';

// Target user email (must exist in database)
export const TARGET_USER_EMAIL = 'gia.iamoni@tiscali.it';

// Content directory
export const CONTENT_DIR = path.join(__dirname, 'content');

// Document configurations
export interface SeedDocument {
  filename: string;
  title: string;
  description: string;
  category: string;
  visibility: 'private' | 'public' | 'unlisted';
}

export const SEED_DOCUMENTS: SeedDocument[] = [
  {
    filename: 'mathematics.md',
    title: 'Introduction to Calculus',
    description: 'Complete guide covering limits, derivatives, and integration with practical examples and exercises',
    category: 'Mathematics',
    visibility: 'private'
  },
  {
    filename: 'history.md',
    title: 'Renaissance and Reformation',
    description: 'Comprehensive overview of European history during the Renaissance and Reformation periods (1300-1600)',
    category: 'History',
    visibility: 'private'
  },
  {
    filename: 'programming.md',
    title: 'Modern JavaScript and TypeScript',
    description: 'Advanced guide to JavaScript ES6+, TypeScript, React, and modern web development best practices',
    category: 'Programming',
    visibility: 'private'
  },
  {
    filename: 'science.md',
    title: 'Cell Biology and Genetics',
    description: 'Introduction to cell structure, DNA, genetics, and evolutionary biology with detailed explanations',
    category: 'Science',
    visibility: 'private'
  },
  {
    filename: 'language.md',
    title: 'Advanced English Grammar',
    description: 'Comprehensive guide to complex sentence structures, verb forms, conditionals, and academic writing',
    category: 'Language',
    visibility: 'private'
  }
];

// Tutor configurations
export interface SeedTutor {
  name: string;
  description: string;
  avatar_url?: string;
  system_prompt: string;
  temperature: number;
  model: string;
  use_rag: boolean;
  max_context_chunks: number;
  similarity_threshold: number;
  visibility: 'private' | 'public' | 'unlisted' | 'marketplace';
  category?: string;
  tags?: string[];
  documentCategories: string[]; // Which document categories to link
}

export const SEED_TUTORS: SeedTutor[] = [
  {
    name: 'Calculus Professor',
    description: 'Expert mathematics tutor specializing in calculus, limits, derivatives, and integration. Provides step-by-step explanations with clear examples.',
    system_prompt: 'You are an experienced calculus professor with 20 years of teaching experience. You explain complex mathematical concepts in simple terms, always providing step-by-step solutions. You use analogies and real-world examples to help students understand abstract concepts. When a student asks a question, first check if relevant information exists in the provided context, then supplement with your knowledge. Always show your work and explain your reasoning.',
    temperature: 0.3,
    model: 'gpt-4o-mini',
    use_rag: true,
    max_context_chunks: 5,
    similarity_threshold: 0.75,
    visibility: 'private',
    category: 'education',
    tags: ['mathematics', 'calculus', 'education', 'STEM'],
    documentCategories: ['Mathematics']
  },
  {
    name: 'History Scholar',
    description: 'Knowledgeable history tutor covering Renaissance, Reformation, and major historical events. Engaging storytelling with accurate facts.',
    system_prompt: 'You are a passionate history scholar with expertise in European history, particularly the Renaissance and Reformation periods. You bring history to life through engaging narratives while maintaining historical accuracy. You connect past events to modern contexts and help students understand cause-and-effect relationships. Always cite specific dates, figures, and events from the provided documents when available.',
    temperature: 0.5,
    model: 'gpt-4o-mini',
    use_rag: true,
    max_context_chunks: 5,
    similarity_threshold: 0.7,
    visibility: 'private',
    category: 'education',
    tags: ['history', 'renaissance', 'reformation', 'education'],
    documentCategories: ['History']
  },
  {
    name: 'Full-Stack Coding Mentor',
    description: 'Expert programming tutor for JavaScript, TypeScript, React, and modern web development. Provides practical code examples and best practices.',
    system_prompt: 'You are a senior full-stack developer and coding mentor with expertise in JavaScript, TypeScript, React, and modern web technologies. You provide clear, practical code examples and explain best practices. You emphasize clean code, type safety, and modern patterns. When helping with code, you reference the provided documentation and examples, then expand with additional context. You always include code snippets in your explanations.',
    temperature: 0.4,
    model: 'gpt-4o-mini',
    use_rag: true,
    max_context_chunks: 6,
    similarity_threshold: 0.75,
    visibility: 'private',
    category: 'technology',
    tags: ['programming', 'javascript', 'typescript', 'react', 'web-development'],
    documentCategories: ['Programming']
  },
  {
    name: 'Biology & Genetics Tutor',
    description: 'Comprehensive biology tutor covering cell biology, genetics, DNA, and evolution. Clear explanations with diagrams and examples.',
    system_prompt: 'You are a biology professor specializing in cell biology and genetics. You explain complex biological processes in accessible terms, using analogies and visual descriptions. You help students understand the connections between molecular biology, genetics, and evolution. You always reference specific concepts from the provided materials and build upon them with additional explanations.',
    temperature: 0.4,
    model: 'gpt-4o-mini',
    use_rag: true,
    max_context_chunks: 5,
    similarity_threshold: 0.7,
    visibility: 'private',
    category: 'science',
    tags: ['biology', 'genetics', 'science', 'education', 'STEM'],
    documentCategories: ['Science']
  },
  {
    name: 'English Grammar Expert',
    description: 'Advanced English tutor for grammar, writing, and academic English. Helps with sentence structure, style, and composition.',
    system_prompt: 'You are an English language expert and writing instructor. You help students master advanced grammar, improve their writing style, and develop academic writing skills. You provide clear explanations of grammar rules with examples, point out common errors, and suggest improvements. You reference the grammar rules and examples from the provided documents and offer personalized feedback.',
    temperature: 0.5,
    model: 'gpt-4o-mini',
    use_rag: true,
    max_context_chunks: 5,
    similarity_threshold: 0.7,
    visibility: 'private',
    category: 'language',
    tags: ['english', 'grammar', 'writing', 'education', 'language'],
    documentCategories: ['Language']
  },
  {
    name: 'General Study Assistant',
    description: 'Versatile AI tutor with access to all subjects. Helps with mathematics, history, programming, science, and language studies.',
    system_prompt: 'You are a versatile AI study assistant with broad knowledge across multiple subjects including mathematics, history, programming, biology, and language. You adapt your teaching style to the subject matter and student needs. You draw from the comprehensive knowledge base provided to give accurate, detailed answers. You can help with homework, explain concepts, provide examples, and guide students through complex topics across all disciplines.',
    temperature: 0.5,
    model: 'gpt-4o-mini',
    use_rag: true,
    max_context_chunks: 7,
    similarity_threshold: 0.65,
    visibility: 'marketplace',
    category: 'education',
    tags: ['general', 'multi-subject', 'education', 'tutor', 'learning'],
    documentCategories: ['Mathematics', 'History', 'Programming', 'Science', 'Language']
  }
];

// Demo conversation configurations
export interface SeedConversation {
  tutorName: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export const SEED_CONVERSATIONS: SeedConversation[] = [
  {
    tutorName: 'Calculus Professor',
    title: 'Understanding Derivatives',
    messages: [
      {
        role: 'user',
        content: 'Can you explain what a derivative is and why it is useful?'
      },
      {
        role: 'assistant',
        content: 'Great question! A derivative represents the instantaneous rate of change of a function at a specific point. Think of it like this: if you are driving a car and you look at your speedometer at a particular moment, it shows your instantaneous speed - that is essentially what a derivative tells us.\n\nFormally, the derivative of a function f at point x is defined as:\n\nf\'(x) = lim(h→0) [f(x + h) - f(x)]/h\n\nThis measures how much the function f changes as x changes by a tiny amount h, and then we take the limit as h approaches zero.\n\n**Why is it useful?**\n\n1. **Physics**: Derivatives describe velocity (rate of change of position) and acceleration (rate of change of velocity)\n2. **Optimization**: Finding maximum and minimum values - like maximizing profit or minimizing cost\n3. **Geometry**: The derivative gives us the slope of the tangent line to a curve\n4. **Economics**: Marginal cost, marginal revenue concepts\n\nWould you like me to work through a specific example?'
      },
      {
        role: 'user',
        content: 'Yes, can you find the derivative of f(x) = 3x² + 2x - 5?'
      },
      {
        role: 'assistant',
        content: 'Absolutely! Let\'s find the derivative step by step using the power rule.\n\nGiven: f(x) = 3x² + 2x - 5\n\n**The Power Rule states**: If f(x) = xⁿ, then f\'(x) = nxⁿ⁻¹\n\n**Step 1**: Apply the power rule to each term separately\n\n- For 3x²: derivative is 3 × 2x²⁻¹ = 6x\n- For 2x: derivative is 2 × 1x¹⁻¹ = 2\n- For -5: derivative is 0 (constant rule)\n\n**Step 2**: Combine the results\n\nf\'(x) = 6x + 2 + 0 = 6x + 2\n\n**Therefore**: f\'(x) = 6x + 2\n\n**What does this mean?**\n- At any point x, the slope of the tangent line to the curve is 6x + 2\n- For example, at x = 1: f\'(1) = 6(1) + 2 = 8 (slope is 8)\n- At x = -1: f\'(-1) = 6(-1) + 2 = -4 (slope is -4)\n\nWould you like to try finding where the function has a horizontal tangent line (where f\'(x) = 0)?'
      }
    ]
  },
  {
    tutorName: 'History Scholar',
    title: 'The Renaissance Art Revolution',
    messages: [
      {
        role: 'user',
        content: 'What made Renaissance art so revolutionary compared to medieval art?'
      },
      {
        role: 'assistant',
        content: 'Excellent question! Renaissance art represented a dramatic departure from medieval artistic traditions in several key ways:\n\n**1. Perspective and Realism**\nRenaissance artists like Brunelleschi developed mathematical perspective around 1415, allowing them to create the illusion of three-dimensional space on flat surfaces. Medieval art was often flat and symbolic, while Renaissance art aimed to mirror reality.\n\n**2. Humanism and Subject Matter**\nWhile medieval art focused almost exclusively on religious themes with stylized, idealized figures, Renaissance artists:\n- Studied human anatomy to create lifelike representations\n- Included portraits of real people, not just saints\n- Depicted classical mythology alongside Christian themes\n- Showed humans as noble, capable beings (reflecting humanist philosophy)\n\n**3. Technical Innovations**\n- **Sfumato**: Leonardo da Vinci\'s technique of soft, gradual transitions (visible in the Mona Lisa)\n- **Chiaroscuro**: Strong contrasts between light and dark to add depth and drama\n- **Oil painting**: Allowed for richer colors and finer details\n\n**4. The Artist as Individual**\nRenaissance artists like Michelangelo, Leonardo, and Raphael were celebrated as creative geniuses, not anonymous craftsmen. They signed their works and were commissioned by wealthy patrons.\n\nWould you like to know more about any specific Renaissance artist or technique?'
      }
    ]
  },
  {
    tutorName: 'Full-Stack Coding Mentor',
    title: 'TypeScript Generics Explained',
    messages: [
      {
        role: 'user',
        content: 'I am confused about TypeScript generics. Can you explain them with a practical example?'
      },
      {
        role: 'assistant',
        content: 'Great question! Generics are one of TypeScript\'s most powerful features. Let me explain with a practical example.\n\n**The Problem**: Imagine you want to create a function that returns the first element of an array. Without generics:\n\n```typescript\nfunction getFirst(arr: any[]): any {\n  return arr[0];\n}\n\nconst num = getFirst([1, 2, 3]);    // Type: any (not safe!)\nconst str = getFirst(["a", "b"]);   // Type: any (not safe!)\n```\n\nThe problem? We lost type safety! TypeScript doesn\'t know what type we\'ll get back.\n\n**The Solution: Generics**\n\n```typescript\nfunction getFirst<T>(arr: T[]): T {\n  return arr[0];\n}\n\nconst num = getFirst<number>([1, 2, 3]);    // Type: number ✅\nconst str = getFirst<string>(["a", "b"]);   // Type: string ✅\n\n// TypeScript can often infer the type:\nconst num2 = getFirst([1, 2, 3]);    // Inferred as number\nconst str2 = getFirst(["a", "b"]);   // Inferred as string\n```\n\n**What happened?**\n- `<T>` is a type parameter - a placeholder for a type\n- When you call the function, T gets replaced with the actual type\n- Now TypeScript maintains type safety throughout!\n\n**Practical Example: API Response**\n\n```typescript\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  message: string;\n}\n\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n// Type-safe API response\nconst userResponse: ApiResponse<User> = {\n  data: { id: 1, name: "Alice", email: "alice@example.com" },\n  status: 200,\n  message: "Success"\n};\n\n// TypeScript knows userResponse.data is a User!\nconsole.log(userResponse.data.name); // ✅ Type-safe\n```\n\nWould you like to see more advanced generic patterns, like constraints or multiple type parameters?'
      }
    ]
  }
];

