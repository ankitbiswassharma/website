import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg-orb hero-bg-orb-a" aria-hidden="true" />
      <div className="hero-bg-orb hero-bg-orb-b" aria-hidden="true" />
      <div className="hero-grid-lines" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <div className="hero-badge">
            <span className="hero-badge-pip" />
            Now accepting Q3 sprint engagements
          </div>
          <div className="eyebrow">On-Demand Software &amp; Consulting</div>
          <h1>
            Ship Software.
            <br />
            <span className="text-gradient">On Your Timeline.</span>
          </h1>
          <p>
            Musk-IT gives product teams and founders a senior engineering
            partner they can activate on demand — sprint delivery, technical
            consulting, and full custom builds, without the hiring overhead.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/contact">
              Start a Sprint
            </Link>
            <Link className="button button-ghost" href="/features">
              See What We Build
            </Link>
          </div>
          <div className="hero-trust-rail">
            <span className="hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#4f46e5" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              48h kickoff
            </span>
            <span className="hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#4f46e5" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              No hiring overhead
            </span>
            <span className="hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#4f46e5" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              End-to-end delivery
            </span>
          </div>
        </div>

        <div className="hero-float-scene" aria-label="Sprint delivery metrics">
          {/* ── Main KPI card ── */}
          <div className="float-card float-card-main">
            <div className="float-card-head">
              <div className="float-sparkline" aria-hidden="true">
                {[40, 55, 48, 70, 62, 85, 78, 96].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
              <span className="float-status-dot" />
            </div>
            <div className="float-kpi">96%</div>
            <div className="float-kpi-label">Sprint velocity</div>
            <div className="float-progress-row" aria-hidden="true">
              <div className="float-progress-bar">
                <div className="float-progress-fill" style={{ width: "96%" }} />
              </div>
              <span className="float-progress-val">96/100</span>
            </div>
          </div>

          {/* ── Stories card ── */}
          <div className="float-card float-card-stories">
            <div className="float-badge float-badge-green">Active</div>
            <div className="float-kpi float-kpi-sm">42</div>
            <div className="float-kpi-label">Stories shipped</div>
            <div className="float-sublabel">Across 3 sprints</div>
          </div>

          {/* ── Kickoff card ── */}
          <div className="float-card float-card-kickoff">
            <svg className="float-card-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M11 2v8l5 2.5" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="9" stroke="#4f46e5" strokeWidth="1.8" opacity=".5"/>
            </svg>
            <div className="float-kpi float-kpi-sm">48h</div>
            <div className="float-kpi-label">Avg. kickoff</div>
            <div className="float-sublabel">Brief to first commit</div>
          </div>

          {/* ── Pipeline card ── */}
          <div className="float-card float-card-pipeline">
            <div className="float-card-head" style={{ justifyContent: "space-between" }}>
              <span className="float-kpi-label" style={{ marginBottom: 0 }}>Delivery pipeline</span>
              <span className="float-badge float-badge-indigo">Sprint 12</span>
            </div>
            <div className="float-pipeline" aria-hidden="true">
              {["Scoped", "In Build", "Review", "Shipped"].map((stage, i) => (
                <div key={stage} className={`float-pipeline-step${i < 2 ? " is-done" : i === 2 ? " is-active" : ""}`}>
                  <div className="float-pipeline-dot" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>
            <div className="float-pipeline-track" aria-hidden="true">
              <div className="float-pipeline-fill" style={{ width: "62%" }} />
            </div>
          </div>

          {/* ── Activity card ── */}
          <div className="float-card float-card-activity">
            <div className="float-kpi-label" style={{ marginBottom: 10 }}>Recent activity</div>
            {[
              { dot: "#818cf8", text: "Auth module deployed — awaiting sign-off" },
              { dot: "#34d399", text: "API spec locked with client" },
              { dot: "#f59e0b", text: "Sprint 13 scope agreed — kickoff 09:00" },
            ].map((item, i) => (
              <div className="float-activity-row" key={i}>
                <span className="float-activity-dot" style={{ background: item.dot }} />
                <span className="float-activity-text">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
