import Link from "next/link";

export default function PageHero({
  eyebrow,
  title,
  highlight,
  text,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) {
  return (
    <section className="page-hero">
      <div className="shell">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1>
          {title}
          {highlight ? (
            <>
              <br />
              <span>{highlight}</span>
            </>
          ) : null}
        </h1>
        {text ? <p>{text}</p> : null}
        {primaryHref || secondaryHref ? (
          <div className="page-hero-actions">
            {primaryHref && primaryLabel ? (
              <Link className="button button-primary" href={primaryHref}>
                {primaryLabel}
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link className="button button-ghost" href={secondaryHref}>
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
