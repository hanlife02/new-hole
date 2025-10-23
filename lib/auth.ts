import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'casdoor',
      name: 'Casdoor',
      type: 'oauth',
      clientId: process.env.CASDOOR_CLIENT_ID!,
      clientSecret: process.env.CASDOOR_CLIENT_SECRET!,
      issuer: process.env.CASDOOR_ENDPOINT,
      authorization: {
        url: `${process.env.CASDOOR_ENDPOINT}/login/oauth/authorize`,
        params: {
          scope: 'openid profile email',
          response_type: 'code',
        },
      },
      token: `${process.env.CASDOOR_ENDPOINT}/api/login/oauth/access_token`,
      userinfo: `${process.env.CASDOOR_ENDPOINT}/api/userinfo`,
      checks: ['pkce'],
      profile(profile) {
        return {
          id: profile.sub || profile.name,
          name: profile.name || profile.displayName,
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
      (session as any).accessToken = token.accessToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 登录成功后总是跳转到API Key验证页面
      if (url === `${baseUrl}/` || url === baseUrl) {
        return `${baseUrl}/auth/apikey`;
      }
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/auth/apikey`;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('SignIn event triggered');
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

