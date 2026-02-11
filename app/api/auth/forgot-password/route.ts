import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/lib/api-response';
import { sendPasswordResetEmail } from '@/lib/password-reset-email';
import {
  generatePasswordResetToken,
  getAppBaseUrl,
  getPasswordResetExpiryDate,
  hashPasswordResetToken,
} from '@/lib/password-reset';
import { consumeRateLimit, getClientIpAddress } from '@/lib/rate-limit';

const GENERIC_FORGOT_PASSWORD_MESSAGE =
  'If an account exists for this email, a reset link has been sent.';

const FORGOT_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_LIMIT_PER_IP = 15;
const FORGOT_LIMIT_PER_EMAIL = 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();

    if (!email) {
      return successResponse({ message: GENERIC_FORGOT_PASSWORD_MESSAGE }, GENERIC_FORGOT_PASSWORD_MESSAGE);
    }

    const ipAddress = getClientIpAddress(request.headers);
    const allowedByIp = consumeRateLimit(`forgot-password:ip:${ipAddress}`, FORGOT_LIMIT_PER_IP, FORGOT_WINDOW_MS);
    const allowedByEmail = consumeRateLimit(
      `forgot-password:email:${email}`,
      FORGOT_LIMIT_PER_EMAIL,
      FORGOT_WINDOW_MS
    );

    if (!allowedByIp || !allowedByEmail) {
      return successResponse({ message: GENERIC_FORGOT_PASSWORD_MESSAGE }, GENERIC_FORGOT_PASSWORD_MESSAGE);
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
      },
    });

    if (user?.isActive) {
      const rawToken = generatePasswordResetToken();
      const tokenHash = hashPasswordResetToken(rawToken);
      const expiresAt = getPasswordResetExpiryDate();

      await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`
          UPDATE password_reset_tokens
          SET used = TRUE
          WHERE user_id = ${user.id}::uuid AND used = FALSE
        `;

        await tx.$executeRaw`
          INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
          VALUES (${user.id}::uuid, ${tokenHash}, ${expiresAt}, FALSE)
        `;
      });

      const resetLink = `${getAppBaseUrl(request)}/reset-password?token=${encodeURIComponent(rawToken)}`;
      try {
        await sendPasswordResetEmail({
          toEmail: user.email,
          recipientName: user.fullName,
          resetLink,
        });
      } catch (emailError) {
        console.error('Password reset email send error:', emailError);
      }
    }

    return successResponse({ message: GENERIC_FORGOT_PASSWORD_MESSAGE }, GENERIC_FORGOT_PASSWORD_MESSAGE);
  } catch (error) {
    console.error('Forgot password error:', error);
    return serverErrorResponse('Failed to process forgot password request');
  }
}
