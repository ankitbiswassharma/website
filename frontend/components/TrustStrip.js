/**
 * Social-proof strip: an edge-faded marquee of the industries Musk-IT builds
 * for. The list is duplicated so the CSS translateX loop is seamless; it pauses
 * on hover and is disabled under prefers-reduced-motion (handled in globals.css).
 */
const DEFAULT_INDUSTRIES = [
  "Manufacturing",
  "Retail & E-commerce",
  "Logistics & Supply Chain",
  "Healthcare",
  "Professional Services",
  "Education",
  "Finance & Fintech",
  "Real Estate",
];

export default function TrustStrip({
  label = "Trusted across industries",
  items = DEFAULT_INDUSTRIES,
}) {
  const loop = [...items, ...items];
  return (
    <div className="trust-strip" aria-label="Industries we build software for">
      <span className="trust-strip-label">{label}</span>
      <div className="trust-marquee">
        <div className="trust-marquee-track">
          {loop.map((name, i) => (
            <span
              className="trust-chip"
              key={`${name}-${i}`}
              aria-hidden={i >= items.length ? "true" : undefined}
            >
              <span className="trust-chip-dot" aria-hidden="true" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
