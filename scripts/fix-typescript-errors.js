#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix with specific patterns
const filesToFix = [
  // Fix missing imports and cookies issues
  {
    file: 'app/api/admin/monitoring/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      },
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      }
    ]
  },
  {
    file: 'app/api/admin/monitoring/start/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/admin/monitoring/stop/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/admin/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/analytics/alerts/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/analytics/forecasts/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/analytics/pricing/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  {
    file: 'app/api/analytics/trends/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'function createSupabaseClient() {'
      }
    ]
  },
  // Fix cookies async issues
  {
    file: 'app/api/auth/signout/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n    return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  {
    file: 'app/api/auth/signup/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n    return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  {
    file: 'app/api/cart/route.ts',
    patterns: [
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n    return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  // Fix other files with similar patterns
  {
    file: 'app/api/disputes/[id]/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n    return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  {
    file: 'app/api/disputes/route.ts',
    patterns: [
      { 
        old: 'import { createRouteHandlerClient } from \'@/lib/supabaseRouteHandler\'',
        new: 'import { createServerClient } from \'@supabase/ssr\''
      },
      { 
        old: 'import { rateLimit } from \'@/lib/rateLimitApp\'',
        new: 'import { rateLimit } from \'@/lib/rateLimitApp\'\nimport { cookies } from \'next/headers\''
      },
      { 
        old: 'function _createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n    return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value, options)'
      }
    ]
  },
  // Fix MarketplaceContent showFilters issue
  {
    file: 'app/buyer/marketplace/MarketplaceContent.tsx',
    patterns: [
      { 
        old: 'const [_showFilters, _setShowFilters] = useState(false)',
        new: 'const [showFilters, setShowFilters] = useState(false)'
      },
      { 
        old: 'const _handleSearch = () => {',
        new: 'const handleSearch = () => {'
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

console.log('🔧 Fixing TypeScript errors...\n');

filesToFix.forEach(({ file, patterns }) => {
  fixFile(file, patterns);
});

console.log('\n✨ TypeScript fixes completed!');
console.log('Run "pnpm type-check" to verify all errors are fixed.');
