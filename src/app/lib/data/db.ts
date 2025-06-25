import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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
    .from('users')
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
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;
  return data;
}
