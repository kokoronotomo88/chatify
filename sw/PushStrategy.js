/** @module sw/PushStrategy
 *  Push notification handling — show, action, deep-link.
 */

export class PushStrategy {
  /**
   * Display a push notification.
   * @param {ServiceWorkerRegistration} registration
   * @param {{ title, body, icon, badge, tag, data }} payload
   */
  static async showNotification(registration, payload) {
    const {
      title = 'Chattify',
      body  = 'You have a new message',
      icon  = '/assets/icons/icon-192.png',
      badge = '/assets/icons/icon-96.png',
      tag   = 'chattify-msg',
      data  = {},
    } = payload;

    return registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data,
      vibrate: [100, 50, 100],
      actions: [
        { action: 'reply',    title: 'Reply' },
        { action: 'dismiss',  title: 'Dismiss' },
      ],
      requireInteraction: false,
    });
  }

  /**
   * Handle notification click — open or focus the relevant chat.
   * @param {NotificationEvent} event
   */
  static async handleClick(event) {
    const { action, notification } = event;
    const data = notification.data ?? {};

    if (action === 'dismiss') return;

    const url = data.roomId
      ? `/#/chat/${data.roomId}`
      : data.groupId
        ? `/#/group/${data.groupId}`
        : '/';

    const clients = await self.clients?.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients ?? []) {
      if (new URL(client.url).origin === self.location.origin) {
        client.focus();
        client.postMessage({ type: 'NAVIGATE', url });
        return;
      }
    }
    // No window open — open a new one
    self.clients?.openWindow(url);
  }
}
