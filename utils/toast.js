/** @module utils/toast */
import { bus, APP_EVENTS } from './helpers.js';
import { APP_EVENTS as EVENTS } from '../constants/events.js';

const ICONS = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
};

class ToastManager {
  #container = null;
  #toasts = [];

  #ensureContainer() {
    if (this.#container) return;
    this.#container = document.createElement('div');
    this.#container.className = 'toast-container';
    this.#container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.#container);
  }

  /**
   * Show a toast notification.
   * @param {Object} opts
   * @param {string} opts.message
   * @param {string} [opts.title]
   * @param {'success'|'error'|'warning'|'info'} [opts.type]
   * @param {number} [opts.duration]  ms, 0 = sticky
   */
  show({ message, title = '', type = 'info', duration = 3500 }) {
    this.#ensureContainer();
    const id = `toast-${Date.now()}`;
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'alert');
    el.dataset.toastId = id;
    el.innerHTML = `
      <span class="toast__icon">${ICONS[type] ?? ICONS.info}</span>
      <div class="toast__body">
        ${title ? `<div class="toast__title">${title}</div>` : ''}
        <div class="toast__message">${message}</div>
      </div>
      <button class="toast__close" aria-label="Close notification">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>`;
    el.querySelector('.toast__close').addEventListener('click', () => this.dismiss(id), { once: true });
    this.#container.appendChild(el);
    this.#toasts.push(id);
    if (duration > 0) setTimeout(() => this.dismiss(id), duration);
    return id;
  }

  dismiss(id) {
    const el = this.#container?.querySelector(`[data-toast-id="${id}"]`);
    if (!el) return;
    el.classList.add('toast--exit');
    el.addEventListener('animationend', () => {
      el.remove();
      this.#toasts = this.#toasts.filter(t => t !== id);
    }, { once: true });
  }

  success(message, title) { return this.show({ message, title, type: 'success' }); }
  error(message, title)   { return this.show({ message, title, type: 'error', duration: 5000 }); }
  warning(message, title) { return this.show({ message, title, type: 'warning' }); }
  info(message, title)    { return this.show({ message, title, type: 'info' }); }
}

export const toast = new ToastManager();
