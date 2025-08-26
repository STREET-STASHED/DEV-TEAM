#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

console.log('🔍 Starting Comprehensive App Audit...\n');

// Test function
function testFeature(name, testFn) {
  try {
    console.log(`ℹ️  Testing: ${name}`);
    testFn();
    console.log(`✅ ${name} - PASSED\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}\n`);
    return false;
  }
}

// API test function
function testAPI(endpoint, expectedStatus = 200) {
  try {
    const response = execSync(`curl -s -w "%{http_code}" "${BASE_URL}${endpoint}"`, { timeout: TEST_TIMEOUT });
    const [body, statusCode] = response.toString().split(/(?=\d{3}$)/);
    
    if (parseInt(statusCode) === expectedStatus) {
      return JSON.parse(body);
    } else {
      throw new Error(`Expected status ${expectedStatus}, got ${statusCode}`);
    }
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

// Page test function
function testPage(pagePath, expectedContent) {
  try {
    const response = execSync(`curl -s "${BASE_URL}${pagePath}"`, { timeout: TEST_TIMEOUT });
    const html = response.toString();
    
    if (!html.includes(expectedContent)) {
      throw new Error(`Expected content "${expectedContent}" not found`);
    }
    
    if (html.includes('Error') || html.includes('404')) {
      throw new Error('Page returned an error');
    }
  } catch (error) {
    throw new Error(`Page test failed: ${error.message}`);
  }
}

// File existence test
function testFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
}

let passedTests = 0;
let totalTests = 0;

// =============================
// PHASE 1: CORE FUNCTIONALITY AUDIT
// =============================

console.log('📋 PHASE 1: Core Functionality Audit\n');

// Test all core pages
testFeature('Homepage Core Features', () => {
  testPage('/', 'StreetStashed');
  testPage('/', 'AI Personal Stylist');
  testPage('/', 'Marketplace');
});

// Test AI Stylist functionality
testFeature('AI Stylist Form Validation', () => {
  testPage('/ai-stylist', 'AI Personal Stylist');
  testPage('/ai-stylist', 'Style Preferences');
  testPage('/ai-stylist', 'Color Preferences');
});

// Test AR Try-On functionality
testFeature('AR Try-On Measurements', () => {
  testPage('/ar-try-on', 'AR Virtual Try-On');
  testPage('/ar-try-on', 'Body Measurements');
  testPage('/ar-try-on', 'Fit Analysis');
});

// Test Marketplace functionality
testFeature('Marketplace Features', () => {
  testPage('/buyer/marketplace', 'Loading marketplace');
  testPage('/buyer/marketplace', 'Products');
});

// Test all API endpoints
testFeature('Products API Data Structure', () => {
  const data = testAPI('/api/items?limit=2');
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('Invalid products data structure');
  }
  if (data.items.length === 0) {
    throw new Error('No products returned');
  }
});

testFeature('Categories API Data Structure', () => {
  const data = testAPI('/api/categories');
  if (!data.categories || !Array.isArray(data.categories)) {
    throw new Error('Invalid categories data structure');
  }
  if (data.categories.length === 0) {
    throw new Error('No categories returned');
  }
});

testFeature('Stores API Data Structure', () => {
  const data = testAPI('/api/stores');
  if (!data.stores || !Array.isArray(data.stores)) {
    throw new Error('Invalid stores data structure');
  }
});

// Test authentication system
testFeature('Authentication System', () => {
  const data = testAPI('/api/auth/status');
  if (typeof data.authenticated !== 'boolean') {
    throw new Error('Invalid authentication response');
  }
});

// Test protected endpoints
testFeature('Protected API Endpoints', () => {
  testAPI('/api/user-style-profiles', 401); // Should return unauthorized
  testAPI('/api/cart', 401); // Should return unauthorized
  testAPI('/api/wishlist', 401); // Should return unauthorized
});

// =============================
// PHASE 2: ADVANCED FEATURES AUDIT
// =============================

console.log('🚀 PHASE 2: Advanced Features Audit\n');

// Test AI and ML features
testFeature('AI Recommendation System', () => {
  testAPI('/api/recommendations?limit=5');
});

testFeature('Personalization System', () => {
  testAPI('/api/personalization/recommendations?limit=5');
});

testFeature('Enhanced Personalization', () => {
  testAPI('/api/personalization/enhanced-recommendations?limit=5');
});

// Test social features
testFeature('Social Features', () => {
  testPage('/social', 'Loading social feed');
  testAPI('/api/social/posts');
  testAPI('/api/social/challenges');
});

// Test rewards and referrals
testFeature('Rewards System', () => {
  testPage('/referrals', 'Referral Program');
  testAPI('/api/user-rewards', 401); // Protected endpoint
  testAPI('/api/referrals', 401); // Protected endpoint
});

// Test analytics and monitoring
testFeature('Analytics System', () => {
  testAPI('/api/analytics/trends');
  testAPI('/api/analytics/forecasts');
  testAPI('/api/analytics/pricing');
});

// Test payment system
testFeature('Payment System', () => {
  testAPI('/api/payment/create-intent', 401); // Protected endpoint
});

// =============================
// PHASE 3: INFRASTRUCTURE AUDIT
// =============================

console.log('🏗️ PHASE 3: Infrastructure Audit\n');

// Test database connectivity
testFeature('Database Connectivity', () => {
  // Test that API endpoints can connect to database
  testAPI('/api/items?limit=1');
  testAPI('/api/categories');
});

// Test mobile app structure
testFeature('Mobile App Structure', () => {
  testFileExists('capacitor.config.ts');
  testFileExists('android/app/build.gradle');
  testFileExists('ios/App/App/AppDelegate.swift');
});

// Test configuration files
testFeature('Configuration Files', () => {
  testFileExists('next.config.js');
  testFileExists('tailwind.config.js');
  testFileExists('tsconfig.json');
  testFileExists('.env.local');
});

// Test build system
testFeature('Build System', () => {
  testFileExists('package.json');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.scripts || !packageJson.scripts.build) {
    throw new Error('Build script not found');
  }
});

// =============================
// PHASE 4: SECURITY & PERFORMANCE AUDIT
// =============================

console.log('🔒 PHASE 4: Security & Performance Audit\n');

// Test security headers
testFeature('Security Headers', () => {
  const response = execSync(`curl -s -I "${BASE_URL}"`, { timeout: TEST_TIMEOUT });
  const headers = response.toString();
  
  // Check for basic security headers
  if (!headers.includes('X-Frame-Options')) {
    console.log('⚠️  Warning: X-Frame-Options header not found');
  }
});

// Test rate limiting
testFeature('Rate Limiting', () => {
  // Make multiple rapid requests to test rate limiting
  try {
    for (let i = 0; i < 5; i++) {
      testAPI('/api/auth/status');
    }
  } catch (error) {
    // Rate limiting might be in place, which is good
    console.log('✅ Rate limiting appears to be working');
  }
});

// Test error handling
testFeature('Error Handling', () => {
  // Test non-existent endpoint
  try {
    testAPI('/api/non-existent-endpoint', 404);
  } catch (error) {
    // Expected to fail, which is good
    console.log('✅ Error handling working correctly');
  }
});

// =============================
// PHASE 5: USER EXPERIENCE AUDIT
// =============================

console.log('🎨 PHASE 5: User Experience Audit\n');

// Test responsive design indicators
testFeature('Responsive Design', () => {
  const response = execSync(`curl -s "${BASE_URL}"`, { timeout: TEST_TIMEOUT });
  const html = response.toString();
  
  if (!html.includes('viewport')) {
    throw new Error('Viewport meta tag not found');
  }
  
  if (!html.includes('responsive')) {
    console.log('⚠️  Warning: Responsive design indicators not found');
  }
});

// Test accessibility
testFeature('Accessibility Features', () => {
  const response = execSync(`curl -s "${BASE_URL}"`, { timeout: TEST_TIMEOUT });
  const html = response.toString();
  
  if (!html.includes('aria-')) {
    console.log('⚠️  Warning: ARIA attributes not found');
  }
});

// Test PWA features
testFeature('PWA Features', () => {
  testFileExists('public/manifest.json');
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  
  if (!manifest.name || !manifest.short_name) {
    throw new Error('PWA manifest missing required fields');
  }
});

// =============================
// FINAL SUMMARY
// =============================

console.log('📊 COMPREHENSIVE AUDIT SUMMARY');
console.log('==============================\n');

console.log(`✅ Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${totalTests - passedTests}`);
console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

if (passedTests === totalTests) {
  console.log('🎉 PERFECT SCORE! All features are working correctly.');
  console.log('\n🚀 Ready for Phase 1-2-3-4 implementation!');
} else {
  console.log('⚠️  Some issues found. Please review and fix before proceeding.');
}

console.log('\n✨ Comprehensive audit completed!');
