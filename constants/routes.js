/** @module constants/routes */

export const ROUTES = Object.freeze({
  LOGIN:     '/',
  DASHBOARD: '/dashboard',
  CHAT:      '/chat/:id',
  GROUP:     '/group/:id',
  STORY:     '/story/:userId',
  SETTINGS:  '/settings',
  PROFILE:   '/profile/:id',
  CALL:      '/call/:id',
  SEARCH:    '/search',
  OFFLINE:   '/offline',
});

/**
 * Build a dynamic route path.
 * @param {string} pattern  e.g. ROUTES.CHAT
 * @param {Object} params   e.g. { id: '123' }
 */
export function buildRoute(pattern, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, val]) => path.replace(`:${key}`, encodeURIComponent(val)),
    pattern
  );
}
