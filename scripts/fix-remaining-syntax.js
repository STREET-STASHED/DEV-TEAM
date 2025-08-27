#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that still need syntax fixes
const filesToFix = [
  'app/api/analytics/alerts/route.ts',
  'app/api/cart/route.ts',
  'app/api/notification-preferences/route.ts',
  'app/api/notifications/route.ts',
  'app/api/personalization/profile/route.ts',
  'app/api/reviews/route.ts',
  'app/api/social/challenges/route.ts',
  'app/api/social/posts/route.ts',
  'app/api/user-measurements/route.ts',
  'app/api/user-style-profiles/route.ts',
  'app/api/wishlist/route.ts'
];

function fixQuerySyntax(content) {
  // Fix patterns where query<Tables<'table'>>( is missing supabase.from
  content = content.replace(
    /query<Tables<'([^']+)'>>\(\s*\n\s*\.select\(/g,
    "query<Tables<'$1'>>(\n  supabase.from('$1')\n    .select("
  );

  content = content.replace(
    /query<Tables<'([^']+)'>>\(\s*\n\s*\.update\(/g,
    "query<Tables<'$1'>>(\n  supabase.from('$1')\n    .update("
  );

  content = content.replace(
    /query<Tables<'([^']+)'>>\(\s*\n\s*\.delete\(/g,
    "query<Tables<'$1'>>(\n  supabase.from('$1')\n    .delete("
  );

  content = content.replace(
    /query<Tables<'([^']+)'>>\(\s*\n\s*\.insert\(/g,
    "query<Tables<'$1'>>(\n  supabase.from('$1')\n    .insert("
  );

  // Fix patterns where query<Tables<'table'>>( is followed by .select( on the same line
  content = content.replace(
    /query<Tables<'([^']+)'>>\(\s*\.select\(/g,
    "query<Tables<'$1'>>(\n  supabase.from('$1')\n    .select("
  );

  // Fix missing closing parentheses for select
  content = content.replace(
    /\.select\([^)]*\)\s*\n\s*\)\s*$/gm,
    ".select($1)\n  )"
  );

  // Fix missing closing parentheses for other methods
  content = content.replace(
    /\.update\([^)]*\)\s*\n\s*\)\s*$/gm,
    ".update($1)\n  )"
  );

  content = content.replace(
    /\.delete\([^)]*\)\s*\n\s*\)\s*$/gm,
    ".delete()\n  )"
  );

  content = content.replace(
    /\.insert\([^)]*\)\s*\n\s*\)\s*$/gm,
    ".insert($1)\n  )"
  );

  // Fix specific patterns that are causing issues
  content = content.replace(
    /\.select\([^)]*\)\s*\n\s*\)\s*\n\s*\.single\(\)/g,
    ".select($1)\n  )\n        .single()"
  );

  content = content.replace(
    /\.select\([^)]*\)\s*\n\s*\)\s*\n\s*\.maybeSingle\(\)/g,
    ".select($1)\n  )\n        .maybeSingle()"
  );

  // Fix missing supabase.from calls that are causing the "Declaration or statement expected" errors
  content = content.replace(
    /query<Tables<'([^']+)'>>\(\s*\n\s*\)\s*$/gm,
    "query<Tables<'$1'>>(\n  supabase.from('$1')\n    .select('*')\n  )"
  );

  return content;
}

function processFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Fix query syntax
    content = fixQuerySyntax(content);

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🔧 Fixing remaining query<T> syntax issues...\n');

filesToFix.forEach(processFile);

console.log('\n✨ Syntax fix complete!');
console.log('📝 Note: You may need to manually adjust some type parameters and closing parentheses.');
