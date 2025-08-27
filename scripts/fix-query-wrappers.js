#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Patterns to find and replace
const patterns = [
  // Pattern 1: const { data, error } = await supabase.from(...)
  {
    find: /const\s*\{\s*data[^}]*\}\s*=\s*await\s+supabase\s*\.\s*from\s*\(/g,
    replace: (match) => {
      // Extract the table name from the match
      const tableMatch = match.match(/\.from\s*\(['"`]([^'"`]+)['"`]/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        return `const { data, error } = await query<Tables<'${tableName}'>>(\n      supabase.from(`;
      }
      return match;
    }
  },

  // Pattern 2: const { data, error } = await supabase.from(...) without query wrapper
  {
    find: /const\s*\{\s*data[^}]*\}\s*=\s*await\s+supabase\s*\.\s*from\s*\([^)]+\)\s*\.\s*select/g,
    replace: (match) => {
      // Extract the table name from the match
      const tableMatch = match.match(/\.from\s*\(['"`]([^'"`]+)['"`]/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        return `const { data, error } = await query<Tables<'${tableName}'>>(\n      supabase.from('${tableName}').select`;
      }
      return match;
    }
  }
];

// Files to process
const apiFiles = [
  'app/api/admin/route.ts',
  'app/api/analytics/alerts/route.ts',
  'app/api/analytics/forecasts/route.ts',
  'app/api/analytics/pricing/route.ts',
  'app/api/analytics/trends/route.ts',
  'app/api/auth/signup/route.ts',
  'app/api/auth/status/route.ts',
  'app/api/cart/route.ts',
  'app/api/disputes/route.ts',
  'app/api/leaderboard/referrals/route.ts',
  'app/api/notification-preferences/route.ts',
  'app/api/orders/route.ts',
  'app/api/personalization/enhanced-recommendations/route.ts',
  'app/api/personalization/insights/route.ts',
  'app/api/personalization/profile/route.ts',
  'app/api/personalization/recommendations/route.ts',
  'app/api/recommendations/route.ts',
  'app/api/referrals/route.ts',
  'app/api/reviews/route.ts',
  'app/api/social/challenges/route.ts',
  'app/api/social/posts/route.ts',
  'app/api/user-measurements/route.ts',
  'app/api/user-rewards/route.ts',
  'app/api/user-style-profiles/route.ts',
  'app/api/wishlist/route.ts'
];

function addQueryImport(content) {
  if (!content.includes("import { query }")) {
    const importMatch = content.match(/import\s+.*from\s+['"`]@\/lib\/supabase\/database\.types['"`]/);
    if (importMatch) {
      const newImport = "import { query } from '@/lib/supabase/typed';\n";
      return content.replace(importMatch[0], newImport + importMatch[0]);
    }
  }
  return content;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Add query import if missing
    content = addQueryImport(content);

    // Apply patterns
    patterns.forEach(pattern => {
      content = content.replace(pattern.find, pattern.replace);
    });

    // If content changed, write it back
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('🔧 Adding query<T> wrappers to Supabase calls...\n');

apiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    processFile(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✨ Done! Run "pnpm tsc --noEmit" to check remaining errors.');
