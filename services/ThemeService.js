/** @module services/ThemeService */
import { StorageService } from './StorageService.js';

const THEME_KEY = 'theme';

export class ThemeService {
  static get() {
    const saved = StorageService.get(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  static set(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    StorageService.set(THEME_KEY, theme);
    window.__app?.stores?.theme?.setState({ current: theme });
  }

  static toggle() {
    const current = this.get();
    this.set(current === 'dark' ? 'light' : 'dark');
  }

  static init() {
    const theme = this.get();
    document.documentElement.setAttribute('data-theme', theme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!StorageService.get(THEME_KEY)) this.set(e.matches ? 'dark' : 'light');
    });
  }
}
