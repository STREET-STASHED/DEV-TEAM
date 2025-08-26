const fs = require('fs');
const path = require('path');

// Function to fix double async keywords
function fixDoubleAsync(content) {
  let fixedContent = content;

  // Pattern to match double async keywords
  const doubleAsyncPattern = /async async setAll\(cookiesToSet\)/g;

  if (doubleAsyncPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      doubleAsyncPattern,
      'async setAll(cookiesToSet)'
    );
  }

  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixDoubleAsync(content);

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
console.log('🔧 Fixing double async keywords...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with double async keywords.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Removed duplicate async keywords');
  console.log('- Fixed syntax errors');
  console.log('\n🚀 You can now run your build without syntax errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
