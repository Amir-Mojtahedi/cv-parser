// actions/authenticate.ts
'use server';

import { signIn } from '../../../../auth';
import { AuthError } from 'next-auth';
import { createUser } from '@/app/lib/data/db'; // A function you'll write
import bcrypt from 'bcrypt';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s\-]{10,}$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  company: z.string().optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  agreeToTerms: z.boolean(),
  agreeToMarketing: z.boolean()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// This action will be called by your LoginForm
export async function login(formData: FormData) {
  try {
    // The first argument is the provider name ('credentials' or 'google')
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function signup(formData: globalThis.FormData) {
  const data = Object.fromEntries(formData.entries());
  
  try {
    const validatedData = signupSchema.parse({
      ...data,
      agreeToTerms: data.agreeToTerms === 'on',
      agreeToMarketing: data.agreeToMarketing === 'on'
    });

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    await createUser({
      email: validatedData.email,
      password: hashedPassword,
      name: `${validatedData.firstName} ${validatedData.lastName}`,
      username: validatedData.username,
      phone: validatedData.phone,
      company: validatedData.company,
      dateOfBirth: validatedData.dateOfBirth,
      country: validatedData.country,
    });
    
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return 'Failed to create account.';
  }
}