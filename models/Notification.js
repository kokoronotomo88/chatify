/** @module models/Notification */

export class Notification {
  constructor(data = {}) {
    this.id        = data.id        ?? crypto.randomUUID();
    this.type      = data.type      ?? 'message'; // message|mention|call|system
    this.title     = data.title     ?? '';
    this.body      = data.body      ?? '';
    this.icon      = data.icon      ?? null;
    this.roomId    = data.roomId    ?? null;
    this.senderId  = data.senderId  ?? null;
    this.isRead    = data.isRead    ?? false;
    this.createdAt = data.createdAt ?? new Date().toISOString();
  }
  toJSON() { return { ...this }; }
  static fromJSON(data) { return new Notification(data); }
}
