const fs = require('fs');
const path = require('path');

// Function to fix destructuring issues
function fixDestructuringIssues(content) {
  let fixedContent = content;

  // Fix the destructuring pattern to use options: _options
  const destructuringPattern = /cookiesToSet\.map\(\(\{ name, value, _options \}\)\s*=>/g;

  if (destructuringPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      destructuringPattern,
      'cookiesToSet.map(({ name, value, options: _options }) =>'
    );
  }

  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixDestructuringIssues(content);

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
console.log('🔧 Fixing final destructuring issues...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with destructuring issues.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Fixed destructuring to use options: _options');
  console.log('- This ensures TypeScript compatibility');
  console.log('\n🚀 You can now run your build without TypeScript errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
