/** @module store/AppStore
 *  Simple reactive state container.
 */
import { bus } from '../utils/helpers.js';

class Store {
  #state;
  #name;

  constructor(name, initialState = {}) {
    this.#name  = name;
    this.#state = { ...initialState };
  }

  getState() { return { ...this.#state }; }

  setState(partial) {
    const prev = this.#state;
    this.#state = { ...this.#state, ...partial };
    bus.emit('store:update', { store: this.#name, prev, next: this.#state, changed: Object.keys(partial) });
  }

  /** Subscribe to state changes. Returns unsubscribe function. */
  subscribe(fn) {
    return bus.on('store:update', ({ store, next, prev, changed }) => {
      if (store === this.#name) fn(next, prev, changed);
    });
  }

  /** Subscribe to specific key changes. */
  watch(key, fn) {
    return this.subscribe((next, prev) => {
      if (next[key] !== prev[key]) fn(next[key], prev[key]);
    });
  }

  reset(initialState = {}) { this.setState(initialState); }
}

export class AppStore extends Store {
  constructor() {
    super('app', {
      isReady:      false,
      isOnline:     navigator.onLine,
      activeTab:    'chats',
      activeRoomId: null,
      searchQuery:  '',
      sidebarOpen:  false,
    });
    // Network status
    window.addEventListener('online',  () => this.setState({ isOnline: true  }));
    window.addEventListener('offline', () => this.setState({ isOnline: false }));
  }
}

export const appStore = new AppStore();
