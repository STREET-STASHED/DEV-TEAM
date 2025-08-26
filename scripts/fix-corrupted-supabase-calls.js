const fs = require('fs');
const path = require('path');

// Function to fix corrupted supabase calls
function fixCorruptedSupabaseCalls(content) {
  let fixedContent = content;
  
  // Fix patterns like (await supabase)supabase.from
  const corruptedPattern1 = /\(await supabase\)supabase\.from\(/g;
  if (corruptedPattern1.test(fixedContent)) {
    fixedContent = fixedContent.replace(corruptedPattern1, 'supabase.from(');
  }
  
  // Fix patterns like (await supabase)(await supabase)...supabase.from
  const corruptedPattern2 = /\(await supabase\)+supabase\.from\(/g;
  if (corruptedPattern2.test(fixedContent)) {
    fixedContent = fixedContent.replace(corruptedPattern2, 'supabase.from(');
  }
  
  // Fix patterns like (await supabase)supabase.from
  const corruptedPattern3 = /\(await supabase\)\s*supabase\.from\(/g;
  if (corruptedPattern3.test(fixedContent)) {
    fixedContent = fixedContent.replace(corruptedPattern3, 'supabase.from(');
  }
  
  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixCorruptedSupabaseCalls(content);
    
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
console.log('🔧 Fixing corrupted supabase calls...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with corrupted supabase calls.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Fixed malformed supabase.from() calls');
  console.log('- Removed duplicate (await supabase) patterns');
  console.log('- Cleaned up syntax errors');
  console.log('\n🚀 You can now run your build without syntax errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
