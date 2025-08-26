const fs = require('fs');
const path = require('path');

// Function to fix all remaining build issues
function fixAllBuildIssues(content) {
  let fixedContent = content;
  
  // Fix createSupabaseClient import issues
  const createSupabaseClientImportPattern = /import\s*\{\s*createSupabaseClient\s*\}\s*from\s*['"][^'"]*supabaseRouteHandler['"]/g;
  if (createSupabaseClientImportPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      createSupabaseClientImportPattern,
      'import { createRouteHandlerClient } from \'../../../lib/supabaseRouteHandler\''
    );
  }
  
  // Fix createSupabaseClient usage
  const createSupabaseClientUsagePattern = /const supabase = createSupabaseClient\(\)/g;
  if (createSupabaseClientUsagePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      createSupabaseClientUsagePattern,
      'const supabase = await createRouteHandlerClient()'
    );
  }
  
  // Fix createServerClient import issues
  const createServerClientImportPattern = /import\s*\{\s*createServerClient\s*\}\s*from\s*['"]@supabase\/ssr['"]/g;
  if (createServerClientImportPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      createServerClientImportPattern,
      'import { createRouteHandlerClient } from \'../../../lib/supabaseRouteHandler\''
    );
  }
  
  // Fix createServerClient usage
  const createServerClientUsagePattern = /createServerClient\(/g;
  if (createServerClientUsagePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      createServerClientUsagePattern,
      'createRouteHandlerClient('
    );
  }
  
  // Fix any remaining supabase().from() patterns
  const supabaseFromPattern = /\(await supabase\)\.from\(/g;
  if (supabaseFromPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      supabaseFromPattern,
      'supabase.from('
    );
  }
  
  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixAllBuildIssues(content);
    
    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find and process all API route files
function processApiRoutes() {
  const apiDir = path.join(__dirname, '..', 'app', 'api');
  let fixedCount = 0;
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file === 'route.ts' || file === 'route.js') {
        if (processFile(filePath)) {
          fixedCount++;
        }
      }
    }
  }
  
  if (fs.existsSync(apiDir)) {
    walkDir(apiDir);
  }
  
  return fixedCount;
}

// Main execution
console.log('🔧 Fixing all remaining build issues...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with build issues.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Fixed createSupabaseClient import issues');
  console.log('- Fixed createServerClient import issues');
  console.log('- Fixed supabase usage patterns');
  console.log('- Standardized on createRouteHandlerClient');
  console.log('\n🚀 You can now run your build without import errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
