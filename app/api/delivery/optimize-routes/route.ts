import { NextRequest, NextResponse } from 'next/server'
import { RouteOptimizationEngine } from '@/lib/delivery/routeOptimization'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orders } = body

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: 'Orders array is required' }, { status: 400 })
    }

    const optimizationEngine = RouteOptimizationEngine.getInstance()
    const results = await optimizationEngine.optimizeRoutes(orders)

    return NextResponse.json({ success: true, routes: results })
  } catch (error) {
    console.error('Error optimizing routes:', error)
    return NextResponse.json({ error: 'Failed to optimize routes' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')

    if (!driverId) {
      return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 })
    }

    const optimizationEngine = RouteOptimizationEngine.getInstance()
    const performance = optimizationEngine.getDriverPerformance(driverId)

    return NextResponse.json({ performance })
  } catch (error) {
    console.error('Error fetching driver performance:', error)
    return NextResponse.json({ error: 'Failed to fetch driver performance' }, { status: 500 })
  }
}
