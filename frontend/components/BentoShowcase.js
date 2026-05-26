"use client";

const ICONS = {
  sprints: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M6 22L14 6l8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  consulting: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M14 9v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  builds: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 11h20" stroke="currentColor" strokeWidth="2"/>
      <path d="M9 17h4M15 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  saas: (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M7 21c-2.8 0-5-2.2-5-5 0-2.5 1.8-4.5 4.2-4.9C7 8.3 9.8 6 13 6c3.9 0 7 3.1 7 7h1c1.7 0 3 1.3 3 3s-1.3 3-3 3H7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
};

const ACCENTS = {
  sprints:    { bg: "rgba(79,70,229,0.08)",  border: "rgba(99,102,241,0.22)",  color: "#818cf8", tag: "rgba(79,70,229,0.15)",  tagText: "#a5b4fc" },
  consulting: { bg: "rgba(124,58,237,0.08)", border: "rgba(139,92,246,0.22)", color: "#a78bfa", tag: "rgba(124,58,237,0.15)", tagText: "#c4b5fd" },
  builds:     { bg: "rgba(8,145,178,0.08)",  border: "rgba(6,182,212,0.22)",  color: "#22d3ee", tag: "rgba(8,145,178,0.15)",  tagText: "#67e8f9" },
  saas:       { bg: "rgba(16,185,129,0.08)", border: "rgba(52,211,153,0.22)", color: "#34d399", tag: "rgba(16,185,129,0.15)", tagText: "#6ee7b7" },
};

function SprintBar({ pct, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      <div style={{
        height: 6, borderRadius: 999,
        background: "rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 999,
          background: color, transition: "width 600ms ease",
        }} />
      </div>
    </div>
  );
}

export default function BentoShowcase({ items }) {
  const [sprints, consulting, builds, saas] = items;

  return (
    <div className="bento-showcase">

      {/* ── Large hero card — Sprints ── */}
      <div className="bento-card bento-hero bento-sprints">
        <div className="bento-card-inner">
          <div className="bento-icon" style={{ background: ACCENTS.sprints.bg, border: `1px solid ${ACCENTS.sprints.border}`, color: ACCENTS.sprints.color }}>
            {ICONS.sprints}
          </div>
          <div className="bento-eyebrow" style={{ background: ACCENTS.sprints.tag, color: ACCENTS.sprints.tagText }}>
            {sprints.eyebrow}
          </div>
          <h3 className="bento-title">{sprints.title}</h3>
          <p className="bento-text">{sprints.text}</p>
          <ul className="bento-bullets">
            {sprints.bullets.map((b) => (
              <li key={b}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <path d="M2.5 6.5l3 3 5-5" stroke={ACCENTS.sprints.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {b}
              </li>
            ))}
          </ul>
        </div>
        {/* Decorative sprint bars */}
        <div className="bento-sprint-visual" aria-hidden="true">
          <div className="bento-sprint-label">Sprint velocity</div>
          <div className="bento-sprint-bars">
            {[62, 74, 55, 88, 94, 80, 96].map((h, i) => (
              <div key={i} className="bento-bar" style={{
                height: `${h}%`,
                background: `linear-gradient(180deg, ${ACCENTS.sprints.color} 0%, rgba(79,70,229,0.5) 100%)`,
                opacity: i === 6 ? 1 : 0.55 + i * 0.06,
              }} />
            ))}
          </div>
          <div className="bento-metric-pill" style={{ background: ACCENTS.sprints.tag, color: ACCENTS.sprints.tagText }}>
            {sprints.metric}
          </div>
        </div>
      </div>

      {/* ── Consulting ── */}
      <div className="bento-card bento-sm bento-consulting">
        <div className="bento-icon" style={{ background: ACCENTS.consulting.bg, border: `1px solid ${ACCENTS.consulting.border}`, color: ACCENTS.consulting.color }}>
          {ICONS.consulting}
        </div>
        <div className="bento-eyebrow" style={{ background: ACCENTS.consulting.tag, color: ACCENTS.consulting.tagText }}>
          {consulting.eyebrow}
        </div>
        <h3 className="bento-title">{consulting.title}</h3>
        <p className="bento-text">{consulting.text}</p>
        <div className="bento-metric-pill" style={{ background: ACCENTS.consulting.tag, color: ACCENTS.consulting.tagText }}>
          {consulting.metric}
        </div>
      </div>

      {/* ── Custom Builds ── */}
      <div className="bento-card bento-sm bento-builds">
        <div className="bento-icon" style={{ background: ACCENTS.builds.bg, border: `1px solid ${ACCENTS.builds.border}`, color: ACCENTS.builds.color }}>
          {ICONS.builds}
        </div>
        <div className="bento-eyebrow" style={{ background: ACCENTS.builds.tag, color: ACCENTS.builds.tagText }}>
          {builds.eyebrow}
        </div>
        <h3 className="bento-title">{builds.title}</h3>
        <p className="bento-text">{builds.text}</p>
        <ul className="bento-bullets">
          {builds.bullets.slice(0, 2).map((b) => (
            <li key={b}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M2.5 6.5l3 3 5-5" stroke={ACCENTS.builds.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* ── SaaS Platform ── */}
      <div className="bento-card bento-wide bento-saas">
        <div className="bento-card-inner">
          <div className="bento-icon" style={{ background: ACCENTS.saas.bg, border: `1px solid ${ACCENTS.saas.border}`, color: ACCENTS.saas.color }}>
            {ICONS.saas}
          </div>
          <div className="bento-eyebrow" style={{ background: ACCENTS.saas.tag, color: ACCENTS.saas.tagText }}>
            {saas.eyebrow}
          </div>
          <h3 className="bento-title">{saas.title}</h3>
          <p className="bento-text">{saas.text}</p>
        </div>
        {/* Decorative deploy progress bars */}
        <div className="bento-deploy-visual" aria-hidden="true">
          <div className="bento-deploy-label">Module deployment</div>
          {[
            { label: "CRM", pct: 100 },
            { label: "Billing", pct: 88 },
            { label: "Portal", pct: 72 },
          ].map(({ label, pct }) => (
            <div key={label} className="bento-deploy-row">
              <span className="bento-deploy-tag">{label}</span>
              <SprintBar pct={pct} color={ACCENTS.saas.color} />
              <span className="bento-deploy-pct" style={{ color: ACCENTS.saas.color }}>{pct}%</span>
            </div>
          ))}
          <div className="bento-metric-pill" style={{ background: ACCENTS.saas.tag, color: ACCENTS.saas.tagText }}>
            {saas.metric}
          </div>
        </div>
      </div>

    </div>
  );
}
