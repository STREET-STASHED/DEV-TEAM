const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Authentication calls
      urlPattern: /^https:\/\/ofccxjowebslrcuynrw\.supabase\.co\/auth\/v1\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-auth-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 10, maxAgeSeconds: 300 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    {
      // REST calls
      urlPattern: /^https:\/\/ofccxjowebslrcuynrw\.supabase\.co\/rest\/v1\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-rest-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Include the default Next.js PWA cache rules
    ...runtimeCaching,
  ],
});
