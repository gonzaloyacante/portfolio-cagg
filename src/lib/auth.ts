import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { twoFactor } from 'better-auth/plugins';

import { prisma } from './prisma';
import { sendPasswordResetEmail } from './resend';

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  console.warn(
    '[auth] requireEmailVerification is disabled. For a multi-admin setup this is a ' +
      'risk (forgot-password can be triggered for unverified emails). ' +
      'For this single-admin portfolio we keep it off so the admin can recover their account; ' +
      'a DB-side `emailVerified = true` on the admin row mitigates the risk.'
  );
}

export const auth = betterAuth({
  appName: 'portfolio-cag',
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Revoke all active sessions when the password is reset, so an
    // attacker who had a stolen cookie loses access immediately.
    revokeSessionsOnPasswordReset: true,
    minPasswordLength: 10,
    // Forward the password-reset email to Resend. Better-Auth defaults
    // to a console.log if this is not set, which means prod silently
    // never delivers the link.
    sendResetPassword: async ({ user, url }) => {
      const from = process.env.RESEND_FROM_EMAIL;
      if (!from) {
        console.error('[auth] RESEND_FROM_EMAIL not set; password reset email not sent');
        return;
      }
      await sendPasswordResetEmail({ to: user.email, from, resetUrl: url });
    },
  },
  plugins: [twoFactor()],
  advanced: {
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
        },
      },
    },
    useSecureCookies: isProd,
  },
  session: {
    // Shorter cache window so password resets / 2FA changes are reflected
    // immediately on the client without waiting for the cache to expire.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});
