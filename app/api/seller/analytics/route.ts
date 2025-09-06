import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const timeRange = searchParams.get('timeRange') || '30d'

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Fetch seller analytics data
    const [
      overviewData,
      salesData,
      productsData,
      inventoryData,
      alertsData
    ] = await Promise.all([
      getOverviewData(supabase, sellerId, startDate),
      getSalesData(supabase, sellerId, startDate, timeRange),
      getProductsData(supabase, sellerId),
      getInventoryData(supabase, sellerId),
      getAlertsData(supabase, sellerId)
    ])

    const analytics = {
      overview: overviewData,
      sales: salesData,
      products: productsData,
      inventory: inventoryData,
      alerts: alertsData,
      trends: calculateTrends(overviewData, timeRange)
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching seller analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

async function getOverviewData(_supabase: any, _sellerId: string, _startDate: Date) {
  // Mock data for now - in production, this would query the actual database
  return {
    totalRevenue: 15420.50,
    totalOrders: 127,
    totalProducts: 45,
    conversionRate: 0.12,
    averageOrderValue: 121.42,
    totalViews: 2840,
    totalFavorites: 156,
    rating: 4.3,
    reviewCount: 89
  }
}

async function getSalesData(_supabase: any, _sellerId: string, _startDate: Date, timeRange: string) {
  // Mock sales data - in production, this would query order history
  const generateSalesData = (days: number) => {
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 500 + 100,
        orders: Math.floor(Math.random() * 10) + 1
      })
    }
    return data
  }

  let dailyData: Array<{ date: string; revenue: number; orders: number }> = []
  switch (timeRange) {
    case '7d':
      dailyData = generateSalesData(7)
      break
    case '30d':
      dailyData = generateSalesData(30)
      break
    case '90d':
      dailyData = generateSalesData(90)
      break
    case '1y':
      dailyData = generateSalesData(365)
      break
  }

  return {
    daily: dailyData,
    weekly: [], // Would aggregate daily data into weeks
    monthly: [] // Would aggregate daily data into months
  }
}

async function getProductsData(_supabase: any, _sellerId: string) {
  // Mock product data - in production, this would query the products table
  return {
    topSelling: [
      {
        id: '1',
        name: 'Vintage Nike Air Jordan 1',
        image: '/images/products/jordan1.jpg',
        sales: 23,
        revenue: 3450.00,
        views: 156,
        conversionRate: 0.15
      },
      {
        id: '2',
        name: 'Supreme Box Logo Hoodie',
        image: '/images/products/supreme-hoodie.jpg',
        sales: 18,
        revenue: 2700.00,
        views: 89,
        conversionRate: 0.20
      },
      {
        id: '3',
        name: 'Off-White Industrial Belt',
        image: '/images/products/offwhite-belt.jpg',
        sales: 15,
        revenue: 1200.00,
        views: 67,
        conversionRate: 0.22
      }
    ],
    lowStock: [
      {
        id: '4',
        name: 'Balenciaga Triple S Sneakers',
        image: '/images/products/balenciaga-triple-s.jpg',
        currentStock: 2,
        reorderPoint: 5,
        urgency: 'critical' as const
      },
      {
        id: '5',
        name: 'Gucci GG Marmont Bag',
        image: '/images/products/gucci-bag.jpg',
        currentStock: 3,
        reorderPoint: 5,
        urgency: 'high' as const
      }
    ],
    performance: [
      {
        id: '1',
        name: 'Vintage Nike Air Jordan 1',
        views: 156,
        favorites: 23,
        sales: 23,
        revenue: 3450.00,
        rating: 4.8,
        conversionRate: 0.15
      }
    ]
  }
}

async function getInventoryData(_supabase: any, _sellerId: string) {
  // Mock inventory data - in production, this would query inventory tables
  return {
    totalValue: 45600.00,
    turnoverRate: 3.2,
    lowStockCount: 8,
    outOfStockCount: 2,
    reorderSuggestions: 12
  }
}

async function getAlertsData(_supabase: any, _sellerId: string) {
  // Mock alerts data - in production, this would query alerts table
  return [
    {
      id: '1',
      type: 'low_stock' as const,
      severity: 'high' as const,
      message: 'Balenciaga Triple S Sneakers - Only 2 units left',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      resolved: false
    },
    {
      id: '2',
      type: 'out_of_stock' as const,
      severity: 'critical' as const,
      message: 'Supreme Box Logo Tee - Out of stock',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      resolved: false
    },
    {
      id: '3',
      type: 'performance_alert' as const,
      severity: 'medium' as const,
      message: 'Low conversion rate detected on 3 products',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      resolved: false
    }
  ]
}

function calculateTrends(_overviewData: any, _timeRange: string) {
  // Mock trend calculations - in production, this would compare with previous periods
  return {
    revenueGrowth: 0.15, // 15% growth
    orderGrowth: 0.08,   // 8% growth
    productGrowth: 0.05, // 5% growth
    conversionGrowth: 0.12 // 12% growth
  }
}
