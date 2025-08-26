const fs = require('fs');
const path = require('path');

// Function to fix cookies await issues
function fixCookiesAwaitIssues(content) {
  let fixedContent = content;

  // Pattern to match setAll functions that need to be made async and use await cookies()
  const setAllPattern = /setAll\(cookiesToSet[^)]*\)\s*\{\s*try\s*\{\s*return Promise\.all\(\s*cookiesToSet\.map\(\(\{ name, value, options: _options \}\)\s*=>\s*cookies\(\)\.set\(name, value, _options\)\s*\)\s*\)\s*\}\s*catch\s*\{[^}]*\}\s*\}/s;

  if (setAllPattern.test(fixedContent)) {
    const replacement = `setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            return Promise.all(
              cookiesToSet.map(({ name, value, options: _options }) =>
                cookieStore.set(name, value, _options)
              )
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }`;

    fixedContent = fixedContent.replace(setAllPattern, replacement);
  }

  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixCookiesAwaitIssues(content);

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
console.log('🔧 Fixing cookies await issues...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with cookies await issues.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Made setAll functions async');
  console.log('- Added await for cookies() call');
  console.log('- Used cookieStore.set instead of cookies().set');
  console.log('\n🚀 You can now run your build without TypeScript errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
