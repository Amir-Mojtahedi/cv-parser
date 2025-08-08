// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
    password?: string;
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
  }
}
