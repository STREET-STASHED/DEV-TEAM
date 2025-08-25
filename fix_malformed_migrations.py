#!/usr/bin/env python3
"""
Script to fix malformed migration statements
"""

import os
import re
import glob

def fix_malformed_statements(file_path):
    """Fix malformed statements in a single migration file"""
    print(f"Fixing malformed statements in {file_path}...")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix various malformed patterns
    patterns = [
        # Fix double CREATE POLICY
        (r'CREATE POLICY CREATE POLICY', 'CREATE POLICY'),
        
        # Fix double DROP POLICY
        (r'DROP POLICY DROP POLICY', 'DROP POLICY'),
        
        # Fix "ON public ON public."
        (r'ON public ON public\.', 'ON public.'),
        
        # Fix "UPDATE public.USING"
        (r'UPDATE public\.USING', 'UPDATE USING'),
        
        # Fix "FROM public.auth.users" (should be "FROM auth.users")
        (r'FROM public\.auth\.users', 'FROM auth.users'),
        
        # Fix "FROM public.driver_profiles" (should be "FROM public.driver_profiles" - this is correct)
        # But fix any double references
        (r'FROM public\.public\.', 'FROM public.'),
        
        # Fix any remaining double public references
        (r'public\.public\.', 'public.'),
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
        fix_malformed_statements(file_path)
    
    print("All malformed statements have been fixed!")

if __name__ == "__main__":
    main()
