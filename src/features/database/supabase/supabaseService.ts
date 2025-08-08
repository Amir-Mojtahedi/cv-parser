import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function createUser({
  email,
  password,
  name,
  company,
  dateOfBirth,
}: {
  email: string;
  password: string;
  name: string;
  company?: string;
  dateOfBirth?: string;
}) {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password,
        name,
        company,
        date_of_birth: dateOfBirth,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) return null;
  return data;
}

/**
 * Retrieves the Google account associated with a given user ID from the Supabase "accounts" table.
 */
export async function getAccountByUserId(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .schema("next_auth")
    .from("accounts")
    .select("*")
    .eq("userId", userId)
    .eq("provider", "google")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching account:", error);
    return null;
  }

  return data;
}
