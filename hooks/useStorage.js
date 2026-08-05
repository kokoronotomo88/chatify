/** @module hooks/useStorage */
import { StorageService } from '../services/StorageService.js';

export function useStorage(key, defaultValue = null) {
  let value = StorageService.get(key, defaultValue);
  const subscribers = new Set();
  const notify = () => subscribers.forEach(fn => fn(value));

  return {
    get value() { return value; },
    set(newValue) {
      StorageService.set(key, newValue);
      value = newValue;
      notify();
    },
    remove() {
      StorageService.remove(key);
      value = defaultValue;
      notify();
    },
    subscribe: (fn) => { subscribers.add(fn); fn(value); return () => subscribers.delete(fn); },
  };
}
