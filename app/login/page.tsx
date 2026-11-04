import { redirect } from "next/navigation";
import { getSuperadminSession } from "@/lib/auth";
import { LoginButton } from "@/components/login-button";

export default async function LoginPage() {
  const session = await getSuperadminSession();
  if (session.user && session.isSuperadmin) redirect("/chains");
  return <main className="auth-page"><section className="auth-card">
    <p className="eyebrow">Restricted workspace</p>
    <h1>Prompt Chain<br /><em>Studio</em></h1>
    <p>Design, sequence, and run multimodal prompts for NYC Sidequests.</p>
    <LoginButton />
    <small>Access requires a profile with superadmin privileges.</small>
  </section></main>;
}
