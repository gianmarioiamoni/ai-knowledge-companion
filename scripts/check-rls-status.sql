-- Script per verificare lo stato delle RLS policies
-- Esegui questo script nella console SQL di Supabase

-- 1. Verifica se RLS è abilitato per tutte le tabelle
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled' 
        ELSE '❌ RLS Disabled' 
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'profiles', 
        'documents', 
        'document_chunks', 
        'tutors', 
        'tutor_documents', 
        'conversations', 
        'messages', 
        'usage_logs'
    )
ORDER BY tablename;

-- 2. Conta il numero di policies per ogni tabella
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 
        'documents', 
        'document_chunks', 
        'tutors', 
        'tutor_documents', 
        'conversations', 
        'messages', 
        'usage_logs'
    )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 3. Lista tutte le policies attive
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Verifica se ci sono tabelle senza policies (potenziale problema di sicurezza)
SELECT 
    t.tablename,
    COALESCE(p.policy_count, 0) as policy_count,
    CASE 
        WHEN COALESCE(p.policy_count, 0) = 0 THEN '⚠️ No Policies' 
        ELSE '✅ Has Policies' 
    END as status
FROM (
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
        AND tablename IN (
            'profiles', 
            'documents', 
            'document_chunks', 
            'tutors', 
            'tutor_documents', 
            'conversations', 
            'messages', 
            'usage_logs'
        )
) t
LEFT JOIN (
    SELECT tablename, COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
) p ON t.tablename = p.tablename
ORDER BY t.tablename;
