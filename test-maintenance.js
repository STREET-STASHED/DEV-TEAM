#!/usr/bin/env node

// Test script for maintenance system
const SUPABASE_PROJECT_REF = 'ofccxjxowebslrcuynrw';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mY2N4anhvd2Vic2xyY3V5bnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzIwMDUsImV4cCI6MjA2NTI0ODAwNX0.k8zmGXQC6hXrkXLgEJYVlnFd7WKPWaZpcbGCgL9qsys';

async function testMaintenance() {
  console.log('🧪 Testing Maintenance System...\n');

  try {
    // Test daily maintenance
    console.log('📅 Testing Daily Maintenance...');
    const dailyResponse = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/maintenance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (dailyResponse.ok) {
      const dailyResult = await dailyResponse.json();
      console.log('✅ Daily maintenance test successful:', dailyResult);
    } else {
      console.log('❌ Daily maintenance test failed:', dailyResponse.status, dailyResponse.statusText);
    }

    // Test monthly maintenance
    console.log('\n📅 Testing Monthly Maintenance...');
    const monthlyResponse = await fetch(`https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/monthly-maintenance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (monthlyResponse.ok) {
      const monthlyResult = await monthlyResponse.json();
      console.log('✅ Monthly maintenance test successful:', monthlyResult);
    } else {
      console.log('❌ Monthly maintenance test failed:', monthlyResponse.status, monthlyResponse.statusText);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testMaintenance();
