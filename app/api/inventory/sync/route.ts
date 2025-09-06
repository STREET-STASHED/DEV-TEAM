import { NextRequest, NextResponse } from 'next/server'
// import { createAdminClient } from '@/lib/supabaseAdmin'
import { RealTimeInventoryManager } from '@/lib/inventory/realTimeInventory'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, updates } = body

    if (!productId || !updates) {
      return NextResponse.json({ error: 'Product ID and updates are required' }, { status: 400 })
    }

    const inventoryManager = RealTimeInventoryManager.getInstance()
    const updatedItem = await inventoryManager.syncInventory(productId, updates)

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error('Error syncing inventory:', error)
    return NextResponse.json({ error: 'Failed to sync inventory' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    const inventoryManager = RealTimeInventoryManager.getInstance()
    const inventory = inventoryManager.getSellerInventory(sellerId)
    const alerts = inventoryManager.getSellerAlerts(sellerId)
    const reorderSuggestions = inventoryManager.getSellerReorderSuggestions(sellerId)
    const analytics = inventoryManager.getInventoryAnalytics(sellerId)

    return NextResponse.json({
      inventory,
      alerts,
      reorderSuggestions,
      analytics
    })
  } catch (error) {
    console.error('Error fetching inventory data:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory data' }, { status: 500 })
  }
}
