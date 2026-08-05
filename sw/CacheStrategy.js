/** @module sw/CacheStrategy
 *  Cache strategies: Cache First, Network First, Stale While Revalidate, Network Only.
 */

export class CacheStrategy {
  /**
   * Pre-cache a list of assets into a named cache.
   * @param {string} cacheName
   * @param {string[]} assets
   */
  static async precache(cacheName, assets) {
    const cache = await caches.open(cacheName);
    await cache.addAll(assets);
    console.info(`[SW] Precached ${assets.length} assets → ${cacheName}`);
  }

  /**
   * Cache First — serve from cache; fallback to network and cache result.
   */
  static async cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  }

  /**
   * Network First — try network; fall back to cache on failure.
   */
  static async networkFirst(request, cacheName) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      throw new Error('Network failed and no cache available');
    }
  }

  /**
   * Stale While Revalidate — serve cache immediately, update in background.
   */
  static async staleWhileRevalidate(request, cacheName) {
    const cached = await caches.match(request);

    // Revalidate in background
    const fetchPromise = fetch(request).then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => null);

    return cached ?? await fetchPromise;
  }

  /**
   * Network Only — always fetch, never cache.
   */
  static async networkOnly(request) {
    return fetch(request);
  }

  /**
   * Delete all entries in a cache.
   */
  static async clearCache(cacheName) {
    return caches.delete(cacheName);
  }
}
