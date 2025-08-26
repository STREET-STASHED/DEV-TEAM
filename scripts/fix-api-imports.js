#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file uses createRouteHandlerClient
    if (content.includes('createRouteHandlerClient')) {
      console.log(`Fixing imports in: ${filePath}`);
      
      // Replace import
      content = content.replace(
        /import \{ createRouteHandlerClient \} from '@supabase\/ssr'/g,
        "import { createServerClient } from '@supabase/ssr'"
      );

      // Add helper function after imports
      const helperFunction = `
function createSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies().set(name, value, options)
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}`;

      // Insert helper function after imports
      const importEndIndex = content.indexOf('export');
      if (importEndIndex !== -1) {
        content = content.slice(0, importEndIndex) + helperFunction + '\n\n' + content.slice(importEndIndex);
      }

      // Replace all function calls
      content = content.replace(/createRouteHandlerClient\(\{ cookies \}\)/g, 'createSupabaseClient()');

      fs.writeFileSync(filePath, content);
      modified = true;
    }

    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and fix API route files
function fixApiRoutes(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixApiRoutes(fullPath);
    } else if (item === 'route.ts' && fullPath.includes('/api/')) {
      fixImportsInFile(fullPath);
    }
  }
}

// Main execution
console.log('🔧 Fixing API route imports...');

const apiDir = path.join(__dirname, '..', 'app', 'api');
if (fs.existsSync(apiDir)) {
  fixApiRoutes(apiDir);
  console.log('✅ API route imports fixed!');
} else {
  console.log('❌ API directory not found');
}
