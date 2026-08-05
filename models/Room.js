/** @module models/Room */

export class Room {
  constructor(data = {}) {
    this.id           = data.id           ?? crypto.randomUUID();
    this.type         = data.type         ?? 'direct'; // direct|group
    this.name         = data.name         ?? '';
    this.avatar       = data.avatar       ?? null;
    this.members      = data.members      ?? [];
    this.lastMessage  = data.lastMessage  ?? null;
    this.lastActivity = data.lastActivity ?? new Date().toISOString();
    this.unreadCount  = data.unreadCount  ?? 0;
    this.isPinned     = data.isPinned     ?? false;
    this.isMuted      = data.isMuted      ?? false;
    this.isArchived   = data.isArchived   ?? false;
    this.createdAt    = data.createdAt    ?? new Date().toISOString();
  }

  get isDirect() { return this.type === 'direct'; }
  get isGroup()  { return this.type === 'group'; }
  get hasUnread(){ return this.unreadCount > 0; }

  toJSON() {
    return { id: this.id, type: this.type, name: this.name, avatar: this.avatar,
             members: this.members, lastMessage: this.lastMessage,
             lastActivity: this.lastActivity, unreadCount: this.unreadCount,
             isPinned: this.isPinned, isMuted: this.isMuted, isArchived: this.isArchived };
  }

  static fromJSON(data) { return new Room(data); }
}
