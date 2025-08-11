// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string;
    password?: string;
    hasGoogleAuth?: boolean;
  }

  interface Session {
    user: User & DefaultSession["user"];
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
    accessToken?: string;
    hasGoogleAuth?: boolean;
  }
}
