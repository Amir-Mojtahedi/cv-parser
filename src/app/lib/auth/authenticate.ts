"use server";

import { signIn } from "@/lib/auth/auth";
import { createUser } from "@/app/lib/data/db";
import { ZodError } from "zod";
import { signInSchema, signupSchema } from "@/lib/zod";

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
