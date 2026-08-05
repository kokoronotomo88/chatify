/** @module constants/colors */

export const COLORS = Object.freeze({
  bgPrimary:    '#0F0F1A',
  bgSecondary:  '#1A1A2E',
  bgTertiary:   '#1E1E30',
  bgElevated:   '#252540',
  bgSurface:    '#2A2A3E',

  brandPurple:  '#8B5CF6',
  brandPink:    '#EC4899',
  brandCyan:    '#06B6D4',
  brandLime:    '#84CC16',
  brandOrange:  '#F97316',

  textPrimary:  '#F8F8FF',
  textSecond:   '#A0A0B8',
  textTertiary: '#6B6B8A',
  textMuted:    '#4A4A60',

  statusOnline:  '#22C55E',
  statusAway:    '#F59E0B',
  statusBusy:    '#EF4444',
  statusOffline: '#6B6B8A',

  success: '#22C55E',
  warning: '#F59E0B',
  error:   '#EF4444',
  info:    '#06B6D4',
});

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#8B5CF6,#EC4899)',
  'linear-gradient(135deg,#06B6D4,#8B5CF6)',
  'linear-gradient(135deg,#F97316,#EC4899)',
  'linear-gradient(135deg,#84CC16,#06B6D4)',
  'linear-gradient(135deg,#EC4899,#F97316)',
  'linear-gradient(135deg,#8B5CF6,#06B6D4)',
];

/** Pick a stable gradient by string hash */
export function getAvatarGradient(str = '') {
  let hash = 0;
  for (const ch of str) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}
