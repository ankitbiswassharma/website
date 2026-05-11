import Link from "next/link";

export default function FeatureGrid({ items }) {
  return (
    <div className="feature-grid">
      {items.map((item) => (
        <article
          className={`card feature-card${item.featured ? " feature-card-featured" : ""}`}
          key={item.title}
        >
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
