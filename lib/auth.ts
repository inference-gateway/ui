import logger from '@/lib/logger';
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';
import type { Account, Session, User } from 'next-auth';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Keycloak from 'next-auth/providers/keycloak';
import type { NextRequest } from 'next/server';

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
          scope: 'openid email profile',
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/keycloak`,
        },
      },
      checks: ['pkce', 'state'],
    }),
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account: Account | null; user: User }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user?.id;
      }
      return token;
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
