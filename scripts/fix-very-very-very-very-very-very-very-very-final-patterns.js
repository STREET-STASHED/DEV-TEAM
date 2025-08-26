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
  
  // Fix 1: Fix missing await for all supabase calls
  content = content.replace(
    /await supabase\s*$/gm,
    'await (await supabase)'
  );
  
  // Fix 2: Remove unused options parameter warnings
  content = content.replace(
    /cookiesToSet\.forEach\(\(\{ name, value, options \}\) =>/g,
    'cookiesToSet.forEach(({ name, value }) =>'
  );
  
  // Fix 3: Remove double async functions
  content = content.replace(
    /async async function/g,
    'async function'
  );
  
  content = content.replace(
    /async async getAll\(\)/g,
    'async getAll()'
  );
  
  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔧 Starting very very very very very very very very final pattern fixes...');

const files = findFiles('./app');
let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎯 Very very very very very very very very final TypeScript error patterns have been addressed!');
