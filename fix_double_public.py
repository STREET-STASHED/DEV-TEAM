#!/usr/bin/env python3
"""
Script to fix double 'public.' prefixes in migration files
"""

import os
import re
import glob

def fix_double_public(file_path):
    """Fix double public. prefixes in a single migration file"""
    print(f"Fixing double public. in {file_path}...")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix double public. prefixes
    patterns = [
        (r'public\.public\.', 'public.'),
        (r'public\.IF NOT EXISTS public\.', 'IF NOT EXISTS public.'),
        (r'public\.ON public\.', 'ON public.'),
        (r'public\.FOR public\.', 'FOR public.'),
        (r'public\.USING public\.', 'USING public.'),
        (r'public\.WITH public\.', 'WITH public.'),
        (r'public\.CHECK public\.', 'CHECK public.'),
        (r'public\.REFERENCES public\.', 'REFERENCES public.'),
        (r'public\.JOIN public\.', 'JOIN public.'),
        (r'public\.FROM public\.', 'FROM public.'),
        (r'public\.UPDATE public\.', 'UPDATE public.'),
        (r'public\.DELETE FROM public\.', 'DELETE FROM public.'),
        (r'public\.INSERT INTO public\.', 'INSERT INTO public.'),
        (r'public\.WHERE public\.', 'WHERE public.'),
        (r'public\.EXISTS \(SELECT [^)]*FROM public\.', 'EXISTS (SELECT \g<0> FROM public.'),
        (r'public\.EXECUTE FUNCTION public\.', 'EXECUTE FUNCTION public.'),
        (r'public\.GRANT [^O]*ON public\.', 'GRANT \g<0> ON public.'),
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
        fix_double_public(file_path)
    
    print("All double public. prefixes have been fixed!")

if __name__ == "__main__":
    main()
