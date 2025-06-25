import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getUserByEmail } from "@/app/lib/data/db"; // You'll create this function
import { ZodError } from "zod";
import { signInSchema } from "@/lib/zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(
            credentials
          );

          const user = await getUserByEmail(email);
          if (!user) return null;

          // const passwordsMatch = await bcrypt.compare(password, user.password);
          const passwordsMatch = password === user.password;

          if (passwordsMatch) return user;

          return null;
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});
