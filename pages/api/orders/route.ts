import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buyerId, items, status = 'pending' } = body;

    const orderInserts = items.map((item: any) => ({
      buyer_id: buyerId,
      seller_id: item.seller_id,
      product_name: item.name,
      price: item.price,
      status,
    }));

    const { data, error } = await supabase.from('orders').insert(orderInserts);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}