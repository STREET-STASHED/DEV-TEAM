import "@testing-library/jest-dom";
import React from "react";

// Global Jest globals
global.describe = describe;
global.test = test;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.module = module;
global.require = require;

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    return React.createElement("img", props);
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return React.createElement("a", { href, ...props }, children);
  },
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_test";
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = "test-google-maps-key";

// Mock Supabase
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      ),
      signIn: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      ),
      signUp: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: "test-user-id" } },
          error: null,
        }),
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => Promise.resolve({ data: null, error: null })),
      delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}));

// Mock Stripe
jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn(() =>
    Promise.resolve({
      elements: jest.fn(() => ({
        create: jest.fn(() => ({
          mount: jest.fn(),
          unmount: jest.fn(),
          on: jest.fn(),
        })),
      })),
      confirmPayment: jest.fn(() => Promise.resolve({ error: null })),
      createToken: jest.fn(() => Promise.resolve({ error: null })),
    }),
  ),
}));

// Mock Google Maps
global.google = {
  maps: {
    Map: jest.fn().mockImplementation(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      fitBounds: jest.fn(),
    })),
    Marker: jest.fn().mockImplementation(() => ({
      setPosition: jest.fn(),
      setMap: jest.fn(),
    })),
    InfoWindow: jest.fn().mockImplementation(() => ({
      open: jest.fn(),
      close: jest.fn(),
    })),
    LatLng: jest.fn().mockImplementation((lat, lng) => ({
      lat: () => lat,
      lng: () => lng,
    })),
    Geocoder: jest.fn().mockImplementation(() => ({
      geocode: jest.fn(),
    })),
    places: {
      Autocomplete: jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        bindTo: jest.fn(),
      })),
      PlacesService: jest.fn().mockImplementation(() => ({
        findPlaceFromQuery: jest.fn(),
        getDetails: jest.fn(),
      })),
    },
  },
};

// Mock Intersection Observer
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Resize Observer
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: jest.fn(),
});

// Mock window.alert
Object.defineProperty(window, "alert", {
  writable: true,
  value: jest.fn(),
});

// Mock window.confirm
Object.defineProperty(window, "confirm", {
  writable: true,
  value: jest.fn(() => true),
});

// Mock window.prompt
Object.defineProperty(window, "prompt", {
  writable: true,
  value: jest.fn(() => "test"),
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  }),
);

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock console methods in tests to reduce noise
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Create proper Jest mocks for console methods
  console.error = jest.fn((...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is deprecated")
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  });

  console.warn = jest.fn((...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: componentWillReceiveProps") ||
        args[0].includes("Warning: componentWillUpdate"))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock performance API
Object.defineProperty(window, "performance", {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn(),
  },
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mocked-url");
global.URL.revokeObjectURL = jest.fn();

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  result: "test-result",
}));

// Mock crypto API
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: jest.fn(() => new Uint8Array(16)),
    randomUUID: jest.fn(() => "test-uuid"),
  },
});

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.getItem.mockReturnValue(null);

  // Reset fetch mock
  global.fetch.mockClear();

  // Reset console mocks
  console.error.mockClear();
  console.warn.mockClear();
});

// Global test utilities
global.testUtils = {
  // Helper to wait for async operations
  waitFor: (callback, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
            return;
          }
        } catch {
          // Continue checking
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error("waitFor timeout"));
          return;
        }

        setTimeout(check, 10);
      };

      check();
    });
  },

  // Helper to create mock user
  createMockUser: (overrides = {}) => ({
    id: "test-user-id",
    email: "test@example.com",
    full_name: "Test User",
    role: "buyer",
    ...overrides,
  }),

  // Helper to create mock product
  createMockProduct: (overrides = {}) => ({
    id: "test-product-id",
    name: "Test Product",
    price: 99.99,
    description: "Test description",
    category: "test",
    image: "test-image.jpg",
    ...overrides,
  }),
};
