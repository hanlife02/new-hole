import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/api/auth/signin?provider=casdoor',
  },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon\\.ico|.*\\..*).*)',
  ],
};
