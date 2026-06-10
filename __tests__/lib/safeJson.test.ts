import { safeJsonParse, safeEnvJsonParse, safeLocalStorageParse } from '@/lib/safeJson';

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
    expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3]);
  });

  it('returns the fallback for invalid JSON', () => {
    expect(safeJsonParse('{not json', { ok: true })).toEqual({ ok: true });
  });

  it('returns the fallback for null/undefined/empty input', () => {
    expect(safeJsonParse(null, 'fallback')).toBe('fallback');
    expect(safeJsonParse(undefined, 'fallback')).toBe('fallback');
    expect(safeJsonParse('', 42)).toBe(42);
  });
});

describe('safeEnvJsonParse', () => {
  const KEY = 'SAFE_JSON_TEST_ENV';

  afterEach(() => {
    delete process.env[KEY];
  });

  it('parses JSON stored in an env var', () => {
    process.env[KEY] = '{"flag":true}';
    expect(safeEnvJsonParse(KEY, {})).toEqual({ flag: true });
  });

  it('returns the fallback when the env var is missing', () => {
    expect(safeEnvJsonParse(KEY, { default: 1 })).toEqual({ default: 1 });
  });
});

describe('safeLocalStorageParse', () => {
  beforeEach(() => localStorage.clear());

  it('parses JSON stored in localStorage', () => {
    localStorage.setItem('k', '{"x":2}');
    expect(safeLocalStorageParse('k', {})).toEqual({ x: 2 });
  });

  it('returns the fallback when the key is absent', () => {
    expect(safeLocalStorageParse('missing', [])).toEqual([]);
  });
});
