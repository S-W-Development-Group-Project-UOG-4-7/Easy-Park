type PasswordResetEmailInput = {
  toEmail: string;
  recipientName?: string | null;
  resetLink: string;
};

function buildPasswordResetHtml(input: PasswordResetEmailInput) {
  const displayName = input.recipientName?.trim() || 'EasyPark User';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <div style="padding: 24px; background: linear-gradient(135deg, #0f172a, #1e293b); color: #e5e7eb; border-radius: 12px 12px 0 0;">
        <h2 style="margin: 0; color: #84cc16;">EasyPark</h2>
        <p style="margin: 8px 0 0;">Password Reset Request</p>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: 0; border-radius: 0 0 12px 12px;">
        <p>Hello ${displayName},</p>
        <p>We received a request to reset your EasyPark account password.</p>
        <p>
          <a
            href="${input.resetLink}"
            style="display: inline-block; padding: 12px 18px; background: #84cc16; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 700;"
          >
            Reset Password
          </a>
        </p>
        <p>This link will expire in 15 minutes and can only be used once.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESET_PASSWORD_FROM_EMAIL || process.env.FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    console.info('[PASSWORD_RESET_EMAIL_FALLBACK]', {
      to: input.toEmail,
      resetLink: input.resetLink,
    });
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: input.toEmail,
      subject: 'EasyPark Password Reset',
      html: buildPasswordResetHtml(input),
    }),
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => '');
    throw new Error(`Failed to send password reset email: ${payload}`);
  }
}
