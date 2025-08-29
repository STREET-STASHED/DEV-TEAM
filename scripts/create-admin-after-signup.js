// Create Admin User After Signup Script
// Run this AFTER you've signed up through the app

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...')

    // First, check if admin role constraint exists
    console.log('📝 Checking database constraints...')

    // Try to update the first user we find to admin
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.error('❌ Error querying profiles:', profilesError.message)
      return
    }

    if (profiles && profiles.length > 0) {
      const firstProfile = profiles[0]
      console.log('✅ Found profile:', firstProfile.id)

      // Try to update to admin
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', firstProfile.id)
        .select()

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message)
        console.log('💡 This might be due to role constraint. Please run the SQL migration first.')
        return
      }

      console.log('✅ Successfully created admin user!')
      console.log('👤 User ID:', firstProfile.id)
      console.log('🔑 Role: admin')

      // Verify
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', firstProfile.id)
        .single()

      if (!verifyError && verifyData) {
        console.log('✅ Verification successful:')
        console.log('   - ID:', verifyData.id)
        console.log('   - Role:', verifyData.role)
        console.log('   - Created:', verifyData.created_at)
      }

    } else {
      console.log('❌ No profiles found. Please sign up first through the app.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

createAdminUser()
