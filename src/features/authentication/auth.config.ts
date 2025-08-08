import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getUserByEmail } from "@/features/database/supabase/supabaseService";
import { signInSchema } from "@/features/authentication/zod";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        try {
          const { email, password } = await signInSchema.parseAsync(credentials);
          const user = await getUserByEmail(email);

          if (!user || !user.password) return null;

          const passwordsMatch = password === user.password;
          return passwordsMatch ? user : null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.modify",
            "https://www.googleapis.com/auth/gmail.send",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");
      const isLoginPage = nextUrl.pathname === "/login";
      const isSignupPage = nextUrl.pathname === "/signup";

      if (isDashboardPage && !isLoggedIn) {
        return false;
      }

      if ((isLoginPage || isSignupPage) && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
