import { createRouteHandlerClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Check if user is admin
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || (profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    if (metric === 'overview') {
      // Get platform overview metrics
      const [
        { count: totalUsers },
        { count: totalProducts },
        { count: totalOrders },
        { count: totalDisputes },
        { count: activeDisputes },
        { count: totalRevenue }
      ] = await Promise.all([
        (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
        (supabase as any).from('products').select('*', { count: 'exact', head: true }),
        (supabase as any).from('orders').select('*', { count: 'exact', head: true }),
        (supabase as any).from('disputes').select('*', { count: 'exact', head: true }),
        (supabase as any).from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        (supabase as any).from('orders').select('total_amount', { count: 'exact', head: true })
      ]).then(results => results.map(r => ({ count: r.count })));

      return NextResponse.json({
        metrics: {
          totalUsers: totalUsers || 0,
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          totalDisputes: totalDisputes || 0,
          activeDisputes: activeDisputes || 0,
          totalRevenue: totalRevenue || 0
        }
      });
    }

    if (metric === 'disputes') {
      // Get dispute metrics
      const { data: disputes, error } = await (supabase as any)
        .from('disputes')
        .select(`
          *,
          orders!inner(id, total_amount, status, created_at)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching disputes:', error);
        return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
      }

      return NextResponse.json({ disputes });
    }

    if (metric === 'orders') {
      // Get order metrics
      const { data: orders, error } = await (supabase as any)
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
      }

      return NextResponse.json({ orders });
    }

    if (metric === 'users') {
      // Get user metrics
      const { data: users, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }

      return NextResponse.json({ users });
    }

    // Default: return overview
    const [
      { count: totalUsers },
      { count: totalProducts },
      { count: totalOrders },
      { count: totalDisputes },
      { count: activeDisputes }
    ] = await Promise.all([
      (supabase as any).from('profiles').select('*', { count: 'exact', head: true }),
      (supabase as any).from('products').select('*', { count: 'exact', head: true }),
      (supabase as any).from('orders').select('*', { count: 'exact', head: true }),
      (supabase as any).from('disputes').select('*', { count: 'exact', head: true }),
      (supabase as any).from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open')
    ]).then(results => results.map(r => ({ count: r.count })));

    return NextResponse.json({
      metrics: {
        totalUsers: totalUsers || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        totalDisputes: totalDisputes || 0,
        activeDisputes: activeDisputes || 0
      }
    });

  } catch (error) {
    console.error('Error in GET /api/admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Check if user is admin
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || (profile as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, target_id, data } = body;

    if (!action || !target_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    switch (action) {
      case 'escalate_dispute': {
        // Escalate a dispute for admin review
        const { data: cancelledOrder, error: cancelError } = await (supabase as any)
          .from('orders')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: 'Cancelled by admin'
          })
          .eq('id', target_id)
          .select();
        if (cancelError) {
          console.error('Error escalating dispute:', cancelError);
          return NextResponse.json({ error: 'Failed to escalate dispute' }, { status: 500 });
        }

        return NextResponse.json({ dispute: cancelledOrder });
      }

      case 'delete_listing': {
        // Delete a fraudulent listing
        const { error: deleteError } = await (supabase as any)
          .from('products')
          .delete()
          .eq('id', target_id);

        if (deleteError) {
          console.error('Error deleting listing:', deleteError);
          return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
      }

      case 'reassign_driver': {
        // Reassign order to different driver
        const { data: reassignedOrder, error: reassignError } = await (supabase as any)
          .from('orders')
          .update({
            driver_id: data.driver_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)
          .select();

        if (reassignError) {
          console.error('Error reassigning driver:', reassignError);
          return NextResponse.json({ error: 'Failed to reassign driver' }, { status: 500 });
        }

        return NextResponse.json({ order: reassignedOrder });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in PUT /api/admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
