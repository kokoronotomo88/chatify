/** @module hooks/useFetch */
import { ApiService } from '../services/ApiService.js';

/**
 * Simple fetch hook with loading/error state.
 * Returns { data, loading, error, refetch }
 * @param {string} endpoint
 * @param {{ immediate?: boolean, method?: string, body?: any }} [opts]
 */
export function useFetch(endpoint, opts = {}) {
  let data    = null;
  let loading = false;
  let error   = null;
  const subscribers = new Set();

  function notify() { subscribers.forEach(fn => fn({ data, loading, error })); }

  async function fetch_(body) {
    loading = true; error = null; notify();
    try {
      const method = (opts.method ?? 'GET').toUpperCase();
      data = method === 'GET'
        ? await ApiService.get(endpoint)
        : await ApiService[method.toLowerCase()](endpoint, body ?? opts.body);
    } catch (e) { error = e.message ?? String(e); }
    finally     { loading = false; notify(); }
  }

  if (opts.immediate !== false) fetch_();

  return {
    get data()    { return data; },
    get loading() { return loading; },
    get error()   { return error; },
    refetch:    (body) => fetch_(body),
    subscribe:  (fn)   => { subscribers.add(fn); return () => subscribers.delete(fn); },
  };
}
