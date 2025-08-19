# 🚀 StreetStashed Full Stashed Support Fee System

## Overview

The StreetStashed platform implements a **full Stashed Support Fee model** where the entire platform fee (driver pay + platform margin + operations) is split fairly between buyers and sellers. This ensures drivers are paid fairly for their time and distance, while maintaining platform sustainability through shared contributions from all parties.

## 🎯 Core Principles

- **Fair Driver Compensation**: Drivers are paid based on distance and time, not order value
- **Transparent Fee Structure**: Clear breakdown of all fees and their purposes
- **Shared Platform Responsibility**: Both buyer and seller contribute to platform sustainability
- **Minimal Individual Impact**: Small, capped fees protect both parties from excessive costs
- **Pittsburgh Market Optimization**: Tuned for local delivery market conditions

## 💰 Fee Structure

### Full Stashed Support Fee Formula

```
Stashed Support Fee = Base + (Per Mile × Distance) + Bonuses
```

**Base Components:**

- **Base Fee**: $6.00 (covers short trips 0–2 miles baseline)
- **Per Mile Rate**: $0.60 per mile
- **Night Bonus**: +$1.00 for deliveries after 10 PM
- **Long Trip Bonus**: +$2.00 for deliveries 10+ miles

**Example Calculations:**

- 0.5 mi @ 3pm → $6.00 + ($0.60 × 0.5) = **$6.30**
- 2.0 mi @ 3pm → $6.00 + ($0.60 × 2.0) = **$7.20**
- 7.0 mi @ 3pm → $6.00 + ($0.60 × 7.0) = **$10.20**
- 10.0 mi @ 11pm → $6.00 + ($0.60 × 10.0) + $1.00 + $2.00 = **$15.00**

### Fee Split Between Buyer and Seller

```
Buyer Share = 50% of Total Support Fee (capped at $12.00)
Seller Share = 50% of Total Support Fee (capped at $20.00)
```

**Protection Caps:**

- **Buyer Cap**: $12.00 maximum (prevents excessive buyer costs)
- **Seller Cap**: $20.00 maximum (prevents excessive seller deductions)

### Driver Compensation from Support Fee

```
Driver Pay = 75% of Total Support Fee
Platform Margin = 25% of Total Support Fee
```

**Example:**

- 12-mile order at 11PM → Support Fee = $16.20
- Driver gets: $16.20 × 75% = **$12.15**
- Platform gets: $16.20 × 25% = **$4.05**

## 🗂️ File Structure

### Core Configuration

- **`lib/feeConfig.ts`** - Fee configuration and constants
- **`lib/fees.ts`** - Fee calculation logic and validation
- **`lib/distance.ts`** - Distance calculation and Google Maps integration

### Components

- **`components/orders/CheckoutSummary.tsx`** - Checkout fee breakdown
- **`components/orders/OrderPageBuyer.tsx`** - Buyer order view with fees
- **`components/orders/OrderPageDriver.tsx`** - Driver order management
- **`components/orders/OrderPageSeller.tsx`** - Seller order dashboard

### Services

- **`lib/orders.ts`** - Order management with fee integration
- **`lib/drivers.ts`** - Driver operations and order handling

### Database

- **`supabase/migrations/20250118000000_add_fee_fields.sql`** - Database schema updates

## 🔧 Configuration

### Fee Configuration (`lib/feeConfig.ts`)

```typescript
export const feeConfig = {
  // Base Stashed Support Fee calculation (covers everything)
  base: 6.0, // covers short trips (0–2 miles baseline)
  perMile: 0.6, // per-mile add-on

  // Bonuses
  enableNightBonus: true,
  nightBonusAfterHour: 22,
  nightBonusAmount: 1.0,
  enableLongTripBonus: true,
  longTripThresholdMiles: 10,
  longTripBonusAmount: 2.0,

  // Split percentages — these apply to the full fee, not just driver payout
  buyerSharePercent: 0.5, // 50% buyer
  sellerSharePercent: 0.5, // 50% seller

  // Caps/floors to protect either side
  buyerMaxFee: 12.0,
  sellerMaxFee: 20.0,

  // Distance limits
  maxPilotRadiusMiles: 20,

  // Fallback speed for Pittsburgh (if API fails)
  fallbackAvgMph: 23.4,

  // Driver payout percentage from the total support fee
  driverPayPercentage: 0.75, // 75% of total support fee goes to driver
};
```

### Environment Variables

```bash
# Required for Google Maps integration
GOOGLE_MAPS_API_KEY=your_api_key_here

# Optional: Override default configuration
NEXT_PUBLIC_FEE_CONFIG_OVERRIDE=false
```

## 📊 Database Schema

### New Fields in `orders` Table

```sql
ALTER TABLE orders ADD COLUMN:
- distance_miles NUMERIC(8,2)      -- Delivery distance
- eta_minutes INTEGER              -- Estimated delivery time
- stashed_support_fee_total NUMERIC(10,2) -- Full support fee (driver pay + platform margin + ops)
- buyer_support_fee NUMERIC(10,2)     -- Buyer's portion
- seller_support_fee NUMERIC(10,2)    -- Seller's portion
- driver_pay NUMERIC(10,2)            -- Driver compensation
- platform_margin NUMERIC(10,2)       -- Platform margin
```

### Automatic Fee Calculation

The database includes triggers that automatically calculate fees when orders are created or updated:

```sql
-- Trigger function automatically updates fee fields
CREATE TRIGGER trigger_update_order_fees
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_fees();
```

## 🚀 Usage Examples

### Calculate Fees for an Order

```typescript
import { calculateFees } from "@/lib/fees";

const fees = calculateFees({
  distanceMiles: 8.5,
  etaMinutes: 25,
  merchSubtotal: 89.99,
});

console.log(fees.stashedSupportFee.total); // $11.10
console.log(fees.stashedSupportFee.buyerShare); // $5.55
console.log(fees.stashedSupportFee.sellerShare); // $5.55
console.log(fees.driverCompensation.driverPay); // $8.33
console.log(fees.driverCompensation.platformMargin); // $2.77
```

### Get Driver Pay Breakdown

```typescript
import { getDriverPayBreakdown } from "@/lib/fees";

const breakdown = getDriverPayBreakdown(8.5, 14); // 8.5 miles, 2 PM

console.log(breakdown.base); // $6.00
console.log(breakdown.mileage); // $5.10
console.log(breakdown.bonuses); // $0.00
console.log(breakdown.total); // $11.10
```

### Calculate Seller Net Payout

```typescript
import { calculateSellerNetPayout } from "@/lib/fees";

const payout = calculateSellerNetPayout(100, 5.55); // $100 item, $5.55 support fee

console.log(payout.basePrice); // $100.00
console.log(payout.supportFeeDeduction); // $5.55
console.log(payout.netPayout); // $94.45
console.log(payout.profitMargin); // 94.45%
```

### Validate Order Distance

```typescript
import { canPlaceOrder } from "@/lib/fees";

const validation = canPlaceOrder(25.5); // 25.5 miles

if (!validation.valid) {
  console.log(validation.error); // "Distance 25.5 miles exceeds pilot radius of 20 miles"
}
```

## 🧪 Testing

### Test Page

Visit `/test-fees` to interactively test the fee calculation system with different parameters, including the full Stashed Support Fee model.

### Unit Tests

```bash
# Run fee calculation tests
npm test -- --testPathPattern=fees

# Test specific scenarios
npm test -- --testNamePattern="0.5 mi @ 3pm"
```

### Test Cases

The system includes comprehensive test cases covering:

- Short distance deliveries (0-2 miles)
- Medium distance deliveries (2-10 miles)
- Long distance deliveries (10+ miles)
- Night deliveries (after 10 PM)
- Fee splits between buyer and seller
- Driver compensation calculations
- Platform margin calculations
- Edge cases and validation

## 🔒 Security & Validation

### Input Validation

- Distance must be positive and within pilot radius (20 miles)
- All monetary values are rounded to 2 decimal places
- Support fees are capped to prevent excessive charges
- Buyer and seller caps protect both parties

### Rate Limiting

- Google Maps API calls are rate-limited
- Fallback calculations prevent service disruption
- Error handling with graceful degradation

### Data Integrity

- Database constraints ensure valid fee values
- Automatic fee calculation prevents manual errors
- Audit trail for all fee calculations
- Caps prevent excessive fees for either party

## 📈 Performance Optimization

### Caching

- Fee calculations are cached for repeated requests
- Distance calculations use Google Maps with fallbacks
- Database indexes on frequently queried fields

### Fallback Systems

- Haversine formula with road multiplier (1.2x) for distance
- Pittsburgh-specific speed averages for ETA
- Graceful degradation when external APIs fail

## 🚧 Future Enhancements

### Planned Features

- Dynamic pricing based on demand
- Driver rating bonuses
- Peak hour surcharges
- Multi-stop delivery optimization
- Fee split optimization based on market conditions
- A/B testing for different fee structures

### Configuration Management

- Admin dashboard for fee adjustments
- A/B testing for different fee structures
- Market-specific fee configurations
- Dynamic cap adjustments based on market conditions

## 🐛 Troubleshooting

### Common Issues

**Fee calculation errors:**

- Check environment variables for Google Maps API key
- Verify distance calculations are within pilot radius
- Ensure all required fields are provided
- Check that fee caps are properly configured

**Database migration issues:**

- Run migration with `supabase db push`
- Check for existing column conflicts
- Verify database permissions

**Component rendering errors:**

- Check import paths for fee calculation functions
- Verify TypeScript types are properly defined
- Ensure all required props are passed

### Debug Mode

Enable debug logging by setting:

```bash
NEXT_PUBLIC_DEBUG_FEES=true
```

This will log detailed fee calculation steps to the console.

## 📚 API Reference

### Fee Calculation Functions

| Function                     | Description                                      | Parameters                    | Returns                |
| ---------------------------- | ------------------------------------------------ | ----------------------------- | ---------------------- |
| `calculateFees()`            | Calculate all fees for an order                  | `FeeInput`                    | `FeeOutput`            |
| `getDriverPayBreakdown()`    | Get driver pay breakdown                         | `distance, hour`              | `DriverPayBreakdown`   |
| `canPlaceOrder()`            | Validate order distance                          | `distanceMiles`               | `ValidationResult`     |
| `calculateSellerNetPayout()` | Calculate seller net payout                      | `basePrice, sellerSupportFee` | `SellerNetPayout`      |
| `getExampleCalculations()`   | Get example calculations for different scenarios | None                          | `ExampleCalculation[]` |

### Types

```typescript
interface FeeInput {
  distanceMiles: number;
  etaMinutes: number;
  merchSubtotal: number;
  localHour?: number;
}

interface FeeOutput {
  stashedSupportFee: {
    total: number; // Full support fee (driver pay + platform margin + ops)
    buyerShare: number; // Buyer's portion
    sellerShare: number; // Seller's portion
  };
  driverCompensation: {
    driverPay: number; // Driver's take-home pay
    platformMargin: number; // Platform's margin
    percentage: number; // What % of support fee goes to driver
  };
  meta: {
    distanceMiles: number;
    etaMinutes: number;
    isWithinPilotRadius: boolean;
    appliedBonuses: string[];
    feeTierDescription: string;
    totalOrderAmount: number;
  };
}
```

## 🤝 Contributing

### Development Guidelines

1. All fee calculations must include proper validation
2. New fee types require database migration
3. UI components must handle loading and error states
4. Tests must cover edge cases and validation
5. Fee caps must protect both buyer and seller
6. Driver compensation must remain fair and transparent

### Code Style

- Use TypeScript for all fee-related code
- Include JSDoc comments for public functions
- Follow the existing black & gold theme
- Implement proper error handling

## 📞 Support

For questions about the fee system:

- Check the test page at `/test-fees`
- Review the configuration in `lib/feeConfig.ts`
- Run the test suite for validation
- Check browser console for debug information

---

**Last Updated**: January 18, 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅
