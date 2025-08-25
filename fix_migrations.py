#!/usr/bin/env python3
"""
Script to automatically add 'public.' schema prefix to migration files
"""

import os
import re
import glob

def fix_migration_file(file_path):
    """Fix a single migration file by adding public. schema prefixes"""
    print(f"Fixing {file_path}...")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Patterns to fix
    patterns = [
        # CREATE TABLE without public.
        (r'CREATE TABLE IF NOT EXISTS ([a-zA-Z_][a-zA-Z0-9_]*)', r'CREATE TABLE IF NOT EXISTS public.\1'),
        (r'CREATE TABLE ([a-zA-Z_][a-zA-Z0-9_]*)', r'CREATE TABLE public.\1'),
        
        # ALTER TABLE without public.
        (r'ALTER TABLE ([a-zA-Z_][a-zA-Z0-9_]*)', r'ALTER TABLE public.\1'),
        
        # CREATE INDEX without public.
        (r'CREATE INDEX [^O]*ON ([a-zA-Z_][a-zA-Z0-9_]*)', r'CREATE INDEX \g<0> ON public.\1'),
        
        # CREATE POLICY without public.
        (r'CREATE POLICY [^O]*ON ([a-zA-Z_][a-zA-Z0-9_]*)', r'CREATE POLICY \g<0> ON public.\1'),
        
        # DROP POLICY without public.
        (r'DROP POLICY [^O]*ON ([a-zA-Z_][a-zA-Z0-9_]*)', r'DROP POLICY \g<0> ON public.\1'),
        
        # CREATE TRIGGER without public.
        (r'CREATE TRIGGER [^O]*ON ([a-zA-Z_][a-zA-Z0-9_]*)', r'CREATE TRIGGER \g<0> ON public.\1'),
        
        # DROP TRIGGER without public.
        (r'DROP TRIGGER [^O]*ON ([a-zA-Z_][a-zA-Z0-9_]*)', r'DROP TRIGGER \g<0> ON public.\1'),
        
        # GRANT without public.
        (r'GRANT [^O]*ON ([a-zA-Z_][a-zA-Z0-9_]*)', r'GRANT \g<0> ON public.\1'),
        
        # Function calls without public. (but not CREATE OR REPLACE FUNCTION)
        (r'(?<!CREATE OR REPLACE )FUNCTION ([a-zA-Z_][a-zA-Z0-9_]*)', r'FUNCTION public.\1'),
        
        # EXECUTE FUNCTION without public.
        (r'EXECUTE FUNCTION ([a-zA-Z_][a-zA-Z0-9_]*)', r'EXECUTE FUNCTION public.\1'),
        
        # References to tables without public. in FROM, JOIN, etc.
        (r'FROM ([a-zA-Z_][a-zA-Z0-9_]*)', r'FROM public.\1'),
        (r'JOIN ([a-zA-Z_][a-zA-Z0-9_]*)', r'JOIN public.\1'),
        (r'UPDATE ([a-zA-Z_][a-zA-Z0-9_]*)', r'UPDATE public.\1'),
        (r'DELETE FROM ([a-zA-Z_][a-zA-Z0-9_]*)', r'DELETE FROM public.\1'),
        (r'INSERT INTO ([a-zA-Z_][a-zA-Z0-9_]*)', r'INSERT INTO public.\1'),
        
        # References in WHERE clauses
        (r'WHERE ([a-zA-Z_][a-zA-Z0-9_]*\.)', r'WHERE public.\1'),
        
        # References in EXISTS subqueries
        (r'EXISTS \(SELECT [^)]*FROM ([a-zA-Z_][a-zA-Z0-9_]*)', r'EXISTS (SELECT \g<0> FROM public.\1'),
    ]
    
    # Apply patterns
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    # Write back to file
    with open(file_path, 'w') as f:
        f.write(content)
    
    print(f"Fixed {file_path}")

def main():
    """Main function to fix all migration files"""
    migrations_dir = "supabase/migrations"
    
    # Get all SQL migration files
    migration_files = glob.glob(os.path.join(migrations_dir, "*.sql"))
    
    print(f"Found {len(migration_files)} migration files")
    
    # Fix each file
    for file_path in sorted(migration_files):
        fix_migration_file(file_path)
    
    print("All migration files have been fixed!")

if __name__ == "__main__":
    main()
