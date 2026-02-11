import bcrypt from 'bcryptjs'; // Changed from 'bcrypt' to 'bcryptjs' to fix the error
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Ensure this matches the secret used in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Hashes a plain text password using bcryptjs.
 * Used during user registration (Sign-up).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password with a stored hash.
 * Used during login (Sign-in).
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generates a JWT token containing the user's ID, email, and role.
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts the token from either the Authorization header or Cookies.
 * Priority is given to cookies for Next.js API route consistency.
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Check Cookies first (standard for your Next.js setup)
  const cookieToken = request.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;

  // 2. Fallback to Authorization Header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return null;
}

/**
 * Retrieves the authenticated user payload from the request.
 * If no valid token is found, returns null.
 */
export function getAuthUser(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const decoded = verifyToken(token) as (JWTPayload & {
    id?: string;
    sub?: string;
    user_id?: string;
    mail?: string;
    roles?: string[] | string;
  }) | null;
  if (!decoded) return null;

  const roleFromRoles =
    Array.isArray(decoded.roles) && decoded.roles.length > 0
      ? String(decoded.roles[0])
      : typeof decoded.roles === 'string'
        ? decoded.roles
        : undefined;

  return {
    ...decoded,
    userId:
      (typeof decoded.userId === 'string' && decoded.userId) ||
      (typeof decoded.id === 'string' && decoded.id) ||
      (typeof decoded.user_id === 'string' && decoded.user_id) ||
      (typeof decoded.sub === 'string' && decoded.sub) ||
      undefined,
    email:
      (typeof decoded.email === 'string' && decoded.email) ||
      (typeof decoded.mail === 'string' && decoded.mail) ||
      undefined,
    role:
      (typeof decoded.role === 'string' && decoded.role) ||
      (typeof roleFromRoles === 'string' && roleFromRoles) ||
      undefined,
  };
}

/**
 * Helper to enforce authentication. 
 * Throws an error if the user is not logged in.
 */
export function requireAuth(request: NextRequest): JWTPayload {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
