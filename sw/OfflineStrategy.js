/** @module sw/OfflineStrategy
 *  Offline-specific strategies: network-first with offline page fallback.
 */

export class OfflineStrategy {
  /**
   * Try network first; on failure return the cached offline fallback page.
   * @param {Request} request
   * @param {string}  offlinePath  e.g. '/offline.html'
   */
  static async networkFirstWithFallback(request, offlinePath = '/offline.html') {
    try {
      const response = await fetch(request);
      // Cache successful HTML navigations for offline use
      if (response.ok) {
        const cache = await caches.open('chattify-pages-v1.0.0');
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      // Try the specific cached page first
      const cached = await caches.match(request);
      if (cached) return cached;

      // Fall back to offline page
      const offline = await caches.match(offlinePath);
      if (offline) return offline;

      // Last resort: minimal inline offline response
      return new Response(
        '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
  }

  /**
   * Check if the client is currently offline.
   */
  static isOffline() {
    return !self.navigator?.onLine;
  }
}
