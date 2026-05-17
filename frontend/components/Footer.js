import Link from "next/link";

import { contactDetails, footerExploreLinks, footerResourceLinks } from "@/lib/site-data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-panel">
        <div className="footer-head">
          <div className="stack-md">
            <Link className="brand footer-brand" href="/" aria-label="Musk-IT home">
              <span className="brand-wordmark">
                <span>Musk</span>
                <span>-IT</span>
              </span>
            </Link>
            <p className="footer-copy">
              Custom ERP, CRM, automation, and business software built around how
              your team actually works.
            </p>
            <div className="footer-links footer-contact">
              <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
              <a href={`tel:${contactDetails.phone.replace(/\s+/g, "")}`}>{contactDetails.phone}</a>
            </div>
          </div>
          <div className="footer-actions">
            <Link className="button button-primary" href="/contact">
              Start Your Project
            </Link>
            <Link className="button button-ghost" href="/enterprise-login">
              Enterprise Login
            </Link>
            <Link className="button button-ghost button-admin" href="/dashboard/login">
              Admin Login
            </Link>
          </div>
        </div>

        <div className="footer-grid">
          <div>
            <h3 className="footer-title">Explore</h3>
            <nav className="footer-links footer-links-stack" aria-label="Footer explore links">
              {footerExploreLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3 className="footer-title">Resources</h3>
            <nav className="footer-links footer-links-stack" aria-label="Footer resource links">
              {footerResourceLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="footer-spotlight">
            <div className="eyebrow">Built Around Your Workflow</div>
            <h3>Software that adapts to your business.</h3>
            <p>
              We study how your operations actually work, identify inefficiencies, and
              build custom systems that streamline tasks, improve tracking, and scale with you.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
