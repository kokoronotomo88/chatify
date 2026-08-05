/** @module store/ChatStore */
import { bus } from '../utils/helpers.js';
import { Message } from '../models/Message.js';

class ChatStoreClass {
  _state = {
    rooms:         [],
    groups:        [],
    activeRoomId:  null,
    messages:      {},   // { [roomId]: Message[] }
    typingUsers:   {},   // { [roomId]: Set<userId> }
    loading:       false,
    error:         null,
  };

  getState()  { return { ...this._state }; }
  setState(p) {
    this._state = { ...this._state, ...p };
    bus.emit('store:update', { store: 'chat', next: this._state, prev: {}, changed: Object.keys(p) });
  }
  subscribe(fn) {
    return bus.on('store:update', ({ store, next, prev, changed }) => {
      if (store === 'chat') fn(next, prev, changed);
    });
  }

  setRooms(rooms)   { this.setState({ rooms }); }
  setGroups(groups) { this.setState({ groups }); }

  setActiveRoom(roomId) {
    this.setState({ activeRoomId: roomId });
    if (roomId && !this._state.messages[roomId]) {
      this.setState({ messages: { ...this._state.messages, [roomId]: [] } });
    }
  }

  getMessages(roomId) { return this._state.messages[roomId] ?? []; }

  addMessage(roomId, msgData) {
    const msg  = msgData instanceof Message ? msgData : new Message(msgData);
    const prev = this.getMessages(roomId);
    this.setState({ messages: { ...this._state.messages, [roomId]: [...prev, msg] } });
    // Update last message in room list
    const rooms = this._state.rooms.map(r =>
      r.id === roomId ? { ...r, lastMessage: msg, lastActivity: msg.createdAt } : r
    );
    this.setState({ rooms });
    return msg;
  }

  sendLocalMessage(roomId, content, senderId) {
    return this.addMessage(roomId, { roomId, senderId, content, status: 'sent' });
  }

  setTyping(roomId, userId, isTyping) {
    const room = new Set(this._state.typingUsers[roomId] ?? []);
    isTyping ? room.add(userId) : room.delete(userId);
    this.setState({ typingUsers: { ...this._state.typingUsers, [roomId]: room } });
  }

  getTypingUsers(roomId) { return [...(this._state.typingUsers[roomId] ?? [])]; }

  markRead(roomId) {
    const rooms = this._state.rooms.map(r =>
      r.id === roomId ? { ...r, unreadCount: 0 } : r
    );
    this.setState({ rooms });
  }

  clearRoom(roomId) {
    const { [roomId]: _, ...rest } = this._state.messages;
    this.setState({ messages: rest });
  }
}

export const chatStore = new ChatStoreClass();
