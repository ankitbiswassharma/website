import Link from "next/link";

import { navLinks } from "@/lib/site-data";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/" aria-label="Musk-IT home">
          <span className="brand-wordmark">
            <span>Musk</span>
            <span>-IT</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="button button-ghost" href="/enterprise-login">
            Client Login
          </Link>
          <Link className="button button-primary" href="/contact">
            Start a Sprint
          </Link>
        </div>
      </div>
    </header>
  );
}
