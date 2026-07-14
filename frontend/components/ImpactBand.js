import StatsStrip from "@/components/StatsStrip";

/**
 * Full-bleed gradient "impact" band — a high-energy metrics moment that anchors
 * the page's credibility. Reuses StatsStrip for the count-up animation; the
 * gradient background and glass cards are styled in globals.css.
 */
export default function ImpactBand({
  eyebrow = "By The Numbers",
  title = "Built for outcomes, not hours",
  items,
}) {
  return (
    <div className="impact-band">
      <div className="impact-band-head">
        <span className="eyebrow">{eyebrow}</span>
        <h2 style={{ marginTop: 14 }}>{title}</h2>
      </div>
      <StatsStrip items={items} />
      <p className="impact-band-foot">
        Figures reflect our standard engagement commitments — the pace and ownership every client gets.
      </p>
    </div>
  );
}
