#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file uses createRouteHandlerClient from @/lib/supabaseRouteHandler
    if (content.includes('createRouteHandlerClient') && content.includes('@/lib/supabaseRouteHandler')) {
      console.log(`Fixing imports in: ${filePath}`);
      
      // Replace the import
      content = content.replace(
        /import \{ createRouteHandlerClient \} from ['"]@\/lib\/supabaseRouteHandler['"]/g,
        "import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'"
      );

      // The function is already properly implemented, so we just need to ensure it's used correctly
      // Check if the function calls are properly awaited
      if (content.includes('const supabase = createRouteHandlerClient()')) {
        content = content.replace(
          /const supabase = createRouteHandlerClient\(\)/g,
          'const supabase = await createRouteHandlerClient()'
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
      } else {
        console.log(`✅ Already correct: ${filePath}`);
      }
    }

    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and fix all API route files
function fixAllApiRoutes(directory) {
  const files = fs.readdirSync(directory);
  let totalFixed = 0;

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      totalFixed += fixAllApiRoutes(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (fixImportsInFile(filePath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

// Main execution
console.log('🔧 Fixing all API route imports...\n');

const apiDirectory = path.join(process.cwd(), 'app', 'api');
const totalFixed = fixAllApiRoutes(apiDirectory);

console.log(`\n🎉 Fixed ${totalFixed} API route files!`);
console.log('\n✅ All API routes should now be using the correct async pattern.');
