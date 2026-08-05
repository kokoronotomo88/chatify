/** @module adapters/UserAdapter — transform raw API data → User model */
import { User } from '../models/User.js';

export class UserAdapter {
  static fromApi(raw) {
    return new User({
      id:       raw.id        ?? raw._id ?? '',
      name:     raw.name      ?? raw.display_name ?? 'Unknown',
      username: raw.username  ?? raw.user_name ?? '',
      avatar:   raw.avatar    ?? raw.avatar_url ?? raw.profile_picture ?? null,
      bio:      raw.bio       ?? raw.description ?? '',
      role:     raw.role      ?? 'user',
      status:   raw.status    ?? raw.presence ?? 'offline',
      lastSeen: raw.lastSeen  ?? raw.last_seen ?? null,
      createdAt:raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    });
  }
  static toApi(user) {
    return { name: user.name, username: user.username, bio: user.bio, avatar: user.avatar };
  }
  static fromApiList(list = []) { return list.map(this.fromApi.bind(this)); }
}
