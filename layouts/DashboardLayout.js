/** @module layouts/DashboardLayout
 *  Main dashboard shell: sticky header + tab bar + content area.
 */
import { authStore }  from '../store/AuthStore.js';
import { themeStore } from '../store/ThemeStore.js';
import { router }     from '../router/Router.js';
import { ROUTES }     from '../constants/routes.js';

export class DashboardLayout {
  /**
   * @param {HTMLElement} container
   * @param {'chats'|'groups'|'settings'|'search'} activeTab
   * @param {string} contentHtml
   */
  static render(container, activeTab = 'chats', contentHtml = '') {
    const user = authStore.getState().user;
    const isAdmin = authStore.getState().isAdmin;

    container.innerHTML = `
      <div class="dashboard-layout" data-testid="dashboard-layout">

        <!-- Sticky Header -->
        <header class="dash-header glass-header" role="banner">
          <div class="dash-header__left">
            ${activeTab === 'search'
              ? `<button class="icon-btn" id="btn-back" aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>`
              : `<div class="dash-header__avatar-wrap">
                   <div class="avatar avatar--story-ring" style="--avatar-size:38px" data-testid="img-user-avatar">
                     ${user?.avatar
                       ? `<img src="${user.avatar}" alt="${user?.name}" class="avatar__img" />`
                       : `<div class="avatar__fallback">${user?.initials ?? 'U'}</div>`
                     }
                   </div>
                   <div class="status-dot status-dot--online" aria-label="Online"></div>
                 </div>`
            }
            <div class="dash-header__title-wrap">
              <h1 class="dash-header__title" data-testid="text-header-title">${DashboardLayout.#getTitle(activeTab)}</h1>
              ${activeTab === 'chats' ? `<p class="dash-header__subtitle" data-testid="text-online-count">3 online</p>` : ''}
            </div>
          </div>
          <div class="dash-header__right">
            <button class="icon-btn" id="btn-search" aria-label="Search" data-testid="button-search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button class="icon-btn" id="btn-notifications" aria-label="Notifications" data-testid="button-notifications">
              <div class="icon-btn__badge" aria-label="3 notifications">3</div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
          </div>
        </header>

        <!-- Content Area -->
        <main class="dash-content" id="dash-content" role="main">
          ${contentHtml}
        </main>

        <!-- Tab Bar -->
        <nav class="tab-bar safe-bottom" role="tablist" aria-label="Main navigation" data-testid="tab-bar">
          ${DashboardLayout.#tabs(activeTab)}
        </nav>

        <!-- FAB (Admin only) -->
        ${isAdmin ? `
          <button class="fab" id="btn-fab" aria-label="New chat" data-testid="button-fab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        ` : ''}
      </div>
    `;

    DashboardLayout.#bindEvents(container, activeTab);
    DashboardLayout.#injectStyles();
    return container.querySelector('.dash-content');
  }

  static #getTitle(tab) {
    return { chats: 'Chattify', groups: 'Groups', settings: 'Settings', search: 'Search' }[tab] ?? 'Chattify';
  }

  static #tabs(active) {
    const tabs = [
      { id: 'chats',    label: 'Chats',    icon: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>` },
      { id: 'groups',   label: 'Groups',   icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` },
      { id: 'settings', label: 'Settings', icon: `<circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M20 12h-2M4 12H2M17.66 17.66l-1.41-1.41M6.34 17.66l1.41-1.41M12 20v-2M12 4V2"/>` },
    ];
    return tabs.map(t => `
      <button
        class="tab-bar__item${t.id === active ? ' tab-bar__item--active' : ''}"
        data-tab="${t.id}"
        role="tab"
        aria-selected="${t.id === active}"
        aria-label="${t.label}"
        data-testid="tab-${t.id}"
      >
        <svg class="tab-bar__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>
        <span class="tab-bar__label">${t.label}</span>
        ${t.id === 'chats' ? '<span class="tab-bar__dot" aria-hidden="true"></span>' : ''}
      </button>
    `).join('');
  }

  static #bindEvents(container, activeTab) {
    // Tab switching
    container.querySelectorAll('.tab-bar__item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab === activeTab) return;
        import('../pages/DashboardPage.js').then(({ DashboardPage }) =>
          DashboardPage.render(container, tab)
        );
      });
    });

    // Search
    container.querySelector('#btn-search')?.addEventListener('click', () => {
      import('../pages/DashboardPage.js').then(({ DashboardPage }) =>
        DashboardPage.render(container, 'search')
      );
    });

    // Back (search)
    container.querySelector('#btn-back')?.addEventListener('click', () => {
      import('../pages/DashboardPage.js').then(({ DashboardPage }) =>
        DashboardPage.render(container, 'chats')
      );
    });

    // FAB
    container.querySelector('#btn-fab')?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) =>
        showToast('New chat coming soon!', 'info')
      );
    });

    // Notifications
    container.querySelector('#btn-notifications')?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) =>
        showToast('Notifications coming soon!', 'info')
      );
    });
  }

  static #injectStyles() {
    if (document.getElementById('dash-layout-styles')) return;
    const s = document.createElement('style');
    s.id = 'dash-layout-styles';
    s.textContent = `
      .dashboard-layout { display: flex; flex-direction: column; min-height: 100dvh; position: relative; }

      /* Header */
      .dash-header {
        position: sticky; top: 0; z-index: var(--z-header);
        display: flex; align-items: center; justify-content: space-between;
        padding: var(--space-3) var(--space-4);
        padding-top: calc(var(--sat) + var(--space-3));
        height: calc(var(--header-height) + var(--sat));
        background: rgba(15,15,26,0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-bottom: 1px solid var(--border-subtle);
      }
      .dash-header__left  { display: flex; align-items: center; gap: var(--space-3); }
      .dash-header__right { display: flex; align-items: center; gap: var(--space-1); }
      .dash-header__avatar-wrap { position: relative; flex-shrink: 0; }
      .dash-header__title { font-size: var(--fs-xl); font-weight: var(--fw-bold); font-family: var(--font-heading); letter-spacing: var(--ls-tight); }
      .dash-header__subtitle { font-size: var(--fs-xs); color: var(--status-online); font-weight: var(--fw-medium); }

      /* Icon button */
      .icon-btn {
        position: relative; width: 40px; height: 40px; border-radius: var(--radius-md);
        display: flex; align-items: center; justify-content: center;
        color: var(--text-secondary); background: transparent;
        transition: background 0.15s, color 0.15s;
      }
      .icon-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
      .icon-btn__badge {
        position: absolute; top: 4px; right: 4px;
        min-width: 16px; height: 16px; border-radius: var(--radius-pill);
        background: var(--gradient-brand); color: #fff;
        font-size: 10px; font-weight: var(--fw-bold);
        display: flex; align-items: center; justify-content: center; padding: 0 4px;
      }

      /* Content */
      .dash-content { flex: 1; overflow-y: auto; padding-bottom: calc(var(--tabbar-height) + var(--sab)); }

      /* Tab bar */
      .tab-bar {
        position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
        width: 100%; max-width: 480px;
        display: flex; align-items: center;
        background: rgba(15,15,26,0.92); backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid var(--border-subtle);
        padding: var(--space-2) var(--space-2) calc(var(--sab) + var(--space-2));
        z-index: var(--z-navbar);
      }
      .tab-bar__item {
        flex: 1; display: flex; flex-direction: column; align-items: center;
        gap: 3px; padding: var(--space-2); border-radius: var(--radius-md);
        color: var(--text-tertiary); position: relative;
        transition: color 0.2s, background 0.2s;
      }
      .tab-bar__item--active { color: var(--brand-purple); }
      .tab-bar__item--active .tab-bar__icon { filter: drop-shadow(0 0 6px rgba(139,92,246,0.5)); }
      .tab-bar__label { font-size: 10px; font-weight: var(--fw-medium); }
      .tab-bar__dot {
        position: absolute; top: 6px; right: calc(50% - 14px);
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--brand-pink);
      }

      /* FAB */
      .fab {
        position: fixed; bottom: calc(var(--tabbar-height) + var(--sab) + var(--space-4));
        right: var(--space-5); width: 56px; height: 56px; border-radius: 50%;
        background: var(--gradient-brand);
        display: flex; align-items: center; justify-content: center;
        color: #fff; box-shadow: var(--shadow-brand);
        z-index: var(--z-fab); transition: transform 0.2s, box-shadow 0.2s;
      }
      .fab:active { transform: scale(0.92); }
    `;
    document.head.appendChild(s);
  }
}
