# Profiles Schema - Important Notes

## ⚠️ Schema Already Exists

The `profiles` table **already exists** in the database from `supabase/schema.sql`.

### Existing Schema (from `supabase/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Existing RLS Policies

```sql
-- Users can view own profile
-- Users can update own profile
-- Users can insert own profile
```

## Migration Script

Instead of running `09_profiles_schema.sql` (which will fail with duplicate policy errors), run:

```bash
psql < sql/10_profiles_migration.sql
```

### What the Migration Does

1. **Adds `full_name` column** (if not exists) - for backward compatibility
2. **Creates/updates trigger** to auto-create profile on user signup
3. **Creates avatars storage bucket** (if not exists)
4. **Sets up storage policies** for avatar uploads

### Column Mapping

| New Code | Database Column | Fallback |
|----------|----------------|----------|
| `full_name` | `full_name` (new) | `display_name` (existing) |
| `display_name` | `display_name` | - |
| `bio` | `bio` | - |
| `avatar_url` | `avatar_url` | - |
| `settings` | `settings` (JSONB) | - |

### TypeScript Types

The `Profile` interface supports both columns:

```typescript
export interface Profile {
  id: string
  avatar_url?: string
  display_name?: string  // From existing schema
  full_name?: string     // New column
  bio?: string
  settings?: Record<string, any>
  email?: string
  created_at: string
  updated_at: string
}
```

### UI Behavior

- Profile form uses `full_name || display_name` for name display
- Avatar uses `full_name || display_name || email` for fallback initials
- Updates are saved to `full_name` by default

## Files to Delete

- ❌ `sql/09_profiles_schema.sql` - Use migration instead

