/** @module constants/events */

export const APP_EVENTS = Object.freeze({
  // Auth
  AUTH_LOGIN:        'auth:login',
  AUTH_LOGOUT:       'auth:logout',
  AUTH_PIN_ERROR:    'auth:pin-error',

  // Navigation
  NAV_PUSH:          'nav:push',
  NAV_POP:           'nav:pop',
  NAV_REPLACE:       'nav:replace',

  // Chat
  CHAT_OPEN:         'chat:open',
  CHAT_SEND:         'chat:send',
  CHAT_RECEIVE:      'chat:receive',
  CHAT_TYPING_START: 'chat:typing-start',
  CHAT_TYPING_STOP:  'chat:typing-stop',
  CHAT_READ:         'chat:read',
  CHAT_SCROLL_BOTTOM:'chat:scroll-bottom',

  // Socket (future)
  SOCKET_CONNECT:    'socket:connect',
  SOCKET_DISCONNECT: 'socket:disconnect',
  SOCKET_ERROR:      'socket:error',
  SOCKET_RECONNECT:  'socket:reconnect',

  // Store
  STORE_UPDATE:      'store:update',

  // Theme
  THEME_CHANGE:      'theme:change',

  // Notification
  NOTIF_SHOW:        'notification:show',
  NOTIF_DISMISS:     'notification:dismiss',

  // PWA
  PWA_INSTALL:       'pwa:install',
  PWA_UPDATE:        'pwa:update',
});

export const SOCKET_EVENTS = Object.freeze({
  CONNECT:           'connect',
  DISCONNECT:        'disconnect',
  MESSAGE_SEND:      'message:send',
  MESSAGE_RECEIVE:   'message:receive',
  TYPING_START:      'typing:start',
  TYPING_STOP:       'typing:stop',
  USER_ONLINE:       'user:online',
  USER_OFFLINE:      'user:offline',
  ROOM_JOIN:         'room:join',
  ROOM_LEAVE:        'room:leave',
  READ_RECEIPT:      'read:receipt',
});
