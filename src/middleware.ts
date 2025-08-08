import NextAuth from 'next-auth';
import { authConfig } from '@/features/authentication/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};