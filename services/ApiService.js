/** @module services/ApiService */
import { API_BASE_URL } from '../constants/api.js';

const ENV = 'development'; // switched by config

export class ApiService {
  static #base = API_BASE_URL[ENV];
  static #headers = { 'Content-Type': 'application/json' };
  static #token = null;

  static setToken(token) { this.#token = token; }
  static clearToken()    { this.#token = null; }

  static #getHeaders() {
    const h = { ...this.#headers };
    if (this.#token) h['Authorization'] = `Bearer ${this.#token}`;
    return h;
  }

  static async #request(method, endpoint, body = null) {
    const url = `${this.#base}${endpoint}`;
    const opts = { method, headers: this.#getHeaders() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw Object.assign(new Error(err.message ?? 'API error'), { status: res.status, data: err });
    }
    const ct = res.headers.get('content-type') ?? '';
    return ct.includes('json') ? res.json() : res.text();
  }

  static get(endpoint)           { return this.#request('GET',    endpoint); }
  static post(endpoint, body)    { return this.#request('POST',   endpoint, body); }
  static put(endpoint, body)     { return this.#request('PUT',    endpoint, body); }
  static patch(endpoint, body)   { return this.#request('PATCH',  endpoint, body); }
  static delete(endpoint)        { return this.#request('DELETE', endpoint); }

  /** Replace :param in endpoint */
  static buildUrl(template, params = {}) {
    return Object.entries(params).reduce(
      (url, [k, v]) => url.replace(`:${k}`, encodeURIComponent(v)),
      template
    );
  }
}
