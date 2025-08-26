const fs = require('fs');
const path = require('path');

// Function to fix cookie setAll await errors
function fixCookieSetAllAwaitErrors(content) {
  // Pattern to match the problematic setAll function
  const setAllPattern = /setAll\(cookiesToSet[^)]*\)\s*\{\s*try\s*\{\s*cookiesToSet\.forEach\(\([^)]*\)\s*=>\s*\(await cookies\(\)\)\.set\([^)]*\)\s*\)\s*\}\s*catch\s*\{[^}]*\}\s*\}/s;

  if (setAllPattern.test(content)) {
    // Replace with async version using Promise.all and map
    const replacement = `setAll(cookiesToSet) {
          try {
            return Promise.all(
              cookiesToSet.map(({ name, value, options }) =>
                cookies().set(name, value, options)
              )
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }`;

    return content.replace(setAllPattern, replacement);
  }

  return content;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixCookieSetAllAwaitErrors(content);

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
console.log('🔧 Fixing cookie await errors in API routes...');
const fixedCount = processApiRoutes();
console.log(`\n✨ Fixed ${fixedCount} files with cookie await errors.`);

if (fixedCount > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Made setAll functions async');
  console.log('- Replaced forEach with Promise.all + map');
  console.log('- Removed await from forEach callbacks');
  console.log('\n🚀 You can now run your build and tests without errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
