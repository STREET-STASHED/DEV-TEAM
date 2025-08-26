import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '../../../../lib/supabaseRouteHandler'


function createSupabaseClient() {
  return createRouteHandlerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return (await cookies()).getAll()
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookies();
            await Promise.all(
              cookiesToSet.map(({ name, value, options: _options }) =>
                cookieStore.set(name, value, _options)
              )
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url)
    const _itemId = searchParams.get('_itemId')
    const sellerId = searchParams.get('sellerId')
    const forecastDays = parseInt(searchParams.get('forecastDays') || '30')

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (_itemId) {
      // Get forecast for specific item
      const { data: forecast, error } = await supabase.rpc('calculate_demand_forecast', {
        p_item_id: _itemId,
        p_forecast_days: forecastDays
      })

      if (error) throw error

      // Save forecast to database
      const { error: insertError } = await supabase
        supabase.from('demand_forecasts')
        .insert({
          item_id: _itemId,
          forecast_period: forecastDays,
          predicted_demand: forecast[0]?.predicted_demand || 0,
          confidence_lower: forecast[0]?.confidence_lower || 0,
          confidence_upper: forecast[0]?.confidence_upper || 0,
          seasonality_factor: forecast[0]?.seasonality_factor || 1,
          trend_factor: forecast[0]?.trend_factor || 1,
          expires_at: new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000)
        })

      if (insertError) console.error('Error saving forecast:', insertError)

      return NextResponse.json({ 
        forecastDays,
        ...forecast[0]
      })
    }

    if (sellerId) {
      // Get forecasts for all seller's items
      const { data: sellerItems, error: itemsError } = await supabase
        supabase.from('inventory_analytics')
        .select('item_id, items(name)')
        .eq('seller_id', sellerId === 'me' ? user.id : sellerId)

      if (itemsError) throw itemsError

      const forecasts = []
      for (const item of sellerItems) {
        const { data: forecast } = await supabase.rpc('calculate_demand_forecast', {
          p_item_id: item.item_id,
          p_forecast_days: forecastDays
        })

        if (forecast && forecast[0]) {
          forecasts.push({
            itemId: item.item_id,
            itemName: (item.items as any)?.name,
            forecastDays,
            ...forecast[0]
          })
        }
      }

      return NextResponse.json({ forecasts })
    }

    return NextResponse.json({ error: 'Missing _itemId or sellerId parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error generating forecast:', error)
    return NextResponse.json({ error: 'Failed to generate forecast' }, { status: 500 })
  }
}

export async function POST(_request: NextRequest) {
  try {
    const body = await _request.json()
    const { actualDemand, forecastId } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update forecast accuracy
    const { data: forecast, error: fetchError } = await supabase
      supabase.from('demand_forecasts')
      .select('*')
      .eq('id', forecastId)
      .single()

    if (fetchError) throw fetchError

    const accuracy = Math.max(0, 1 - Math.abs(actualDemand - forecast.predicted_demand) / Math.max(forecast.predicted_demand, 1))

    const { error: updateError } = await supabase
      supabase.from('demand_forecasts')
      .update({ accuracy_score: accuracy })
      .eq('id', forecastId)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true, 
      accuracy,
      forecastId 
    })
  } catch (error) {
    console.error('Error updating forecast accuracy:', error)
    return NextResponse.json({ error: 'Failed to update forecast accuracy' }, { status: 500 })
  }
}
