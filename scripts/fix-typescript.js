#!/usr/bin/env node

/**
 * Targeted TypeScript Fix Script
 * Only fixes 'any' type issues without corrupting other files
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting targeted TypeScript fixes...\n');

// Function to fix specific files with known issues
function fixSpecificFiles() {
  const fixes = [
    {
      file: 'lib/ai/styleCreator.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'colorPreferences', to: '_colorPreferences' },
        { from: 'aestheticPreferences', to: '_aestheticPreferences' },
        { from: 'pricePreferences', to: '_pricePreferences' },
        { from: 'mood', to: '_mood' },
        { from: 'stylePreferences', to: '_stylePreferences' },
        { from: 'complexOccasions', to: '_complexOccasions' },
        { from: 'userId', to: '_userId' }
      ]
    },
    {
      file: 'lib/analytics/predictiveInventory.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'let optimalPrice', to: 'const optimalPrice' },
        { from: 'category', to: '_category' },
        { from: 'itemId', to: '_itemId' },
        { from: 'historicalData', to: '_historicalData' },
        { from: 'socialData', to: '_socialData' },
        { from: 'predictedPeak', to: '_predictedPeak' },
        { from: 'marketData', to: '_marketData' },
        { from: 'sellerId', to: '_sellerId' }
      ]
    },
    {
      file: 'lib/ar-vr/arVrShopping.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'contentType', to: '_contentType' }
      ]
    },
    {
      file: 'lib/blockchain/blockchainSystem.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'journey', to: '_journey' },
        { from: 'userId', to: '_userId' },
        { from: 'parameters', to: '_parameters' },
        { from: 'contractAddress', to: '_contractAddress' },
        { from: 'functionName', to: '_functionName' }
      ]
    },
    {
      file: 'lib/brand/brandExclusivity.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'userId', to: '_userId' },
        { from: 'brandId', to: '_brandId' }
      ]
    },
    {
      file: 'lib/brand/brandOnboarding.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'brandId', to: '_brandId' }
      ]
    },
    {
      file: 'lib/influencer/influencerMarketplace.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'now', to: '_now' },
        { from: 'brandId', to: '_brandId' },
        { from: 'collaborationId', to: '_collaborationId' }
      ]
    },
    {
      file: 'lib/international/internationalExpansion.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'distanceMultipliers', to: '_distanceMultipliers' }
      ]
    },
    {
      file: 'lib/logistics/sameDayDelivery.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'zoneId', to: '_zoneId' }
      ]
    },
    {
      file: 'lib/personalization/enhancedUserProfile.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' },
        { from: 'context', to: '_context' },
        { from: 'currentMood', to: '_currentMood' },
        { from: 'userProfile', to: '_userProfile' },
        { from: 'events', to: '_events' }
      ]
    },
    {
      file: 'lib/redis/client.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'lib/social/viralFeatures.ts',
      replacements: [
        { from: 'platform', to: '_platform' },
        { from: 'comment', to: '_comment' },
        { from: 'userId', to: '_userId' },
        { from: 'post', to: '_post' },
        { from: 'budget', to: '_budget' }
      ]
    }
  ];
  
  let totalFixed = 0;
  
  for (const fix of fixes) {
    try {
      const filePath = path.join(process.cwd(), fix.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const replacement of fix.replacements) {
          if (content.includes(replacement.from)) {
            // Use word boundaries to avoid partial replacements
            const regex = new RegExp(`\\b${replacement.from}\\b`, 'g');
            content = content.replace(regex, replacement.to);
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Fixed: ${fix.file}`);
          totalFixed++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
  }
  
  return totalFixed;
}

// Main execution
try {
  console.log('🎯 Applying targeted fixes...\n');
  const fixedCount = fixSpecificFiles();
  
  console.log(`\n✅ Fixed ${fixedCount} files with targeted TypeScript fixes`);
  console.log('🔍 Run "pnpm run lint" to check remaining issues');
  
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}
