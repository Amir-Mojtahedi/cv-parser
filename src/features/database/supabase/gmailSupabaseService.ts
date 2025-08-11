"use server";

import { getCurrentUserEmail } from "@/features/authentication/authService";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveCompanyContext(companyContextBlobUrl: string) {
  const userEmail = await getCurrentUserEmail();
  const { data, error } = await supabase
    .from("companycontexts")
    .upsert(
      [
        {
          useremail: userEmail,
          companycontextbloburl: companyContextBlobUrl,
        },
      ],
      { onConflict: "useremail" }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCompanyContext() {
  const userEmail = await getCurrentUserEmail();
  const { data, error } = await supabase
    .from("companycontexts")
    .select("*")
    .eq("useremail", userEmail)
    .maybeSingle();

  if (error) throw error;
  return data;
}
