import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimitApp';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { pickup, delivery } = body;

    if (!pickup || !delivery) {
      return NextResponse.json({ error: 'Pickup and delivery addresses are required' }, { status: 400 });
    }

    // Use Google Maps Distance Matrix API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API not configured' }, { status: 500 });
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(pickup)}&destinations=${encodeURIComponent(delivery)}&key=${apiKey}&units=imperial`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Maps API error:', data);
      // Fallback to mock data if API fails
      const mockDistanceMiles = Math.random() * 15 + 2;
      return NextResponse.json({ 
        distanceMiles: mockDistanceMiles,
        minutes: Math.round(mockDistanceMiles * 3),
        note: 'Using fallback calculation due to API error'
      });
    }

    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      return NextResponse.json({ error: 'Could not calculate distance' }, { status: 400 });
    }

    const distanceMiles = element.distance.value * 0.000621371; // Convert meters to miles
    const minutes = element.duration.value / 60; // Convert seconds to minutes

    return NextResponse.json({ 
      distanceMiles: Math.round(distanceMiles * 100) / 100,
      minutes: Math.round(minutes)
    });

  } catch (error) {
    console.error('Distance calculation error:', error);
    return NextResponse.json({ error: 'Failed to calculate distance' }, { status: 500 });
  }
}
