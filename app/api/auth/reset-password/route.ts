import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { errorResponse, successResponse, serverErrorResponse } from '@/lib/api-response';
import { hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/password-policy';
import { hashPasswordResetToken } from '@/lib/password-reset';
import { consumeRateLimit, getClientIpAddress } from '@/lib/rate-limit';

const INVALID_TOKEN_MESSAGE = 'Invalid or expired reset token';
const RESET_WINDOW_MS = 15 * 60 * 1000;
const RESET_LIMIT_PER_IP = 25;

type TokenLookupRow = {
  id: string;
  user_id: string;
  used: boolean;
  expires_at: Date;
  is_active: boolean;
};

type FreshTokenRow = {
  user_id: string;
  used: boolean;
  expires_at: Date;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const token = String(body?.token || '').trim();
    const newPassword = String(body?.newPassword || '');
    const confirmPassword = String(body?.confirmPassword || '');

    const ipAddress = getClientIpAddress(request.headers);
    const allowed = consumeRateLimit(`reset-password:ip:${ipAddress}`, RESET_LIMIT_PER_IP, RESET_WINDOW_MS);
    if (!allowed) {
      return errorResponse('Too many reset attempts. Please try again later.', 429);
    }

    if (!token || !newPassword || !confirmPassword) {
      return errorResponse('Token, new password, and confirm password are required');
    }

    if (newPassword !== confirmPassword) {
      return errorResponse('Passwords do not match');
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return errorResponse(passwordError);
    }

    const tokenHash = hashPasswordResetToken(token);
    const tokenRows = await prisma.$queryRaw<TokenLookupRow[]>`
      SELECT prt.id, prt.user_id, prt.used, prt.expires_at, u.is_active
      FROM password_reset_tokens prt
      JOIN users u ON u.id = prt.user_id
      WHERE prt.token = ${tokenHash}
      LIMIT 1
    `;
    const tokenRecord = tokenRows[0];

    const now = new Date();
    if (!tokenRecord || tokenRecord.used || tokenRecord.expires_at <= now || !tokenRecord.is_active) {
      return errorResponse(INVALID_TOKEN_MESSAGE, 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      const freshRows = await tx.$queryRaw<FreshTokenRow[]>`
        SELECT user_id, used, expires_at
        FROM password_reset_tokens
        WHERE id = ${tokenRecord.id}::uuid
        LIMIT 1
      `;
      const freshToken = freshRows[0];

      if (!freshToken || freshToken.used || freshToken.expires_at <= new Date()) {
        throw new Error('INVALID_TOKEN');
      }

      await tx.users.update({
        where: { id: freshToken.user_id },
        data: {
          passwordHash: hashedPassword,
        },
      });

      // Single-use and user-wide invalidation for pending reset tokens.
      await tx.$executeRaw`
        UPDATE password_reset_tokens
        SET used = TRUE
        WHERE user_id = ${freshToken.user_id}::uuid AND used = FALSE
      `;
    });

    const response = successResponse({ success: true }, 'Password reset successful');
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_TOKEN') {
      return errorResponse(INVALID_TOKEN_MESSAGE, 400);
    }
    console.error('Reset password error:', error);
    return serverErrorResponse('Failed to reset password');
  }
}
