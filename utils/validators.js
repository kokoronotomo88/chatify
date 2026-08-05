/** @module utils/validators */

/**
 * Validate a PIN input
 * @param {string} pin
 * @param {'admin'|'user'} [expectedRole]
 */
export function validatePin(pin) {
  if (typeof pin !== 'string') return { valid: false, error: 'Invalid input' };
  const trimmed = pin.trim();
  if (trimmed.length < 4) return { valid: false, error: 'PIN too short (min 4 digits)' };
  if (trimmed.length > 6) return { valid: false, error: 'PIN too long (max 6 digits)' };
  if (!/^\d+$/.test(trimmed)) return { valid: false, error: 'PIN must be numeric only' };
  return { valid: true };
}

/**
 * Determine role from PIN
 * Admin PIN: 12345
 */
export function getRoleFromPin(pin) {
  return pin === '12345' ? 'admin' : 'user';
}

export function isValidUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

export function isNonEmpty(str) { return typeof str === 'string' && str.trim().length > 0; }

export function isValidMessage(text) {
  return typeof text === 'string' && text.trim().length > 0 && text.length <= 4096;
}
