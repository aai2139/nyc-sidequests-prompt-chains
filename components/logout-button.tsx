"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return <button className="text-button" onClick={async () => {
    await createBrowserSupabaseClient().auth.signOut(); router.push("/login"); router.refresh();
  }}>Sign out</button>;
}
