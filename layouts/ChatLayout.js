/** @module layouts/ChatLayout
 *  Chat room shell: glass header, scrollable messages, fixed input bar.
 */
import { router } from '../router/Router.js';
import { ROUTES } from '../constants/routes.js';

export class ChatLayout {
  /**
   * @param {HTMLElement} container
   * @param {{ name, avatar, color, online, lastSeen }} contact
   * @param {string} roomId
   * @returns {HTMLElement} the inner content element
   */
  static render(container, contact, roomId) {
    const statusText = contact.online ? 'Online' : (contact.lastSeen ? `Last seen ${contact.lastSeen}` : 'Offline');

    container.innerHTML = `
      <div class="chat-layout" data-testid="chat-layout">

        <!-- Glass Header -->
        <header class="chat-header glass-header" role="banner">
          <button class="icon-btn" id="btn-back" aria-label="Go back" data-testid="button-back">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div class="chat-header__contact" data-testid="chat-header-contact">
            <div class="avatar" style="--avatar-size:38px">
              ${contact.avatar
                ? `<img src="${contact.avatar}" alt="${contact.name}" class="avatar__img" />`
                : `<div class="avatar__fallback" style="background:${contact.color ?? 'var(--gradient-brand)'}">${(contact.name?.[0] ?? '?')}</div>`}
              <div class="status-dot ${contact.online ? 'status-dot--online' : 'status-dot--offline'}" aria-label="${contact.online ? 'Online' : 'Offline'}"></div>
            </div>
            <div class="chat-header__info">
              <h2 class="chat-header__name" data-testid="text-contact-name">${contact.name}</h2>
              <p class="chat-header__status ${contact.online ? 'chat-header__status--online' : ''}" data-testid="text-contact-status">${statusText}</p>
            </div>
          </div>

          <div class="chat-header__actions">
            <button class="icon-btn" id="btn-voice-call" aria-label="Voice call" data-testid="button-voice-call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6.09 6.09l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </button>
            <button class="icon-btn" id="btn-video-call" aria-label="Video call" data-testid="button-video-call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </button>
            <button class="icon-btn" id="btn-chat-menu" aria-label="More options" data-testid="button-chat-menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </header>

        <!-- Messages Area -->
        <div class="chat-messages" id="chat-messages" role="log" aria-label="Messages" aria-live="polite" data-testid="chat-messages">
          <!-- Populated by ChatPage -->
        </div>

        <!-- Typing Indicator -->
        <div class="typing-indicator" id="typing-indicator" aria-live="polite" aria-label="Typing indicator">
          <div class="typing-indicator__dots">
            <div class="typing-indicator__dot"></div>
            <div class="typing-indicator__dot"></div>
            <div class="typing-indicator__dot"></div>
          </div>
          <span class="typing-indicator__name">${contact.name} is typing…</span>
        </div>

        <!-- Scroll to bottom button -->
        <button class="scroll-btn" id="btn-scroll-bottom" aria-label="Scroll to latest message" data-testid="button-scroll-bottom">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        <!-- Input Bar -->
        <div class="chat-input-bar safe-bottom" role="form" aria-label="Message input">
          <button class="input-action-btn" id="btn-emoji" aria-label="Emoji" data-testid="button-emoji">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </button>

          <div class="chat-input-wrap">
            <textarea
              id="msg-input"
              class="chat-input"
              placeholder="Message…"
              rows="1"
              aria-label="Type a message"
              data-testid="input-message"
            ></textarea>
          </div>

          <button class="input-action-btn" id="btn-attach" aria-label="Attach file" data-testid="button-attach">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>

          <button class="btn-send" id="btn-send" aria-label="Send message" data-testid="button-send">
            <svg class="btn-send__mic" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            <svg class="btn-send__plane hidden" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    `;

    ChatLayout.#bindEvents(container, roomId);
    ChatLayout.#injectStyles();

    return container.querySelector('.chat-layout');
  }

  static #bindEvents(container, roomId) {
    container.querySelector('#btn-back')?.addEventListener('click', () => router.back());

    container.querySelector('#btn-voice-call')?.addEventListener('click', () => {
      import('../router/Router.js').then(({ router }) =>
        import('../constants/routes.js').then(({ ROUTES, buildRoute }) =>
          router.push(buildRoute(ROUTES.CALL, { id: roomId }))
        )
      );
    });

    container.querySelector('#btn-video-call')?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) => showToast('Video call coming soon!', 'info'));
    });

    container.querySelector('#btn-chat-menu')?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) => showToast('Chat options coming soon!', 'info'));
    });
  }

  static #injectStyles() {
    if (document.getElementById('chat-layout-styles')) return;
    const s = document.createElement('style');
    s.id = 'chat-layout-styles';
    s.textContent = `
      .chat-layout { display: flex; flex-direction: column; min-height: 100dvh; background: var(--bg-primary); }

      /* Header */
      .chat-header {
        position: sticky; top: 0; z-index: var(--z-header);
        display: flex; align-items: center; gap: var(--space-3);
        padding: var(--space-3) var(--space-3);
        padding-top: calc(var(--sat) + var(--space-3));
        background: rgba(15,15,26,0.92);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border-bottom: 1px solid var(--border-subtle);
        height: calc(var(--header-height) + var(--sat));
      }
      .chat-header__contact { display: flex; align-items: center; gap: var(--space-3); flex: 1; min-width: 0; }
      .chat-header__info { min-width: 0; }
      .chat-header__name { font-size: var(--fs-base); font-weight: var(--fw-semibold); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .chat-header__status { font-size: var(--fs-xs); color: var(--text-tertiary); }
      .chat-header__status--online { color: var(--status-online); }
      .chat-header__actions { display: flex; align-items: center; }

      /* Messages */
      .chat-messages {
        flex: 1; overflow-y: auto; padding: var(--space-4) var(--space-2);
        padding-bottom: var(--space-4); scroll-behavior: smooth;
        display: flex; flex-direction: column; gap: 2px;
      }

      /* Input bar */
      .chat-input-bar {
        display: flex; align-items: flex-end; gap: var(--space-2);
        padding: var(--space-3) var(--space-3);
        padding-bottom: calc(var(--sab) + var(--space-3));
        background: rgba(15,15,26,0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid var(--border-subtle);
        min-height: var(--input-height);
      }
      .input-action-btn { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-tertiary); flex-shrink: 0; transition: color 0.15s, background 0.15s; }
      .input-action-btn:hover { color: var(--brand-purple); }

      .chat-input-wrap { flex: 1; background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px solid var(--border-default); padding: var(--space-2) var(--space-4); min-height: 44px; display: flex; align-items: center; transition: border-color 0.2s; }
      .chat-input-wrap:focus-within { border-color: var(--border-focus); }
      .chat-input { flex: 1; background: none; color: var(--text-primary); font-size: var(--fs-base); line-height: var(--lh-relaxed); resize: none; max-height: 120px; overflow-y: auto; }
      .chat-input::placeholder { color: var(--text-muted); }

      .btn-send {
        width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
        background: var(--gradient-brand); color: #fff;
        display: flex; align-items: center; justify-content: center;
        box-shadow: var(--shadow-brand); transition: transform 0.15s, box-shadow 0.15s;
      }
      .btn-send:active { transform: scale(0.92); }

      /* Scroll button */
      .scroll-btn { position: fixed; right: var(--space-4); bottom: calc(var(--input-height) + var(--sab) + var(--space-4)); }

      /* Avatar / status */
      .avatar { position: relative; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
      .avatar[style] { width: var(--avatar-size); height: var(--avatar-size); }
      .avatar__img { width: 100%; height: 100%; object-fit: cover; }
      .avatar__fallback { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1em; font-weight: 700; color: #fff; }
      .status-dot { position: absolute; bottom: 1px; right: 1px; width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--bg-primary); }
      .status-dot--online  { background: var(--status-online); }
      .status-dot--offline { background: var(--status-offline); }

      /* Icon btn */
      .icon-btn { position: relative; width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: background 0.15s, color 0.15s; }
      .icon-btn:hover { background: var(--bg-surface); color: var(--text-primary); }
    `;
    document.head.appendChild(s);
  }
}
