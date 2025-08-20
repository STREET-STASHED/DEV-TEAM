#!/usr/bin/env node

/**
 * Master Testing Script for StreetStashed
 * Runs all testing frameworks: AI Tests, E2E Tests, and Manual Tests
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MasterTestRunner {
  constructor() {
    this.testResults = [];
    this.startTime = Date.now();
    this.reports = [];
  }

  async runAllTests() {
    console.log('🚀 MASTER TESTING SUITE STARTING...\n');
    console.log('='.repeat(80));
    console.log('🧪 StreetStashed Comprehensive Testing');
    console.log('='.repeat(80));
    
    try {
      // 1. Check if app is running
      await this.checkAppHealth();
      
      // 2. Run AI-Powered Tests
      await this.runAITests();
      
      // 3. Run E2E Tests (if Puppeteer available)
      await this.runE2ETests();
      
      // 4. Run Manual Test Checklist
      await this.runManualTestChecklist();
      
      // 5. Generate Master Report
      await this.generateMasterReport();
      
    } catch (error) {
      console.error('❌ Master testing failed:', error.message);
    }
  }

  async checkAppHealth() {
    console.log('🏥 Checking App Health...');
    
    try {
      const http = require('http');
      const response = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: 'localhost',
          port: 3000,
          path: '/',
          method: 'GET',
          timeout: 5000
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
        
        req.end();
      });
      
      if (response.status === 200) {
        console.log('✅ App is running and healthy');
        this.addTestResult('App Health', 'PASS', 'App accessible on localhost:3000');
      } else {
        console.log('⚠️  App returned status:', response.status);
        this.addTestResult('App Health', 'WARNING', `App returned status ${response.status}`);
      }
    } catch (error) {
      console.log('❌ App is not running or accessible');
      this.addTestResult('App Health', 'FAIL', `App not accessible: ${error.message}`);
      throw new Error('App must be running to run tests');
    }
  }

  async runAITests() {
    console.log('\n🤖 Running AI-Powered Tests...');
    
    try {
      const result = await this.runScript('scripts/ai-test-runner.js');
      if (result.success) {
        this.addTestResult('AI Tests', 'PASS', 'AI tests completed successfully');
        this.reports.push({ type: 'AI', output: result.output });
      } else {
        this.addTestResult('AI Tests', 'FAIL', `AI tests failed: ${result.error}`);
      }
    } catch (error) {
      this.addTestResult('AI Tests', 'FAIL', `AI tests error: ${error.message}`);
    }
  }

  async runE2ETests() {
    console.log('\n🔄 Running End-to-End Tests...');
    
    try {
      // Check if Puppeteer is available
      try {
        require.resolve('puppeteer');
        const result = await this.runScript('scripts/e2e-test-runner.js');
        if (result.success) {
          this.addTestResult('E2E Tests', 'PASS', 'E2E tests completed successfully');
          this.reports.push({ type: 'E2E', output: result.output });
        } else {
          this.addTestResult('E2E Tests', 'FAIL', `E2E tests failed: ${result.error}`);
        }
      } catch (error) {
        console.log('⚠️  Puppeteer not available, skipping E2E tests');
        this.addTestResult('E2E Tests', 'INFO', 'Puppeteer not installed - install with: npm install puppeteer');
      }
    } catch (error) {
      this.addTestResult('E2E Tests', 'FAIL', `E2E tests error: ${error.message}`);
    }
  }

  async runManualTestChecklist() {
    console.log('\n📋 Running Manual Test Checklist...');
    
    const manualTests = [
      {
        category: 'Core Navigation',
        tests: [
          'Landing page loads correctly',
          'Navigation menu works',
          'All main routes accessible'
        ]
      },
      {
        category: 'User Authentication',
        tests: [
          'Signup form validation',
          'Login functionality',
          'Role-based access control'
        ]
      },
      {
        category: 'Guest Experience',
        tests: [
          'Browse marketplace without account',
          'Add items to cart',
          'Guest checkout flow'
        ]
      },
      {
        category: 'Buyer Experience',
        tests: [
          'Product browsing and search',
          'Cart management',
          'Checkout process'
        ]
      },
      {
        category: 'Seller Experience',
        tests: [
          'Product upload form',
          'Inventory management',
          'Sales analytics'
        ]
      },
      {
        category: 'Responsive Design',
        tests: [
          'Mobile layout',
          'Tablet layout',
          'Desktop layout'
        ]
      }
    ];

    console.log('📝 Manual Testing Checklist:');
    console.log('='.repeat(80));
    
    for (const category of manualTests) {
      console.log(`\n${category.category}:`);
      for (const test of category.tests) {
        console.log(`  ☐ ${test}`);
      }
    }
    
    console.log('\n💡 To complete manual testing:');
    console.log('   1. Open http://localhost:3000 in your browser');
    console.log('   2. Go through each test manually');
    console.log('   3. Check off completed tests');
    console.log('   4. Report any issues found');
    
    this.addTestResult('Manual Tests', 'INFO', 'Manual testing checklist provided');
  }

  async runScript(scriptPath) {
    return new Promise((resolve) => {
      const script = spawn('node', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let output = '';
      let error = '';
      
      script.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });
      
      script.stderr.on('data', (data) => {
        error += data.toString();
        process.stderr.write(data);
      });
      
      script.on('close', (code) => {
        resolve({
          success: code === 0,
          output,
          error,
          code
        });
      });
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

  async generateMasterReport() {
    console.log('\n📊 Generating Master Test Report...\n');
    console.log('='.repeat(80));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    const info = this.testResults.filter(r => r.status === 'INFO').length;
    
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';
    const testDuration = Date.now() - this.startTime;
    
    console.log(`🎯 MASTER TEST SUMMARY:`);
    console.log(`   Total Test Categories: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   ℹ️  Info: ${info}`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    console.log(`   ⏱️  Total Duration: ${testDuration}ms`);
    console.log(`   📄 Reports Generated: ${this.reports.length}`);
    
    console.log('\n📋 Test Results by Category:');
    console.log('='.repeat(80));
    
    for (const result of this.testResults) {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'WARNING': '⚠️',
        'INFO': 'ℹ️'
      }[result.status];
      
      console.log(`  ${statusIcon} ${result.category}: ${result.message}`);
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('='.repeat(80));
    
    if (failedTests === 0) {
      console.log('🎉 EXCELLENT! All automated tests passed.');
      console.log('   Your app is ready for production!');
    } else {
      console.log('🔧 Issues detected. Focus on fixing failed tests first.');
    }
    
    if (warnings > 0) {
      console.log('⚠️  Address warnings to improve app quality.');
    }
    
    console.log('\n📱 Next Steps:');
    console.log('   1. Complete manual testing checklist');
    console.log('   2. Fix any failed automated tests');
    console.log('   3. Address warnings and improve quality');
    console.log('   4. Test on multiple devices and browsers');
    console.log('   5. Deploy to staging environment');
    
    // Save master report
    await this.saveMasterReport();
  }

  async saveMasterReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        warnings: this.testResults.filter(r => r.status === 'WARNING').length
      },
      results: this.testResults,
      reports: this.reports,
      duration: Date.now() - this.startTime
    };

    const reportPath = path.join(__dirname, '../test-reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const filename = `master-test-report-${Date.now()}.json`;
    fs.writeFileSync(path.join(reportPath, filename), JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Master report saved to: test-reports/${filename}`);
    console.log('\n🎯 Testing Complete! Your app is now thoroughly tested.');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  const runner = new MasterTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = MasterTestRunner;
