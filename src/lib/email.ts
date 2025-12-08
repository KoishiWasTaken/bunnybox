import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

// Initialize Resend (only if API key is available)
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export function isEmailConfigured(): boolean {
  return !!resendApiKey;
}

export function generateVerificationCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateResetToken(): string {
  // Generate a secure 32-character random token
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationCode: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Resend API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    await resend.emails.send({
      from: 'bunnybox <noreply@bunnybox.moe>',
      to: email,
      subject: 'Verify your bunnybox account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ec4899;">Welcome to bunnybox, ${username}!</h1>
          <p style="font-size: 16px; color: #333;">Thank you for creating an account. To start uploading files, please verify your email address using the code below:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 0;">Your verification code:</p>
            <p style="font-size: 32px; font-weight: bold; color: #ec4899; letter-spacing: 4px; margin: 10px 0;">${verificationCode}</p>
          </div>
          <p style="font-size: 14px; color: #666;">This code will expire when you generate a new one. If you didn't create this account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">Made with ❤️ by @.koishi</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('Resend API key not configured');
    return { success: false, error: 'Email service not configured' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: 'bunnybox <noreply@bunnybox.moe>',
      to: email,
      subject: 'Reset your bunnybox password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ec4899;">Password Reset Request</h1>
          <p style="font-size: 16px; color: #333;">Hi ${username},</p>
          <p style="font-size: 16px; color: #333;">We received a request to reset your bunnybox account password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(to right, #ec4899, #a855f7); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #999; background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">This link will expire in 1 hour and can only be used once.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">Made with ❤️ by @.koishi</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

export async function sendPasswordChangeConfirmation(
  email: string,
  username: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    await resend.emails.send({
      from: 'bunnybox <noreply@bunnybox.moe>',
      to: email,
      subject: 'Your bunnybox password was changed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ec4899;">Password Changed</h1>
          <p style="font-size: 16px; color: #333;">Hi ${username},</p>
          <p style="font-size: 16px; color: #333;">Your bunnybox account password was recently changed. If you made this change, you can safely ignore this email.</p>
          <p style="font-size: 16px; color: #333;">If you did not change your password, please contact us immediately at @.koishi on Discord.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999;">Made with ❤️ by @.koishi</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send password change email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
