const fs = require('fs');
const path = require('path');

// Function to fix all corrupted patterns
function fixAllCorruptedPatterns(content) {
  let fixedContent = content;
  
  // Fix the most complex pattern: multiple (await supabase) followed by supabase.from
  const complexPattern = /\(await supabase\)+supabase\.from\(/g;
  if (complexPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(complexPattern, 'supabase.from(');
  }
  
  // Fix any remaining (await supabase) patterns before supabase.from
  const remainingPattern = /\(await supabase\)\s*supabase\.from\(/g;
  if (remainingPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(remainingPattern, 'supabase.from(');
  }
  
  // Fix any standalone (await supabase) that might be left
  const standalonePattern = /\(await supabase\)/g;
  if (standalonePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(standalonePattern, '');
  }
  
  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixAllCorruptedPatterns(content);
    
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
console.log('🔧 Fixing all remaining corrupted patterns...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with corrupted patterns.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Fixed complex (await supabase) patterns');
  console.log('- Cleaned up all corrupted supabase calls');
  console.log('- Removed standalone (await supabase)');
  console.log('\n🚀 You can now run your build without syntax errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
