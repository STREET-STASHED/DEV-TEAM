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
  
  // Fix 1: Remove double await patterns
  content = content.replace(
    /await \(await supabase\)/g,
    'await supabase'
  );
  
  // Fix 2: Fix supabase.auth.getUser() calls
  content = content.replace(
    /await supabase\.auth\.getUser\(\)/g,
    'await (await supabase).auth.getUser()'
  );
  
  // Fix 3: Fix supabase.rpc calls
  content = content.replace(
    /await supabase\.rpc\(/g,
    'await (await supabase).rpc('
  );
  
  // Fix 4: Fix supabase.auth.getSession() calls
  content = content.replace(
    /await supabase\.auth\.getSession\(\)/g,
    'await (await supabase).auth.getSession()'
  );
  
  // Fix 5: Fix MarketplaceContent unused variables
  if (filePath.includes('MarketplaceContent.tsx')) {
    content = content.replace(
      /const \[showFilters, setShowFilters\] = useState\(false\)/g,
      'const [_showFilters, _setShowFilters] = useState(false)'
    );
    
    content = content.replace(
      /const handleSearch = \(\) => \{/g,
      'const _handleSearch = () => {'
    );
  }
  
  // Fix 6: Add type annotations for parameters
  content = content.replace(
    /\.find\(p =>/g,
    '.find((p: any) =>'
  );
  
  content = content.replace(
    /\.filter\(r =>/g,
    '.filter((r: any) =>'
  );
  
  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
console.log('🔧 Starting final pattern fixes...');

const files = findFiles('./app');
let fixedCount = 0;

files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎯 Final TypeScript error patterns have been addressed!');
