/** @module main
 *  Application entry point — bootstraps Chattify SPA.
 */

import { router }    from './router/Router.js';
import { authStore } from './store/AuthStore.js';
import { themeStore } from './store/ThemeStore.js';
import { ROUTES }    from './constants/routes.js';
import { LoginPage }     from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ChatPage }      from './pages/ChatPage.js';
import { GroupPage }     from './pages/GroupPage.js';
import { StoryPage }     from './pages/StoryPage.js';
import { CallPage }      from './pages/CallPage.js';

// Expose global app namespace (no other globals)
window.__app = { version: '1.0.0', name: 'Chattify' };

const app = document.getElementById('app');

/** Auth guard — redirect to login if not authenticated */
router.guard((to) => {
  const publicRoutes = [ROUTES.LOGIN, ROUTES.OFFLINE];
  if (publicRoutes.includes(to)) return true;
  if (!authStore.getState().isLoggedIn) {
    router.replace(ROUTES.LOGIN);
    return false;
  }
  return true;
});

/** Route definitions */
router
  .on(ROUTES.LOGIN,     () => LoginPage.render(app))
  .on(ROUTES.DASHBOARD, () => DashboardPage.render(app))
  .on(ROUTES.CHAT,      (p) => ChatPage.render(app, p.id))
  .on(ROUTES.GROUP,     (p) => GroupPage.render(app, p.id))
  .on(ROUTES.STORY,     (p) => StoryPage.render(app, p.userId))
  .on(ROUTES.CALL,      (p) => CallPage.render(app, p.id))
  .on(ROUTES.SETTINGS,  () => DashboardPage.render(app, 'settings'))
  .on(ROUTES.SEARCH,    () => DashboardPage.render(app, 'search'))
  .on('*', () => {
    if (authStore.getState().isLoggedIn) router.replace(ROUTES.DASHBOARD);
    else router.replace(ROUTES.LOGIN);
  });

/** Init theme */
themeStore.init();

/** Offline banner */
const banner = document.getElementById('offline-banner');
window.addEventListener('online',  () => { banner.hidden = true; });
window.addEventListener('offline', () => { banner.hidden = false; });
if (!navigator.onLine) banner.hidden = false;

/** Register service worker */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
      console.info('[SW] Registered:', reg.scope);

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        newSW?.addEventListener('statechange', () => {
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            // Notify user of update
            import('./utils/toast.js').then(({ showToast }) =>
              showToast('App updated! Refresh to apply.', 'info', 6000)
            );
          }
        });
      });
    } catch (err) {
      console.warn('[SW] Registration failed:', err);
    }
  });
}

/** PWA install prompt */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  window.__app.installPrompt = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.info('[PWA] Install outcome:', outcome);
    deferredPrompt = null;
  };
  window.dispatchEvent(new CustomEvent('pwa:installable'));
});

/** Start router — resolves current URL hash */
router.start();
