import {
  metersToMiles,
  milesToMeters,
  milesToKm,
  formatAddress,
  calculateDistance,
  type Address,
} from '@/lib/distance';

describe('unit conversions', () => {
  it('converts meters to miles and back (round trip)', () => {
    expect(metersToMiles(1609.34)).toBeCloseTo(1, 4);
    expect(milesToMeters(1)).toBeCloseTo(1609.34, 2);
    expect(metersToMiles(milesToMeters(5))).toBeCloseTo(5, 4);
  });

  it('converts miles to kilometers', () => {
    expect(milesToKm(1)).toBeCloseTo(1.60934, 5);
    expect(milesToKm(0)).toBe(0);
  });
});

describe('formatAddress', () => {
  it('formats an address into a single line string', () => {
    const addr: Address = {
      street: '123 Main St',
      city: 'Pittsburgh',
      state: 'PA',
      zip_code: '15213',
    };
    expect(formatAddress(addr)).toBe('123 Main St, Pittsburgh, PA 15213');
  });
});

describe('calculateDistance (Haversine, km)', () => {
  it('returns 0 for identical coordinates', () => {
    expect(calculateDistance(40.4406, -79.9959, 40.4406, -79.9959)).toBeCloseTo(0, 6);
  });

  it('approximates a known distance (Pittsburgh -> Philadelphia ~430km)', () => {
    const km = calculateDistance(40.4406, -79.9959, 39.9526, -75.1652);
    expect(km).toBeGreaterThan(400);
    expect(km).toBeLessThan(460);
  });

  it('is symmetric', () => {
    const a = calculateDistance(40.44, -79.99, 39.95, -75.16);
    const b = calculateDistance(39.95, -75.16, 40.44, -79.99);
    expect(a).toBeCloseTo(b, 6);
  });
});
