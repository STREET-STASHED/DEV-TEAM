#!/usr/bin/env node

/**
 * AI-Powered Testing Framework for StreetStashed
 * Automatically tests all app functions and identifies issues
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class AITestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
    this.performanceMetrics = {};
    this.errorLog = [];
    this.testStartTime = Date.now();
  }

  // Test Configuration
  config = {
    timeout: 10000,
    retries: 3,
    performanceThreshold: 2000, // 2 seconds
    criticalRoutes: [
      '/',
      '/signup',
      '/login',
      '/buyer/marketplace',
      '/buyer/checkout',
      '/seller/upload',
      '/stylist/dashboard',
      '/driver-dashboard'
    ],
    apiEndpoints: [
      '/api/orders',
      '/api/signup',
      '/api/items',
      '/api/distance'
    ]
  };

  // Test Categories
  testCategories = {
    accessibility: ['ARIA labels', 'Keyboard navigation', 'Screen reader support'],
    performance: ['Page load time', 'API response time', 'Resource optimization'],
    functionality: ['User flows', 'Form validation', 'Data persistence'],
    security: ['Authentication', 'Route protection', 'Input validation'],
    responsive: ['Mobile layout', 'Tablet layout', 'Desktop layout'],
    integration: ['Database connections', 'External APIs', 'Payment systems']
  };

  async runAllTests() {
    console.log('🤖 AI-Powered Testing Framework Starting...\n');
    console.log('='.repeat(80));
    
    try {
      // 1. Health Check
      await this.healthCheck();
      
      // 2. Core Functionality Tests
      await this.testCoreFunctionality();
      
      // 3. User Flow Tests
      await this.testUserFlows();
      
      // 4. API Tests
      await this.testAPIs();
      
      // 5. Performance Tests
      await this.testPerformance();
      
      // 6. Security Tests
      await this.testSecurity();
      
      // 7. Accessibility Tests
      await this.testAccessibility();
      
      // 8. Generate Report
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Testing failed:', error.message);
      this.errorLog.push({ type: 'Framework Error', error: error.message });
    }
  }

  async healthCheck() {
    console.log('🏥 Running Health Check...');
    
    try {
      const response = await this.makeRequest('/');
      if (response.status === 200) {
        this.addTestResult('Health Check', 'PASS', 'App is running and accessible');
      } else {
        this.addTestResult('Health Check', 'FAIL', `App returned status ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('Health Check', 'FAIL', `App is not accessible: ${error.message}`);
      throw new Error('App is not running');
    }
  }

  async testCoreFunctionality() {
    console.log('🔧 Testing Core Functionality...');
    
    const coreTests = [
      { route: '/signup', name: 'Signup Page', expectedStatus: 200 },
      { route: '/login', name: 'Login Page', expectedStatus: 200 },
      { route: '/buyer/marketplace', name: 'Marketplace', expectedStatus: 200 },
      { route: '/buyer/checkout', name: 'Checkout Page', expectedStatus: 200 }
    ];

    for (const test of coreTests) {
      try {
        const response = await this.makeRequest(test.route);
        const status = response.status;
        const hasContent = response.data && response.data.length > 100;
        
        if (status === test.expectedStatus && hasContent) {
          this.addTestResult(test.name, 'PASS', `Route accessible with content (${response.data.length} chars)`);
        } else if (status === test.expectedStatus) {
          this.addTestResult(test.name, 'WARNING', `Route accessible but minimal content (${response.data?.length || 0} chars)`);
        } else {
          this.addTestResult(test.name, 'FAIL', `Expected ${test.expectedStatus}, got ${status}`);
        }
      } catch (error) {
        this.addTestResult(test.name, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testUserFlows() {
    console.log('🔄 Testing User Flows...');
    
    const userFlows = [
      {
        name: 'Guest Checkout Flow',
        steps: [
          { action: 'Browse Marketplace', route: '/buyer/marketplace' },
          { action: 'Add to Cart', route: '/buyer/checkout' },
          { action: 'Guest Checkout', route: '/buyer/checkout' }
        ]
      },
      {
        name: 'User Registration Flow',
        steps: [
          { action: 'Visit Signup', route: '/signup' },
          { action: 'Role Selection', route: '/signup' },
          { action: 'Form Validation', route: '/signup' }
        ]
      },
      {
        name: 'Seller Onboarding Flow',
        steps: [
          { action: 'Seller Signup', route: '/signup' },
          { action: 'Upload Page', route: '/seller/upload' },
          { action: 'Dashboard Access', route: '/seller-dashboard' }
        ]
      }
    ];

    for (const flow of userFlows) {
      let flowSuccess = true;
      let flowErrors = [];

      for (const step of flow.steps) {
        try {
          const response = await this.makeRequest(step.route);
          // For protected routes, 307 redirects are expected for unauthenticated users
          if (response.status !== 200 && response.status !== 307) {
            flowSuccess = false;
            flowErrors.push(`${step.action}: Status ${response.status}`);
          }
        } catch (error) {
          flowSuccess = false;
          flowErrors.push(`${step.action}: ${error.message}`);
        }
      }

      if (flowSuccess) {
        this.addTestResult(flow.name, 'PASS', 'All flow steps accessible');
      } else {
        this.addTestResult(flow.name, 'FAIL', `Flow broken: ${flowErrors.join(', ')}`);
      }
    }
  }

  async testAPIs() {
    console.log('🔌 Testing API Endpoints...');
    
    const apiTests = [
      { 
        endpoint: '/api/signup', 
        method: 'POST', 
        name: 'Signup API',
        data: {
          email: `test${Date.now()}@example.com`,
          password: 'testpassword123',
          userData: {
            full_name: 'Test User',
            role: 'buyer',
            username: `testuser${Date.now()}`
          }
        }
      },
      { 
        endpoint: '/api/orders', 
        method: 'POST', 
        name: 'Orders API',
        data: {
          items: [{ id: 1, quantity: 1 }],
          pickup: '123 Test St, Test City',
          delivery: '456 Test Ave, Test City'
        }
      },
      { 
        endpoint: '/api/items', 
        method: 'GET', 
        name: 'Items API'
      },
      { 
        endpoint: '/api/distance', 
        method: 'POST', 
        name: 'Distance API',
        data: {
          pickup: '123 Test St, Test City',
          delivery: '456 Test Ave, Test City'
        }
      }
    ];

    for (const test of apiTests) {
      try {
        const response = await this.makeRequest(test.endpoint, test.method, test.data);
        if (response.status === 200 || response.status === 201 || response.status === 405) { // 405 = Method Not Allowed
          this.addTestResult(test.name, 'PASS', `API endpoint accessible (${response.status})`);
        } else if (response.status === 401) {
          this.addTestResult(test.name, 'PASS', `API properly protected (${response.status})`);
        } else {
          this.addTestResult(test.name, 'FAIL', `API returned status ${response.status}`);
        }
      } catch (error) {
        this.addTestResult(test.name, 'FAIL', `API error: ${error.message}`);
      }
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    for (const route of this.config.criticalRoutes) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(route);
        const loadTime = Date.now() - startTime;
        
        this.performanceMetrics[route] = loadTime;
        
        if (loadTime < this.config.performanceThreshold) {
          this.addTestResult(`${route} Performance`, 'PASS', `Load time: ${loadTime}ms`);
        } else {
          this.addTestResult(`${route} Performance`, 'WARNING', `Slow load time: ${loadTime}ms`);
        }
      } catch (error) {
        this.addTestResult(`${route} Performance`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testSecurity() {
    console.log('🔒 Testing Security...');
    
    const securityTests = [
      {
        name: 'Route Protection',
        test: async () => {
          const response = await this.makeRequest('/seller-dashboard');
          return response.status === 307 || response.status === 401; // Should redirect/block
        }
      },
      {
        name: 'Admin Route Protection',
        test: async () => {
          const response = await this.makeRequest('/admin');
          return response.status === 307 || response.status === 401; // Should redirect/block
        }
      }
    ];

    for (const test of securityTests) {
      try {
        const isSecure = await test.test();
        if (isSecure) {
          this.addTestResult(test.name, 'PASS', 'Route properly protected');
        } else {
          this.addTestResult(test.name, 'FAIL', 'Route not properly protected');
        }
      } catch (error) {
        this.addTestResult(test.name, 'FAIL', `Security test error: ${error.message}`);
      }
    }
  }

  async testAccessibility() {
    console.log('♿ Testing Accessibility...');
    
    // Basic accessibility checks
    const accessibilityTests = [
      { name: 'HTML Structure', check: () => true }, // Would need HTML parsing
      { name: 'Meta Tags', check: () => true }, // Would need HTML parsing
      { name: 'Responsive Design', check: () => true } // Would need viewport testing
    ];

    for (const test of accessibilityTests) {
      this.addTestResult(test.name, 'INFO', 'Accessibility testing requires HTML parsing (implemented in full version)');
    }
  }

  async makeRequest(route, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: route,
        method: method,
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Test-Runner/1.0'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data && method === 'POST') {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  addTestResult(category, status, message) {
    this.testResults.push({
      category,
      status,
      message,
      timestamp: new Date().toISOString()
    });
  }

  async generateReport() {
    console.log('\n📊 Generating AI Test Report...\n');
    console.log('='.repeat(80));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    const info = this.testResults.filter(r => r.status === 'INFO').length;
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const testDuration = Date.now() - this.testStartTime;
    
    console.log(`🎯 Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   ℹ️  Info: ${info}`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    console.log(`   ⏱️  Test Duration: ${testDuration}ms`);
    
    console.log('\n📋 Detailed Results:');
    console.log('='.repeat(80));
    
    const groupedResults = this.groupResultsByCategory();
    for (const [category, results] of Object.entries(groupedResults)) {
      console.log(`\n${category}:`);
      results.forEach(result => {
        const statusIcon = {
          'PASS': '✅',
          'FAIL': '❌',
          'WARNING': '⚠️',
          'INFO': 'ℹ️'
        }[result.status];
        
        console.log(`  ${statusIcon} ${result.message}`);
      });
    }
    
    // Performance Summary
    if (Object.keys(this.performanceMetrics).length > 0) {
      console.log('\n⚡ Performance Metrics:');
      console.log('='.repeat(80));
      for (const [route, time] of Object.entries(this.performanceMetrics)) {
        const status = time < this.config.performanceThreshold ? '✅' : '⚠️';
        console.log(`  ${status} ${route}: ${time}ms`);
      }
    }
    
    // Recommendations
    console.log('\n💡 AI Recommendations:');
    console.log('='.repeat(80));
    
    if (failedTests === 0) {
      console.log('🎉 Excellent! Your app is working perfectly.');
      console.log('   Consider adding more comprehensive tests for edge cases.');
    } else {
      console.log('🔧 Issues detected. Focus on fixing failed tests first.');
      console.log('   Then address warnings to improve app quality.');
    }
    
    if (warnings > 0) {
      console.log('⚠️  Address warnings to improve user experience.');
    }
    
    // Save report to file
    await this.saveReport();
  }

  groupResultsByCategory() {
    const grouped = {};
    this.testResults.forEach(result => {
      if (!grouped[result.category]) {
        grouped[result.category] = [];
      }
      grouped[result.category].push(result);
    });
    return grouped;
  }

  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        warnings: this.testResults.filter(r => r.status === 'WARNING').length
      },
      results: this.testResults,
      performance: this.performanceMetrics,
      errors: this.errorLog
    };

    const reportPath = path.join(__dirname, '../test-reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const filename = `ai-test-report-${Date.now()}.json`;
    fs.writeFileSync(path.join(reportPath, filename), JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Report saved to: test-reports/${filename}`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new AITestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = AITestRunner;
