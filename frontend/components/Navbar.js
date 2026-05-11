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
        <nav className="nav-links">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link className="button button-primary" href="/enterprise-login">
            Access Enterprise
          </Link>
        </div>
      </div>
    </header>
  );
}
