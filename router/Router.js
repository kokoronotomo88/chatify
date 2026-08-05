/** @module router/Router
 *  Client-side SPA hash router.
 */
import { bus } from '../utils/helpers.js';
import { ROUTES } from '../constants/routes.js';

class Router {
  #routes   = new Map();
  #current  = null;
  #history  = [];
  #guards   = [];

  constructor() {
    window.addEventListener('hashchange', () => this.#resolve());
    window.addEventListener('popstate',   () => this.#resolve());
  }

  /**
   * Register a route.
   * @param {string} pattern  e.g. '/dashboard'
   * @param {Function} handler  fn(params, query) → void
   */
  on(pattern, handler) {
    this.#routes.set(pattern, handler);
    return this;
  }

  /** Add a global navigation guard. fn(to, from) → boolean|Promise<boolean> */
  guard(fn) { this.#guards.push(fn); return this; }

  /** Navigate to path */
  async push(path, replace = false) {
    const allowed = await this.#runGuards(path);
    if (!allowed) return;
    const encoded = `#${path}`;
    if (replace) history.replaceState(null, '', encoded);
    else         history.pushState(null, '', encoded);
    this.#resolve(path);
  }

  /** Replace current history entry */
  replace(path) { return this.push(path, true); }

  /** Go back */
  back() { history.back(); }

  /** Current path */
  get currentPath() { return this.#current; }
  get historyStack()   { return [...this.#history]; }

  async #runGuards(to) {
    for (const guard of this.#guards) {
      const ok = await guard(to, this.#current);
      if (ok === false) return false;
    }
    return true;
  }

  #resolve(path) {
    const raw = path ?? (location.hash.slice(1) || '/');
    const [pathname, search = ''] = raw.split('?');
    const query = Object.fromEntries(new URLSearchParams(search));

    // Match exact, then parameterized
    for (const [pattern, handler] of this.#routes) {
      const params = this.#match(pattern, pathname);
      if (params !== null) {
        const prev = this.#current;
        this.#current = pathname;
        this.#history.push(pathname);
        bus.emit('nav:push', { to: pathname, from: prev, params, query });
        handler(params, query);
        return;
      }
    }

    // 404 fallback
    bus.emit('nav:push', { to: pathname, from: this.#current, params: {}, query, notFound: true });
    this.#routes.get('*')?.({}  , query);
  }

  #match(pattern, path) {
    if (pattern === path) return {};
    const pParts = pattern.split('/');
    const rParts = path.split('/');
    if (pParts.length !== rParts.length) return null;
    const params = {};
    for (let i = 0; i < pParts.length; i++) {
      if (pParts[i].startsWith(':')) { params[pParts[i].slice(1)] = decodeURIComponent(rParts[i]); }
      else if (pParts[i] !== rParts[i]) return null;
    }
    return params;
  }

  /** Bootstrap — resolve current URL */
  start() { this.#resolve(); return this; }
}

export const router = new Router();
