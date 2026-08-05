/** @module pages/CallPage
 *  Voice/Video call placeholder UI.
 */
import { router } from '../router/Router.js';
import { sleep }  from '../utils/helpers.js';

const MOCK_CONTACTS = {
  r1: { name: 'Sarah Amelia', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3d9?w=200&h=200&fit=crop&crop=face', color: null },
  r2: { name: 'Budi Santoso', avatar: null, color: 'linear-gradient(135deg,#06B6D4,#8B5CF6)' },
  r3: { name: 'Rina Putri',   avatar: null, color: 'linear-gradient(135deg,#F97316,#EC4899)' },
};

export class CallPage {
  static #callTimer  = null;
  static #seconds    = 0;
  static #timerEl    = null;
  static #callActive = false;

  static render(container, roomId) {
    const contact = MOCK_CONTACTS[roomId] ?? { name: 'Unknown', avatar: null, color: 'var(--gradient-brand)' };
    CallPage.#callActive = false;
    CallPage.#seconds    = 0;

    container.innerHTML = `
      <div class="call-screen" data-testid="call-screen">
        <!-- Background blur -->
        <div class="call-bg" aria-hidden="true">
          ${contact.avatar
            ? `<img src="${contact.avatar}" alt="" class="call-bg__img" />`
            : `<div class="call-bg__gradient" style="background:${contact.color}"></div>`}
        </div>
        <div class="call-overlay" aria-hidden="true"></div>

        <!-- Contact info -->
        <div class="call-info" role="main">
          <div class="call-avatar">
            ${contact.avatar
              ? `<img src="${contact.avatar}" alt="${contact.name}" class="call-avatar__img" />`
              : `<div class="call-avatar__fallback" style="background:${contact.color}">${contact.name[0]}</div>`}
            <!-- Pulse rings -->
            <div class="call-pulse call-pulse--1" aria-hidden="true"></div>
            <div class="call-pulse call-pulse--2" aria-hidden="true"></div>
            <div class="call-pulse call-pulse--3" aria-hidden="true"></div>
          </div>
          <h2 class="call-name" data-testid="text-call-name">${contact.name}</h2>
          <p class="call-status" id="call-status" data-testid="text-call-status">Calling…</p>
          <p class="call-timer" id="call-timer" data-testid="text-call-timer" hidden>00:00</p>
        </div>

        <!-- Controls -->
        <div class="call-controls safe-bottom" role="group" aria-label="Call controls">
          <div class="call-controls__row">
            <div class="call-ctrl-group">
              <button class="call-btn call-btn--secondary" id="btn-mute"   aria-label="Mute" aria-pressed="false" data-testid="button-mute">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              </button>
              <span class="call-btn__label">Mute</span>
            </div>

            <div class="call-ctrl-group">
              <button class="call-btn call-btn--secondary" id="btn-speaker" aria-label="Speaker" aria-pressed="false" data-testid="button-speaker">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              </button>
              <span class="call-btn__label">Speaker</span>
            </div>

            <div class="call-ctrl-group">
              <button class="call-btn call-btn--secondary" id="btn-video"   aria-label="Video" aria-pressed="false" data-testid="button-video">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </button>
              <span class="call-btn__label">Video</span>
            </div>

            <div class="call-ctrl-group">
              <button class="call-btn call-btn--secondary" id="btn-more"    aria-label="More options" data-testid="button-call-more">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </button>
              <span class="call-btn__label">More</span>
            </div>
          </div>

          <!-- End call -->
          <button class="call-btn call-btn--end" id="btn-end-call" aria-label="End call" data-testid="button-end-call">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.927.366 1.897.614 2.9.74a2 2 0 0 1 1.73 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.9 11.5 19.79 19.79 0 0 1 1.83 2.88 2 2 0 0 1 3.8 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.71a16 16 0 0 0 2.77 4.6z"/><line x1="22" y1="2" x2="2" y2="22"/></svg>
          </button>
        </div>
      </div>
    `;

    CallPage.#bindEvents(container, contact);
    CallPage.#simulateCall(container);
    CallPage.#injectStyles();
  }

  static #simulateCall(container) {
    // Simulate call connecting after 2s
    setTimeout(() => {
      const statusEl = container.querySelector('#call-status');
      const timerEl  = container.querySelector('#call-timer');
      if (!statusEl) return;

      statusEl.textContent = 'Connected';
      if (timerEl) timerEl.hidden = false;
      CallPage.#callActive = true;
      CallPage.#timerEl    = timerEl;
      CallPage.#seconds    = 0;

      CallPage.#callTimer = setInterval(() => {
        CallPage.#seconds++;
        const m = String(Math.floor(CallPage.#seconds / 60)).padStart(2, '0');
        const s = String(CallPage.#seconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
      }, 1000);
    }, 2000);
  }

  static #bindEvents(container, contact) {
    const toggleBtn = (btn) => {
      const pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
      btn.classList.toggle('call-btn--active', !pressed);
    };

    container.querySelector('#btn-mute')?.addEventListener('click', (e) => toggleBtn(e.currentTarget));
    container.querySelector('#btn-speaker')?.addEventListener('click', (e) => toggleBtn(e.currentTarget));
    container.querySelector('#btn-video')?.addEventListener('click', (e) => {
      toggleBtn(e.currentTarget);
      import('../utils/toast.js').then(({ showToast }) => showToast('Video call coming soon!', 'info'));
    });
    container.querySelector('#btn-more')?.addEventListener('click', () => {
      import('../utils/toast.js').then(({ showToast }) => showToast('More options coming soon!', 'info'));
    });

    container.querySelector('#btn-end-call')?.addEventListener('click', () => {
      clearInterval(CallPage.#callTimer);
      CallPage.#callActive = false;
      router.back();
    });
  }

  static #injectStyles() {
    if (document.getElementById('call-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'call-page-styles';
    s.textContent = `
      .call-screen { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: space-between; z-index: var(--z-modal); overflow: hidden; }
      .call-bg { position: absolute; inset: 0; z-index: 0; }
      .call-bg__img { width: 100%; height: 100%; object-fit: cover; filter: blur(32px) saturate(1.5); transform: scale(1.1); }
      .call-bg__gradient { width: 100%; height: 100%; }
      .call-overlay { position: absolute; inset: 0; background: rgba(15,15,26,0.75); z-index: 1; }
      .call-info { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding-top: calc(var(--sat) + var(--space-16)); }
      .call-avatar { position: relative; width: 120px; height: 120px; }
      .call-avatar__img, .call-avatar__fallback { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 700; color: #fff; }
      .call-pulse { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(139,92,246,0.4); animation: callPulse 2s ease-out infinite; }
      .call-pulse--1 { animation-delay: 0s; }
      .call-pulse--2 { animation-delay: 0.6s; }
      .call-pulse--3 { animation-delay: 1.2s; }
      @keyframes callPulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
      .call-name { font-family: var(--font-heading); font-size: var(--fs-3xl); font-weight: var(--fw-bold); color: #fff; text-align: center; }
      .call-status { color: rgba(255,255,255,0.7); font-size: var(--fs-sm); }
      .call-timer { color: #fff; font-size: var(--fs-lg); font-weight: var(--fw-semibold); font-variant-numeric: tabular-nums; }
      .call-controls { position: relative; z-index: 2; width: 100%; padding: var(--space-8) var(--space-6); display: flex; flex-direction: column; align-items: center; gap: var(--space-8); }
      .call-controls__row { display: flex; justify-content: center; gap: var(--space-6); }
      .call-ctrl-group { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
      .call-btn { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.15s; }
      .call-btn:active { transform: scale(0.92); }
      .call-btn--secondary { background: rgba(255,255,255,0.15); color: #fff; }
      .call-btn--active { background: rgba(139,92,246,0.5); }
      .call-btn--end { width: 72px; height: 72px; background: #EF4444; color: #fff; box-shadow: 0 8px 24px rgba(239,68,68,0.4); }
      .call-btn__label { font-size: var(--fs-xs); color: rgba(255,255,255,0.7); }
    `;
    document.head.appendChild(s);
  }
}
