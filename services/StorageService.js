/** @module services/StorageService */

const PREFIX = 'chattify_';

export class StorageService {
  /** Save value (JSON-serialized) */
  static set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  /** Get value (JSON-parsed) */
  static get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  /** Remove key */
  static remove(key) { localStorage.removeItem(PREFIX + key); }

  /** Clear all chattify keys */
  static clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }

  /** Session storage */
  static setSession(key, value) {
    try { sessionStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
  static getSession(key, fallback = null) {
    try { const r = sessionStorage.getItem(PREFIX + key); return r !== null ? JSON.parse(r) : fallback; }
    catch { return fallback; }
  }
  static removeSession(key) { sessionStorage.removeItem(PREFIX + key); }
}
