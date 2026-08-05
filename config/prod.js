/** @module config/prod */
export const config = {
  env: 'production',
  apiBaseUrl: 'https://chattify.vercel.app/api',
  wsUrl: 'wss://chattify.vercel.app',
  debug: false,
  logLevel: 'error',
  mockEnabled: false,
  cacheVersion: 'v1',
};
