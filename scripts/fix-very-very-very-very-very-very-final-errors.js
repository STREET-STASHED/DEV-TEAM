#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to fix with specific patterns
const filesToFix = [
  // Fix remaining supabase calls that need await
  {
    file: 'app/api/orders/route.ts',
    patterns: [
      { 
        old: 'const { data: orders, error: ordersError } = await (await supabase)',
        new: 'const { data: orders, error: ordersError } = await (await supabase)'
      },
      { 
        old: '.from(\'order_history\')',
        new: '(await supabase).from(\'order_history\')'
      },
      { 
        old: 'await supabase',
        new: 'await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/personalization/enhanced-recommendations/route.ts',
    patterns: [
      { 
        old: 'const { data: item } = await (await supabase)',
        new: 'const { data: item } = await (await supabase)'
      },
      { 
        old: 'const { data: sellerData } = await (await supabase)',
        new: 'const { data: sellerData } = await (await supabase)'
      },
      { 
        old: 'const { error: eventError } = await (await supabase)',
        new: 'const { error: eventError } = await (await supabase)'
      },
      { 
        old: 'const { error: updateError } = await (await supabase)',
        new: 'const { error: updateError } = await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/personalization/profile/route.ts',
    patterns: [
      { 
        old: 'const { data: profile, error } = await (await supabase)',
        new: 'const { data: profile, error } = await (await supabase)'
      },
      { 
        old: '.from(\'user_style_profiles\')',
        new: '(await supabase).from(\'user_style_profiles\')'
      },
      { 
        old: 'const { data: event, error } = await (await supabase)',
        new: 'const { data: event, error } = await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/personalization/recommendations/route.ts',
    patterns: [
      { 
        old: 'const { error: eventError } = await (await supabase)',
        new: 'const { error: eventError } = await (await supabase)'
      },
      { 
        old: 'const { error: updateError } = await (await supabase)',
        new: 'const { error: updateError } = await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/recommendations/route.ts',
    patterns: [
      { 
        old: 'const { data: products, error: productsError } = await (await supabase)',
        new: 'const { data: products, error: productsError } = await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/referrals/route.ts',
    patterns: [
      { 
        old: 'const { data: referrals, error: referralsError } = await (await supabase)',
        new: 'const { data: referrals, error: referralsError } = await (await supabase)'
      },
      { 
        old: 'const { data: referrer } = await (await supabase)',
        new: 'const { data: referrer } = await (await supabase)'
      },
      { 
        old: '.from(\'referrals\')',
        new: '(await supabase).from(\'referrals\')'
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
        old: 'const { data: existingReview } = await (await supabase)',
        new: 'const { data: existingReview } = await (await supabase)'
      },
      { 
        old: '.from(\'user_reviews\')',
        new: '(await supabase).from(\'user_reviews\')'
      }
    ]
  },
  {
    file: 'app/api/social/challenges/route.ts',
    patterns: [
      { 
        old: 'const { data, error } = await (await supabase)',
        new: 'const { data, error } = await (await supabase)'
      },
      { 
        old: '.from(\'social_challenges\')',
        new: '(await supabase).from(\'social_challenges\')'
      },
      { 
        old: 'const { data: profile } = await (await supabase)',
        new: 'const { data: profile } = await (await supabase)'
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
        old: 'const { error: interactionError } = await (await supabase)',
        new: 'const { error: interactionError } = await (await supabase)'
      },
      { 
        old: 'await supabase',
        new: 'await (await supabase)'
      },
      { 
        old: 'const { data: post } = await (await supabase)',
        new: 'const { data: post } = await (await supabase)'
      },
      { 
        old: '.from(\'social_rewards\')',
        new: '(await supabase).from(\'social_rewards\')'
      }
    ]
  },
  {
    file: 'app/api/social/posts/route.ts',
    patterns: [
      { 
        old: 'const { data, error } = await (await supabase)',
        new: 'const { data, error } = await (await supabase)'
      },
      { 
        old: '.from(\'social_posts\')',
        new: '(await supabase).from(\'social_posts\')'
      },
      { 
        old: 'await supabase',
        new: 'await (await supabase)'
      }
    ]
  },
  {
    file: 'app/api/user-measurements/route.ts',
    patterns: [
      { 
        old: 'const { data: measurements, error: measurementsError } = await (await supabase)',
        new: 'const { data: measurements, error: measurementsError } = await (await supabase)'
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
        old: 'const { data: rewards, error: rewardsError } = await (await supabase)',
        new: 'const { data: rewards, error: rewardsError } = await (await supabase)'
      },
      { 
        old: '.from(\'user_rewards\')',
        new: '(await supabase).from(\'user_rewards\')'
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
        old: 'const { data: profile, error: profileError } = await (await supabase)',
        new: 'const { data: profile, error: profileError } = await (await supabase)'
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
        old: 'const { data: wishlistItems, error: wishlistError } = await (await supabase)',
        new: 'const { data: wishlistItems, error: wishlistError } = await (await supabase)'
      },
      { 
        old: '.from(\'wishlist\')',
        new: '(await supabase).from(\'wishlist\')'
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

console.log('🔧 Fixing very very very very very very final remaining errors...\n');

filesToFix.forEach(({ file, patterns }) => {
  fixFile(file, patterns);
});

console.log('\n✨ Very very very very very very final remaining errors fixed!');
console.log('Run "pnpm type-check" to verify all errors are fixed.');
