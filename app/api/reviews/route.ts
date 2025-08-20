import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimitApp';
import { audit } from '@/lib/audit';
import { flags } from '@/lib/flags';
import { reviewSchema, reviewsQuerySchema } from '@/lib/schemas/viral';
import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
  if (!flags.reviews) {
    return NextResponse.json({ error: 'Reviews feature is disabled' }, { status: 403 });
  }

  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many review submissions. Please try again later.' },
        { status: 429 }
      );
    }

    // Get authenticated user
    const supabase = await createRouteHandlerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // Verify user was part of the order (buyer)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('buyer_id, status')
      .eq('id', validatedData.orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: 'You can only review orders you placed' }, { status: 403 });
    }

    if (!['delivered', 'completed'].includes(order.status)) {
      return NextResponse.json({ error: 'Can only review completed orders' }, { status: 400 });
    }

    // Check if user already reviewed this subject for this order
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', validatedData.orderId)
      .eq('subject_type', validatedData.subjectType)
      .eq('subject_id', validatedData.subjectId)
      .eq('reviewer_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this subject for this order' }, { status: 400 });
    }

    // Create review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        order_id: validatedData.orderId,
        reviewer_id: user.id,
        subject_type: validatedData.subjectType,
        subject_id: validatedData.subjectId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Failed to insert review:', insertError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Audit log
    await audit.log('review_created', {
      userId: user.id,
      reviewId: review.id,
      orderId: validatedData.orderId,
      subjectType: validatedData.subjectType,
      subjectId: validatedData.subjectId,
      rating: validatedData.rating,
    });

    // Analytics tracking
    analytics.track('review_submitted', {
      subjectType: validatedData.subjectType,
      rating: validatedData.rating,
      hasComment: !!validatedData.comment,
    }, user.id);

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!flags.reviews) {
    return NextResponse.json({ error: 'Reviews feature is disabled' }, { status: 403 });
  }

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    const validatedQuery = reviewsQuerySchema.parse(query);

    const supabase = await createRouteHandlerClient();

    // Build query - simplified to avoid foreign key issues
    let queryBuilder = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (validatedQuery.subjectType) {
      queryBuilder = queryBuilder.eq('subject_type', validatedQuery.subjectType);
    }

    if (validatedQuery.subjectId) {
      queryBuilder = queryBuilder.eq('subject_id', validatedQuery.subjectId);
    }

    // Apply pagination
    const offset = (validatedQuery.page - 1) * validatedQuery.pageSize;
    queryBuilder = queryBuilder.range(offset, offset + validatedQuery.pageSize - 1);

    // Get total count for pagination
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('subject_type', validatedQuery.subjectType || '')
      .eq('subject_id', validatedQuery.subjectId || '');

    // Execute query
    const { data: reviews, error } = await queryBuilder;

    if (error) {
      console.error('Failed to fetch reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        page: validatedQuery.page,
        pageSize: validatedQuery.pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedQuery.pageSize),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
