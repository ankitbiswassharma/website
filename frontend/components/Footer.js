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
              Musk-IT is a B2B custom software and IT solutions provider serving
              businesses across India — building software (ERP, CRM, dashboards,
              apps, and integrations) and running the IT behind it: cloud
              infrastructure, managed support, cybersecurity, and consulting.
            </p>
            <div className="footer-links footer-contact">
              <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a>
              <a href={`tel:${contactDetails.phone.replace(/\s+/g, "")}`}>{contactDetails.phone}</a>
            </div>
          </div>
          <div className="footer-actions">
            <Link className="button button-primary" href="/consultation">
              Book a Call
            </Link>
            <Link className="button button-ghost" href="/portal">
              Client Login
            </Link>
            <Link className="button button-ghost" href="/staff/login">
              Staff Login
            </Link>
            <Link className="button button-ghost button-admin" href="/dashboard/login">
              Admin
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
            <div className="eyebrow">Custom Software & IT Solutions</div>
            <h3>Software built and IT handled, end to end.</h3>
            <p>
              Tell us how your business runs and where the manual work piles up.
              We scope it, build it, and run the IT behind it — with no lock-in.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
