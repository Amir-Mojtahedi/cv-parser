import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),

  session: { strategy: "jwt" },

  callbacks: {
    ...authConfig.callbacks,
    
    async jwt({ token, user, account }) {
      // Call the original jwt callback first
      const result = await authConfig.callbacks.jwt!({ token, user, account });
      
      // Then add your custom logic
      if (user) {
        result.user = user;
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          ...(token.user as any),
        },
        accessToken: token.accessToken,
      };
    },
  },
});