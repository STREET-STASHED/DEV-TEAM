import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json()
    const { postId, interactionType, platform, comment } = body

    const supabase = await createRouteHandlerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Record interaction
    const { error: interactionError } = await supabase
      .from('social_interactions')
      .insert({
        user_id: user.id,
        post_id: postId,
        interaction_type: interactionType,
        platform
      })

    if (interactionError && interactionError.code !== '23505') { // Ignore unique constraint violations
      throw interactionError
    }

    // Update post metrics
    const updateData: Record<string, unknown> = {}
    
    switch (interactionType) {
      case 'like':
        updateData.likes = supabase.rpc('increment', { row_id: postId, column_name: 'likes' })
        break
      case 'share':
        updateData.shares = supabase.rpc('increment', { row_id: postId, column_name: 'shares' })
        break
      case 'view':
        updateData.views = supabase.rpc('increment', { row_id: postId, column_name: 'views' })
        break
      case 'comment':
        updateData.comments = supabase.rpc('increment', { row_id: postId, column_name: 'comments' })
        
        // Create comment
        if (comment) {
          await supabase
            .from('social_comments')
            .insert({
              post_id: postId,
              user_id: user.id,
              content: comment
            })
        }
        break
    }

    // Award points based on interaction type
    let points = 0
    let description = ''
    
    switch (interactionType) {
      case 'like':
        points = 1
        description = 'Earned 1 point for liking a post'
        break
      case 'share':
        points = 3
        description = 'Earned 3 points for sharing a post'
        break
      case 'comment':
        points = 2
        description = 'Earned 2 points for commenting on a post'
        break
    }

    if (points > 0) {
      await supabase
        .from('social_rewards')
        .insert({
          user_id: user.id,
          type: 'engagement',
          amount: points,
          currency: 'points',
          description,
          status: 'approved'
        })
    }

    // Award points to post creator for engagement
    const { data: post } = await supabase
      .from('social_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (post && post.user_id !== user.id) {
      let creatorPoints = 0
      let creatorDescription = ''
      
      switch (interactionType) {
        case 'like':
          creatorPoints = 2
          creatorDescription = 'Earned 2 points for someone liking your post'
          break
        case 'share':
          creatorPoints = 5
          creatorDescription = 'Earned 5 points for someone sharing your post'
          break
        case 'comment':
          creatorPoints = 3
          creatorDescription = 'Earned 3 points for someone commenting on your post'
          break
      }

      if (creatorPoints > 0) {
        await supabase
          .from('social_rewards')
          .insert({
            user_id: post.user_id,
            type: interactionType === 'share' ? 'viral' : 'engagement',
            amount: creatorPoints,
            currency: 'points',
            description: creatorDescription,
            status: 'approved'
          })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording interaction:', error)
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 })
  }
}
