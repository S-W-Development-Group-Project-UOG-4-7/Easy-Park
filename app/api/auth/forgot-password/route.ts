import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
const IS_DEV_RESET_LINK_MODE =
  process.env.NODE_ENV === 'development' || String(process.env.RESET_LINK_MODE || '').toLowerCase() === 'dev';

const FORGOT_WINDOW_MS = 15 * 60 * 1000;
const FORGOT_LIMIT_PER_IP = 15;
const FORGOT_LIMIT_PER_EMAIL = 5;

function genericForgotPasswordResponse(devResetUrl?: string) {
  return NextResponse.json(
    devResetUrl
      ? {
          message: GENERIC_FORGOT_PASSWORD_MESSAGE,
          devResetUrl,
        }
      : {
          message: GENERIC_FORGOT_PASSWORD_MESSAGE,
        }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || '').trim().toLowerCase();
    const appUrl = (process.env.APP_URL || getAppBaseUrl(request)).replace(/\/+$/, '');
    let devResetUrl = '';

    if (!email) {
      return genericForgotPasswordResponse();
    }

    const ipAddress = getClientIpAddress(request.headers);
    const allowedByIp = consumeRateLimit(`forgot-password:ip:${ipAddress}`, FORGOT_LIMIT_PER_IP, FORGOT_WINDOW_MS);
    const allowedByEmail = consumeRateLimit(
      `forgot-password:email:${email}`,
      FORGOT_LIMIT_PER_EMAIL,
      FORGOT_WINDOW_MS
    );

    if (!allowedByIp || !allowedByEmail) {
      return genericForgotPasswordResponse();
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

      const resetLink = `${appUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
      if (IS_DEV_RESET_LINK_MODE) {
        devResetUrl = resetLink;
      }
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

    return genericForgotPasswordResponse(devResetUrl || undefined);
  } catch (error) {
    console.error('Forgot password error:', error);
    return genericForgotPasswordResponse();
  }
}
