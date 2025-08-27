// Polyfill for 'self' global variable to prevent 'self is not defined' errors
// This is needed because OpenTelemetry (used by Next.js) references 'self' at the top level

if (typeof globalThis !== 'undefined' && typeof self === 'undefined') {
  (globalThis as any).self = globalThis;
}

// Also polyfill webpack chunk loading mechanism
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).webpackChunk_N_E === 'undefined') {
  (globalThis as any).webpackChunk_N_E = (globalThis as any).webpackChunk_N_E || [];
}

export {};
