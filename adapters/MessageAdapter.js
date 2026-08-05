/** @module adapters/MessageAdapter */
import { Message } from '../models/Message.js';

export class MessageAdapter {
  static fromApi(raw) {
    return new Message({
      id:        raw.id         ?? raw._id ?? '',
      roomId:    raw.roomId     ?? raw.room_id ?? '',
      senderId:  raw.senderId   ?? raw.sender_id ?? raw.from ?? '',
      type:      raw.type       ?? 'text',
      content:   raw.content    ?? raw.text ?? raw.body ?? '',
      mediaUrl:  raw.mediaUrl   ?? raw.media_url ?? null,
      replyTo:   raw.replyTo    ?? raw.reply_to ?? null,
      reactions: raw.reactions  ?? {},
      status:    raw.status     ?? 'delivered',
      edited:    raw.edited     ?? false,
      deleted:   raw.deleted    ?? false,
      createdAt: raw.createdAt  ?? raw.created_at ?? new Date().toISOString(),
    });
  }
  static toApi(msg) {
    return { roomId: msg.roomId, type: msg.type, content: msg.content,
             mediaUrl: msg.mediaUrl, replyTo: msg.replyTo };
  }
  static fromApiList(list = []) { return list.map(this.fromApi.bind(this)); }
}
