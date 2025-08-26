const fs = require('fs');
const path = require('path');

// Function to fix import paths based on file depth
function fixImportPaths(content, filePath) {
  let fixedContent = content;
  
  // Calculate the relative path to lib/supabaseRouteHandler
  const relativePath = path.relative(path.dirname(filePath), path.join(process.cwd(), 'lib', 'supabaseRouteHandler'));
  
  // Fix the import path
  const importPattern = /import\s*\{\s*createRouteHandlerClient\s*\}\s*from\s*['"][^'"]*supabaseRouteHandler['"]/g;
  
  if (importPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      importPattern,
      `import { createRouteHandlerClient } from '${relativePath}'`
    );
  }
  
  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixImportPaths(content, filePath);
    
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
console.log('🔧 Fixing import paths for different API route depths...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with import path issues.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Fixed import paths based on file depth');
  console.log('- Calculated correct relative paths to supabaseRouteHandler');
  console.log('\n🚀 You can now run your build without module resolution errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
