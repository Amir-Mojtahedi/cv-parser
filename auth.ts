// auth.ts

import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getUserByEmail } from '@/app/lib/data/db'; // You'll create this function
import bcrypt from 'bcrypt';

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // Your Google provider from auth.config.ts is automatically included
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          // Note: The login form uses 'username', but let's assume it can be an email.
          // If you want to support both username and email, you'd adjust your logic.
          // For now, let's stick to email as it's more common.
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserByEmail(email); // Fetch user from your DB
          if (!user) return null; // If user not found, reject login

          const passwordsMatch = await bcrypt.compare(password, user.password); // Compare hashed password

          if (passwordsMatch) return user; // If passwords match, return user object to create session
        }

        return null; // Reject login if credentials are bad
      },
    }),
  ],
});