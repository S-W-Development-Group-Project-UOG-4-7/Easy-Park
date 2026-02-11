import crypto from 'crypto';
import { NextRequest } from 'next/server';

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 15;

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getPasswordResetExpiryDate() {
  return new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

export function getAppBaseUrl(request?: NextRequest) {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;

  if (!request) return 'http://localhost:3000';

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  return `${protocol}://${host}`;
}
