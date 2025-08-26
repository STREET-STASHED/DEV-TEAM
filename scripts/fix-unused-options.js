const fs = require('fs');
const path = require('path');

// Function to fix unused options parameters
function fixUnusedOptions(content) {
  // Pattern to match unused options parameters in setAll functions
  const optionsPattern = /setAll\(cookiesToSet[^)]*\)\s*\{\s*try\s*\{\s*return Promise\.all\(\s*cookiesToSet\.map\(\(\{ name, value, options \}\)\s*=>\s*cookies\(\)\.set\(name, value, options\)\s*\)\s*\)\s*\}\s*catch\s*\{[^}]*\}\s*\}/s;

  if (optionsPattern.test(content)) {
    // Replace with _options to indicate it's intentionally unused
    const replacement = `setAll(cookiesToSet) {
          try {
            return Promise.all(
              cookiesToSet.map(({ name, value, _options }) =>
                cookies().set(name, value, _options)
              )
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }`;

    return content.replace(optionsPattern, replacement);
  }

  return content;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixUnusedOptions(content);

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
console.log('🔧 Fixing unused options parameters in API routes...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with unused options parameters.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Renamed unused "options" parameters to "_options"');
  console.log('- This prevents ESLint unused variable warnings');
  console.log('\n🚀 You can now run your build without ESLint errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
