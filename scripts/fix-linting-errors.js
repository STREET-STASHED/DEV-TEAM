#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix with specific patterns
const filesToFix = [
  {
    file: 'app/api/admin/monitoring/start/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/admin/monitoring/stop/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/admin/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/analytics/alerts/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/analytics/forecasts/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/analytics/pricing/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/analytics/trends/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/auth/signout/route.ts',
    patterns: [
      { old: 'export async function POST(request: NextRequest)', new: 'export async function POST(_request: NextRequest)' }
    ]
  },
  {
    file: 'app/api/disputes/[id]/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/disputes/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/functions/v1/handle-redirect/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/leaderboard/referrals/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/notification-preferences/route.ts',
    patterns: [
      { old: 'export async function GET(request: NextRequest)', new: 'export async function GET(_request: NextRequest)' }
    ]
  },
  {
    file: 'app/api/notifications/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/notifications/subscribe/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/orders/route.ts',
    patterns: [
      { old: 'export async function GET(request: NextRequest)', new: 'export async function GET(_request: NextRequest)' }
    ]
  },
  {
    file: 'app/api/payment/create-intent/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/personalization/enhanced-recommendations/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/personalization/insights/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/personalization/profile/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/personalization/recommendations/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/recommendations/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/referrals/route.ts',
    patterns: [
      { old: 'export async function GET(request: NextRequest)', new: 'export async function GET(_request: NextRequest)' }
    ]
  },
  {
    file: 'app/api/share/signed-link/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/social/challenges/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/social/interactions/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/social/posts/route.ts',
    patterns: [
      { old: 'function createSupabaseClient()', new: 'function _createSupabaseClient()' }
    ]
  },
  {
    file: 'app/api/user-measurements/route.ts',
    patterns: [
      { old: 'export async function GET(request: NextRequest)', new: 'export async function GET(_request: NextRequest)' }
    ]
  },
  {
    file: 'app/api/user-rewards/route.ts',
    patterns: [
      { old: 'export async function GET(request: NextRequest)', new: 'export async function GET(_request: NextRequest)' }
    ]
  },
  {
    file: 'app/api/user-style-profiles/route.ts',
    patterns: [
      { old: 'export async function GET(request: NextRequest)', new: 'export async function GET(_request: NextRequest)' }
    ]
  },
  {
    file: 'app/api/wishlist/route.ts',
    patterns: [
      { old: 'export async function GET(request: NextRequest)', new: 'export async function GET(_request: NextRequest)' }
    ]
  }
];

function fixFile(filePath, patterns) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  patterns.forEach(pattern => {
    if (content.includes(pattern.old)) {
      content = content.replace(pattern.old, pattern.new);
      modified = true;
      console.log(`✅ Fixed pattern in ${filePath}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

console.log('🔧 Fixing linting errors...\n');

filesToFix.forEach(({ file, patterns }) => {
  fixFile(file, patterns);
});

console.log('\n✨ Linting fixes completed!');
console.log('Run "pnpm lint" to verify all errors are fixed.');
