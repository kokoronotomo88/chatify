/** @module store/ThemeStore */
import { bus } from '../utils/helpers.js';
import { ThemeService } from '../services/ThemeService.js';

class ThemeStoreClass {
  _state = { current: ThemeService.get() };

  getState()  { return { ...this._state }; }
  setState(p) {
    this._state = { ...this._state, ...p };
    bus.emit('store:update', { store: 'theme', next: this._state, prev: {}, changed: Object.keys(p) });
  }

  toggle() { ThemeService.toggle(); this.setState({ current: ThemeService.get() }); }
  setTheme(theme) { ThemeService.set(theme); this.setState({ current: theme }); }
  get isDark() { return this._state.current === 'dark'; }
}

export const themeStore = new ThemeStoreClass();
