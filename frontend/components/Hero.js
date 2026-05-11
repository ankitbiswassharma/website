import Link from "next/link";

import {
  engagementSignals,
  heroProducts,
  heroProofStats,
  platformHighlights,
} from "@/lib/site-data";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow hero-glow-a" />
      <div className="hero-glow hero-glow-b" />
      <div className="hero-grid-lines" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">Engineering ERP for Infrastructure & EPC</div>
          <h1>
            Enterprise Software That Feels
            <br />
            <span>Built For Real Execution</span>
          </h1>
          <p>
            Musk-IT is positioned as a serious operational platform: governed workflows,
            engineering-grade screens, and product presentation designed for high-value
            infrastructure, industrial, and execution-heavy teams.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/contact">
              Access Enterprise
            </Link>
            <Link className="button button-ghost" href="/modules">
              View Modules
            </Link>
          </div>
          <ul className="bullet-list">
            {platformHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="hero-signal-rail">
            {engagementSignals.map((item) => (
              <span className="hero-signal-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
          <div className="hero-proof-grid">
            {heroProofStats.map((item) => (
              <article className="hero-proof-card" key={item.value}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="hero-panel">
          <div className="card card-showcase hero-showcase-stage">
            <div className="showcase-stage-copy stack-sm">
              <div className="eyebrow">What We Build</div>
              <h3>Operational product surfaces, not generic dashboard filler</h3>
              <p>
                Screens designed for engineers, management, and teams that need revision control,
                approvals, cost visibility, and governed execution flow.
              </p>
            </div>
            <div className="showcase-grid">
              {heroProducts.map((item) => (
                <article className="showcase-item" key={item.value}>
                  <div className="showcase-media">
                    <img alt={item.alt} loading="lazy" src={item.image} />
                  </div>
                  <div className="showcase-copy">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="hero-showcase-pulse" />
          </div>
          <div className="card card-journey">
            <div className="stack-sm">
              <div className="eyebrow">Platform Positioning</div>
              <h3>What makes the product feel expensive</h3>
            </div>
            <ol className="journey-list">
              <li>Sharper product hierarchy with darker, enterprise-first surfaces</li>
              <li>Screen design led by workflow clarity instead of decorative blocks</li>
              <li>Premium interaction states, motion, and component consistency</li>
              <li>Messaging focused on governed operations and execution control</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
