#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix with specific patterns
const filesToFix = [
  // Fix all remaining createRouteHandlerClient calls
  {
    file: 'app/api/payment/create-intent/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient();',
        new: 'const supabase = createSupabaseClient();'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/personalization/enhanced-recommendations/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/personalization/insights/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/personalization/profile/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/personalization/recommendations/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/recommendations/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/share/signed-link/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient();',
        new: 'const supabase = createSupabaseClient();'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/social/challenges/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/social/interactions/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  {
    file: 'app/api/social/posts/route.ts',
    patterns: [
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      },
      { 
        old: 'return cookies().getAll()',
        new: 'const cookieStore = await cookies()\n          return cookieStore.getAll()'
      },
      { 
        old: 'cookies().set(name, value, options)',
        new: 'cookieStore.set(name, value)'
      }
    ]
  },
  // Fix remaining cookies issues
  {
    file: 'app/api/referrals/route.ts',
    patterns: [
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = await cookies()'
      },
      { 
        old: 'cookiesToSet.forEach(({ name, value, options }) =>',
        new: 'cookiesToSet.forEach(({ name, value }) =>'
      },
      { 
        old: 'const { data: { session }, error: sessionError } = await supabase.auth.getSession()',
        new: 'const { data: { session }, error: sessionError } = await (await supabase).auth.getSession()'
      },
      { 
        old: '.from(\'referrals\')',
        new: '(await supabase).from(\'referrals\')'
      },
      { 
        old: '.from(\'profiles\')',
        new: '(await supabase).from(\'profiles\')'
      },
      { 
        old: '.from(\'user_rewards\')',
        new: '(await supabase).from(\'user_rewards\')'
      },
      { 
        old: '.from(\'personalization_events\')',
        new: '(await supabase).from(\'personalization_events\')'
      }
    ]
  },
  {
    file: 'app/api/reviews/route.ts',
    patterns: [
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = await cookies()'
      },
      { 
        old: 'cookiesToSet.forEach(({ name, value, options }) =>',
        new: 'cookiesToSet.forEach(({ name, value }) =>'
      },
      { 
        old: 'const { data: { session }, error: sessionError } = await supabase.auth.getSession()',
        new: 'const { data: { session }, error: sessionError } = await (await supabase).auth.getSession()'
      },
      { 
        old: '.from(\'user_reviews\')',
        new: '(await supabase).from(\'user_reviews\')'
      }
    ]
  },
  {
    file: 'app/api/user-measurements/route.ts',
    patterns: [
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = await cookies()'
      },
      { 
        old: 'cookiesToSet.forEach(({ name, value, options }) =>',
        new: 'cookiesToSet.forEach(({ name, value }) =>'
      },
      { 
        old: 'const { data: { session }, error: sessionError } = await supabase.auth.getSession()',
        new: 'const { data: { session }, error: sessionError } = await (await supabase).auth.getSession()'
      },
      { 
        old: '.from(\'user_measurements\')',
        new: '(await supabase).from(\'user_measurements\')'
      }
    ]
  },
  {
    file: 'app/api/user-rewards/route.ts',
    patterns: [
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = await cookies()'
      },
      { 
        old: 'cookiesToSet.forEach(({ name, value, options }) =>',
        new: 'cookiesToSet.forEach(({ name, value }) =>'
      },
      { 
        old: 'const { data: { session }, error: sessionError } = await supabase.auth.getSession()',
        new: 'const { data: { session }, error: sessionError } = await (await supabase).auth.getSession()'
      },
      { 
        old: '.from(\'user_rewards\')',
        new: '(await supabase).from(\'user_rewards\')'
      },
      { 
        old: '.from(\'personalization_events\')',
        new: '(await supabase).from(\'personalization_events\')'
      }
    ]
  },
  {
    file: 'app/api/user-style-profiles/route.ts',
    patterns: [
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = await cookies()'
      },
      { 
        old: 'cookiesToSet.forEach(({ name, value, options }) =>',
        new: 'cookiesToSet.forEach(({ name, value }) =>'
      },
      { 
        old: 'const { data: { session }, error: sessionError } = await supabase.auth.getSession()',
        new: 'const { data: { session }, error: sessionError } = await (await supabase).auth.getSession()'
      },
      { 
        old: '.from(\'user_style_profiles\')',
        new: '(await supabase).from(\'user_style_profiles\')'
      }
    ]
  },
  {
    file: 'app/api/wishlist/route.ts',
    patterns: [
      { 
        old: 'function createSupabaseClient() {',
        new: 'async function createSupabaseClient() {'
      },
      { 
        old: 'const cookieStore = await cookies()',
        new: 'const cookieStore = await cookies()'
      },
      { 
        old: 'cookiesToSet.forEach(({ name, value, options }) =>',
        new: 'cookiesToSet.forEach(({ name, value }) =>'
      },
      { 
        old: 'const { data: { session }, error: sessionError } = await supabase.auth.getSession()',
        new: 'const { data: { session }, error: sessionError } = await (await supabase).auth.getSession()'
      },
      { 
        old: '.from(\'wishlist\')',
        new: '(await supabase).from(\'wishlist\')'
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

console.log('🔧 Fixing all remaining TypeScript errors...\n');

filesToFix.forEach(({ file, patterns }) => {
  fixFile(file, patterns);
});

console.log('\n✨ All remaining TypeScript fixes completed!');
console.log('Run "pnpm type-check" to verify all errors are fixed.');
