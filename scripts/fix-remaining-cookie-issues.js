const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to fix a file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix 1: Make cookie getAll functions async
  if (content.includes('getAll() {') && content.includes('const cookieStore = await cookies()')) {
    content = content.replace(
      /getAll\(\)\s*{\s*\n\s*const cookieStore = await cookies\(\)/g,
      'async getAll() {\n          const cookieStore = await cookies()'
    );
    modified = true;
  }
  
  // Fix 2: Fix supabase client calls that need await
  content = content.replace(
    /await \(await supabase\)/g,
    'await supabase'
  );
  
  content = content.replace(
    /await supabase\.auth\.getSession\(\)/g,
    'await (await supabase).auth.getSession()'
  );
  
  // Fix 3: Fix .from() calls to use await
  content = content.replace(
    /\.from\(/g,
    '(await supabase).from('
  );
  
  // Fix 4: Fix await supabase calls
  content = content.replace(
    /await supabase\s*$/gm,
    'await (await supabase)'
  );
  
  // Fix 5: Add missing imports for createServerClient
  if (content.includes('createRouteHandlerClient(') && !content.includes("import { createServerClient }")) {
    if (content.includes("import { createRouteHandlerClient }")) {
      content = content.replace(
        "import { createRouteHandlerClient }",
        "import { createServerClient }"
      );
      modified = true;
    }
  }
  
  // Fix 6: Replace createRouteHandlerClient calls
  content = content.replace(
    /createRouteHandlerClient\(\)/g,
    'createSupabaseClient()'
  );
  
  // Fix 7: Fix cookies() calls to be awaited
  content = content.replace(
    /cookies\(\)\.getAll\(\)/g,
    '(await cookies()).getAll()'
  );
  
  content = content.replace(
    /cookies\(\)\.set\(/g,
    '(await cookies()).set('
  );
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔧 Starting cookie and supabase client fixes...');

const files = findFiles('./app');
let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎯 Cookie async issues and supabase client calls have been addressed!');
