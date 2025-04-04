import "next-auth";

declare module "next-auth" {
  interface Session {
    idToken?: string;
  }

  interface JWT {
    idToken?: string;
  }
}
