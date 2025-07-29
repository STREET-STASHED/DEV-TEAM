if (!self.define) {
  let e,
    s = {};
  const a = (a, n) => (
    (a = new URL(a + ".js", n).href),
    s[a] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          ((e.src = a), (e.onload = s), document.head.appendChild(e));
        } else ((e = a), importScripts(a), s());
      }).then(() => {
        let e = s[a];
        if (!e) throw new Error(`Module ${a} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, c) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[t]) return;
    let i = {};
    const r = (e) => a(e, t),
      o = { module: { uri: t }, exports: i, require: r };
    s[t] = Promise.all(n.map((e) => o[e] || r(e))).then((e) => (c(...e), i));
  };
}
define(["./workbox-4754cb34"], function (e) {
  "use strict";
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/dynamic-css-manifest.json",
          revision: "d751713988987e9331980363e24189ce",
        },
        {
          url: "/_next/static/ZUYD7TjUbwqW9rFs_cF0w/_buildManifest.js",
          revision: "90242f4c115076af81f50d5b4a6ea5e0",
        },
        {
          url: "/_next/static/ZUYD7TjUbwqW9rFs_cF0w/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/230-a4d0371afe61a9ff.js",
          revision: "a4d0371afe61a9ff",
        },
        {
          url: "/_next/static/chunks/40-fcc6283ff78fbb15.js",
          revision: "fcc6283ff78fbb15",
        },
        {
          url: "/_next/static/chunks/84.300590af89854e3e.js",
          revision: "300590af89854e3e",
        },
        {
          url: "/_next/static/chunks/framework-f75312fc4004b783.js",
          revision: "f75312fc4004b783",
        },
        {
          url: "/_next/static/chunks/main-f034d7055a953fb8.js",
          revision: "f034d7055a953fb8",
        },
        {
          url: "/_next/static/chunks/pages/_app-b9083d01252b37a9.js",
          revision: "b9083d01252b37a9",
        },
        {
          url: "/_next/static/chunks/pages/_error-e15c84159987e7e6.js",
          revision: "e15c84159987e7e6",
        },
        {
          url: "/_next/static/chunks/pages/admin/dashboard-6d2b3cf9caed569c.js",
          revision: "6d2b3cf9caed569c",
        },
        {
          url: "/_next/static/chunks/pages/admin/transactions-efe3156556211cf6.js",
          revision: "efe3156556211cf6",
        },
        {
          url: "/_next/static/chunks/pages/book-stylist-ad60cca6af441d9c.js",
          revision: "ad60cca6af441d9c",
        },
        {
          url: "/_next/static/chunks/pages/buyer-29b0c15b685e7ff4.js",
          revision: "29b0c15b685e7ff4",
        },
        {
          url: "/_next/static/chunks/pages/buyer/checkout-7c23607ea0983993.js",
          revision: "7c23607ea0983993",
        },
        {
          url: "/_next/static/chunks/pages/buyer/dashboard-adafa1bc6f9be8a2.js",
          revision: "adafa1bc6f9be8a2",
        },
        {
          url: "/_next/static/chunks/pages/buyer/marketplace-4b914d35f81aad42.js",
          revision: "4b914d35f81aad42",
        },
        {
          url: "/_next/static/chunks/pages/buyer/orders-50dd30838a3a7368.js",
          revision: "50dd30838a3a7368",
        },
        {
          url: "/_next/static/chunks/pages/cancel-34536d3f25f89a59.js",
          revision: "34536d3f25f89a59",
        },
        {
          url: "/_next/static/chunks/pages/driver-153718310039c1e3.js",
          revision: "153718310039c1e3",
        },
        {
          url: "/_next/static/chunks/pages/driver/dashboard-a871e2d6c84628ce.js",
          revision: "a871e2d6c84628ce",
        },
        {
          url: "/_next/static/chunks/pages/index-36d5ccce1aee4a39.js",
          revision: "36d5ccce1aee4a39",
        },
        {
          url: "/_next/static/chunks/pages/login-41fc923c2e2a2b80.js",
          revision: "41fc923c2e2a2b80",
        },
        {
          url: "/_next/static/chunks/pages/onboarding-fc37a0ca17ac4b40.js",
          revision: "fc37a0ca17ac4b40",
        },
        {
          url: "/_next/static/chunks/pages/seller-46bd0736e92878d3.js",
          revision: "46bd0736e92878d3",
        },
        {
          url: "/_next/static/chunks/pages/seller/dashboard-e7714c9f25a9f60d.js",
          revision: "e7714c9f25a9f60d",
        },
        {
          url: "/_next/static/chunks/pages/seller/upload-e6f36791d8602617.js",
          revision: "e6f36791d8602617",
        },
        {
          url: "/_next/static/chunks/pages/signup-ff8dd06968aa697c.js",
          revision: "ff8dd06968aa697c",
        },
        {
          url: "/_next/static/chunks/pages/stores-747be4f045725ec5.js",
          revision: "747be4f045725ec5",
        },
        {
          url: "/_next/static/chunks/pages/stores/%5Bstoreid%5D-f38ec0c0595efe5b.js",
          revision: "f38ec0c0595efe5b",
        },
        {
          url: "/_next/static/chunks/pages/stylist-e8fb312060241567.js",
          revision: "e8fb312060241567",
        },
        {
          url: "/_next/static/chunks/pages/stylist/dashboard-98969d8dea42bb08.js",
          revision: "98969d8dea42bb08",
        },
        {
          url: "/_next/static/chunks/pages/stylist/upload-c24a57988a3d5d96.js",
          revision: "c24a57988a3d5d96",
        },
        {
          url: "/_next/static/chunks/pages/success-dd373ac8baa74dcf.js",
          revision: "dd373ac8baa74dcf",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-c95ba12e2e26a23e.js",
          revision: "c95ba12e2e26a23e",
        },
        {
          url: "/_next/static/css/10940e144c69ecbb.css",
          revision: "10940e144c69ecbb",
        },
        {
          url: "/background.png",
          revision: "a0b3c99399e4e0773cf5129f05a23eeb",
        },
        { url: "/favicon.ico", revision: "d4d323cd2085addc355771e025929309" },
        {
          url: "/fonts/Urbanist-Regular.ttf",
          revision: "d089bea3460a89ab3a8124a3e6c890dd",
        },
        {
          url: "/images/sneaker1.jpg",
          revision: "d41d8cd98f00b204e9800998ecf8427e",
        },
        { url: "/logo.png", revision: "c549ef41d01e2698aee7e9bb2315f429" },
        { url: "/manifest.json", revision: "b85863ab2612dc7273d9d5b8caa1567e" },
        {
          url: "/mock/default-product.jpg",
          revision: "d41d8cd98f00b204e9800998ecf8427e",
        },
        {
          url: "/mock/default-stylist.jpg",
          revision: "d41d8cd98f00b204e9800998ecf8427e",
        },
      ],
      { ignoreURLParametersMatching: [] },
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: n,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET",
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET",
    ));
});
