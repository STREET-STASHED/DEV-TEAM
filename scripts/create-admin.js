// Create Admin User Script
// Run this script to create an admin user in your StreetStashed app

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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...')

    // Option 1: Update existing user to admin
    const email = 'streetstashed412@gmail.com' // Replace with your email

        // First, get the user ID from auth.users using the correct API
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)

    if (authError) {
      console.error('❌ Error finding user:', authError.message)
      return
    }

    if (!authUser.user) {
      console.error('❌ User not found with email:', email)
      console.log('💡 Please sign up first through your app, then run this script')
      return
    }

    const userId = authUser.user.id
    console.log('✅ Found user:', userId)

    // Update the user's role to admin in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select()

    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message)
      return
    }

    console.log('✅ Successfully created admin user!')
    console.log('👤 User ID:', userId)
    console.log('📧 Email:', email)
    console.log('🔑 Role: admin')

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

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the script
createAdminUser()
