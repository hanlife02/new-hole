import { NextAuthOptions } from 'next-auth';
import { Sdk } from 'casdoor-js-sdk';

const sdk = new Sdk({
  serverUrl: process.env.CASDOOR_ENDPOINT!,
  clientId: process.env.CASDOOR_CLIENT_ID!,
  clientSecret: process.env.CASDOOR_CLIENT_SECRET!,
  organizationName: process.env.CASDOOR_ORGANIZATION_NAME!,
  appName: process.env.CASDOOR_APP_NAME!,
  redirectPath: '/api/auth/callback/casdoor',
});

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'casdoor',
      name: 'Casdoor',
      type: 'oauth',
      clientId: process.env.CASDOOR_CLIENT_ID!,
      clientSecret: process.env.CASDOOR_CLIENT_SECRET!,
      authorization: {
        url: `${process.env.CASDOOR_ENDPOINT}/api/login/oauth/authorize`,
        params: {
          scope: 'read',
          response_type: 'code',
          client_id: process.env.CASDOOR_CLIENT_ID!,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/casdoor`,
        },
      },
      token: `${process.env.CASDOOR_ENDPOINT}/api/login/oauth/access_token`,
      userinfo: `${process.env.CASDOOR_ENDPOINT}/api/get-account`,
      profile(profile) {
        return {
          id: profile.name,
          name: profile.displayName,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
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
  },
};

export { sdk };