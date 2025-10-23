import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'casdoor',
      name: 'Casdoor',
      type: 'oauth',
      clientId: process.env.CASDOOR_CLIENT_ID!,
      clientSecret: process.env.CASDOOR_CLIENT_SECRET!,
      authorization: {
        url: `${process.env.CASDOOR_ENDPOINT}/login/oauth/authorize`,
        params: {
          scope: 'openid profile email',
          response_type: 'code',
          client_id: process.env.CASDOOR_CLIENT_ID!,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/casdoor`,
        },
      },
      token: `${process.env.CASDOOR_ENDPOINT}/login/oauth/access_token`,
      userinfo: `${process.env.CASDOOR_ENDPOINT}/api/userinfo`,
      profile(profile) {
        console.log('Casdoor profile:', profile);
        return {
          id: profile.sub || profile.name,
          name: profile.name || profile.displayName,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

