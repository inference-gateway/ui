import logger from '@/lib/logger';
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { type NextAuthConfig, Account, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Keycloak from 'next-auth/providers/keycloak';
import type { NextRequest } from 'next/server';

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    let url: string;
    let clientId: string;
    let clientSecret: string;

    switch (token.provider) {
      case 'keycloak':
        url =
          process.env.AUTH_OIDC_KEYCLOAK_ISSUER ||
          `http://localhost:8080/protocol/openid-connect/token`;
        clientId = process.env.AUTH_OIDC_KEYCLOAK_CLIENT_ID!;
        clientSecret = process.env.AUTH_OIDC_KEYCLOAK_CLIENT_SECRET!;
        break;
      case 'google':
        url = process.env.AUTH_OIDC_GOOGLE_ISSUER || 'https://oauth2.googleapis.com/token';
        clientId = process.env.AUTH_OIDC_GOOGLE_CLIENT_ID!;
        clientSecret = process.env.AUTH_OIDC_GOOGLE_CLIENT_SECRET!;
        break;
      case 'github':
        url = process.env.AUTH_OIDC_GITHUB_ISSUER || 'https://github.com/login/oauth/access_token';
        clientId = process.env.AUTH_OIDC_GITHUB_CLIENT_ID!;
        clientSecret = process.env.AUTH_OIDC_GITHUB_CLIENT_SECRET!;
        break;
      default:
        throw new Error(`Unsupported provider for token refresh: ${token.provider}`);
    }

    logger.debug(`[Auth] Attempting to refresh ${token.provider} token at ${url}`);

    const params = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    };

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: new URLSearchParams(params),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      logger.error(`[Auth] ${token.provider} token refresh failed`, {
        status: response.status,
        error: refreshedTokens.error,
        error_description: refreshedTokens.error_description,
      });
      return {
        ...token,
        error: 'TokenExpiredError',
      };
    }

    logger.debug(`[Auth] Refreshed ${token.provider} access token successfully`);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    logger.error('[Auth] Error refreshing access token', error);

    return {
      ...token,
      error: 'TokenExpiredError',
    };
  }
}

export const authConfig: NextAuthConfig = {
  debug: true,
  logger: {
    error(error: Error) {
      logger.error('[Auth Error]', error);
    },
    warn(code: string) {
      logger.warn(`[Auth Warning] ${code}`);
    },
    debug(message: string, metadata?: unknown) {
      logger.debug(`[Auth Debug] ${message}`, metadata);
    },
  },
  pages: {
    error: '/auth/error',
    signIn: '/auth/signin',
  },
  trustHost: true,
  useSecureCookies: process.env.AUTH_SECURE_COOKIES === 'true',
  providers: [
    ...(process.env.AUTH_OIDC_KEYCLOAK_CLIENT_ID && process.env.AUTH_OIDC_KEYCLOAK_CLIENT_SECRET
      ? [
          Keycloak({
            id: 'keycloak',
            name: 'Keycloak',
            clientId: process.env.AUTH_OIDC_KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.AUTH_OIDC_KEYCLOAK_CLIENT_SECRET,
            issuer: process.env.AUTH_OIDC_KEYCLOAK_ISSUER!,
            wellKnown:
              process.env.AUTH_OIDC_KEYCLOAK_WELL_KNOWN ||
              `${process.env.AUTH_OIDC_KEYCLOAK_ISSUER!}/.well-known/openid-configuration`,
            authorization: {
              params: {
                scope: process.env.AUTH_OIDC_KEYCLOAK_SCOPES || 'openid profile email roles',
                response_type: 'code',
              },
            },
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name ?? profile.preferred_username,
                email: profile.email,
                image: profile.picture,
              };
            },
          }),
        ]
      : []),
    ...(process.env.AUTH_OIDC_GITHUB_CLIENT_ID && process.env.AUTH_OIDC_GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: process.env.AUTH_OIDC_GITHUB_CLIENT_ID,
            clientSecret: process.env.AUTH_OIDC_GITHUB_CLIENT_SECRET,
            ...(process.env.AUTH_OIDC_GITHUB_ISSUER && {
              issuer: process.env.AUTH_OIDC_GITHUB_ISSUER,
              wellKnown:
                process.env.AUTH_OIDC_GITHUB_WELL_KNOWN ||
                `${process.env.AUTH_OIDC_GITHUB_ISSUER}/.well-known/openid-configuration`,
            }),
            authorization: {
              params: {
                scope: process.env.AUTH_OIDC_GITHUB_SCOPES || 'read:user user:email',
              },
            },
          }),
        ]
      : []),
    ...(process.env.AUTH_OIDC_GOOGLE_CLIENT_ID && process.env.AUTH_OIDC_GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_OIDC_GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_OIDC_GOOGLE_CLIENT_SECRET,
            ...(process.env.AUTH_OIDC_GOOGLE_ISSUER && {
              issuer: process.env.AUTH_OIDC_GOOGLE_ISSUER,
              wellKnown:
                process.env.AUTH_OIDC_GOOGLE_WELL_KNOWN ||
                `${process.env.AUTH_OIDC_GOOGLE_ISSUER}/.well-known/openid-configuration`,
            }),
            authorization: {
              params: {
                prompt: 'consent',
                access_type: 'offline',
                response_type: 'code',
                scope:
                  process.env.AUTH_OIDC_GOOGLE_SCOPES ||
                  'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
              },
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account?: Account | null; user?: User }) {
      if (account && user) {
        logger.debug('[Auth] Initial token setup', {
          provider: account.provider,
          userId: user.id,
        });
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + (account.expires_in || 3600) * 1000,
          refreshToken: account.refresh_token,
          id: user?.id,
          provider: account.provider,
        };
      }

      const ONE_MINUTE_MS = 60 * 1000;
      const tokenIsValid =
        token.accessTokenExpires &&
        typeof token.accessTokenExpires === 'number' &&
        Date.now() < token.accessTokenExpires - ONE_MINUTE_MS;

      if (tokenIsValid) {
        const accessTokenExpires = token.accessTokenExpires as number;
        const expiresInSeconds = Math.round((accessTokenExpires - Date.now()) / 1000);
        logger.debug('[Auth] Using existing token (not expired yet)', {
          expiresIn: `${expiresInSeconds}s`,
        });
        return token;
      }

      if (process.env.NEXTAUTH_REFRESH_TOKEN_ENABLED === 'true') {
        try {
          logger.debug('[Auth] Token expired or about to expire, refreshing...');
          return await refreshAccessToken(token);
        } catch (error) {
          logger.error('[Auth] Error during token refresh', error);
          return {
            ...token,
            error: 'TokenExpiredError',
          };
        }
      } else {
        logger.debug('[Auth] Token expired, refresh tokens disabled');
        return {
          ...token,
          error: 'TokenExpiredError',
        };
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub || undefined,
          name: token.name || undefined,
          email: token.email || undefined,
        };
        session.accessToken = token.accessToken as string | undefined;
        session.expires = token.exp?.toString();
        session.error = token.error as string | undefined;
      }

      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.AUTH_SECURE_COOKIES === 'true',
      },
    },
  },
};

type AuthHandlers = {
  GET: (request: NextRequest) => Promise<Response>;
  POST: (request: NextRequest) => Promise<Response>;
  auth: (
    req?: NextApiRequest | GetServerSidePropsContext,
    res?: NextApiResponse
  ) => Promise<Session | null>;
  signIn: () => Promise<{
    error?: string;
    status?: number;
    ok?: boolean;
  } | null>;
  signOut: () => Promise<{ url: string } | null>;
};

const createAuthHandlers = (): AuthHandlers => {
  if (process.env.AUTH_ENABLE !== 'true') {
    return {
      GET: async () => new Response(null, { status: 404 }),
      POST: async () => new Response(null, { status: 404 }),
      auth: async () => null,
      signIn: async () => null,
      signOut: async () => null,
    };
  }

  const nextAuth = NextAuth(authConfig);
  return {
    ...nextAuth,
    GET: nextAuth.handlers.GET,
    POST: nextAuth.handlers.POST,
    auth: nextAuth.auth,
    signIn: nextAuth.signIn,
    signOut: nextAuth.signOut,
  };
};

export const authHandlers = createAuthHandlers();

export const { GET, POST, auth, signIn, signOut } = authHandlers;

export type ProviderConfig = {
  id: string;
  name: string;
  enabled: boolean;
  signinUrl: string;
  callbackUrl: string;
};

export function getEnabledProviders(): ProviderConfig[] {
  const providers = [
    {
      id: 'keycloak',
      name: 'Keycloak',
      enabled: Boolean(
        process.env.AUTH_OIDC_KEYCLOAK_CLIENT_ID && process.env.AUTH_OIDC_KEYCLOAK_CLIENT_SECRET
      ),
      signinUrl: `/api/auth/signin/keycloak`,
      callbackUrl: `/api/auth/callback/keycloak`,
    },
    {
      id: 'github',
      name: 'GitHub',
      enabled: Boolean(
        process.env.AUTH_OIDC_GITHUB_CLIENT_ID && process.env.AUTH_OIDC_GITHUB_CLIENT_SECRET
      ),
      signinUrl: `/api/auth/signin/github`,
      callbackUrl: `/api/auth/callback/github`,
    },
    {
      id: 'google',
      name: 'Google',
      enabled: Boolean(
        process.env.AUTH_OIDC_GOOGLE_CLIENT_ID && process.env.AUTH_OIDC_GOOGLE_CLIENT_SECRET
      ),
      signinUrl: `/api/auth/signin/google`,
      callbackUrl: `/api/auth/callback/google`,
    },
  ];

  return providers.filter(provider => provider.enabled);
}
