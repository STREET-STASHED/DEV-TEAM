import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(_request.url)
    const itemId = searchParams.get('itemId')
    const sellerId = searchParams.get('sellerId')

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (itemId) {
      // Get price optimization for specific item
      const { data: item, error: itemError } = await supabase
        .from('inventory_analytics')
        .select('*, items(name)')
        .eq('item_id', itemId)
        .single()

      if (itemError) throw itemError

      // Calculate price elasticity
      const { data: elasticity, error: elasticityError } = await supabase.rpc('calculate_price_elasticity', {
        p_item_id: itemId
      })

      if (elasticityError) throw elasticityError

      // Get demand forecast
      const { data: forecast, error: forecastError } = await supabase.rpc('calculate_demand_forecast', {
        p_item_id: itemId,
        p_forecast_days: 30
      })

      if (forecastError) throw forecastError

      // Mock competitor prices (in real app, this would come from market intelligence)
      const basePrice = item.selling_price
      const competitorPrices = [
        basePrice * (0.9 + Math.random() * 0.2),
        basePrice * (0.95 + Math.random() * 0.1),
        basePrice * (0.85 + Math.random() * 0.3),
        basePrice * (1.0 + Math.random() * 0.15)
      ]

      const avgCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length
      const forecastData = forecast[0] || { predicted_demand: 0 }

      // Price optimization logic
      let recommendedPrice = item.selling_price
      let recommendationReason = 'Current price is optimal'
      let confidenceScore = 0.7

      // High demand + low competition = increase price
      if (forecastData.predicted_demand > item.available_stock && item.selling_price < avgCompetitorPrice * 0.9) {
        recommendedPrice = Math.min(item.selling_price * 1.15, avgCompetitorPrice * 0.95)
        recommendationReason = 'High demand detected, price increase recommended'
        confidenceScore = 0.85
      }
      // Low demand + high stock = decrease price
      else if (forecastData.predicted_demand < item.available_stock * 0.5 && item.available_stock > 10) {
        recommendedPrice = Math.max(item.selling_price * 0.9, item.cost_price * 1.1)
        recommendationReason = 'Excess inventory detected, price reduction recommended'
        confidenceScore = 0.8
      }
      // Competitor pricing adjustment
      else if (item.selling_price > avgCompetitorPrice * 1.2) {
        recommendedPrice = avgCompetitorPrice * 1.1
        recommendationReason = 'Price too high compared to competitors'
        confidenceScore = 0.75
      }

      const profitImpact = (recommendedPrice - item.cost_price) * forecastData.predicted_demand - 
                          (item.selling_price - item.cost_price) * (forecastData.predicted_demand * 0.8)

      const optimization = {
        itemId,
        itemName: item.items?.name,
        currentPrice: item.selling_price,
        recommendedPrice: Number(recommendedPrice.toFixed(2)),
        priceElasticity: elasticity || -1.2,
        competitorPrices,
        avgCompetitorPrice: Number(avgCompetitorPrice.toFixed(2)),
        demandSensitivity: Math.abs(elasticity || 1.2),
        profitImpact: Number(profitImpact.toFixed(2)),
        recommendationReason,
        confidenceScore,
        currentStock: item.available_stock,
        predictedDemand: forecastData.predicted_demand
      }

      // Save optimization to database
      const { error: insertError } = await supabase
        .from('price_optimizations')
        .insert({
          item_id: itemId,
          current_price: optimization.currentPrice,
          recommended_price: optimization.recommendedPrice,
          price_elasticity: optimization.priceElasticity,
          competitor_avg_price: optimization.avgCompetitorPrice,
          demand_sensitivity: optimization.demandSensitivity,
          profit_impact: optimization.profitImpact,
          recommendation_reason: optimization.recommendationReason,
          confidence_score: optimization.confidenceScore
        })

      if (insertError) console.error('Error saving price optimization:', insertError)

      return NextResponse.json(optimization)
    }

    if (sellerId) {
      // Get price optimizations for all seller's items
      const { data: optimizations, error } = await supabase
        .from('price_optimizations')
        .select(`
          *,
          items(name)
        `)
        .eq('seller_id', sellerId === 'me' ? user.id : sellerId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return NextResponse.json({ optimizations })
    }

    return NextResponse.json({ error: 'Missing itemId or sellerId parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error generating price optimization:', error)
    return NextResponse.json({ error: 'Failed to generate price optimization' }, { status: 500 })
  }
}

export async function POST(_request:NextRequest) {
  try {
    const body = await _request.json()
    const { itemId, newPrice, optimizationId } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update item price
    const { error: updateItemError } = await supabase
      .from('items')
      .update({ price: newPrice })
      .eq('id', itemId)

    if (updateItemError) throw updateItemError

    // Update inventory analytics
    const { error: updateInventoryError } = await supabase
      .from('inventory_analytics')
      .update({ selling_price: newPrice })
      .eq('item_id', itemId)

    if (updateInventoryError) throw updateInventoryError

    // Mark optimization as implemented
    const { error: updateOptimizationError } = await supabase
      .from('price_optimizations')
      .update({ 
        implemented: true, 
        implemented_at: new Date().toISOString() 
      })
      .eq('id', optimizationId)

    if (updateOptimizationError) throw updateOptimizationError

    return NextResponse.json({ 
      success: true, 
      itemId, 
      newPrice,
      message: 'Price updated successfully' 
    })
  } catch (error) {
    console.error('Error implementing price optimization:', error)
    return NextResponse.json({ error: 'Failed to implement price optimization' }, { status: 500 })
  }
}
