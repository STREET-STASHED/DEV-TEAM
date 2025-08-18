import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.streetstashed.app',
  appName: 'StreetStashed',
  webDir: '.next',        // keep for assets; SSR still uses server.url
  server: {
    url: process.env.CAP_SERVER_URL ?? 'http://10.0.0.210:3000',
    cleartext: true,      // allow http in Debug (see ATS note below)
    allowNavigation: ['localhost', '10.0.0.0/8', '192.168.0.0/16'], // optional whitelist
  },
};

export default config;
