import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
    },
    state: {
      name: 'next-auth.state',
    },
    nonce: {
      name: 'next-auth.nonce',
    },
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    '/((?!api/auth|auth/signin|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
  ],
};
