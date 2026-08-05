/** @module services/AuthService */
import { StorageService } from './StorageService.js';
import { validatePin, getRoleFromPin } from '../utils/validators.js';
import { User } from '../models/User.js';

const SESSION_KEY = 'session';
const USER_KEY    = 'current_user';

export class AuthService {
  /** Login with PIN — resolves with User or throws */
  static async login(pin) {
    const { valid, error } = validatePin(pin);
    if (!valid) throw new Error(error);

    const role = getRoleFromPin(pin);
    const userId = `user_${Date.now()}`;

    // Load mock user or create ephemeral user
    let userData;
    if (pin === '12345') {
      // Admin: load first mock user
      const mockUsers = await import('../mock/users.json', { assert: { type: 'json' } }).catch(() => null);
      userData = mockUsers?.default?.[0] ?? {
        id: userId, name: 'Sarah Amelia', username: 'sarah_amelia',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c3d9?w=150&h=150&fit=crop&crop=face',
        bio: 'Designer & creator ✨', role: 'admin', status: 'online',
      };
      userData.role = 'admin';
    } else {
      userData = { id: userId, name: 'Guest', username: `guest_${userId.slice(-4)}`,
                   avatar: null, bio: '', role: 'user', status: 'online' };
    }

    const user = new User(userData);
    const session = { userId: user.id, role, pin: null, token: null,
                      loggedInAt: new Date().toISOString() };

    StorageService.set(SESSION_KEY, session);
    StorageService.set(USER_KEY,    user.toJSON());
    return user;
  }

  static logout() {
    StorageService.remove(SESSION_KEY);
    StorageService.remove(USER_KEY);
  }

  static getCurrentUser() {
    const data = StorageService.get(USER_KEY);
    return data ? new User(data) : null;
  }

  static getSession() {
    return StorageService.get(SESSION_KEY);
  }

  static isLoggedIn() {
    const session = this.getSession();
    const user    = this.getCurrentUser();
    return !!(session && user);
  }

  static isAdmin() {
    return this.getSession()?.role === 'admin';
  }

  /** Update stored user data */
  static updateUser(updates = {}) {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated = new User({ ...user.toJSON(), ...updates });
    StorageService.set(USER_KEY, updated.toJSON());
    return updated;
  }
}
