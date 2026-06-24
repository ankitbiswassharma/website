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
            Now onboarding new clients for Q3
          </div>
          <h1>
            Custom Software &amp; IT Solutions,
            <br />
            <span className="text-gradient">Built Around Your Business.</span>
          </h1>
          <p>
            We build the software your business actually runs on — ERP, CRM,
            dashboards, web and mobile apps — then run the cloud, security, and
            support behind it. One partner, tailored to your exact workflows.
          </p>
          <div className="hero-cta-group">
            <div className="hero-actions">
              <Link className="button button-primary" href="/consultation">
                Book a Free Consultation
              </Link>
              <Link className="button button-ghost" href="/work">
                See Our Work
              </Link>
            </div>
            <p className="hero-cta-note">
              Free 30-minute consultation · No obligation · We reply within 24 hours
            </p>
          </div>
          <div className="hero-trust-rail">
            <span className="hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#4f46e5" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Custom software builds
            </span>
            <span className="hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#4f46e5" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Tailored to your workflows
            </span>
            <span className="hero-trust-item">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="7" fill="#4f46e5" opacity=".15"/><path d="M4 7l2 2 4-4" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Managed IT &amp; security
            </span>
          </div>
        </div>

        <div className="hero-float-scene" aria-label="What Musk-IT builds and the IT it runs">
          {/* ── What we build ── */}
          <div className="float-card float-card-main">
            <div className="float-card-head" style={{ justifyContent: "space-between" }}>
              <span className="float-kpi-label" style={{ marginBottom: 0 }}>What we build</span>
              <span className="float-status-dot" />
            </div>
            <div className="float-card-mini-title">Custom software & IT, end to end</div>
            <div className="float-build-list">
              <span>ERP &amp; CRM systems</span>
              <span>Workflow automation</span>
              <span>Web &amp; mobile apps</span>
              <span>APIs &amp; integrations</span>
            </div>
          </div>

          {/* ── The IT behind it ── */}
          <div className="float-card float-card-stories">
            <div className="float-badge float-badge-green">Managed</div>
            <div className="float-card-mini-title">The IT behind it</div>
            <div className="float-sublabel">Cloud, security &amp; support</div>
          </div>

          {/* ── Ownership ── */}
          <div className="float-card float-card-kickoff">
            <svg className="float-card-icon" width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M11 2v8l5 2.5" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="9" stroke="#4f46e5" strokeWidth="1.8" opacity=".5"/>
            </svg>
            <div className="float-card-mini-title">You own the code</div>
            <div className="float-sublabel">No lock-in, full handover</div>
          </div>

          {/* ── How we work ── */}
          <div className="float-card float-card-pipeline">
            <div className="float-card-head" style={{ justifyContent: "space-between" }}>
              <span className="float-kpi-label" style={{ marginBottom: 0 }}>How we work</span>
              <span className="float-badge float-badge-indigo">4 steps</span>
            </div>
            <div className="float-pipeline" aria-hidden="true">
              {["Scope", "Build", "Review", "Ship"].map((stage) => (
                <div key={stage} className="float-pipeline-step is-done">
                  <div className="float-pipeline-dot" />
                  <span>{stage}</span>
                </div>
              ))}
            </div>
            <div className="float-pipeline-track" aria-hidden="true">
              <div className="float-pipeline-fill" style={{ width: "100%" }} />
            </div>
          </div>

          {/* ── What you get ── */}
          <div className="float-card float-card-activity">
            <div className="float-kpi-label" style={{ marginBottom: 10 }}>What you get</div>
            {[
              { dot: "#818cf8", text: "Clean, documented code you own" },
              { dot: "#34d399", text: "Tests and a proper handover" },
              { dot: "#f59e0b", text: "Ongoing support when you want it" },
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
