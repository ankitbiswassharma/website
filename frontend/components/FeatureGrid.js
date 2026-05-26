import Link from "next/link";

const ICONS = {
  problem: {
    0: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2L2 17h16L10 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M10 8v4M10 14.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    1: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M10 6v5M10 13.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    2: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 4h12v8H4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M7 16h6M10 12v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  solution: {
    0: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    1: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    2: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 3v7l4 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
    ),
  },
  service: {
    0: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    1: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M3 17l4-4m0 0l3-8 3 8m0 0l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    2: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
};

export default function FeatureGrid({ items, variant }) {
  const gridClass = variant
    ? `feature-grid feature-grid-${variant}`
    : "feature-grid";

  const iconSet = ICONS[variant] || {};

  return (
    <div className={gridClass}>
      {items.map((item, index) => (
        <article
          className={`card feature-card${item.featured ? " feature-card-featured" : ""}`}
          key={item.title}
        >
          {iconSet[index] ? (
            <div className={`feature-icon-ring icon-${variant}`}>
              {iconSet[index]}
            </div>
          ) : null}
          {item.eyebrow ? <div className="eyebrow">{item.eyebrow}</div> : null}
          <h3>{item.title}</h3>
          {item.text ? <p>{item.text}</p> : null}
          {item.bullets?.length ? (
            <ul className="bullet-list compact">
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {item.footer ? <p className="feature-footer">{item.footer}</p> : null}
          {item.href && item.linkLabel ? (
            <Link className="text-link" href={item.href}>
              {item.linkLabel}
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
