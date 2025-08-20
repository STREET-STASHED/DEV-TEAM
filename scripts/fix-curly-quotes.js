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

// Function to fix curly quotes in a file
function fixCurlyQuotes(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix curly quotes in 'use client' directives
    const originalContent = content;
    
    // Replace various curly quote patterns with straight quotes
    content = content.replace(/[""]use client[""]/g, "'use client'");
    content = content.replace(/['']use client['']/g, "'use client'");
    content = content.replace(/[""]use client[""]/g, "'use client'");
    content = content.replace(/['']use client['']/g, "'use client'");
    
    // Check if content was modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed curly quotes in: ${filePath}`);
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
  console.log('🔍 Searching for files with curly quotes...');
  
  // Find all TypeScript/TSX files in components and app folders
  const componentsFiles = findFiles('components', ['.ts', '.tsx']);
  const appFiles = findFiles('app', ['.ts', '.tsx']);
  const allFiles = [...componentsFiles, ...appFiles];
  
  let totalFiles = allFiles.length;
  let modifiedFiles = 0;
  
  allFiles.forEach(filePath => {
    if (fixCurlyQuotes(filePath)) {
      modifiedFiles++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files checked: ${totalFiles}`);
  console.log(`   Files modified: ${modifiedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - modifiedFiles}`);
  
  if (modifiedFiles > 0) {
    console.log('\n🎉 Curly quotes fixed successfully!');
  } else {
    console.log('\n✨ No curly quotes found to fix.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixCurlyQuotes };
