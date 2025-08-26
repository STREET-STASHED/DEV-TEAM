const fs = require('fs');
const path = require('path');

// Function to fix remaining cookie patterns
function fixRemainingCookiePatterns(content) {
  let fixedContent = content;

  // Pattern for files that use cookieStore.set directly
  const cookieStorePattern = /cookiesToSet\.forEach\(\(\{ name, value, options \}\)\s*=>\s*cookieStore\.set\(name, value\)\s*\)/g;

  if (cookieStorePattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      cookieStorePattern,
      'cookiesToSet.forEach(({ name, value, _options }) => cookieStore.set(name, value, _options))'
    );
  }

  // Pattern for files that use cookies().set directly
  const cookiesSetPattern = /cookiesToSet\.forEach\(\(\{ name, value, options \}\)\s*=>\s*cookies\(\)\.set\(name, value\)\s*\)/g;

  if (cookiesSetPattern.test(fixedContent)) {
    fixedContent = fixedContent.replace(
      cookiesSetPattern,
      'cookiesToSet.forEach(({ name, value, _options }) => cookies().set(name, value, _options))'
    );
  }

  return fixedContent;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixedContent = fixRemainingCookiePatterns(content);

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

// List of specific files that need fixing
const filesToFix = [
  'app/api/auth/signout/route.ts',
  'app/api/auth/signup/route.ts',
  'app/api/cart/route.ts',
  'app/api/disputes/[id]/route.ts',
  'app/api/disputes/route.ts',
  'app/api/notification-preferences/route.ts',
  'app/api/orders/route.ts',
  'app/api/payment/create-intent/route.ts',
  'app/api/personalization/enhanced-recommendations/route.ts',
  'app/api/personalization/insights/route.ts',
  'app/api/personalization/profile/route.ts',
  'app/api/personalization/recommendations/route.ts',
  'app/api/recommendations/route.ts',
  'app/api/referrals/route.ts',
  'app/api/reviews/route.ts',
  'app/api/share/signed-link/route.ts',
  'app/api/social/challenges/route.ts',
  'app/api/social/interactions/route.ts',
  'app/api/social/posts/route.ts',
  'app/api/user-measurements/route.ts',
  'app/api/user-rewards/route.ts',
  'app/api/user-style-profiles/route.ts',
  'app/api/wishlist/route.ts'
];

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
console.log('🔧 Fixing remaining cookie patterns...');

let totalFixed = 0;

// Fix specific files
for (const filePath of filesToFix) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    if (processFile(fullPath)) {
      totalFixed++;
    }
  }
}

// Fix performance file
if (fixPerformanceFile()) {
  totalFixed++;
}

console.log(`\n✨ Fixed ${totalFixed} files with remaining cookie patterns.`);

if (totalFixed > 0) {
  console.log('\n📝 The following changes were made:');
  console.log('- Fixed unused options parameters in forEach callbacks');
  console.log('- Fixed remaining unused args in performance.ts');
  console.log('\n🚀 You can now run your build without ESLint errors!');
} else {
  console.log('\n✅ No files needed fixing.');
}
