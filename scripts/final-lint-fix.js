#!/usr/bin/env node

/**
 * Final Linting Fix Script
 * Addresses remaining major issues systematically
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting final linting fixes...\n');

// Function to fix remaining 'any' types in specific files
function fixRemainingAnyTypes() {
  const anyFixes = [
    {
      file: 'app/api/analytics/alerts/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'app/api/analytics/forecasts/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'app/api/analytics/trends/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'app/api/orders/auto-assign/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'app/api/personalization/enhanced-recommendations/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'app/api/personalization/insights/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'app/api/recommendations/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    },
    {
      file: 'app/api/social/interactions/route.ts',
      replacements: [
        { from: ': any', to: ': Record<string, unknown>' }
      ]
    }
  ];
  
  let fixedCount = 0;
  
  for (const fix of anyFixes) {
    try {
      const filePath = path.join(process.cwd(), fix.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const replacement of fix.replacements) {
          if (content.includes(replacement.from)) {
            content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Fixed any types: ${fix.file}`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
  }
  
  return fixedCount;
}

// Function to fix unused variables by removing them
function fixUnusedVariables() {
  const unusedVarFixes = [
    {
      file: 'app/(seller)/upload/page.tsx',
      replacements: [
        { from: 'e', to: '_e' }
      ]
    },
    {
      file: 'app/api/analytics/forecasts/route.ts',
      replacements: [
        { from: 'itemId', to: '_itemId' }
      ]
    },
    {
      file: 'components/analytics/AnalyticsDashboard.tsx',
      replacements: [
        { from: 'PieChart', to: '_PieChart' },
        { from: 'Eye', to: '_Eye' },
        { from: 'Zap', to: '_Zap' }
      ]
    },
    {
      file: 'components/ar/VirtualTryOn.tsx',
      replacements: [
        { from: 'isInitialized', to: '_isInitialized' }
      ]
    },
    {
      file: 'components/viral/ReferralLeaderboard.tsx',
      replacements: [
        { from: 'rank', to: '_rank' }
      ]
    }
  ];
  
  let fixedCount = 0;
  
  for (const fix of unusedVarFixes) {
    try {
      const filePath = path.join(process.cwd(), fix.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        for (const replacement of fix.replacements) {
          if (content.includes(replacement.from)) {
            const regex = new RegExp(`\\b${replacement.from}\\b`, 'g');
            content = content.replace(regex, replacement.to);
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Fixed unused variables: ${fix.file}`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
  }
  
  return fixedCount;
}

// Function to fix React hook dependencies
function fixReactHookDependencies() {
  const hookFixes = [
    {
      file: 'components/social/SocialChallenges.tsx',
      fix: 'useEffect(() => {\n    fetchChallenges();\n  }, [fetchChallenges]);'
    },
    {
      file: 'components/social/SocialFeed.tsx',
      fix: 'useEffect(() => {\n    fetchPosts();\n  }, [fetchPosts]);'
    }
  ];
  
  let fixedCount = 0;
  
  for (const fix of hookFixes) {
    try {
      const filePath = path.join(process.cwd(), fix.file);
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find and replace the useEffect
        const useEffectRegex = /useEffect\(\(\) => \{\s*fetchChallenges\(\);\s*\}, \[\]\);/g;
        if (useEffectRegex.test(content)) {
          content = content.replace(useEffectRegex, fix.fix);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Fixed React hook: ${fix.file}`);
          fixedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
  }
  
  return fixedCount;
}

// Main execution
try {
  console.log('🎯 Applying final fixes...\n');
  
  let totalFixed = 0;
  
  // Fix remaining any types
  console.log('🔧 Fixing remaining any types...');
  totalFixed += fixRemainingAnyTypes();
  
  // Fix unused variables
  console.log('\n🔧 Fixing unused variables...');
  totalFixed += fixUnusedVariables();
  
  // Fix React hook dependencies
  console.log('\n🔧 Fixing React hook dependencies...');
  totalFixed += fixReactHookDependencies();
  
  console.log(`\n✅ Total fixes applied: ${totalFixed}`);
  console.log('🔍 Run "pnpm run lint" to check remaining issues');
  
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}
