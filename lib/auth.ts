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
    switch (token.provider) {
      case 'keycloak': {
        const url = `${process.env.KEYCLOAK_ISSUER!}/protocol/openid-connect/token`;
        logger.debug(`[Auth] Attempting to refresh Keycloak token at ${url}`);

        const params = {
          client_id: process.env.KEYCLOAK_ID!,
          client_secret: process.env.KEYCLOAK_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken as string,
        };

        logger.debug('[Auth] Refresh token params:', {
          client_id: params.client_id,
          grant_type: params.grant_type,
          refresh_token_length: token.refreshToken
            ? `${(token.refreshToken as string).substring(0, 8)}...`
            : 'undefined',
        });

        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          method: 'POST',
          body: new URLSearchParams(params),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
          logger.error('[Auth] Keycloak token refresh failed', {
            status: response.status,
            error: refreshedTokens.error,
            error_description: refreshedTokens.error_description,
          });
          throw refreshedTokens;
        }

        logger.debug('[Auth] Refreshed Keycloak access token successfully');

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
      }
      case 'google': {
        const url = 'https://oauth2.googleapis.com/token';
        const response = await fetch(url, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          method: 'POST',
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_ID!,
            client_secret: process.env.GOOGLE_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken as string,
          }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
          throw refreshedTokens;
        }

        logger.debug('[Auth] Refreshed Google access token');

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
      }
      case 'github': {
        const url = 'https://github.com/login/oauth/access_token';
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
          method: 'POST',
          body: new URLSearchParams({
            client_id: process.env.GITHUB_ID!,
            client_secret: process.env.GITHUB_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken as string,
          }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
          throw refreshedTokens;
        }

        logger.debug('[Auth] Refreshed GitHub access token');

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires: Date.now() + (refreshedTokens.expires_in || 3600) * 1000,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
      }
      default:
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
    }
  } catch (error) {
    logger.error('[Auth] Error refreshing access token', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
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
  useSecureCookies: process.env.SECURE_COOKIES === 'true',
  providers: [
    Keycloak({
      id: 'keycloak',
      name: 'Keycloak',
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      wellKnown: `${process.env.KEYCLOAK_ISSUER!}/.well-known/openid-configuration`,
      authorization: {
        params: {
          scope: 'openid profile email roles',
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
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope:
            'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
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

      // Token is 1 minute away from expiring, refresh it
      if (process.env.NEXTAUTH_REFRESH_TOKEN_ENABLED === 'true') {
        try {
          logger.debug('[Auth] Token expired or about to expire, refreshing...');
          return await refreshAccessToken(token);
        } catch (error) {
          logger.error('[Auth] Error during token refresh', error);
          return {
            ...token,
            error: 'RefreshAccessTokenError',
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
        secure: process.env.SECURE_COOKIES === 'true',
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
  if (process.env.AUTH_ENABLED !== 'true') {
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
  return [
    {
      id: 'keycloak',
      name: 'Keycloak',
      enabled: Boolean(
        process.env.KEYCLOAK_ID && process.env.KEYCLOAK_SECRET && process.env.KEYCLOAK_ISSUER
      ),
      signinUrl: `/api/auth/signin/keycloak`,
      callbackUrl: `/api/auth/callback/keycloak`,
    },
    {
      id: 'github',
      name: 'GitHub',
      enabled: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
      signinUrl: `/api/auth/signin/github`,
      callbackUrl: `/api/auth/callback/github`,
    },
    {
      id: 'google',
      name: 'Google',
      enabled: Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET),
      signinUrl: `/api/auth/signin/google`,
      callbackUrl: `/api/auth/callback/google`,
    },
  ].filter(provider => provider.enabled);
}

/**
 * Handles token expiration or unauthorized errors by signing the user out
 * and redirecting them to the sign-in page with an explanation message.
 */
export async function handleTokenExpiration(isServer = false): Promise<void> {
  logger.warn('[Auth] Token expired or unauthorized, redirecting to sign-in page');

  if (isServer) {
    const redirectUrl = `/auth/signin?error=Session expired, please sign in again`;
    logger.debug('[Auth] Redirecting to sign-in page:', redirectUrl);
    throw new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } else {
    window.location.href = `/auth/signin?error=Session expired, please sign in again`;
  }
}
