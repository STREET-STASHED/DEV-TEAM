-- Diagnose Current Database Permissions
-- Run this in your Supabase SQL Editor to see exactly what's happening

-- 1. Check what tables exist and their RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check current RLS policies on each table
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

-- 3. Check current permissions for authenticated role
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated' 
    AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 4. Check schema permissions
SELECT 
    grantee,
    schema_name,
    privilege_type,
    is_grantable
FROM information_schema.schema_privileges 
WHERE grantee = 'authenticated' 
    AND schema_name = 'public';

-- 5. Check if we can actually query the tables (this will show the real error)
DO $$
DECLARE
    r RECORD;
    query_result TEXT;
BEGIN
    RAISE NOTICE 'Testing table access...';
    
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        BEGIN
            EXECUTE 'SELECT COUNT(*) FROM public.' || quote_ident(r.tablename);
            RAISE NOTICE '✅ Table % is accessible', r.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Table % access failed: %', r.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- 6. Check current user and role
SELECT 
    current_user,
    current_setting('role'),
    current_setting('search_path');

-- 7. Check if RLS is actually disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND rowsecurity = true;
