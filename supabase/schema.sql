-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT,
  length_tokens INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create document_chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-large dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tutors table
CREATE TABLE IF NOT EXISTS tutors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'marketplace')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tutor_documents junction table
CREATE TABLE IF NOT EXISTS tutor_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, document_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  title TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage_logs table for billing/analytics
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tutor_id UUID REFERENCES tutors(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  api_calls INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost_estimate DECIMAL(10,6) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_tutors_owner_id ON tutors(owner_id);
CREATE INDEX IF NOT EXISTS idx_tutors_visibility ON tutors(visibility);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for documents
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public documents" ON documents
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for document_chunks
CREATE POLICY "Users can view chunks of accessible documents" ON document_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND (documents.owner_id = auth.uid() OR documents.visibility = 'public')
    )
  );

CREATE POLICY "Users can insert chunks for own documents" ON document_chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chunks of own documents" ON document_chunks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chunks of own documents" ON document_chunks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_chunks.document_id 
      AND documents.owner_id = auth.uid()
    )
  );

-- RLS Policies for tutors
CREATE POLICY "Users can view own tutors" ON tutors
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public tutors" ON tutors
  FOR SELECT USING (visibility IN ('public', 'marketplace'));

CREATE POLICY "Users can insert own tutors" ON tutors
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own tutors" ON tutors
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own tutors" ON tutors
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for tutor_documents
CREATE POLICY "Users can manage own tutor documents" ON tutor_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tutors 
      WHERE tutors.id = tutor_documents.tutor_id 
      AND tutors.owner_id = auth.uid()
    )
  );

-- RLS Policies for conversations
CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can manage messages in own conversations" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- RLS Policies for usage_logs
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage logs" ON usage_logs
  FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
