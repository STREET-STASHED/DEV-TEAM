import { NextRequest, NextResponse } from 'next/server'
// import { createAdminClient } from '@/lib/supabaseAdmin'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // const supabase = createAdminClient()

    // Mock tracking data - in production, this would query the orders and tracking tables
    const trackingData = {
      orderId,
      status: 'in_transit' as const,
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      actualDelivery: null,
      driver: {
        id: 'driver-123',
        name: 'Mike Johnson',
        phone: '+1-555-0123',
        photo: '/images/drivers/mike-johnson.jpg',
        rating: 4.8,
        vehicleType: 'car' as const,
        vehicleInfo: 'White Honda Civic - ABC123'
      },
      location: {
        lat: 40.4406,
        lng: -79.9959,
        address: '1234 Market St, Pittsburgh, PA 15222',
        lastUpdated: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      timeline: [
        {
          id: '1',
          status: 'pending',
          message: 'Order placed and confirmed',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          location: {
            lat: 40.4406,
            lng: -79.9959,
            address: '1234 Market St, Pittsburgh, PA 15222'
          }
        },
        {
          id: '2',
          status: 'confirmed',
          message: 'Order confirmed by seller',
          timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
          location: {
            lat: 40.4406,
            lng: -79.9959,
            address: '1234 Market St, Pittsburgh, PA 15222'
          }
        },
        {
          id: '3',
          status: 'preparing',
          message: 'Seller is preparing your items',
          timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          location: {
            lat: 40.4406,
            lng: -79.9959,
            address: '1234 Market St, Pittsburgh, PA 15222'
          }
        },
        {
          id: '4',
          status: 'picked_up',
          message: 'Driver Mike Johnson has picked up your order',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          location: {
            lat: 40.4406,
            lng: -79.9959,
            address: '1234 Market St, Pittsburgh, PA 15222'
          },
          estimatedTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
        },
        {
          id: '5',
          status: 'in_transit',
          message: 'Your order is on the way',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          location: {
            lat: 40.4406,
            lng: -79.9959,
            address: '1234 Market St, Pittsburgh, PA 15222'
          },
          estimatedTime: new Date(Date.now() + 25 * 60 * 1000) // 25 minutes from now
        }
      ],
      deliveryAddress: {
        street: '5678 Liberty Ave',
        city: 'Pittsburgh',
        state: 'PA',
        zipCode: '15222',
        instructions: 'Leave at front door if no answer'
      },
      pickupAddress: {
        street: '1234 Market St',
        city: 'Pittsburgh',
        state: 'PA',
        zipCode: '15222'
      },
      items: [
        {
          id: 'item-1',
          name: 'Vintage Nike Air Jordan 1',
          quantity: 1,
          image: '/images/products/jordan1.jpg'
        },
        {
          id: 'item-2',
          name: 'Supreme Box Logo Hoodie',
          quantity: 1,
          image: '/images/products/supreme-hoodie.jpg'
        }
      ]
    }

    return NextResponse.json(trackingData)
  } catch (error) {
    console.error('Error fetching order tracking data:', error)
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params
    const body = await request.json()
    const { status, location, message } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    // const supabase = createAdminClient()

    // Create new tracking event
    const trackingEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      status,
      message: message || getDefaultMessage(status),
      location,
      timestamp: new Date().toISOString()
    }

    // In production, this would:
    // 1. Insert the tracking event into the database
    // 2. Update the order status
    // 3. Send real-time notifications to the customer
    // 4. Update driver location if provided

    console.log('Tracking event created:', trackingEvent)

    return NextResponse.json({ success: true, event: trackingEvent })
  } catch (error) {
    console.error('Error creating tracking event:', error)
    return NextResponse.json({ error: 'Failed to create tracking event' }, { status: 500 })
  }
}

function getDefaultMessage(status: string): string {
  const messages = {
    pending: 'Order is being processed',
    confirmed: 'Order has been confirmed',
    preparing: 'Seller is preparing your items',
    picked_up: 'Driver has picked up your order',
    in_transit: 'Your order is on the way',
    delivered: 'Order has been delivered',
    cancelled: 'Order has been cancelled'
  }
  
  return messages[status as keyof typeof messages] || 'Order status updated'
}
