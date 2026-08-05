/** @module utils/helpers */

/**
 * Format timestamp to readable time string
 * @param {string|Date} date
 * @param {'time'|'date'|'relative'|'short'} [mode]
 */
export function formatTime(date, mode = 'time') {
  const d = new Date(date);
  if (isNaN(d)) return '';
  switch (mode) {
    case 'time':
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'date':
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    case 'short': {
      const now = new Date();
      const diffDays = Math.floor((now - d) / 86400000);
      if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'short' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    case 'relative': {
      const secs = Math.floor((Date.now() - d) / 1000);
      if (secs < 60)   return 'Just now';
      if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
      if (secs < 86400)return `${Math.floor(secs / 3600)}h ago`;
      return `${Math.floor(secs / 86400)}d ago`;
    }
    default: return d.toISOString();
  }
}

/**
 * Date separator label
 * @param {string|Date} date
 */
export function getDateLabel(date) {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7)  return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

/** Debounce a function */
export function debounce(fn, wait = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

/** Throttle a function */
export function throttle(fn, limit = 100) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= limit) { last = now; fn.apply(this, args); }
  };
}

/** Deep clone (JSON-safe) */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Pick random item from array */
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Unique ID (short) */
export function uid(prefix = '') {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Truncate text */
export function truncate(str, len = 60) {
  if (!str) return '';
  return str.length <= len ? str : `${str.slice(0, len).trimEnd()}…`;
}

/** Check if element is in viewport */
export function isInViewport(el) {
  const r = el.getBoundingClientRect();
  return r.top >= 0 && r.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}

/** Wait ms */
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Capitalize first letter */
export function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/** Format file size */
export function formatFileSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

/** Escape HTML special chars */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Simple event bus */
export class EventBus {
  #listeners = new Map();
  on(event, fn)  { if (!this.#listeners.has(event)) this.#listeners.set(event, new Set()); this.#listeners.get(event).add(fn); return () => this.off(event, fn); }
  off(event, fn) { this.#listeners.get(event)?.delete(fn); }
  emit(event, data) { this.#listeners.get(event)?.forEach(fn => fn(data)); }
  once(event, fn) { const unsub = this.on(event, (...args) => { fn(...args); unsub(); }); return unsub; }
  clear(event)   { if (event) this.#listeners.delete(event); else this.#listeners.clear(); }
}

export const bus = new EventBus();
