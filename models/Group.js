/** @module models/Group */

export class Group {
  constructor(data = {}) {
    this.id          = data.id          ?? crypto.randomUUID();
    this.name        = data.name        ?? '';
    this.description = data.description ?? '';
    this.avatar      = data.avatar      ?? null;
    this.adminIds    = data.adminIds    ?? [];
    this.memberIds   = data.memberIds   ?? [];
    this.lastMessage = data.lastMessage ?? null;
    this.unreadCount = data.unreadCount ?? 0;
    this.isPinned    = data.isPinned    ?? false;
    this.isMuted     = data.isMuted     ?? false;
    this.createdAt   = data.createdAt   ?? new Date().toISOString();
    this.createdBy   = data.createdBy   ?? '';
  }

  get memberCount()          { return this.memberIds.length; }
  isAdmin(userId)            { return this.adminIds.includes(userId); }
  isMember(userId)           { return this.memberIds.includes(userId); }
  get initials()             { return this.name.slice(0, 2).toUpperCase(); }

  toJSON() {
    return { id: this.id, name: this.name, description: this.description,
             avatar: this.avatar, adminIds: this.adminIds, memberIds: this.memberIds,
             lastMessage: this.lastMessage, unreadCount: this.unreadCount,
             isPinned: this.isPinned, isMuted: this.isMuted, createdAt: this.createdAt };
  }
  static fromJSON(data) { return new Group(data); }
}
