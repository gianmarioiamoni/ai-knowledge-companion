# Supabase Setup Guide

## 🚀 Quick Start (Development Mode)

The application will work without Supabase configuration using mock data. You'll see a warning in the console, but all UI components will function normally.

## 🔧 Production Setup

To connect to a real Supabase instance:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Get API Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI Configuration (optional for now)
OPENAI_API_KEY=your-openai-api-key-here

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
```

### 4. Setup Database Schema

Run the SQL scripts in the `sql/` folder in your Supabase SQL editor:

1. **`sql/01_documents_schema.sql`** - Creates documents and document_chunks tables
2. **`sql/02_storage_setup.sql`** - Sets up file storage bucket

### 5. Enable Row Level Security (RLS)

The SQL scripts automatically enable RLS policies for security.

### 6. Restart Development Server

```bash
pnpm run dev
```

## 🧪 Mock Mode Features

When running without Supabase configuration:

- ✅ All UI components work normally
- ✅ File upload UI functions (files aren't actually stored)
- ✅ Document list shows empty state
- ✅ No errors or crashes
- ⚠️ Console warning about missing Supabase config
- ❌ No real data persistence

## 🔍 Troubleshooting

### "Supabase environment variables not found" Warning

This is normal if you haven't set up Supabase yet. The app will use mock data.

### Connection Errors

1. Check your `.env.local` file exists and has correct values
2. Verify your Supabase project is active
3. Ensure the API keys are correct
4. Restart the development server

### Database Errors

1. Make sure you've run the SQL scripts in your Supabase dashboard
2. Check that RLS policies are enabled
3. Verify your service role key has the correct permissions

## 📝 Next Steps

Once Supabase is configured:

1. Test file upload functionality
2. Verify document storage and retrieval
3. Set up OpenAI integration for embeddings
4. Configure authentication flows
