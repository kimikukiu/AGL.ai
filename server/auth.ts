import crypto from 'crypto';

const ADMIN_PASSWORD = '#AllOfThem-3301';
const RECOVERY_CODE = 'Merleoskyn';

/**
 * Hash a password using SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify a password against its hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Verify admin credentials
 */
export function verifyAdminCredentials(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * Verify recovery code
 */
export function verifyRecoveryCode(code: string): boolean {
  return code === RECOVERY_CODE;
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
