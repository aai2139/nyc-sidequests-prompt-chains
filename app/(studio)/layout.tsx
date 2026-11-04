import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSuperadmin();
  return <div className="studio-shell">
    <header className="topbar"><Link href="/chains" className="brand"><span>PC</span> Prompt Chain Studio</Link>
      <nav><Link href="/chains">Chains</Link><Link href="/runs">Media & runs</Link></nav>
      <div className="top-actions"><ThemeToggle /><span className="user-email">{user.email}</span><LogoutButton /></div>
    </header>
    {children}
  </div>;
}
