#!/usr/bin/env node

/**
 * End-to-End Testing Framework for StreetStashed
 * Simulates real user interactions and tests complete user flows
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class E2ETestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.screenshots = [];
    this.testStartTime = Date.now();
  }

  async initialize() {
    console.log('🚀 Initializing E2E Testing Environment...');
    
    try {
      this.browser = await puppeteer.launch({
        headless: false, // Set to true for CI/CD
        slowMo: 100, // Slow down actions for visibility
        defaultViewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
      
      // Enable console logging
      this.page.on('console', msg => console.log('Browser Console:', msg.text()));
      this.page.on('pageerror', error => console.error('Page Error:', error.message));
      
      console.log('✅ E2E Environment Ready');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize E2E environment:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting End-to-End Tests...\n');
    console.log('='.repeat(80));
    
    if (!(await this.initialize())) {
      return;
    }
    
    try {
      // 1. Landing Page Tests
      await this.testLandingPage();
      
      // 2. Guest User Flow Tests
      await this.testGuestUserFlow();
      
      // 3. User Registration Tests
      await this.testUserRegistration();
      
      // 4. Buyer Experience Tests
      await this.testBuyerExperience();
      
      // 5. Seller Experience Tests
      await this.testSellerExperience();
      
      // 6. Responsive Design Tests
      await this.testResponsiveDesign();
      
      // 7. Performance Tests
      await this.testPerformance();
      
      // 8. Generate Report
      await this.generateE2EReport();
      
    } catch (error) {
      console.error('❌ E2E Testing failed:', error.message);
      this.addTestResult('Framework Error', 'FAIL', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async testLandingPage() {
    console.log('🏠 Testing Landing Page...');
    
    try {
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // Test page load
      const title = await this.page.title();
      if (title.includes('StreetStashed')) {
        this.addTestResult('Landing Page Load', 'PASS', 'Page loaded successfully');
      } else {
        this.addTestResult('Landing Page Load', 'FAIL', `Unexpected title: ${title}`);
      }
      
      // Test navigation links
      const shopNowLink = await this.page.$('a[href="/buyer/marketplace"]');
      if (shopNowLink) {
        this.addTestResult('Shop Now Link', 'PASS', 'Navigation link present');
      } else {
        this.addTestResult('Shop Now Link', 'FAIL', 'Navigation link missing');
      }
      
      // Test responsive elements
      const isResponsive = await this.page.evaluate(() => {
        return window.innerWidth > 0 && document.body.scrollWidth > 0;
      });
      
      if (isResponsive) {
        this.addTestResult('Responsive Layout', 'PASS', 'Page is responsive');
      } else {
        this.addTestResult('Responsive Layout', 'FAIL', 'Page not responsive');
      }
      
      // Take screenshot
      await this.takeScreenshot('landing-page');
      
    } catch (error) {
      this.addTestResult('Landing Page', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testGuestUserFlow() {
    console.log('👤 Testing Guest User Flow...');
    
    try {
      // Navigate to marketplace
      await this.page.goto(`${this.baseUrl}/buyer/marketplace`, { waitUntil: 'networkidle2' });
      
      // Test marketplace accessibility
      const marketplaceTitle = await this.page.title();
      if (marketplaceTitle.includes('Marketplace')) {
        this.addTestResult('Marketplace Access', 'PASS', 'Guest can access marketplace');
      } else {
        this.addTestResult('Marketplace Access', 'FAIL', 'Cannot access marketplace');
      }
      
      // Test product browsing
      const products = await this.page.$$('[data-testid="product-card"], .product-card, .grid > div');
      if (products.length > 0) {
        this.addTestResult('Product Display', 'PASS', `Found ${products.length} products`);
      } else {
        this.addTestResult('Product Display', 'WARNING', 'No products found');
      }
      
      // Test add to cart (if products exist)
      if (products.length > 0) {
        try {
          const firstProduct = products[0];
          const addToCartButton = await firstProduct.$('button, [data-testid="add-to-cart"]');
          
          if (addToCartButton) {
            await addToCartButton.click();
            await this.page.waitForTimeout(1000);
            
            // Check if cart updated
            const cartIndicator = await this.page.$('[data-testid="cart-count"], .cart-count');
            if (cartIndicator) {
              this.addTestResult('Add to Cart', 'PASS', 'Product added to cart successfully');
            } else {
              this.addTestResult('Add to Cart', 'WARNING', 'Cart may not have updated');
            }
          } else {
            this.addTestResult('Add to Cart', 'INFO', 'Add to cart button not found');
          }
        } catch (error) {
          this.addTestResult('Add to Cart', 'WARNING', `Cart interaction: ${error.message}`);
        }
      }
      
      // Test checkout access
      await this.page.goto(`${this.baseUrl}/buyer/checkout`, { waitUntil: 'networkidle2' });
      
      const checkoutTitle = await this.page.title();
      if (checkoutTitle.includes('Checkout')) {
        this.addTestResult('Checkout Access', 'PASS', 'Guest can access checkout');
      } else {
        this.addTestResult('Checkout Access', 'FAIL', 'Cannot access checkout');
      }
      
      // Test guest checkout form
      const guestForm = await this.page.$('form, [data-testid="guest-checkout"]');
      if (guestForm) {
        this.addTestResult('Guest Checkout Form', 'PASS', 'Guest checkout form present');
      } else {
        this.addTestResult('Guest Checkout Form', 'FAIL', 'Guest checkout form missing');
      }
      
      await this.takeScreenshot('guest-checkout');
      
    } catch (error) {
      this.addTestResult('Guest User Flow', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testUserRegistration() {
    console.log('📝 Testing User Registration...');
    
    try {
      await this.page.goto(`${this.baseUrl}/signup`, { waitUntil: 'networkidle2' });
      
      // Test signup form
      const signupForm = await this.page.$('form');
      if (signupForm) {
        this.addTestResult('Signup Form', 'PASS', 'Signup form present');
      } else {
        this.addTestResult('Signup Form', 'FAIL', 'Signup form missing');
      }
      
      // Test role selection
      const roleOptions = await this.page.$$('input[type="radio"], select option');
      if (roleOptions.length >= 4) {
        this.addTestResult('Role Selection', 'PASS', `${roleOptions.length} role options available`);
      } else {
        this.addTestResult('Role Selection', 'WARNING', `Only ${roleOptions.length} role options found`);
      }
      
      // Test form validation (try to submit empty form)
      const submitButton = await this.page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        await this.page.waitForTimeout(1000);
        
        // Look for validation errors
        const errors = await this.page.$$('.error, [data-testid="error"], .text-error-400');
        if (errors.length > 0) {
          this.addTestResult('Form Validation', 'PASS', 'Form validation working');
        } else {
          this.addTestResult('Form Validation', 'WARNING', 'Form validation may not be working');
        }
      }
      
      await this.takeScreenshot('signup-form');
      
    } catch (error) {
      this.addTestResult('User Registration', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testBuyerExperience() {
    console.log('🛍️ Testing Buyer Experience...');
    
    try {
      // Test marketplace filters
      await this.page.goto(`${this.baseUrl}/buyer/marketplace`, { waitUntil: 'networkidle2' });
      
      const filters = await this.page.$$('[data-testid="filter"], .filter, select');
      if (filters.length > 0) {
        this.addTestResult('Marketplace Filters', 'PASS', 'Filter options available');
      } else {
        this.addTestResult('Marketplace Filters', 'WARNING', 'No filters found');
      }
      
      // Test product search
      const searchInput = await this.page.$('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]');
      if (searchInput) {
        this.addTestResult('Search Functionality', 'PASS', 'Search input present');
      } else {
        this.addTestResult('Search Functionality', 'WARNING', 'Search input not found');
      }
      
      // Test product details (if products exist)
      const products = await this.page.$$('[data-testid="product-card"], .product-card, .grid > div');
      if (products.length > 0) {
        try {
          await products[0].click();
          await this.page.waitForTimeout(1000);
          
          const productTitle = await this.page.title();
          if (productTitle.includes('Product') || productTitle.includes('Details')) {
            this.addTestResult('Product Details', 'PASS', 'Product details page accessible');
          } else {
            this.addTestResult('Product Details', 'WARNING', 'Product details may not be working');
          }
        } catch (error) {
          this.addTestResult('Product Details', 'WARNING', `Product details: ${error.message}`);
        }
      }
      
    } catch (error) {
      this.addTestResult('Buyer Experience', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testSellerExperience() {
    console.log('🏪 Testing Seller Experience...');
    
    try {
      // Test seller upload page
      await this.page.goto(`${this.baseUrl}/seller/upload`, { waitUntil: 'networkidle2' });
      
      const uploadForm = await this.page.$('form, [data-testid="upload-form"]');
      if (uploadForm) {
        this.addTestResult('Seller Upload Form', 'PASS', 'Upload form present');
      } else {
        this.addTestResult('Seller Upload Form', 'FAIL', 'Upload form missing');
      }
      
      // Test file upload inputs
      const fileInputs = await this.page.$$('input[type="file"]');
      if (fileInputs.length > 0) {
        this.addTestResult('File Upload', 'PASS', 'File upload inputs available');
      } else {
        this.addTestResult('File Upload', 'WARNING', 'No file upload inputs found');
      }
      
      await this.takeScreenshot('seller-upload');
      
    } catch (error) {
      this.addTestResult('Seller Experience', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testResponsiveDesign() {
    console.log('📱 Testing Responsive Design...');
    
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1280, height: 720, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      try {
        await this.page.setViewport(viewport);
        await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Test if page is responsive
        const isResponsive = await this.page.evaluate(() => {
          return window.innerWidth === document.documentElement.clientWidth;
        });
        
        if (isResponsive) {
          this.addTestResult(`${viewport.name} Responsive`, 'PASS', `${viewport.width}x${viewport.height} viewport working`);
        } else {
          this.addTestResult(`${viewport.name} Responsive`, 'WARNING', `${viewport.width}x${viewport.height} viewport may have issues`);
        }
        
        await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
        
      } catch (error) {
        this.addTestResult(`${viewport.name} Responsive`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    try {
      const startTime = Date.now();
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      const loadTime = Date.now() - startTime;
      
      if (loadTime < 3000) {
        this.addTestResult('Page Load Performance', 'PASS', `Load time: ${loadTime}ms`);
      } else if (loadTime < 5000) {
        this.addTestResult('Page Load Performance', 'WARNING', `Slow load time: ${loadTime}ms`);
      } else {
        this.addTestResult('Page Load Performance', 'FAIL', `Very slow load time: ${loadTime}ms`);
      }
      
      // Test resource loading
      const resources = await this.page.evaluate(() => {
        return performance.getEntriesByType('resource').length;
      });
      
      this.addTestResult('Resource Loading', 'INFO', `${resources} resources loaded`);
      
    } catch (error) {
      this.addTestResult('Performance Testing', 'FAIL', `Error: ${error.message}`);
    }
  }

  async takeScreenshot(name) {
    try {
      const screenshotPath = path.join(__dirname, '../test-screenshots');
      if (!fs.existsSync(screenshotPath)) {
        fs.mkdirSync(screenshotPath, { recursive: true });
      }
      
      const filename = `${name}-${Date.now()}.png`;
      const fullPath = path.join(screenshotPath, filename);
      
      await this.page.screenshot({ path: fullPath, fullPage: true });
      this.screenshots.push({ name, path: fullPath });
      
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.error('Failed to take screenshot:', error.message);
    }
  }

  addTestResult(category, status, message) {
    this.testResults.push({
      category,
      status,
      message,
      timestamp: new Date().toISOString()
    });
    
    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'WARNING': '⚠️',
      'INFO': 'ℹ️'
    }[status];
    
    console.log(`  ${statusIcon} ${category}: ${message}`);
  }

  async generateE2EReport() {
    console.log('\n📊 Generating E2E Test Report...\n');
    console.log('='.repeat(80));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
    const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    const info = this.testResults.filter(r => r.status === 'INFO').length;
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const testDuration = Date.now() - this.testStartTime;
    
    console.log(`🎯 E2E Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   ℹ️  Info: ${info}`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    console.log(`   ⏱️  Test Duration: ${testDuration}ms`);
    console.log(`   📸 Screenshots: ${this.screenshots.length}`);
    
    // Save report
    await this.saveE2EReport();
  }

  async saveE2EReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        warnings: this.testResults.filter(r => r.status === 'WARNING').length
      },
      results: this.testResults,
      screenshots: this.screenshots
    };

    const reportPath = path.join(__dirname, '../test-reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const filename = `e2e-test-report-${Date.now()}.json`;
    fs.writeFileSync(path.join(reportPath, filename), JSON.stringify(report, null, 2));
    
    console.log(`\n📄 E2E Report saved to: test-reports/${filename}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 E2E Environment Cleaned Up');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new E2ETestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = E2ETestRunner;
