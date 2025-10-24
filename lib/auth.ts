import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

interface CasdoorProfile {
  sub?: string;
  id?: string;
  userId?: string;
  owner?: string;
  name?: string;
  displayName?: string;
  username?: string;
  email?: string;
  picture?: string;
  avatar?: string;
}

type ExtendedToken = JWT;

const casdoorEndpoint = process.env.CASDOOR_ENDPOINT
  ? process.env.CASDOOR_ENDPOINT.replace(/\/+$/, '')
  : undefined;

const nextAuthUrl = process.env.NEXTAUTH_URL;
const cookieSecure = nextAuthUrl
  ? nextAuthUrl.startsWith('https://')
  : process.env.NODE_ENV === 'production';

function ensureCasdoorEndpoint() {
  if (!casdoorEndpoint) {
    throw new Error('CASDOOR_ENDPOINT is not configured');
  }

  return casdoorEndpoint;
}

function withCasdoorPath(path: string) {
  return `${ensureCasdoorEndpoint()}${path}`;
}

function sanitizeToken(token: ExtendedToken): ExtendedToken {
  return {
    sub: token.sub,
    name: token.name,
    email: token.email,
    picture: token.picture,
    iat: token.iat,
    exp: token.exp,
    jti: token.jti,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'casdoor',
      name: 'Casdoor',
      type: 'oauth',
      clientId: process.env.CASDOOR_CLIENT_ID,
      clientSecret: process.env.CASDOOR_CLIENT_SECRET,
      issuer: ensureCasdoorEndpoint(),
      wellKnown: withCasdoorPath('/.well-known/openid-configuration'),
      authorization: {
        url: withCasdoorPath('/login/oauth/authorize'),
        params: {
          scope: 'openid profile email',
          response_type: 'code',
        },
      },
      token: withCasdoorPath('/api/login/oauth/access_token'),
      userinfo: withCasdoorPath('/api/userinfo'),
      profile(profile: CasdoorProfile) {
        const identifier =
          profile.sub ??
          profile.id ??
          profile.userId ??
          profile.owner ??
          profile.email ??
          profile.username ??
          profile.name;

        if (!identifier) {
          throw new Error('Casdoor profile missing a unique identifier');
        }

        return {
          id: String(identifier),
          name:
            profile.name ??
            profile.displayName ??
            profile.username ??
            String(identifier),
          email: profile.email,
          image: profile.picture ?? profile.avatar ?? undefined,
        };
      },
    },
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: cookieSecure,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: cookieSecure,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: cookieSecure,
      },
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: cookieSecure,
      },
    },
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: cookieSecure,
        maxAge: 900,
      },
    },
    nonce: {
      name: 'next-auth.nonce',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: cookieSecure,
      },
    },
  },
  useSecureCookies: cookieSecure,
  debug: process.env.NEXTAUTH_DEBUG === 'true',
  logger: {
    error(code, metadata) {
      console.error('[next-auth][error]', code, metadata);
    },
    warn(code) {
      console.warn('[next-auth][warn]', code);
    },
    debug(code, metadata) {
      if (process.env.NEXTAUTH_DEBUG === 'true') {
        console.debug('[next-auth][debug]', code, metadata);
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      const extendedToken: ExtendedToken = {
        ...token,
        name: user?.name ?? token.name,
        email: user?.email ?? token.email,
        sub: (user && 'id' in user ? (user.id as string) : undefined) ?? token.sub,
        picture: user?.image ?? token.picture,
      };

      const sanitized = sanitizeToken(extendedToken);

      if (process.env.NEXTAUTH_DEBUG === 'true') {
        console.debug('[next-auth][debug] sanitized keys', Object.keys(sanitized));
        console.debug('[next-auth][debug] sanitized size', JSON.stringify(sanitized).length);
      }

      return sanitized;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
