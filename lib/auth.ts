import "server-only";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function getSuperadminSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, isSuperadmin: false };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .maybeSingle();
  return { user, isSuperadmin: profile?.is_superadmin === true };
}

export async function requireSuperadmin() {
  const session = await getSuperadminSession();
  if (!session.user) redirect("/login");
  if (!session.isSuperadmin) redirect("/unauthorized");
  return session.user;
}
