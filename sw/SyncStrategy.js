/** @module sw/SyncStrategy
 *  Background sync — queues outgoing messages and replays when online.
 */

const SYNC_QUEUE_KEY = 'chattify-sync-queue';

export class SyncStrategy {
  /**
   * Add a message to the outbox for later sync.
   * @param {{ roomId, content, senderId, createdAt }} msg
   */
  static async enqueue(msg) {
    const queue = await SyncStrategy.#readQueue();
    queue.push({ ...msg, id: `sync_${Date.now()}`, retries: 0 });
    await SyncStrategy.#writeQueue(queue);
  }

  /**
   * Replay all queued messages — called on 'sync' event with tag 'sync-messages'.
   */
  static async syncMessages() {
    const queue = await SyncStrategy.#readQueue();
    if (!queue.length) return;

    const failed = [];
    for (const msg of queue) {
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(msg),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        console.info('[SW Sync] Message sent:', msg.id);
      } catch (err) {
        console.warn('[SW Sync] Failed to send:', msg.id, err);
        if (msg.retries < 3) {
          failed.push({ ...msg, retries: (msg.retries ?? 0) + 1 });
        }
      }
    }

    await SyncStrategy.#writeQueue(failed);

    // Notify all open clients of sync result
    const clients = await self.clients?.matchAll({ type: 'window' });
    clients?.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        sentCount: queue.length - failed.length,
        failedCount: failed.length,
      });
    });
  }

  static async #readQueue() {
    try {
      const cache = await caches.open('chattify-sync-v1.0.0');
      const res   = await cache.match(SYNC_QUEUE_KEY);
      if (res) return await res.json();
    } catch {}
    return [];
  }

  static async #writeQueue(queue) {
    try {
      const cache = await caches.open('chattify-sync-v1.0.0');
      await cache.put(SYNC_QUEUE_KEY, new Response(JSON.stringify(queue), {
        headers: { 'Content-Type': 'application/json' },
      }));
    } catch (err) {
      console.warn('[SW Sync] Could not persist queue:', err);
    }
  }
}
