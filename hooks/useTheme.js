/** @module hooks/useTheme */
import { themeStore } from '../store/ThemeStore.js';

export function useTheme() {
  return {
    get current() { return themeStore.getState().current; },
    get isDark()  { return themeStore.isDark; },
    toggle:       () => themeStore.toggle(),
    setTheme:     (t) => themeStore.setTheme(t),
    subscribe:    (fn) => themeStore.subscribe(s => fn(s.current)),
  };
}
