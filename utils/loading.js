/** @module utils/loading */

class LoadingManager {
  #overlay = null;
  #count = 0;

  show(message = '') {
    this.#count++;
    if (this.#overlay) {
      if (message) this.#overlay.querySelector('.loading__message').textContent = message;
      return;
    }
    this.#overlay = document.createElement('div');
    this.#overlay.className = 'loading-overlay';
    this.#overlay.setAttribute('aria-live', 'assertive');
    this.#overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="18" stroke="url(#lg)" stroke-width="3" stroke-linecap="round"
              stroke-dasharray="80 40" class="anim-spin" style="transform-origin:center"/>
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop stop-color="#8B5CF6"/>
                <stop offset="1" stop-color="#EC4899"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        ${message ? `<p class="loading__message">${message}</p>` : ''}
      </div>`;
    document.body.appendChild(this.#overlay);
  }

  hide() {
    this.#count = Math.max(0, this.#count - 1);
    if (this.#count > 0) return;
    this.#overlay?.remove();
    this.#overlay = null;
  }

  /** Wrap async fn with loading state */
  async wrap(fn, message = '') {
    this.show(message);
    try { return await fn(); }
    finally { this.hide(); }
  }
}

export const loading = new LoadingManager();
