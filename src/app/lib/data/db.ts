import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function createUser({
  email,
  password,
  name,
  username,
  phone,
  company,
  dateOfBirth,
  country,
}: {
  email: string;
  password: string;
  name: string;
  username: string;
  phone: string;
  company?: string;
  dateOfBirth?: string;
  country: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        email,
        password,
        name,
        username,
        phone,
        company,
        date_of_birth: dateOfBirth,
        country,
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
