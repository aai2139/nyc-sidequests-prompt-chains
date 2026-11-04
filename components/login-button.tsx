"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export function LoginButton() {
  return <button className="button primary" onClick={async () => {
    await createBrowserSupabaseClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }}>Continue with Google</button>;
}
