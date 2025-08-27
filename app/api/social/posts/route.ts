import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/app/lib/supabase/server'





export async function GET(request:NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'trending' | 'feed' | 'user'
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    const supabase = await createRouteHandlerClient()

    if (type === 'trending') {
      try {
        const { data, error } = await supabase.rpc('get_trending_posts', { p_limit: limit })

        if (error) {
          // If RPC function doesn't exist, return mock trending posts
          console.log('RPC function not available, returning mock trending posts')
          return NextResponse.json({
            posts: [
              {
                id: '1',
                type: 'post',
                content: 'Check out these amazing streetwear finds! 🔥',
                user_id: 'mock-user-1',
                created_at: new Date().toISOString(),
                likes_count: 42,
                comments_count: 8
              },
              {
                id: '2',
                type: 'post',
                content: 'New collection dropping soon! Stay tuned 👀',
                user_id: 'mock-user-2',
                created_at: new Date().toISOString(),
                likes_count: 28,
                comments_count: 5
              }
            ]
          })
        }

        return NextResponse.json({ posts: data })
      } catch (_rpcError) {
        // Fallback to mock data if RPC fails
        console.log('RPC call failed, returning mock trending posts')
        return NextResponse.json({
          posts: [
            {
              id: '1',
              type: 'post',
              content: 'Check out these amazing streetwear finds! 🔥',
              user_id: 'mock-user-1',
              created_at: new Date().toISOString(),
              likes_count: 42,
              comments_count: 8
            },
            {
              id: '2',
              type: 'post',
              content: 'New collection dropping soon! Stay tuned 👀',
              user_id: 'mock-user-2',
              created_at: new Date().toISOString(),
              likes_count: 28,
              comments_count: 5
            }
          ]
        })
      }
    }

    if (type === 'feed' && userId) {
      try {
        const { data, error } = await (supabase as any).rpc('get_user_feed', {
          p_user_id: userId,
          p_limit: limit
        })

        if (error) {
          // If RPC function doesn't exist, return mock feed
          console.log('RPC function not available, returning mock user feed')
          return NextResponse.json({
            posts: [
              {
                id: '1',
                type: 'post',
                content: 'Your personalized feed content here! 📱',
                user_id: userId,
                created_at: new Date().toISOString(),
                likes_count: 15,
                comments_count: 3
              }
            ]
          })
        }

        return NextResponse.json({ posts: data })
      } catch (_rpcError) {
        // Fallback to mock data if RPC fails
        console.log('RPC call failed, returning mock user feed')
        return NextResponse.json({
          posts: [
            {
              id: '1',
              type: 'post',
              content: 'Your personalized feed content here! 📱',
              user_id: userId,
              created_at: new Date().toISOString(),
              likes_count: 15,
              comments_count: 3
            }
          ]
        })
      }
    }

    if (type === 'user' && userId) {
      try {
        const { data, error } = await (supabase as any)
          .from('social_posts')
          .select(`
            *,
            user_social_profiles!inner(username, display_name, avatar)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (error) {
          // If table doesn't exist, return mock user posts
          console.log('Social posts table not available, returning mock user posts')
          return NextResponse.json({
            posts: [
              {
                id: '1',
                type: 'post',
                content: 'User post content here! 👤',
                user_id: userId,
                created_at: new Date().toISOString(),
                likes_count: 8,
                comments_count: 2
              }
            ]
          })
        }

        return NextResponse.json({ posts: data })
      } catch (_dbError) {
        // Fallback to mock data if database query fails
        console.log('Database query failed, returning mock user posts')
        return NextResponse.json({
          posts: [
            {
              id: '1',
              type: 'post',
              content: 'User post content here! 👤',
              user_id: userId,
              created_at: new Date().toISOString(),
              likes_count: 8,
              comments_count: 2
            }
          ]
        })
      }
    }

    // If no type specified, default to trending
    try {
      const { data, error } = await (supabase as any).rpc('get_trending_posts', { p_limit: limit })

      if (error) {
        // If RPC function doesn't exist, return mock trending posts
        console.log('RPC function not available, returning mock trending posts')
        return NextResponse.json({
          posts: [
            {
              id: '1',
              type: 'post',
              content: 'Check out these amazing streetwear finds! 🔥',
              user_id: 'mock-user-1',
              created_at: new Date().toISOString(),
              likes_count: 42,
              comments_count: 8
            },
            {
              id: '2',
              type: 'post',
              content: 'New collection dropping soon! Stay tuned 👀',
              user_id: 'mock-user-2',
              created_at: new Date().toISOString(),
              likes_count: 28,
              comments_count: 5
            }
          ]
        })
      }

      return NextResponse.json({ posts: data })
    } catch (_rpcError) {
      // Fallback to mock data if RPC fails
      console.log('RPC call failed, returning mock trending posts')
      return NextResponse.json({
        posts: [
          {
            id: '1',
            type: 'post',
            content: 'Check out these amazing streetwear finds! 🔥',
            user_id: 'mock-user-1',
            created_at: new Date().toISOString(),
            likes_count: 42,
            comments_count: 8
          },
          {
            id: '2',
            type: 'post',
            content: 'New collection dropping soon! Stay tuned 👀',
            user_id: 'mock-user-2',
            created_at: new Date().toISOString(),
            likes_count: 28,
            comments_count: 5
          }
        ]
      })
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request:NextRequest) {
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
    const { data, error } = await (supabase as any)
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
      .select('*')
      .single()

    if (error) throw error

    // Award points for creating content
    await (supabase as any)
      .from('social_rewards')
      .insert({
        user_id: user.id,
        points: 10,
        description: 'Earned 10 points for creating a post',
        status: 'approved',
        post_id: data.id
      })

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
