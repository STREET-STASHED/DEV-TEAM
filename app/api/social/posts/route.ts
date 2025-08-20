import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(_request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'trending' | 'feed' | 'user'
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createRouteHandlerClient()

    if (type === 'trending') {
      const { data, error } = await supabase.rpc('get_trending_posts', { p_limit: limit })
      
      if (error) throw error
      
      return NextResponse.json({ posts: data })
    }

    if (type === 'feed' && userId) {
      const { data, error } = await supabase.rpc('get_user_feed', { 
        p_user_id: userId, 
        p_limit: limit 
      })
      
      if (error) throw error
      
      return NextResponse.json({ posts: data })
    }

    if (type === 'user' && userId) {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          user_social_profiles!inner(username, display_name, avatar)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      
      return NextResponse.json({ posts: data })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(_request:NextRequest) {
  try {
    const body = await request.json()
    const { type, content, images, productIds, tags, location } = body

    const supabase = await createRouteHandlerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create post
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        user_id: user.id,
        type,
        content,
        images: images || [],
        product_ids: productIds || [],
        tags: tags || [],
        location
      })
      .select()
      .single()

    if (error) throw error

    // Award points for creating content
    await supabase
      .from('social_rewards')
      .insert({
        user_id: user.id,
        type: 'post',
        amount: 10,
        currency: 'points',
        description: 'Earned 10 points for creating a post',
        status: 'approved'
      })

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
