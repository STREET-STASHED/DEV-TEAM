#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to fix cookies usage in a file
function fixCookiesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file uses cookies() function
    if (content.includes('cookies()') && content.includes('createServerClient')) {
      console.log(`Fixing cookies in: ${filePath}`);
      
      // Replace the createServerClient pattern to await cookies
      const oldPattern = /const supabase = createServerClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\s*\{\s*cookies:\s*\{\s*getAll\(\)\s*\{\s*return cookies\(\)\.getAll\(\)\s*\}\s*,\s*setAll\(cookiesToSet\)\s*\{\s*try\s*\{\s*cookiesToSet\.forEach\(\(\{ name, value, options \}\) =>\s*cookies\(\)\.set\(name, value, options\)\s*\)\s*\}\s*catch\s*\{\s*\/\/ The \`setAll\` method was called from a Server Component\.\s*\/\/ This can be ignored if you have middleware refreshing\s*\/\/ user sessions\.\s*\}\s*,\s*\}\s*,\s*\}\s*\)/g;
      
      const newPattern = `const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The \`setAll\` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )`;

      if (oldPattern.test(content)) {
        content = content.replace(oldPattern, newPattern);
        modified = true;
      }

      // Also fix the helper function pattern if it exists
      const helperPattern = /function createSupabaseClient\(\)\s*\{\s*return createServerClient\(\s*process\.env\.NEXT_PUBLIC_SUPABASE_URL!,\s*process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\s*\{\s*cookies:\s*\{\s*getAll\(\)\s*\{\s*return cookies\(\)\.getAll\(\)\s*\}\s*,\s*setAll\(cookiesToSet\)\s*\{\s*try\s*\{\s*cookiesToSet\.forEach\(\(\{ name, value, options \}\) =>\s*cookies\(\)\.set\(name, value, options\)\s*\)\s*\}\s*catch\s*\{\s*\/\/ The \`setAll\` method was called from a Server Component\.\s*\/\/ This can be ignored if you have middleware refreshing\s*\/\/ user sessions\.\s*\}\s*,\s*\}\s*,\s*\}\s*\)\s*\}/g;
      
      const newHelperPattern = `async function createSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The \`setAll\` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}`;

      if (helperPattern.test(content)) {
        content = content.replace(helperPattern, newHelperPattern);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    }

    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and fix API route files
function fixApiRoutes(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      fixApiRoutes(fullPath);
    } else if (item === 'route.ts' && fullPath.includes('/api/')) {
      fixCookiesInFile(fullPath);
    }
  }
}

// Main execution
console.log('🔧 Fixing cookies async usage in API routes...');

const apiDir = path.join(__dirname, '..', 'app', 'api');
if (fs.existsSync(apiDir)) {
  fixApiRoutes(apiDir);
  console.log('✅ Cookies async usage fixed!');
} else {
  console.log('❌ API directory not found');
}
