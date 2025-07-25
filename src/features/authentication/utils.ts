"use server";

import { auth } from "@/features/authentication/auth";
import { signIn } from "@/features/authentication/auth";
import { createUser } from "@/features/database/supabase/supabaseService";
import { ZodError } from "zod";
import { signInSchema, signupSchema } from "@/features/authentication/zod";

export async function login(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  try {
    const validatedData = signInSchema.parse(data);

    await signIn("credentials", {
      redirect: false,
      email: validatedData.email,
      password: validatedData.password,
      callbackUrl: "/dashboard",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as any).code === "credentials"
    ) {
      return "Invalid Credentials!";
    }
    return "Invalid Credentials!";
  }
}

export async function signup(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  try {
    const validatedData = signupSchema.parse(data);

    await createUser({
      email: validatedData.email,
      password: validatedData.password,
      name: `${validatedData.firstName} ${validatedData.lastName}`,
      company: validatedData.company,
      dateOfBirth: validatedData.dateOfBirth,
    });

    await signIn("credentials", {
      redirect: false,
      email: validatedData.email,
      password: validatedData.password,
      callbackUrl: "/dashboard",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return error.errors[0].message;
    } else if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as any).code === "23505"
    ) {
      return "An account with this email already exists.";
    }
    return "Failed to create account.";
  }
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}
