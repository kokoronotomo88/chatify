/** @module sw/VersionStrategy
 *  Cache versioning — clean up stale caches on SW activation.
 */

export class VersionStrategy {
  /**
   * Delete all caches that do not match the current version.
   * @param {string} currentVersion  e.g. 'v1.0.0'
   */
  static async cleanOldCaches(currentVersion) {
    const cacheNames = await caches.keys();
    const toDelete = cacheNames.filter(name =>
      name.startsWith('chattify-') && !name.includes(currentVersion)
    );

    await Promise.all(toDelete.map(name => {
      console.info('[SW Version] Deleting old cache:', name);
      return caches.delete(name);
    }));

    if (toDelete.length) {
      console.info(`[SW Version] Cleaned ${toDelete.length} stale cache(s)`);
    }
  }

  /**
   * Get metadata about current caches.
   */
  static async getCacheInfo() {
    const cacheNames = await caches.keys();
    const info = await Promise.all(
      cacheNames.map(async name => {
        const cache = await caches.open(name);
        const keys  = await cache.keys();
        return { name, count: keys.length };
      })
    );
    return info;
  }

  /**
   * Broadcast a version update to all clients.
   */
  static async notifyUpdate(version) {
    const clients = await self.clients?.matchAll({ type: 'window' });
    clients?.forEach(client =>
      client.postMessage({ type: 'SW_UPDATED', version })
    );
  }
}
