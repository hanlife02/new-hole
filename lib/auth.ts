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

type ExtendedToken = JWT & {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number | string;
  [key: string]: unknown;
};

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

function parseTokenResponse(payload: string): TokenResponse {
  try {
    return JSON.parse(payload) as TokenResponse;
  } catch {
    const params = new URLSearchParams(payload);
    const parsed: TokenResponse = {};

    params.forEach((value, key) => {
      parsed[key] = value;
    });

    return parsed;
  }
}

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  if (!token.refreshToken) {
    return {
      ...token,
      error: 'MissingRefreshToken',
    };
  }

  const endpoint = withCasdoorPath('/api/login/oauth/access_token');
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: token.refreshToken,
  });

  if (process.env.CASDOOR_CLIENT_ID) {
    params.append('client_id', process.env.CASDOOR_CLIENT_ID);
  }

  if (process.env.CASDOOR_CLIENT_SECRET) {
    params.append('client_secret', process.env.CASDOOR_CLIENT_SECRET);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const raw = await response.text();
    const refreshedTokens = parseTokenResponse(raw);

    if (!response.ok || !refreshedTokens.access_token) {
      throw new Error(`Failed to refresh access token: ${response.status} ${raw}`);
    }

    const expiresIn = Number(refreshedTokens.expires_in);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      expiresAt: Number.isFinite(expiresIn)
        ? Date.now() + expiresIn * 1000
        : token.expiresAt,
      error: undefined,
    };
  } catch (error) {
    console.error('Casdoor token refresh failed:', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
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
  trustHost: true,
  callbacks: {
    async jwt({ token, account }) {
      let extendedToken = token as ExtendedToken;

      if (account) {
        const expiresAt = account.expires_at
          ? account.expires_at * 1000
          : account.expires_in
            ? Date.now() + (Number(account.expires_in) * 1000)
            : undefined;

        extendedToken = {
          ...extendedToken,
          accessToken: account.access_token ?? extendedToken.accessToken,
          refreshToken: account.refresh_token ?? extendedToken.refreshToken,
          expiresAt,
          error: undefined,
        };

        return extendedToken;
      }

      if (!extendedToken.expiresAt || Date.now() < extendedToken.expiresAt - 60_000) {
        return extendedToken;
      }

      return refreshAccessToken(extendedToken);
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;

      if (extendedToken.accessToken) {
        session.accessToken = extendedToken.accessToken;
      }

      if (extendedToken.error) {
        session.error = extendedToken.error;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
