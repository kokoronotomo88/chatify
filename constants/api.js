/** @module constants/api */

export const API_BASE_URL = Object.freeze({
  development: 'http://localhost:4000/api',
  staging:     'https://chattify-staging.vercel.app/api',
  production:  'https://chattify.vercel.app/api',
});

export const API_ENDPOINTS = Object.freeze({
  // Auth
  AUTH_LOGIN:     '/auth/login',
  AUTH_LOGOUT:    '/auth/logout',
  AUTH_REFRESH:   '/auth/refresh',
  AUTH_ME:        '/auth/me',

  // Users
  USERS:          '/users',
  USER_BY_ID:     '/users/:id',
  USER_UPDATE:    '/users/:id',
  USER_AVATAR:    '/users/:id/avatar',
  USER_ONLINE:    '/users/:id/online',

  // Rooms / Chats
  ROOMS:          '/rooms',
  ROOM_BY_ID:     '/rooms/:id',
  ROOM_MESSAGES:  '/rooms/:id/messages',
  ROOM_MEMBERS:   '/rooms/:id/members',
  ROOM_READ:      '/rooms/:id/read',

  // Groups
  GROUPS:         '/groups',
  GROUP_BY_ID:    '/groups/:id',
  GROUP_MEMBERS:  '/groups/:id/members',
  GROUP_LEAVE:    '/groups/:id/leave',

  // Messages
  MESSAGES:       '/messages',
  MESSAGE_BY_ID:  '/messages/:id',
  MESSAGE_REACT:  '/messages/:id/react',

  // Stories
  STORIES:        '/stories',
  STORY_BY_ID:    '/stories/:id',
  STORY_VIEWS:    '/stories/:id/views',

  // Notifications
  NOTIFICATIONS:  '/notifications',
  NOTIF_READ:     '/notifications/read-all',

  // Uploads
  UPLOAD:         '/uploads',

  // Search
  SEARCH:         '/search',
});

export const WS_URL = Object.freeze({
  development: 'ws://localhost:4000',
  staging:     'wss://chattify-staging.vercel.app',
  production:  'wss://chattify.vercel.app',
});
