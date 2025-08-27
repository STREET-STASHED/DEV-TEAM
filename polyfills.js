// Polyfill for 'self' in Node.js environment
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  global.self = global;
}

// Additional polyfill for server-side rendering
if (typeof globalThis !== 'undefined' && typeof self === 'undefined') {
  globalThis.self = globalThis;
}
