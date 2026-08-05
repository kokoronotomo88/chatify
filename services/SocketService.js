/** @module services/SocketService
 *  Preparation layer for Socket.IO — connects to backend when available.
 *  Falls back gracefully in offline / no-backend mode.
 */
import { bus } from '../utils/helpers.js';
import { SOCKET_EVENTS } from '../constants/events.js';

export class SocketService {
  static #socket = null;
  static #connected = false;
  static #listeners = new Map();

  /** Connect to WebSocket server */
  static connect(url, opts = {}) {
    if (this.#connected) return;
    // When Socket.IO is loaded:
    if (typeof window.io === 'undefined') {
      console.warn('[SocketService] Socket.IO not loaded — running in offline mode.');
      return;
    }
    this.#socket = window.io(url, { transports: ['websocket'], ...opts });
    this.#socket.on(SOCKET_EVENTS.CONNECT,    () => { this.#connected = true;  bus.emit('socket:connect'); });
    this.#socket.on(SOCKET_EVENTS.DISCONNECT, () => { this.#connected = false; bus.emit('socket:disconnect'); });
    this.#socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, (data) => bus.emit('chat:receive', data));
    this.#socket.on(SOCKET_EVENTS.TYPING_START,    (data) => bus.emit('chat:typing-start', data));
    this.#socket.on(SOCKET_EVENTS.TYPING_STOP,     (data) => bus.emit('chat:typing-stop', data));
    this.#socket.on(SOCKET_EVENTS.USER_ONLINE,     (data) => bus.emit('user:online', data));
    this.#socket.on(SOCKET_EVENTS.USER_OFFLINE,    (data) => bus.emit('user:offline', data));
    this.#socket.on(SOCKET_EVENTS.READ_RECEIPT,    (data) => bus.emit('chat:read', data));
  }

  static disconnect() {
    this.#socket?.disconnect();
    this.#socket = null;
    this.#connected = false;
  }

  static emit(event, data) {
    if (!this.#socket || !this.#connected) return false;
    this.#socket.emit(event, data);
    return true;
  }

  static get isConnected() { return this.#connected; }

  static sendMessage(roomId, message) {
    return this.emit(SOCKET_EVENTS.MESSAGE_SEND, { roomId, message });
  }
  static startTyping(roomId) { return this.emit(SOCKET_EVENTS.TYPING_START, { roomId }); }
  static stopTyping(roomId)  { return this.emit(SOCKET_EVENTS.TYPING_STOP,  { roomId }); }
  static joinRoom(roomId)    { return this.emit(SOCKET_EVENTS.ROOM_JOIN,    { roomId }); }
  static leaveRoom(roomId)   { return this.emit(SOCKET_EVENTS.ROOM_LEAVE,   { roomId }); }
  static sendReadReceipt(roomId, messageId) {
    return this.emit(SOCKET_EVENTS.READ_RECEIPT, { roomId, messageId });
  }
}
