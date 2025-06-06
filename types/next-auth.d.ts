import 'next-auth';

declare module 'next-auth' {
  /**
   * Injected to the client's components when ENABLE_AUTH is true
   */
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    expires?: string;
    error?: string;
  }

  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    provider?: string;
    error?: string;
    id?: string;
    sub?: string;
    name?: string;
    email?: string;
    exp?: number;
  }
}
