/** @module models/Message */

export class Message {
  constructor(data = {}) {
    this.id         = data.id         ?? crypto.randomUUID();
    this.roomId     = data.roomId     ?? '';
    this.senderId   = data.senderId   ?? '';
    this.type       = data.type       ?? 'text'; // text|image|voice|file|location
    this.content    = data.content    ?? '';
    this.mediaUrl   = data.mediaUrl   ?? null;
    this.replyTo    = data.replyTo    ?? null;
    this.reactions  = data.reactions  ?? {};
    this.status     = data.status     ?? 'sent'; // sent|delivered|read
    this.edited     = data.edited     ?? false;
    this.deleted    = data.deleted    ?? false;
    this.createdAt  = data.createdAt  ?? new Date().toISOString();
    this.updatedAt  = data.updatedAt  ?? null;
  }

  get isText()     { return this.type === 'text'; }
  get isImage()    { return this.type === 'image'; }
  get isVoice()    { return this.type === 'voice'; }
  get isFile()     { return this.type === 'file'; }
  get isLocation() { return this.type === 'location'; }

  get displayTime() {
    const d = new Date(this.createdAt);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  toJSON() {
    return { id: this.id, roomId: this.roomId, senderId: this.senderId,
             type: this.type, content: this.content, mediaUrl: this.mediaUrl,
             replyTo: this.replyTo, reactions: this.reactions, status: this.status,
             edited: this.edited, deleted: this.deleted, createdAt: this.createdAt };
  }

  static fromJSON(data) { return new Message(data); }
}
