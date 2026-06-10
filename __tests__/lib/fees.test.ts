import {
  getAppliedBonuses,
  getFeeTierDescription,
  calculateTotalOrderAmount,
  getDriverPayBreakdown,
  calculateSellerNetPayout,
  calculateFees,
} from '@/lib/fees';

describe('getFeeTierDescription', () => {
  it.each([
    [1, 'Local Delivery'],
    [2, 'Local Delivery'],
    [5, 'Metro Delivery'],
    [10, 'Extended Delivery'],
    [15, 'Premium Delivery'],
    [20, 'Long Distance Delivery'],
    [25, 'Extended Range Delivery'],
  ])('maps %d miles to "%s"', (miles, expected) => {
    expect(getFeeTierDescription(miles)).toBe(expected);
  });
});

describe('getAppliedBonuses', () => {
  it('returns no bonuses for a short daytime trip', () => {
    expect(getAppliedBonuses(3, 14)).toEqual([]);
  });

  it('adds a night bonus after 10pm', () => {
    expect(getAppliedBonuses(3, 22)).toContain('Night Bonus ($1.50)');
  });

  it('adds a long trip bonus for 10+ miles', () => {
    expect(getAppliedBonuses(12, 14)).toContain('Long Trip Bonus');
  });

  it('can apply both bonuses', () => {
    expect(getAppliedBonuses(12, 23)).toHaveLength(2);
  });
});

describe('calculateTotalOrderAmount', () => {
  it('sums subtotal and fee, rounded to cents', () => {
    expect(calculateTotalOrderAmount(20, 4.5)).toBe(24.5);
    expect(calculateTotalOrderAmount(19.999, 0)).toBe(20);
  });
});

describe('getDriverPayBreakdown', () => {
  it('computes base + mileage with no bonuses', () => {
    const r = getDriverPayBreakdown(4, 14);
    expect(r.base).toBe(6);
    expect(r.mileage).toBe(2.8); // 0.70 * 4
    expect(r.bonuses).toBe(0);
    expect(r.total).toBe(8.8);
  });

  it('includes night and long-trip bonuses', () => {
    const r = getDriverPayBreakdown(10, 23);
    expect(r.bonuses).toBe(4.5); // 1.50 + 3.00
    expect(r.total).toBeCloseTo(6 + 7 + 4.5, 2);
  });
});

describe('calculateSellerNetPayout', () => {
  it('deducts the support fee and computes a margin', () => {
    const r = calculateSellerNetPayout(100, 10);
    expect(r.netPayout).toBe(90);
    expect(r.profitMargin).toBe(90);
  });

  it('reports a 0% margin when payout is non-positive', () => {
    const r = calculateSellerNetPayout(10, 20);
    expect(r.netPayout).toBe(-10);
    expect(r.profitMargin).toBe(0);
  });
});

describe('calculateFees', () => {
  it('throws when distance is not positive', () => {
    expect(() => calculateFees({ distanceMiles: 0, etaMinutes: 5, merchSubtotal: 20 })).toThrow();
  });

  it('returns a well-formed breakdown for a valid order', () => {
    const out = calculateFees({ distanceMiles: 3, etaMinutes: 12, merchSubtotal: 40, localHour: 14 });
    expect(out.stashedSupportFee.total).toBeGreaterThan(0);
    expect(out.meta.totalOrderAmount).toBeGreaterThanOrEqual(40);
    expect(out.driverCompensation.percentage).toBe(70);
    expect(out.meta.feeTierDescription).toBe('Metro Delivery');
  });
});
