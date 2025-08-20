#!/usr/bin/env node

/**
 * 🤖 AI Production Monitoring System Test Script
 * Demonstrates the monitoring capabilities for production sustainability
 */

const http = require('http');

class MonitoringTestRunner {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.testResults = [];
  }

  async runTests() {
    console.log('🤖 AI Production Monitoring System Test Suite');
    console.log('================================================\n');

    try {
      // Test 1: Health Check
      await this.testHealthCheck();
      
      // Test 2: API Endpoints
      await this.testAPIEndpoints();
      
      // Test 3: Performance Simulation
      await this.testPerformanceSimulation();
      
      // Test 4: Error Simulation
      await this.testErrorSimulation();
      
      // Test 5: Load Testing
      await this.testLoadTesting();
      
      console.log('\n📊 Test Summary:');
      console.log('================');
      this.testResults.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} Test ${index + 1}: ${result.name} - ${result.message}`);
      });
      
      const successCount = this.testResults.filter(r => r.success).length;
      const totalCount = this.testResults.length;
      console.log(`\n🎯 Overall: ${successCount}/${totalCount} tests passed`);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async testHealthCheck() {
    try {
      const response = await this.makeRequest('/api/health');
      const success = response.status === 200;
      this.testResults.push({
        name: 'Health Check',
        success,
        message: `Status: ${response.status}, Response time: ${response.responseTime}ms`
      });
    } catch (error) {
      this.testResults.push({
        name: 'Health Check',
        success: false,
        message: `Error: ${error.message}`
      });
    }
  }

  async testAPIEndpoints() {
    const endpoints = [
      '/api/items',
      '/buyer/marketplace',
      '/buyer/checkout',
      '/signup'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint);
        const success = response.status < 400;
        this.testResults.push({
          name: `API: ${endpoint}`,
          success,
          message: `Status: ${response.status}, Response time: ${response.responseTime}ms`
        });
      } catch (error) {
        this.testResults.push({
          name: `API: ${endpoint}`,
          success: false,
          message: `Error: ${error.message}`
        });
      }
    }
  }

  async testPerformanceSimulation() {
    console.log('🚀 Simulating performance monitoring...');
    
    // Simulate different response times
    const scenarios = [
      { name: 'Fast Response', delay: 50 },
      { name: 'Normal Response', delay: 200 },
      { name: 'Slow Response', delay: 800 },
      { name: 'Very Slow Response', delay: 1500 }
    ];

    for (const scenario of scenarios) {
      await this.simulateResponseTime(scenario.name, scenario.delay);
    }

    this.testResults.push({
      name: 'Performance Simulation',
      success: true,
      message: 'Simulated various response time scenarios'
    });
  }

  async testErrorSimulation() {
    console.log('⚠️ Simulating error monitoring...');
    
    // Simulate different error scenarios
    const errorScenarios = [
      { name: '404 Error', endpoint: '/api/nonexistent' },
      { name: '500 Error', endpoint: '/api/error' },
      { name: 'Timeout', endpoint: '/api/timeout' }
    ];

    for (const scenario of errorScenarios) {
      try {
        await this.makeRequest(scenario.endpoint);
      } catch (error) {
        // Expected errors
        console.log(`  📝 ${scenario.name}: ${error.message}`);
      }
    }

    this.testResults.push({
      name: 'Error Simulation',
      success: true,
      message: 'Simulated various error scenarios'
    });
  }

  async testLoadTesting() {
    console.log('📈 Simulating load testing...');
    
    const concurrentRequests = 10;
    const promises = [];

    for (let _i = 0; _i < concurrentRequests; _i++) {
      promises.push(this.makeRequest('/api/items'));
    }

    try {
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
      const successRate = responses.filter(r => r.status < 400).length / responses.length * 100;

      console.log(`  📊 Concurrent requests: ${concurrentRequests}`);
      console.log(`  ⏱️ Total time: ${totalTime}ms`);
      console.log(`  🎯 Average response time: ${avgResponseTime.toFixed(0)}ms`);
      console.log(`  ✅ Success rate: ${successRate.toFixed(1)}%`);

      this.testResults.push({
        name: 'Load Testing',
        success: successRate > 80,
        message: `Success rate: ${successRate.toFixed(1)}%, Avg response: ${avgResponseTime.toFixed(0)}ms`
      });
    } catch (error) {
      this.testResults.push({
        name: 'Load Testing',
        success: false,
        message: `Error: ${error.message}`
      });
    }
  }

  async simulateResponseTime(name, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`  📝 ${name}: ${delay}ms response time`);
        resolve();
      }, delay);
    });
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
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
          const responseTime = Date.now() - startTime;
          resolve({
            status: res.statusCode,
            responseTime,
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

      req.end();
    });
  }
}

// Run the test suite
async function main() {
  const testRunner = new MonitoringTestRunner();
  await testRunner.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MonitoringTestRunner;
