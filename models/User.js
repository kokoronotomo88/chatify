/** @module models/User */

export class User {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.name
   * @param {string} [data.username]
   * @param {string} [data.avatar]
   * @param {string} [data.bio]
   * @param {'admin'|'user'} [data.role]
   * @param {'online'|'away'|'busy'|'offline'} [data.status]
   * @param {string|null} [data.lastSeen]
   * @param {string} [data.createdAt]
   */
  constructor(data = {}) {
    this.id        = data.id        ?? '';
    this.name      = data.name      ?? 'Unknown';
    this.username  = data.username  ?? '';
    this.avatar    = data.avatar    ?? null;
    this.bio       = data.bio       ?? '';
    this.role      = data.role      ?? 'user';
    this.status    = data.status    ?? 'offline';
    this.lastSeen  = data.lastSeen  ?? null;
    this.createdAt = data.createdAt ?? new Date().toISOString();
  }

  get isAdmin()  { return this.role === 'admin'; }
  get isOnline() { return this.status === 'online'; }
  get initials() {
    return this.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }
  get displayStatus() {
    if (this.status === 'online') return 'Online';
    if (!this.lastSeen) return 'Offline';
    return `Last seen ${formatRelativeTime(this.lastSeen)}`;
  }

  toJSON() {
    return { id: this.id, name: this.name, username: this.username,
             avatar: this.avatar, bio: this.bio, role: this.role,
             status: this.status, lastSeen: this.lastSeen, createdAt: this.createdAt };
  }

  static fromJSON(data) { return new User(data); }
}

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
