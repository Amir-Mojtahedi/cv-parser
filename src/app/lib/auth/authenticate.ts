"use server";

import { signIn } from "@/lib/auth/auth";
import { createUser } from "@/app/lib/data/db";
import { ZodError } from "zod";
import { signupSchema } from "@/lib/zod";


export async function signup(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  try {
    const validatedData = signupSchema.parse(data);

    // const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    await createUser({
      email: validatedData.email,
      password: validatedData.password,
      name: `${validatedData.firstName} ${validatedData.lastName}`,
      company: validatedData.company,
      dateOfBirth: validatedData.dateOfBirth,
    });

    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof ZodError) {
      return error.errors[0].message;
    }
    return "Failed to create account.";
  }
}
