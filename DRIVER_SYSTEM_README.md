# StreetStashed Driver & Order System

## Overview

This document describes the comprehensive driver logic and checkout system implementation for StreetStashed, featuring the Stashed Support Fee structure and driver management system.

## 🚚 Driver Logic

### Order Assignment System
- **No Auto-Assignment**: Orders are NOT automatically assigned to drivers
- **Driver Queue**: Drivers see available orders in a queue and can manually accept/deny them
- **Confirmation Requirements**: Orders beyond 10 miles or after 10 PM require driver confirmation
- **Distance-Based Pay**: Drivers are paid based on distance only, not order value

### Driver Information Visibility
Drivers can ONLY see:
- Distance (miles)
- Pickup location
- Dropoff location
- Estimated earnings
- Order creation time

Drivers CANNOT see:
- Order item details
- Order total value
- Buyer information
- Seller information

### Driver Tiers & Bonuses
- **Bronze**: 0% bonus (default)
- **Silver**: 5% bonus (25+ orders, 4.0+ rating)
- **Gold**: 10% bonus (100+ orders, 4.5+ rating)
- **Diamond**: 15% bonus (250+ orders, 4.8+ rating)

## 💰 Stashed Support Fee System

### Fee Structure
The Stashed Support Fee scales by distance and includes both delivery costs and platform margin:

| Distance Range | Base Fee | Per Mile Rate | Driver Payout % | Platform Margin % |
|----------------|----------|---------------|------------------|-------------------|
| 0-5 miles     | $8.99    | $1.50         | 70%             | 30%               |
| 6-10 miles    | $12.99   | $2.00         | 75%             | 25%               |
| 11-15 miles   | $16.99   | $2.50         | 80%             | 20%               |
| 16-20 miles   | $21.99   | $3.00         | 80%             | 20%               |
| 21+ miles     | $26.99   | $3.50         | 80%             | 20%               |

### Fee Calculation Example
For a 7-mile delivery:
- Base Fee: $12.99
- Per Mile: 7 × $2.00 = $14.00
- **Total Support Fee**: $26.99
- **Driver Payout**: $26.99 × 75% = $20.24
- **Platform Margin**: $26.99 × 25% = $6.75

## 🗄️ Database Schema

### Tables

#### `driver_profiles`
- Driver personal information
- Vehicle details
- Current location and availability
- Driver tier and statistics

#### `driver_stats`
- Order completion tracking
- Earnings and distance totals
- Rating averages
- Tier progression

#### `orders`
- Complete order information
- Fee breakdowns
- Driver assignment
- Status tracking

### Row-Level Security (RLS)
- **Buyers**: Can only see their own orders
- **Sellers**: Can only see orders assigned to them
- **Drivers**: Can see available orders and their assigned orders
- **Admins**: Can see all data

## 🔧 Technical Implementation

### File Structure
```
lib/
├── types.ts              # TypeScript interfaces
├── feeConfig.ts          # Fee calculation logic
├── orders.ts             # Order management service
├── drivers.ts            # Driver management service
└── distance.ts           # Distance calculation utilities

components/orders/
├── CheckoutSummary.tsx   # Fee breakdown component
├── OrderPageBuyer.tsx    # Buyer order view
├── OrderPageDriver.tsx   # Driver dashboard
└── OrderPageSeller.tsx   # Seller order view
```

### Key Services

#### OrderService
- `createOrder()`: Creates new orders with fee calculations
- `getUserOrders()`: Retrieves orders by user role
- `getAvailableOrders()`: Gets pending orders for drivers
- `updateOrderStatus()`: Updates order status and driver assignment

#### DriverService
- `getAvailableOrdersForDriver()`: Gets filtered orders for driver view
- `acceptOrder()`: Driver accepts an order
- `pickupOrder()`: Marks order as picked up
- `deliverOrder()`: Completes order delivery
- `updateDriverStats()`: Updates driver statistics and tier

### Order Status Flow
1. **pending** → Order created, waiting for driver
2. **accepted** → Driver assigned, order accepted
3. **picked_up** → Driver picked up items
4. **in_transit** → Driver en route to delivery
5. **delivered** → Order completed successfully
6. **cancelled** → Order cancelled by any party

## 🚀 Usage Examples

### Creating an Order
```typescript
import { OrderService } from '@/lib/orders'

const checkoutData = {
  items: cartItems,
  pickup_address: sellerAddress,
  delivery_address: buyerAddress,
  distance_miles: 5.2,
  delivery_instructions: "Gate code: 1234"
}

const order = await OrderService.createOrder(checkoutData, buyerId, sellerId)
```

### Driver Accepting Order
```typescript
import { DriverService } from '@/lib/drivers'

const result = await DriverService.acceptOrder(orderId, driverId)
if (result.requiresConfirmation) {
  // Show confirmation modal for long distance/late night orders
}
```

### Calculating Fees
```typescript
import { calculateFees } from '@/lib/feeConfig'

const fees = calculateFees(7.5, 'Silver') // 7.5 miles, Silver tier driver
// Returns: { support_fee_total: 26.99, driver_payout: 20.24, platform_margin: 6.75 }
```

## 🔒 Security Features

### Authentication
- All operations require valid user authentication
- User roles determine data access permissions

### Data Validation
- Input validation on all forms
- Type safety with TypeScript
- Database constraints and triggers

### Row-Level Security
- Users can only access their own data
- Drivers cannot see sensitive order information
- Admins have full access for monitoring

## 📱 UI Components

### CheckoutSummary
- Real-time fee calculation
- Distance-based fee breakdown
- Driver payout transparency
- Platform margin disclosure

### OrderPageBuyer
- Order status tracking
- Delivery information
- Fee breakdown
- Driver assignment details

### OrderPageDriver
- Available orders queue
- Current order management
- Status update buttons
- Earnings information

### OrderPageSeller
- Order management dashboard
- Driver assignment tracking
- Financial summaries
- Status filtering

## 🧪 Testing & Development

### Mock Data
- Sample driver profiles
- Test orders
- Mock distance calculations

### Environment Variables
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Database Setup
1. Run the migration: `supabase/migrations/20250117000000_driver_order_system.sql`
2. Enable RLS on all tables
3. Set up authentication policies

## 🚨 Important Notes

### Driver Confirmation Triggers
- Distance > 10 miles
- Time after 10:00 PM
- Drivers can still accept but must confirm

### Fee Transparency
- All fees clearly displayed to buyers
- Driver payout amounts visible
- Platform margin disclosed

### Real-Time Updates
- Orders refresh every 30 seconds
- Driver status updates immediately
- Fee calculations update in real-time

## 🔮 Future Enhancements

### Planned Features
- Real-time driver tracking
- Push notifications
- Advanced analytics dashboard
- Driver rating system
- Automated tier progression

### Scalability Considerations
- Database indexing for performance
- Caching for frequently accessed data
- Background job processing
- WebSocket integration for real-time updates

## 📞 Support

For technical questions or implementation issues, refer to:
- Database schema: `supabase/migrations/`
- Service logic: `lib/` directory
- UI components: `components/orders/`
- Type definitions: `lib/types.ts`

---

**Version**: 1.0.0  
**Last Updated**: January 17, 2025  
**Status**: Production Ready ✅
