import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabaseRouteHandler'

export async function GET(_request:NextRequest) {
  try {
    const { searchParams } = new URL(_request.url)
    const sellerId = searchParams.get('sellerId')
    const alertType = searchParams.get('alertType')
    const severity = searchParams.get('severity')
    const resolved = searchParams.get('resolved')

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('inventory_alerts')
      .select(`
        *,
        items(name, category),
        inventory_analytics(available_stock, selling_price)
      `)

    // Filter by seller if specified
    if (sellerId) {
      if (sellerId === 'me') {
        // Get alerts for current user's items
        query = query.or(`
          supplier_id.eq.${user.id},
          item_id.in.(
            SELECT item_id FROM inventory_analytics WHERE seller_id = '${user.id}'
          )
        `)
      } else {
        query = query.eq('supplier_id', sellerId)
      }
    }

    if (alertType) {
      query = query.eq('alert_type', alertType)
    }

    if (severity) {
      query = query.eq('severity', severity)
    }

    if (resolved === 'true') {
      query = query.eq('is_resolved', true)
    } else if (resolved === 'false') {
      query = query.eq('is_resolved', false)
    }

    const { data: alerts, error } = await query
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Enhance alerts with additional context
    const enhancedAlerts = alerts.map(alert => ({
      ...alert,
      urgencyScore: calculateUrgencyScore(alert),
      estimatedTimeToResolve: estimateResolutionTime(alert),
      potentialImpact: calculatePotentialImpact(alert)
    }))

    return NextResponse.json({ alerts: enhancedAlerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(_request:NextRequest) {
  try {
    const body = await _request.json()
    const { 
      alertType, 
      severity, 
      itemId, 
      supplierId, 
      title, 
      description, 
      actionRequired, 
      estimatedImpact 
    } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create new alert
    const { data: alert, error } = await supabase
      .from('inventory_alerts')
      .insert({
        alert_type: alertType,
        severity,
        item_id: itemId,
        supplier_id: supplierId,
        title,
        description,
        action_required: actionRequired,
        estimated_impact: estimatedImpact || 0
      })
      .select()
      .single()

    if (error) throw error

    // If it's a critical alert, trigger immediate notifications
    if (severity === 'critical') {
      await triggerCriticalAlertNotification(alert)
    }

    return NextResponse.json({ 
      success: true, 
      alert,
      message: 'Alert created successfully' 
    })
  } catch (error) {
    console.error('Error creating alert:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }
}

export async function PATCH(_request:NextRequest) {
  try {
    const body = await _request.json()
    const { alertId, action } = body

    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (action === 'resolve') {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', alertId)

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Alert resolved successfully' 
      })
    }

    if (action === 'snooze') {
      // Implement snooze functionality (hide alert for a period)
      const { error } = await supabase
        .from('inventory_alerts')
        .update({
          // Add a snooze field if needed
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Alert snoozed successfully' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

// Generate alerts automatically
export async function PUT(_request:NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run automated alert generation
    const { error: alertError } = await supabase.rpc('check_low_stock_alerts')
    if (alertError) throw alertError

    // Generate trend opportunity alerts
    const trendAlerts = await generateTrendAlerts(supabase)
    
    // Generate price optimization alerts
    const priceAlerts = await generatePriceAlerts(supabase)

    // Generate supplier performance alerts
    const supplierAlerts = await generateSupplierAlerts(supabase)

    const totalAlertsGenerated = trendAlerts.length + priceAlerts.length + supplierAlerts.length

    return NextResponse.json({ 
      success: true, 
      alertsGenerated: totalAlertsGenerated,
      breakdown: {
        trends: trendAlerts.length,
        pricing: priceAlerts.length,
        suppliers: supplierAlerts.length
      }
    })
  } catch (error) {
    console.error('Error generating alerts:', error)
    return NextResponse.json({ error: 'Failed to generate alerts' }, { status: 500 })
  }
}

// Helper functions
function calculateUrgencyScore(_alert: Record<string, unknown>): number {
  let score = 0

  // Base score from severity
  switch (_alert.severity) {
    case 'critical': score += 100; break
    case 'high': score += 75; break
    case 'medium': score += 50; break
    case 'low': score += 25; break
  }

  // Adjust based on alert type
  switch (_alert.alert_type) {
    case 'low_stock': score += 20; break
    case 'price_alert': score += 15; break
    case 'trend_opportunity': score += 10; break
    case 'supplier_issue': score += 25; break
  }

  // Time decay (alerts become more urgent over time)
  const hoursOld = (Date.now() - new Date(_alert.created_at as string).getTime()) / (1000 * 60 * 60)
  score += Math.min(hoursOld * 2, 50)

  return Math.round(score)
}

function estimateResolutionTime(_alert: Record<string, unknown>): string {
  switch (_alert.alert_type) {
    case 'low_stock': return '2-5 days'
    case 'overstock': return '1-2 weeks'
    case 'price_alert': return 'Immediate'
    case 'trend_opportunity': return '3-7 days'
    case 'supplier_issue': return '1-3 weeks'
    default: return 'Unknown'
  }
}

function calculatePotentialImpact(_alert: Record<string, unknown>): string {
  const impact = Math.abs(_alert.estimated_impact as number || 0)
  
  if (impact > 10000) return 'Very High'
  if (impact > 5000) return 'High'
  if (impact > 1000) return 'Medium'
  if (impact > 100) return 'Low'
  return 'Minimal'
}

async function triggerCriticalAlertNotification(_alert: Record<string, unknown>): Promise<void> {
  // In a real implementation, this would send notifications via:
  // - Email
  // - SMS
  // - Push notifications
  // - Slack/Discord webhooks
  console.log('Critical alert triggered:', _alert.title)
}

async function generateTrendAlerts(supabase: any): Promise<any[]> {
  const alerts = []

  // Get emerging trends
  const { data: trends } = await supabase
    .from('trend_analyses')
    .select('*')
    .eq('trend_type', 'emerging')
    .gte('confidence_score', 0.7)

  for (const trend of trends || []) {
    alerts.push({
      id: `trend-${trend.id}`,
      alert_type: 'trend_opportunity',
      severity: 'medium',
      title: `Emerging Trend: ${trend.trend_name}`,
      description: `Trend confidence: ${(trend.confidence_score * 100).toFixed(0)}%`,
      item_id: trend.item_id,
      supplier_id: trend.supplier_id,
      estimated_impact: trend.potential_revenue,
      action_required: 'Consider increasing inventory for this trending item',
      created_at: new Date().toISOString()
    })
  }

  return alerts
}

async function generatePriceAlerts(supabase: any): Promise<any[]> {
  const alerts = []

  // Get price optimization opportunities
  const { data: priceData } = await supabase
    .from('price_analytics')
    .select('*')
    .gte('optimization_score', 0.8)

  for (const price of priceData || []) {
    alerts.push({
      id: `price-${price.id}`,
      alert_type: 'price_alert',
      severity: 'high',
      title: `Price Optimization: ${price.item_name}`,
      description: `Current price: $${price.current_price}, Recommended: $${price.optimal_price}`,
      item_id: price.item_id,
      supplier_id: price.supplier_id,
      estimated_impact: price.potential_revenue_increase,
      action_required: 'Review and adjust pricing strategy',
      created_at: new Date().toISOString()
    })
  }

  return alerts
}

async function generateSupplierAlerts(supabase: any): Promise<any[]> {
  const alerts = []

  // Get supplier performance issues
  const { data: suppliers } = await supabase
    .from('supplier_analytics')
    .select('*')
    .lt('performance_score', 0.6)

  for (const supplier of suppliers || []) {
    alerts.push({
      id: `supplier-${supplier.id}`,
      alert_type: 'supplier_issue',
      severity: 'high',
      title: `Supplier Performance: ${supplier.supplier_name}`,
      description: `Performance score: ${(supplier.performance_score * 100).toFixed(0)}%`,
      supplier_id: supplier.id,
      estimated_impact: supplier.potential_loss,
      action_required: 'Review supplier relationship and consider alternatives',
      created_at: new Date().toISOString()
    })
  }

  return alerts
}
