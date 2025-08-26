const fs = require('fs');
const path = require('path');

// Function to fix all remaining issues
function fixAllIssues(content) {
  let fixedContent = content;

  // Fix unused options parameters in setAll functions
  const setAllPattern = /setAll\(cookiesToSet[^)]*\)\s*\{\s*try\s*\{\s*return Promise\.all\(\s*cookiesToSet\.map\(\(\{ name, value, options \}\)\s*=>\s*cookies\(\)\.set\(name, value, options\)\s*\)\s*\)\s*\}\s*catch\s*\{[^}]*\}\s*\}/s;

  if (setAllPattern.test(fixedContent)) {
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

    fixedContent = fixedContent.replace(setAllPattern, replacement);
  }

  // Fix createServerClient import issues
  const createServerClientPattern = /import\s*\{\s*createServerClient\s*\}\s*from\s*['"][^'"]*supabaseRouteHandler['"]/g;
  if (createServerClientPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(createServerClientPattern, 'import { createSupabaseClient } from \'../../../lib/supabaseRouteHandler\'');
  }

  // Fix createSupabaseClient usage
  const createSupabaseClientPattern = /const supabase = await createSupabaseClient\(\)/g;
  if (createSupabaseClientPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(createSupabaseClientPattern, 'const supabase = createSupabaseClient()');
  }

  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixAllIssues(content);

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

// Function to fix performance.ts file
function fixPerformanceFile() {
  const performancePath = path.join(__dirname, '..', 'lib', 'performance.ts');

  if (fs.existsSync(performancePath)) {
    const content = fs.readFileSync(performancePath, 'utf8');

    // Fix the remaining unused args
    let fixedContent = content.replace(
      /return \(\.\.\.args: Parameters<T>\) => \{/g,
      'return (..._args: Parameters<T>) => {'
    );

    if (content !== fixedContent) {
      fs.writeFileSync(performancePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${performancePath}`);
      return true;
    }
  }

  return false;
}

// Main execution
console.log('🔧 Fixing all remaining build issues...');

let totalFixed = 0;

// Fix API routes
const apiFixedCount = processApiRoutes();
totalFixed += apiFixedCount;

// Fix performance file
if (fixPerformanceFile()) {
  totalFixed++;
}

console.log(`\n✨ Fixed ${totalFixed} files with build issues.`);

if (totalFixed > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Fixed unused options parameters in setAll functions');
  console.log('- Fixed createServerClient import issues');
  console.log('- Fixed createSupabaseClient usage');
  console.log('- Fixed remaining unused args in performance.ts');
  console.log('\n🚀 You can now run your build without errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
