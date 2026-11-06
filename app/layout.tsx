import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Library Manager",
  description: "A simple shared lending library manager"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="topbar">
      <div className="nav-wrap">
        <Link href="/" className="brand"><span className="brand-mark">L</span><span>Library<span className="brand-light">Manager</span></span></Link>
        <nav><Link href="/">Books</Link><Link href="/members">Members</Link></nav>
      </div>
    </header>
    <main className="shell">{children}</main>
    <footer className="footer">Library Manager <span>·</span> Keep every book accounted for.</footer>
  </body></html>;
}
