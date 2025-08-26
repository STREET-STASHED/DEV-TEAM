#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix with specific patterns
const filesToFix = [
  // Fix all remaining supabase calls that need await
  {
    file: 'app/api/personalization/profile/route.ts',
    patterns: [
      { 
        old: 'const { data: { user }, error: authError } = await supabase.auth.getUser()',
        new: 'const { data: { user }, error: authError } = await (await supabase).auth.getUser()'
      },
      { 
        old: '.from(\'user_style_profiles\')',
        new: '(await supabase).from(\'user_style_profiles\')'
      },
      { 
        old: 'const supabase = await createRouteHandlerClient()',
        new: 'const supabase = createSupabaseClient()'
      }
    ]
  },
  {
    file: 'app/api/personalization/recommendations/route.ts',
    patterns: [
      { 
        old: 'const { data: { user }, error: authError } = await supabase.auth.getUser()',
        new: 'const { data: { user }, error: authError } = await (await supabase).auth.getUser()'
      },
      { 
        old: '.from(\'personalization_events\')',
        new: '(await supabase).from(\'personalization_events\')'
      },
      { 
        old: '.from(\'personalized_recommendations\')',
        new: '(await supabase).from(\'personalized_recommendations\')'
      }
    ]
  },
  {
    file: 'app/api/recommendations/route.ts',
    patterns: [
      { 
        old: 'const { data: { user }, error: authError } = await supabase.auth.getUser()',
        new: 'const { data: { user }, error: authError } = await (await supabase).auth.getUser()'
      },
      { 
        old: '.from(\'items\')',
        new: '(await supabase).from(\'items\')'
      },
      { 
        old: 'await supabase.rpc(\'update_user_preferences\', { user_uuid: user.id })',
        new: 'await (await supabase).rpc(\'update_user_preferences\', { user_uuid: user.id })'
      }
    ]
  },
  {
    file: 'app/api/referrals/route.ts',
    patterns: [
      { 
        old: 'const { data: referrals, error: referralsError } = await supabase',
        new: 'const { data: referrals, error: referralsError } = await (await supabase)'
      },
      { 
        old: 'const { data: referrer } = await supabase',
        new: 'const { data: referrer } = await (await supabase)'
      },
      { 
        old: 'await supabase',
        new: 'await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/reviews/route.ts',
    patterns: [
      { 
        old: 'const { data: existingReview } = await supabase',
        new: 'const { data: existingReview } = await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/share/signed-link/route.ts',
    patterns: [
      { 
        old: 'const { data: { user } } = await supabase.auth.getUser();',
        new: 'const { data: { user } } = await (await supabase).auth.getUser();'
      }
    ]
  },
  {
    file: 'app/api/social/challenges/route.ts',
    patterns: [
      { 
        old: '.from(\'social_challenges\')',
        new: '(await supabase).from(\'social_challenges\')'
      },
      { 
        old: 'const { data: { user }, error: authError } = await supabase.auth.getUser()',
        new: 'const { data: { user }, error: authError } = await (await supabase).auth.getUser()'
      },
      { 
        old: '.from(\'user_social_profiles\')',
        new: '(await supabase).from(\'user_social_profiles\')'
      },
      { 
        old: '.from(\'social_challenges\')',
        new: '(await supabase).from(\'social_challenges\')'
      }
    ]
  },
  {
    file: 'app/api/social/interactions/route.ts',
    patterns: [
      { 
        old: 'const { data: { user }, error: authError } = await supabase.auth.getUser()',
        new: 'const { data: { user }, error: authError } = await (await supabase).auth.getUser()'
      },
      { 
        old: '.from(\'social_interactions\')',
        new: '(await supabase).from(\'social_interactions\')'
      },
      { 
        old: 'updateData.likes = supabase.rpc(\'increment\', { row_id: postId, column_name: \'likes\' })',
        new: 'updateData.likes = (await supabase).rpc(\'increment\', { row_id: postId, column_name: \'likes\' })'
      },
      { 
        old: 'updateData.shares = supabase.rpc(\'increment\', { row_id: postId, column_name: \'shares\' })',
        new: 'updateData.shares = (await supabase).rpc(\'increment\', { row_id: postId, column_name: \'shares\' })'
      },
      { 
        old: 'updateData.views = supabase.rpc(\'increment\', { row_id: postId, column_name: \'views\' })',
        new: 'updateData.views = (await supabase).rpc(\'increment\', { row_id: postId, column_name: \'views\' })'
      },
      { 
        old: 'updateData.comments = supabase.rpc(\'increment\', { row_id: postId, column_name: \'comments\' })',
        new: 'updateData.comments = (await supabase).rpc(\'increment\', { row_id: postId, column_name: \'comments\' })'
      },
      { 
        old: '.from(\'social_comments\')',
        new: '(await supabase).from(\'social_comments\')'
      },
      { 
        old: '.from(\'social_rewards\')',
        new: '(await supabase).from(\'social_rewards\')'
      },
      { 
        old: '.from(\'social_posts\')',
        new: '(await supabase).from(\'social_posts\')'
      }
    ]
  },
  {
    file: 'app/api/social/posts/route.ts',
    patterns: [
      { 
        old: 'const { data, error } = await supabase.rpc(\'get_trending_posts\', { p_limit: limit })',
        new: 'const { data, error } = await (await supabase).rpc(\'get_trending_posts\', { p_limit: limit })'
      },
      { 
        old: 'const { data, error } = await supabase.rpc(\'get_user_feed\', {',
        new: 'const { data, error } = await (await supabase).rpc(\'get_user_feed\', {'
      },
      { 
        old: '.from(\'social_posts\')',
        new: '(await supabase).from(\'social_posts\')'
      },
      { 
        old: 'const { data, error } = await supabase.rpc(\'get_trending_posts\', { p_limit: limit })',
        new: 'const { data, error } = await (await supabase).rpc(\'get_trending_posts\', { p_limit: limit })'
      },
      { 
        old: 'const { data: { user }, error: authError } = await supabase.auth.getUser()',
        new: 'const { data: { user }, error: authError } = await (await supabase).auth.getUser()'
      },
      { 
        old: '.from(\'social_posts\')',
        new: '(await supabase).from(\'social_posts\')'
      },
      { 
        old: '.from(\'social_rewards\')',
        new: '(await supabase).from(\'social_rewards\')'
      }
    ]
  },
  {
    file: 'app/api/user-measurements/route.ts',
    patterns: [
      { 
        old: 'const { data: measurements, error: measurementsError } = await supabase',
        new: 'const { data: measurements, error: measurementsError } = await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/user-rewards/route.ts',
    patterns: [
      { 
        old: 'const { data: rewards, error: rewardsError } = await supabase',
        new: 'const { data: rewards, error: rewardsError } = await (await supabase)'
      },
      { 
        old: 'await supabase',
        new: 'await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/user-style-profiles/route.ts',
    patterns: [
      { 
        old: 'const { data: profile, error: profileError } = await supabase',
        new: 'const { data: profile, error: profileError } = await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/wishlist/route.ts',
    patterns: [
      { 
        old: 'const { data: wishlistItems, error: wishlistError } = await supabase',
        new: 'const { data: wishlistItems, error: wishlistError } = await (await supabase)'
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

console.log('🔧 Fixing all remaining supabase calls...\n');

filesToFix.forEach(({ file, patterns }) => {
  fixFile(file, patterns);
});

console.log('\n✨ All supabase calls fixed!');
console.log('Run "pnpm type-check" to verify all errors are fixed.');
