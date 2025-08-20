#!/usr/bin/env node

/**
 * Simple App Feature Test Script
 * Run with: node scripts/test-app-features.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_ROUTES = [
  { path: '/', name: 'Landing Page' },
  { path: '/signup', name: 'Signup Page' },
  { path: '/login', name: 'Login Page' },
  { path: '/buyer/marketplace', name: 'Buyer Marketplace' },
  { path: '/buyer/checkout', name: 'Buyer Checkout' },
  { path: '/seller/upload', name: 'Seller Upload' },
  { path: '/seller-dashboard', name: 'Seller Dashboard' },
  { path: '/stylist/dashboard', name: 'Stylist Dashboard' },
  { path: '/driver-dashboard', name: 'Driver Dashboard' },
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/onboarding', name: 'Onboarding' },
  { path: '/referrals', name: 'Referrals' },
  { path: '/rewards', name: 'Rewards' },
  { path: '/curation', name: 'Curation' },
  { path: '/ai-recommendations-demo', name: 'AI Recommendations Demo' },
  { path: '/ar-demo', name: 'AR Demo' },
  { path: '/analytics-demo', name: 'Analytics Demo' },
  { path: '/personalization-demo', name: 'Personalization Demo' },
  { path: '/social-commerce-demo', name: 'Social Commerce Demo' }
];

function testRoute(path, name) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const working = status === 200;
        const hasContent = data.length > 100;
        
        resolve({
          name,
          path,
          status,
          working,
          hasContent,
          error: null
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        name,
        path,
        status: 0,
        working: false,
        hasContent: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name,
        path,
        status: 0,
        working: false,
        hasContent: false,
        error: 'Timeout'
      });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing StreetStashed App Features...\n');
  console.log('Testing routes on:', BASE_URL);
  console.log('='.repeat(60));

  const results = [];
  
  for (const route of TEST_ROUTES) {
    process.stdout.write(`Testing ${route.name.padEnd(25)}... `);
    const result = await testRoute(route.path, route.name);
    results.push(result);
    
    if (result.working && result.hasContent) {
      console.log('✅ Working');
    } else if (result.working) {
      console.log('⚠️  Accessible but no content');
    } else {
      console.log(`❌ Failed (${result.status || result.error})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(60));

  const working = results.filter(r => r.working && r.hasContent).length;
  const accessible = results.filter(r => r.working).length;
  const total = results.length;

  console.log(`✅ Fully Working: ${working}/${total}`);
  console.log(`⚠️  Accessible: ${accessible}/${total}`);
  console.log(`❌ Failed: ${total - accessible}/${total}`);

  if (working === total) {
    console.log('\n🎉 All features are working perfectly!');
  } else if (accessible === total) {
    console.log('\n⚠️  All routes accessible but some may need content');
  } else {
    console.log('\n❌ Some routes are not working - check the details above');
  }

  // Show failed routes
  const failed = results.filter(r => !r.working);
  if (failed.length > 0) {
    console.log('\n🔍 Failed Routes:');
    failed.forEach(r => {
      console.log(`  ${r.name}: ${r.path} - ${r.error || `Status ${r.status}`}`);
    });
  }

  // Show routes needing content
  const noContent = results.filter(r => r.working && !r.hasContent);
  if (noContent.length > 0) {
    console.log('\n📝 Routes Needing Content:');
    noContent.forEach(r => {
      console.log(`  ${r.name}: ${r.path}`);
    });
  }
}

// Check if dev server is running first
testRoute('/', 'Health Check').then(result => {
  if (result.working) {
    runTests();
  } else {
    console.log('❌ Dev server not running!');
    console.log('Please start with: pnpm dev');
    process.exit(1);
  }
});
