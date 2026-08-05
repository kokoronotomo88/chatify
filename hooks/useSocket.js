/** @module hooks/useSocket */
import { SocketService } from '../services/SocketService.js';
import { bus } from '../utils/helpers.js';

export function useSocket() {
  return {
    get connected() { return SocketService.isConnected; },
    send:          (roomId, msg)       => SocketService.sendMessage(roomId, msg),
    startTyping:   (roomId)            => SocketService.startTyping(roomId),
    stopTyping:    (roomId)            => SocketService.stopTyping(roomId),
    joinRoom:      (roomId)            => SocketService.joinRoom(roomId),
    leaveRoom:     (roomId)            => SocketService.leaveRoom(roomId),
    onMessage:     (fn)                => bus.on('chat:receive', fn),
    onTypingStart: (fn)                => bus.on('chat:typing-start', fn),
    onTypingStop:  (fn)                => bus.on('chat:typing-stop', fn),
    onConnect:     (fn)                => bus.on('socket:connect', fn),
    onDisconnect:  (fn)                => bus.on('socket:disconnect', fn),
  };
}
