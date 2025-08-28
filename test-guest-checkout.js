// Test script for guest checkout functionality
// Run this with: node test-guest-checkout.js

const testGuestCheckout = async () => {
  try {
    console.log('🧪 Testing guest checkout API...');

    const testOrderData = {
      items: [
        {
          id: 'test-item-1',
          name: 'Test Product',
          price: 29.99,
          quantity: 1,
          image_url: '/mock/default-product.jpg',
          category: 'Clothing'
        }
      ],
      pickupAddress: {
        street: '123 Main St',
        city: 'Pittsburgh',
        state: 'PA',
        zipCode: '15201'
      },
      deliveryAddress: {
        street: '456 Oak Ave',
        city: 'Pittsburgh',
        state: 'PA',
        zipCode: '15202'
      },
      distanceMiles: 5.2,
      totalPrice: 29.99,
      guestUser: {
        email: 'test@example.com',
        fullName: 'Test User',
        phone: '555-123-4567'
      }
    };

    console.log('📦 Test order data:', JSON.stringify(testOrderData, null, 2));

    const response = await fetch('http://localhost:3000/api/orders/guest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrderData)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Guest checkout successful!');
      console.log('📋 Order result:', JSON.stringify(result, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ Guest checkout failed!');
      console.log('🚨 Error details:', JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('🔍 Full error:', error);
  }
};

// Run the test
testGuestCheckout();
