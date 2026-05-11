import Link from "next/link";

import {
  engagementSignals,
  heroProofStats,
  platformHighlights,
} from "@/lib/site-data";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid-lines" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <div className="eyebrow">Enterprise ERP, CRM & Workflow Platforms</div>
          <h1>
            Operating Systems For
            <br />
            <span>High-Value Companies</span>
          </h1>
          <p>
            Musk-IT designs serious business software for teams that need governed
            operations, management visibility, controlled approvals, and production-grade
            digital workflows across office, field, finance, and leadership.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/contact">
              Request Consultation
            </Link>
            <Link className="button button-ghost" href="/modules">
              Explore Modules
            </Link>
          </div>
          <div className="hero-signal-rail">
            {engagementSignals.map((item) => (
              <span className="hero-signal-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
          <ul className="hero-check-list">
            {platformHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="hero-proof-grid">
            {heroProofStats.map((item) => (
              <article className="hero-proof-card" key={item.value}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-product-console" aria-label="Enterprise product preview">
          <div className="console-topbar">
            <div>
              <span className="console-kicker">Musk-IT Command Centre</span>
              <strong>Operations Control Tower</strong>
            </div>
            <span className="console-status">Live Governance</span>
          </div>

          <div className="console-grid">
            <div className="console-panel console-panel-main">
              <div className="console-panel-head">
                <span>Execution Index</span>
                <strong>94%</strong>
              </div>
              <div className="console-bars" aria-hidden="true">
                <span style={{ height: "46%" }} />
                <span style={{ height: "72%" }} />
                <span style={{ height: "58%" }} />
                <span style={{ height: "86%" }} />
                <span style={{ height: "64%" }} />
                <span style={{ height: "91%" }} />
                <span style={{ height: "76%" }} />
              </div>
            </div>

            <div className="console-panel">
              <span className="console-label">Pending approvals</span>
              <strong>18</strong>
              <small>4 critical items need leadership review</small>
            </div>

            <div className="console-panel">
              <span className="console-label">Commercial exposure</span>
              <strong>2.8%</strong>
              <small>Deviation risk under configured threshold</small>
            </div>

            <div className="console-panel console-panel-wide">
              <div className="console-panel-head">
                <span>Workflow pipeline</span>
                <strong>1,284 actions</strong>
              </div>
              <div className="pipeline-track" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="pipeline-labels">
                <span>Captured</span>
                <span>Approved</span>
                <span>Issued</span>
                <span>Closed</span>
              </div>
            </div>

            <div className="console-panel console-activity">
              <span className="console-label">Recent control events</span>
              <div className="activity-row">
                <span />
                <p>BOQ revision approved by commercial head</p>
              </div>
              <div className="activity-row">
                <span />
                <p>Site report escalated to project director</p>
              </div>
              <div className="activity-row">
                <span />
                <p>Payment milestone released for review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
