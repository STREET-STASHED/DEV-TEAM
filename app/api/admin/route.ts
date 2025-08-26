import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '../../../lib/supabaseRouteHandler';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      supabase.from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');

    if (metric === 'overview') {
      // Get platform overview metrics
      const [
        { count: totalUsers },
        { count: totalOrders },
        { count: totalDisputes },
        { count: activeDisputes },
        { count: totalRevenue }
      ] = await Promise.all([
        supabasesupabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabasesupabase.from('orders').select('*', { count: 'exact', head: true }),
        supabasesupabase.from('disputes').select('*', { count: 'exact', head: true }),
        supabasesupabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabasesupabase.from('orders').select('total', { count: 'exact', head: true })
      ]);

      return NextResponse.json({
        metrics: {
          totalUsers: totalUsers || 0,
          totalOrders: totalOrders || 0,
          totalDisputes: totalDisputes || 0,
          activeDisputes: activeDisputes || 0,
          totalRevenue: totalRevenue || 0
        }
      });
    }

    if (metric === 'disputes') {
      // Get dispute metrics
      const { data: disputes, error: disputesError } = await supabase
        supabase.from('disputes')
        .select(`
          *,
          orders!inner(id, total, status, created_at),
          profiles!disputes_buyer_id_fkey(full_name),
          profiles!disputes_seller_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (disputesError) {
        console.error('Error fetching disputes:', disputesError);
        return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
      }

      return NextResponse.json({ disputes });
    }

    if (metric === 'orders') {
      // Get order metrics
      const { data: orders, error: ordersError } = await supabase
        supabase.from('orders')
        .select(`
          *,
          profiles!orders_buyer_id_fkey(full_name),
          profiles!orders_seller_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
      }

      return NextResponse.json({ orders });
    }

    if (metric === 'users') {
      // Get user metrics
      const { data: users, error: usersError } = await supabase
        supabase.from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }

      return NextResponse.json({ users });
    }

    // Default: return overview
    const [
      { count: totalUsers },
      { count: totalOrders },
      { count: totalDisputes },
      { count: activeDisputes }
    ] = await Promise.all([
      supabasesupabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabasesupabase.from('orders').select('*', { count: 'exact', head: true }),
      supabasesupabase.from('disputes').select('*', { count: 'exact', head: true }),
      supabasesupabase.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open')
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers: totalUsers || 0,
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
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      supabase.from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
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
        const { data: escalatedDispute, error: escalateError } = await supabase
          supabase.from('disputes')
          .update({
            status: 'escalated',
            escalated_at: new Date().toISOString()
          })
          .eq('id', target_id)
          .select()
          .single();

        if (escalateError) {
          console.error('Error escalating dispute:', escalateError);
          return NextResponse.json({ error: 'Failed to escalate dispute' }, { status: 500 });
        }

        return NextResponse.json({ dispute: escalatedDispute });
      }

      case 'delete_listing': {
        // Delete a fraudulent listing
        const { error: deleteError } = await supabase
          supabase.from('items')
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
        const { data: reassignedOrder, error: reassignError } = await supabase
          supabase.from('orders')
          .update({
            driver_id: data.driver_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', target_id)
          .select()
          .single();

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
