import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    expires?: string;
    user: {
      id?: string;
      name?: string;
      email?: string;
    };
  }

  interface JWT {
    accessToken?: string;
    id?: string;
    sub?: string;
    name?: string;
    email?: string;
    exp?: number;
  }
}
