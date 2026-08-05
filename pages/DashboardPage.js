/** @module pages/DashboardPage
 *  Main dashboard with Chats / Groups / Settings tabs.
 */
import { DashboardLayout } from '../layouts/DashboardLayout.js';
import { authStore }       from '../store/AuthStore.js';
import { chatStore }       from '../store/ChatStore.js';
import { router }          from '../router/Router.js';
import { ROUTES, buildRoute } from '../constants/routes.js';
import { formatTime, debounce } from '../utils/helpers.js';

export class DashboardPage {
  static render(container, tab = 'chats') {
    switch (tab) {
      case 'groups':   DashboardPage.#renderGroups(container); break;
      case 'settings': DashboardPage.#renderSettings(container); break;
      case 'search':   DashboardPage.#renderSearch(container); break;
      default:         DashboardPage.#renderChats(container);
    }
  }

  /* ── Chats tab ── */
  static #renderChats(container) {
    const content = DashboardLayout.render(container, 'chats');
    const rooms = DashboardPage.#getMockRooms();
    chatStore.setRooms(rooms);

    content.innerHTML = `
      <!-- Stories row -->
      <section class="stories-row" aria-label="Stories" data-testid="stories-row">
        <div class="stories-row__inner">
          <!-- My Story -->
          <button class="story-thumb story-thumb--add" aria-label="Add story" data-testid="button-add-story">
            <div class="story-thumb__avatar story-thumb__avatar--dashed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span class="story-thumb__name">My Story</span>
          </button>
          ${DashboardPage.#storiesHtml()}
        </div>
      </section>

      <!-- Chat list -->
      <section class="chat-list" aria-label="Conversations" data-testid="chat-list">
        <div class="section-label">Recent</div>
        ${rooms.map(r => DashboardPage.#chatItemHtml(r)).join('')}
      </section>
    `;

    // Bind chat item clicks
    content.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.roomId;
        chatStore.setActiveRoom(id);
        router.push(buildRoute(ROUTES.CHAT, { id }));
      });
    });

    DashboardPage.#injectStyles();
  }

  /* ── Groups tab ── */
  static #renderGroups(container) {
    const content = DashboardLayout.render(container, 'groups');
    const groups  = DashboardPage.#getMockGroups();

    content.innerHTML = groups.length ? `
      <section class="chat-list" aria-label="Groups" data-testid="group-list">
        <div class="section-label">Your Groups</div>
        ${groups.map(g => DashboardPage.#groupItemHtml(g)).join('')}
      </section>
    ` : `
      <div class="empty-state" data-testid="empty-groups">
        <div class="empty-state__icon">💬</div>
        <h3 class="empty-state__title">No Groups Yet</h3>
        <p class="empty-state__desc">Create a group to start chatting with multiple people.</p>
      </div>
    `;

    content.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        router.push(buildRoute(ROUTES.GROUP, { id: item.dataset.groupId }));
      });
    });

    DashboardPage.#injectStyles();
  }

  /* ── Settings tab ── */
  static #renderSettings(container) {
    const content = DashboardLayout.render(container, 'settings');
    const user    = authStore.getState().user;
    const isAdmin = authStore.getState().isAdmin;

    content.innerHTML = `
      <!-- Profile card -->
      <div class="settings-profile glass-card--border" data-testid="settings-profile">
        <div class="avatar avatar--xl" style="--avatar-size:64px">
          ${user?.avatar
            ? `<img src="${user.avatar}" alt="${user?.name}" class="avatar__img" />`
            : `<div class="avatar__fallback avatar__fallback--lg">${user?.initials ?? 'U'}</div>`}
        </div>
        <div class="settings-profile__info">
          <h3 class="settings-profile__name" data-testid="text-profile-name">${user?.name ?? 'User'}</h3>
          <p class="settings-profile__username" data-testid="text-profile-username">@${user?.username ?? 'user'}</p>
          ${isAdmin ? '<span class="badge badge--brand">Admin</span>' : ''}
        </div>
        <button class="icon-btn" aria-label="Edit profile" data-testid="button-edit-profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>

      <!-- Settings groups -->
      ${[
        { title: 'Account', icon: '👤', items: ['Profile', 'Privacy', 'Security'] },
        { title: 'Notifications', icon: '🔔', items: ['Messages', 'Groups', 'Push Notifications'] },
        { title: 'Appearance', icon: '🎨', items: ['Theme', 'Chat Background', 'Font Size'] },
        { title: 'Storage', icon: '💾', items: ['Manage Storage', 'Auto-Download', 'Data Usage'] },
        { title: 'Help', icon: '❓', items: ['FAQ', 'Contact Support', 'Terms & Privacy'] },
      ].map(g => `
        <div class="settings-group" data-testid="settings-group-${g.title.toLowerCase()}">
          <div class="settings-group__title">${g.icon} ${g.title}</div>
          <div class="settings-group__items">
            ${g.items.map(item => `
              <button class="settings-item" data-testid="button-settings-${item.toLowerCase().replace(/\s/g,'-')}">
                <span class="settings-item__label">${item}</span>
                <svg class="settings-item__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            `).join('')}
          </div>
        </div>
      `).join('')}

      <!-- Logout -->
      <div class="settings-group">
        <button class="settings-item settings-item--danger" id="btn-logout" data-testid="button-logout">
          <span class="settings-item__label">Logout</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>

      <!-- App version -->
      <p class="settings-version" data-testid="text-app-version">Chattify v${window.__app?.version ?? '1.0.0'}</p>
    `;

    content.querySelector('#btn-logout')?.addEventListener('click', () => {
      authStore.logout();
      router.replace(ROUTES.LOGIN);
    });

    DashboardPage.#injectStyles();
  }

  /* ── Search tab ── */
  static #renderSearch(container) {
    const content = DashboardLayout.render(container, 'search');
    const rooms   = DashboardPage.#getMockRooms();

    content.innerHTML = `
      <div class="search-page" data-testid="search-page">
        <div class="search-bar-wrap">
          <div class="search-bar" role="search">
            <svg class="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="search" id="search-input" class="search-bar__input"
              placeholder="Search conversations…" autocomplete="off"
              aria-label="Search conversations" data-testid="input-search"
            />
          </div>
        </div>
        <div class="chat-list" id="search-results" aria-label="Search results" data-testid="search-results">
          <div class="section-label">All Chats</div>
          ${rooms.map(r => DashboardPage.#chatItemHtml(r)).join('')}
        </div>
      </div>
    `;

    const input   = content.querySelector('#search-input');
    const results = content.querySelector('#search-results');

    const onSearch = debounce((q) => {
      const filtered = q ? rooms.filter(r => r.name.toLowerCase().includes(q.toLowerCase())) : rooms;
      results.innerHTML = filtered.length
        ? `<div class="section-label">${filtered.length} result${filtered.length !== 1 ? 's' : ''}</div>` + filtered.map(r => DashboardPage.#chatItemHtml(r)).join('')
        : `<div class="empty-state empty-state--small"><p>No results for "${q}"</p></div>`;

      results.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => router.push(buildRoute(ROUTES.CHAT, { id: item.dataset.roomId })));
      });
    }, 250);

    input.addEventListener('input', (e) => onSearch(e.target.value.trim()));
    setTimeout(() => input.focus(), 100);
    DashboardPage.#injectStyles();
  }

  /* ── HTML helpers ── */
  static #chatItemHtml(room) {
    return `
      <div class="chat-item" role="button" tabindex="0" data-room-id="${room.id}" data-testid="chat-item-${room.id}" aria-label="Chat with ${room.name}">
        <div class="avatar" style="--avatar-size:50px">
          ${room.avatar
            ? `<img src="${room.avatar}" alt="${room.name}" class="avatar__img" />`
            : `<div class="avatar__fallback" style="background:${room.color}">${room.initials}</div>`}
          <div class="status-dot ${room.online ? 'status-dot--online' : 'status-dot--offline'}" aria-label="${room.online ? 'Online' : 'Offline'}"></div>
        </div>
        <div class="chat-item__body">
          <div class="chat-item__top">
            <span class="chat-item__name" data-testid="text-room-name-${room.id}">${room.name}</span>
            <span class="chat-item__time" data-testid="text-room-time-${room.id}">${formatTime(room.lastTime, 'short')}</span>
          </div>
          <div class="chat-item__bottom">
            <span class="chat-item__preview" data-testid="text-room-preview-${room.id}">${room.lastMessage}</span>
            ${room.unread ? `<span class="badge badge--brand chat-item__unread" data-testid="badge-unread-${room.id}">${room.unread}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  static #groupItemHtml(group) {
    return `
      <div class="chat-item" role="button" tabindex="0" data-group-id="${group.id}" data-testid="chat-item-group-${group.id}" aria-label="Group ${group.name}">
        <div class="avatar avatar--gradient" style="--avatar-size:50px; background:${group.color}">
          <div class="avatar__fallback">${group.initials}</div>
        </div>
        <div class="chat-item__body">
          <div class="chat-item__top">
            <span class="chat-item__name">${group.name}</span>
            <span class="chat-item__time">${formatTime(group.lastTime, 'short')}</span>
          </div>
          <div class="chat-item__bottom">
            <span class="chat-item__preview"><strong class="chat-item__sender">${group.lastSender}:</strong> ${group.lastMessage}</span>
            ${group.unread ? `<span class="badge badge--brand chat-item__unread">${group.unread}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  static #storiesHtml() {
    const stories = [
      { id: 'u1', name: 'Alex', avatar: null, color: 'linear-gradient(135deg,#8B5CF6,#EC4899)', viewed: false },
      { id: 'u2', name: 'Maya', avatar: null, color: 'linear-gradient(135deg,#06B6D4,#8B5CF6)', viewed: false },
      { id: 'u3', name: 'Jordan', avatar: null, color: 'linear-gradient(135deg,#F97316,#EC4899)', viewed: true },
      { id: 'u4', name: 'Sam', avatar: null, color: 'linear-gradient(135deg,#84CC16,#06B6D4)', viewed: true },
    ];
    return stories.map(s => `
      <button class="story-thumb${s.viewed ? ' story-thumb--viewed' : ''}" aria-label="View ${s.name}'s story" data-user-id="${s.id}" data-testid="button-story-${s.id}">
        <div class="story-thumb__avatar" style="background:${s.color}">
          <span style="font-size:20px">${s.name[0]}</span>
        </div>
        <span class="story-thumb__name">${s.name}</span>
      </button>
    `).join('');
  }

  /* ── Mock data ── */
  static #getMockRooms() {
    return [
      { id: 'r1', name: 'Sarah Amelia', initials: 'SA', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3d9?w=60&h=60&fit=crop&crop=face', color: '', online: true,  lastMessage: 'Lagi ngapain? 😊', lastTime: new Date(Date.now() - 5*60000).toISOString(), unread: 3 },
      { id: 'r2', name: 'Budi Santoso', initials: 'BS', avatar: null, color: 'linear-gradient(135deg,#06B6D4,#8B5CF6)', online: false, lastMessage: 'Ok siap boss 🔥', lastTime: new Date(Date.now() - 30*60000).toISOString(), unread: 0 },
      { id: 'r3', name: 'Rina Putri',   initials: 'RP', avatar: null, color: 'linear-gradient(135deg,#F97316,#EC4899)', online: true,  lastMessage: '📷 Photo', lastTime: new Date(Date.now() - 2*3600000).toISOString(), unread: 1 },
      { id: 'r4', name: 'Dimas Hendra', initials: 'DH', avatar: null, color: 'linear-gradient(135deg,#84CC16,#06B6D4)', online: false, lastMessage: 'Mantap lah 👍', lastTime: new Date(Date.now() - 86400000).toISOString(), unread: 0 },
      { id: 'r5', name: 'Citra Dewi',   initials: 'CD', avatar: null, color: 'linear-gradient(135deg,#8B5CF6,#84CC16)', online: true,  lastMessage: '🎵 Voice Note', lastTime: new Date(Date.now() - 2*86400000).toISOString(), unread: 0 },
    ];
  }

  static #getMockGroups() {
    return [
      { id: 'g1', name: 'Dev Squad 🚀', initials: 'DS', color: 'linear-gradient(135deg,#8B5CF6,#EC4899)', lastSender: 'Budi', lastMessage: 'PR sudah di-merge!', lastTime: new Date(Date.now() - 10*60000).toISOString(), unread: 5 },
      { id: 'g2', name: 'Fam 🏠',       initials: 'FM', color: 'linear-gradient(135deg,#F97316,#84CC16)', lastSender: 'Ibu', lastMessage: 'Makan malam jam 7 ya', lastTime: new Date(Date.now() - 3600000).toISOString(), unread: 0 },
    ];
  }

  static #injectStyles() {
    if (document.getElementById('dashboard-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'dashboard-page-styles';
    s.textContent = `
      /* Stories */
      .stories-row { padding: var(--space-4) 0 var(--space-2); overflow: hidden; }
      .stories-row__inner { display: flex; gap: var(--space-3); overflow-x: auto; padding: 0 var(--space-4); scroll-snap-type: x mandatory; scrollbar-width: none; }
      .stories-row__inner::-webkit-scrollbar { display: none; }
      .story-thumb { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); scroll-snap-align: start; flex-shrink: 0; background: transparent; }
      .story-thumb__avatar {
        width: var(--story-size); height: var(--story-size); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: var(--gradient-brand); color: #fff;
        outline: 2.5px solid var(--brand-purple); outline-offset: 2px;
        transition: transform 0.2s; overflow: hidden;
      }
      .story-thumb__avatar--dashed {
        background: var(--bg-surface);
        outline: 2px dashed var(--border-default);
        color: var(--text-tertiary);
      }
      .story-thumb--viewed .story-thumb__avatar { outline-color: var(--text-tertiary); }
      .story-thumb__name { font-size: var(--fs-xs); color: var(--text-secondary); max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      /* Section label */
      .section-label { padding: var(--space-3) var(--space-4) var(--space-1); font-size: var(--fs-xs); font-weight: var(--fw-semibold); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: var(--ls-wider); }

      /* Chat item */
      .chat-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); cursor: pointer; transition: background 0.15s; border-radius: var(--radius-md); margin: 0 var(--space-2); }
      .chat-item:hover, .chat-item:focus-visible { background: var(--bg-surface); outline: none; }
      .chat-item__body { flex: 1; min-width: 0; }
      .chat-item__top, .chat-item__bottom { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2); }
      .chat-item__top { margin-bottom: 3px; }
      .chat-item__name { font-weight: var(--fw-semibold); font-size: var(--fs-base); color: var(--text-primary); }
      .chat-item__time { font-size: var(--fs-xs); color: var(--text-tertiary); flex-shrink: 0; }
      .chat-item__preview { font-size: var(--fs-sm); color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chat-item__sender { font-weight: var(--fw-semibold); color: var(--brand-purple); }
      .chat-item__unread { flex-shrink: 0; }

      /* Avatar */
      .avatar { position: relative; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
      .avatar[style] { width: var(--avatar-size); height: var(--avatar-size); }
      .avatar__img { width: 100%; height: 100%; object-fit: cover; }
      .avatar__fallback {
        width: 100%; height: 100%; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.875em; font-weight: var(--fw-bold); color: #fff;
      }
      .avatar--story-ring { outline: 2.5px solid var(--brand-purple); outline-offset: 2px; }

      /* Status dot */
      .status-dot {
        position: absolute; bottom: 1px; right: 1px;
        width: 10px; height: 10px; border-radius: 50%;
        border: 2px solid var(--bg-primary);
      }
      .status-dot--online  { background: var(--status-online); }
      .status-dot--offline { background: var(--status-offline); }

      /* Badges */
      .badge { display: inline-flex; align-items: center; justify-content: center; padding: 2px 7px; border-radius: var(--radius-pill); font-size: var(--fs-xs); font-weight: var(--fw-bold); }
      .badge--brand { background: var(--gradient-brand); color: #fff; min-width: 20px; }
      .badge--subtle { background: var(--bg-surface); color: var(--text-tertiary); font-size: 10px; }

      /* Settings */
      .settings-profile { display: flex; align-items: center; gap: var(--space-4); margin: var(--space-4); padding: var(--space-4); border-radius: var(--radius-xl); background: var(--bg-secondary); border: 1px solid var(--border-brand); }
      .glass-card--border { border-image: var(--gradient-brand) 1; }
      .settings-profile__info { flex: 1; }
      .settings-profile__name { font-size: var(--fs-lg); font-weight: var(--fw-bold); }
      .settings-profile__username { font-size: var(--fs-sm); color: var(--text-tertiary); }
      .settings-group { margin: var(--space-2) var(--space-4) var(--space-4); }
      .settings-group__title { font-size: var(--fs-xs); font-weight: var(--fw-semibold); color: var(--text-tertiary); text-transform: uppercase; letter-spacing: var(--ls-wider); margin-bottom: var(--space-2); padding: 0 var(--space-2); }
      .settings-group__items { background: var(--bg-secondary); border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-subtle); }
      .settings-item { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); color: var(--text-primary); font-size: var(--fs-base); border-bottom: 1px solid var(--border-subtle); transition: background 0.15s; }
      .settings-item:last-child { border-bottom: none; }
      .settings-item:hover { background: var(--bg-surface); }
      .settings-item--danger { color: var(--color-error); }
      .settings-item__arrow { color: var(--text-tertiary); }
      .settings-version { text-align: center; padding: var(--space-4); color: var(--text-muted); font-size: var(--fs-xs); }

      /* Search */
      .search-page { padding: var(--space-4); }
      .search-bar-wrap { margin-bottom: var(--space-4); }
      .search-bar { display: flex; align-items: center; gap: var(--space-3); background: var(--bg-surface); border-radius: var(--radius-pill); padding: var(--space-3) var(--space-4); border: 1px solid var(--border-subtle); }
      .search-bar__icon { color: var(--text-tertiary); flex-shrink: 0; }
      .search-bar__input { flex: 1; background: none; color: var(--text-primary); font-size: var(--fs-base); }
      .search-bar__input::placeholder { color: var(--text-muted); }

      /* Empty state */
      .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: var(--space-16) var(--space-8); text-align: center; gap: var(--space-3); }
      .empty-state__icon { font-size: 3rem; }
      .empty-state__title { font-size: var(--fs-xl); font-weight: var(--fw-bold); }
      .empty-state__desc { color: var(--text-tertiary); font-size: var(--fs-sm); max-width: 240px; }
      .empty-state--small { padding: var(--space-8); }

      /* Avatar fallback */
      .avatar__fallback--lg { font-size: 1.25rem; }
    `;
    document.head.appendChild(s);
  }
}
