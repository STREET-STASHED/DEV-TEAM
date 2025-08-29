// Direct Admin User Creation Script
// This script directly queries the database using service role

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Your Supabase credentials (from .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please check your environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...')

    const email = 'streetstashed412@gmail.com'
    console.log('📧 Looking for user with email:', email)

    // First, check if the user exists in auth.users using raw SQL
    const { data: users, error: usersError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT id, email FROM auth.users WHERE email = '${email}'`
      })

    if (usersError) {
      console.log('💡 Trying direct profiles query...')

      // Try to find any existing profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      if (profilesError) {
        console.error('❌ Error querying profiles:', profilesError.message)
        return
      }

      console.log('📊 Found profiles:', profiles)

      if (profiles && profiles.length > 0) {
        // Update the first profile to admin
        const firstProfile = profiles[0]
        console.log('📝 Updating first profile to admin...')

        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', firstProfile.id)
          .select()

        if (updateError) {
          console.error('❌ Error updating profile:', updateError.message)
          return
        }

        console.log('✅ Successfully created admin user!')
        console.log('👤 User ID:', firstProfile.id)
        console.log('🔑 Role: admin')
        return
      }
    }

    if (users && users.length > 0) {
      const userId = users[0].id
      console.log('✅ Found user in auth.users:', userId)

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error checking profile:', profileError.message)
        return
      }

      if (!profile) {
        // Create profile if it doesn't exist
        console.log('📝 Creating new profile...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: 'Admin User',
            role: 'admin',
            created_at: new Date().toISOString()
          })
          .select()

        if (createError) {
          console.error('❌ Error creating profile:', createError.message)
          return
        }

        console.log('✅ Successfully created admin profile!')
        console.log('👤 User ID:', userId)
        console.log('🔑 Role: admin')
      } else {
        // Update existing profile to admin
        console.log('📝 Updating existing profile to admin...')
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
          .select()

        if (updateError) {
          console.error('❌ Error updating profile:', updateError.message)
          return
        }

        console.log('✅ Successfully updated user to admin!')
        console.log('👤 User ID:', userId)
        console.log('🔑 Role: admin')
      }

      // Verify the admin user
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!verifyError && verifyData) {
        console.log('✅ Verification successful:')
        console.log('   - ID:', verifyData.id)
        console.log('   - Role:', verifyData.role)
        console.log('   - Created:', verifyData.created_at)
      }

    } else {
      console.error('❌ User not found with email:', email)
      console.log('💡 Please sign up first through your app, then run this script')
      console.log('💡 Or check if the email is correct')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Run the script
createAdminUser()
