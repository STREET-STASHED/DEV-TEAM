#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find files
function findFiles(dir, extensions, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== '.next') {
      findFiles(fullPath, extensions, files);
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix escaped quotes in a file
function fixEscapedQuotes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix escaped apostrophes
    const originalContent = content;
    
    // Replace various escaped quote patterns
    content = content.replace(/\\'/g, "'");
    content = content.replace(/\\"/g, '"');
    
    // Check if content was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed escaped quotes in: ${filePath}`);
      modified = true;
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🔍 Searching for files with escaped quotes...');
  
  // Find all TypeScript/TSX files in components folder
  const componentsFiles = findFiles('components', ['.ts', '.tsx']);
  
  let totalFiles = componentsFiles.length;
  let modifiedFiles = 0;
  
  componentsFiles.forEach(filePath => {
    if (fixEscapedQuotes(filePath)) {
      modifiedFiles++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - modifiedFiles}`);
  
  if (modifiedFiles > 0) {
    console.log('\n🎉 Escaped quotes fixed successfully!');
  } else {
    console.log('\n✨ No escaped quotes found to fix.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixEscapedQuotes };
