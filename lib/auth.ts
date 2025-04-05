import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { Session } from "next-auth";
import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Keycloak from "next-auth/providers/keycloak";
import type { NextRequest } from "next/server";

export const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === "development",
  pages: {
    error: "/auth/error",
    signIn: "/auth/signin",
  },
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_ID!,
      clientSecret: process.env.KEYCLOAK_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: { params: { scope: "openid email profile" } },
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
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (process.env.AUTH_ENABLED !== "true") return true;

      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) return isLoggedIn;
      return true;
    },
    async jwt({ token, account }) {
      if (account?.id_token) token.idToken = account.id_token;
      return token;
    },
    async session({ session, token }) {
      session.idToken = token.idToken as string;
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
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
  if (process.env.AUTH_ENABLED !== "true") {
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
