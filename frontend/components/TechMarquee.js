/**
 * Infinite, edge-faded marquee of tech badges. The list is duplicated so the
 * CSS translateX(-50%) loop is seamless. Pauses on hover; animation is
 * disabled under prefers-reduced-motion (handled in globals.css).
 */
export default function TechMarquee({ items }) {
  const loop = [...items, ...items];
  return (
    <div className="tech-marquee" aria-label="Technologies we work with">
      <div className="tech-marquee-track">
        {loop.map((t, i) => (
          <span
            className="tech-badge"
            key={`${t}-${i}`}
            aria-hidden={i >= items.length ? "true" : undefined}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
