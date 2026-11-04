import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const serif = Newsreader({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = { title: "Prompt Chain Studio", description: "Build and run media prompt chains." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
    <head><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('theme')||'system'}catch{}` }} /></head>
    <body>{children}</body>
  </html>;
}
