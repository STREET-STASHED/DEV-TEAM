#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix with specific patterns
const filesToFix = [
  // Fix cart route supabase client awaiting
  {
    file: 'app/api/cart/route.ts',
    patterns: [
      { 
        old: 'const supabase = createSupabaseClient()',
        new: 'const supabase = await createSupabaseClient()'
      }
    ]
  },
  // Fix all remaining files with missing imports and cookies issues
  {
    file: 'app/api/disputes/[id]/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'async function createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = cookies()'
      }
    ]
  },
  {
    file: 'app/api/disputes/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'async function createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = cookies()'
      }
    ]
  },
  {
    file: 'app/api/functions/v1/handle-redirect/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/leaderboard/referrals/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/notifications/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/notifications/subscribe/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/payment/create-intent/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/personalization/enhanced-recommendations/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/personalization/insights/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/personalization/profile/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/personalization/recommendations/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/recommendations/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/share/signed-link/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/social/challenges/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/social/interactions/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/social/posts/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  // Fix cookies async issues in remaining files
  {
    file: 'app/api/notification-preferences/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      },
      { 
        old: 'preferences: data[0]',
        new: 'preferences: data?.[0] || null'
      }
    ]
  },
  {
    file: 'app/api/orders/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  {
    file: 'app/api/referrals/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  {
    file: 'app/api/reviews/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  {
    file: 'app/api/user-measurements/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      },
      { 
        old: 'measurements: data[0]',
        new: 'measurements: data?.[0] || null'
      }
    ]
  },
  {
    file: 'app/api/user-rewards/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      },
      { 
        old: 'rewards: data[0]',
        new: 'rewards: data?.[0] || null'
      }
    ]
  },
  {
    file: 'app/api/user-style-profiles/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      },
      { 
        old: 'profile: data[0]',
        new: 'profile: data?.[0] || null'
      }
    ]
  },
  {
    file: 'app/api/wishlist/route.ts',
    patterns: [
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  // Fix MarketplaceContent unused variables
  {
    file: 'app/buyer/marketplace/MarketplaceContent.tsx',
    patterns: [
      { 
        old: 'const [showFilters, setShowFilters] = useState(false)',
        new: 'const [_showFilters, _setShowFilters] = useState(false)'
      },
      { 
        old: 'const handleSearch = () => {',
        new: 'const _handleSearch = () => {'
      }
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

console.log('🔧 Fixing remaining TypeScript errors...\n');

filesToFix.forEach(({ file, patterns }) => {
  fixFile(file, patterns);
});

console.log('\n✨ Remaining TypeScript fixes completed!');
console.log('Run "pnpm type-check" to verify all errors are fixed.');
