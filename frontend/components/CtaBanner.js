import Link from "next/link";

export default function CtaBanner({
  title,
  text,
  eyebrow = "Platform Consultation",
  primaryHref = "/contact",
  primaryLabel = "Request a Consultation",
  secondaryHref = "/modules",
  secondaryLabel = "Explore Modules",
}) {
  return (
    <section className="cta-banner">
      <div className="shell cta-shell">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="cta-actions">
          <Link className="button button-primary" href={primaryHref}>
            {primaryLabel}
          </Link>
          <Link className="button button-ghost" href={secondaryHref}>
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
