"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { estimator } from "@/lib/site-data";

function formatINR(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: estimator.currency,
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

function roundTo(value, step) {
  return Math.round(value / step) * step;
}

function Stepper({ label, hint, value, min = 0, max = 20, onChange }) {
  return (
    <div className="est-stepper">
      <div className="est-stepper-text">
        <span className="est-stepper-label">{label}</span>
        {hint ? <span className="est-stepper-hint">{hint}</span> : null}
      </div>
      <div className="est-stepper-control">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </button>
        <span className="est-stepper-value">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function EstimateCalculator() {
  const [projectType, setProjectType] = useState(estimator.projectTypes[0].value);
  const [modules, setModules] = useState(2);
  const [integrations, setIntegrations] = useState(1);
  const [roles, setRoles] = useState(2);
  const [complexity, setComplexity] = useState("standard");
  const [support, setSupport] = useState("basic");
  const [rush, setRush] = useState(false);

  const result = useMemo(() => {
    const type = estimator.projectTypes.find((t) => t.value === projectType) || estimator.projectTypes[0];
    const comp = estimator.complexity.find((c) => c.value === complexity) || estimator.complexity[0];
    const sup = estimator.support.find((s) => s.value === support) || estimator.support[0];

    let build = type.base;
    build += modules * estimator.perModule;
    build += integrations * estimator.perIntegration;
    build += Math.max(0, roles - 2) * estimator.perRole;
    build *= comp.factor;
    if (rush) build *= estimator.rushFactor;

    const total = build + sup.price;
    const low = roundTo(total, 1000);
    const high = roundTo(total * 1.25, 1000);

    let weeks = type.weeks + comp.addWeeks + Math.floor(modules / 3);
    if (rush) weeks = Math.ceil(weeks * 0.8);

    return { low, high, weeks };
  }, [projectType, modules, integrations, roles, complexity, support, rush]);

  return (
    <div className="est-layout">
      <div className="card est-config stack-md">
        <div className="field">
          <label>Project type</label>
          <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
            {estimator.projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <Stepper
          label="Modules / major features"
          hint="Beyond the core build"
          value={modules}
          onChange={setModules}
        />
        <Stepper
          label="Third-party integrations"
          hint="Payments, email, CRM, ERP…"
          value={integrations}
          onChange={setIntegrations}
        />
        <Stepper
          label="User roles"
          hint="First two are included"
          value={roles}
          min={1}
          onChange={setRoles}
        />

        <div className="field">
          <label>Complexity</label>
          <div className="est-chip-row">
            {estimator.complexity.map((c) => (
              <button
                type="button"
                key={c.value}
                className={`est-chip${complexity === c.value ? " is-selected" : ""}`}
                onClick={() => setComplexity(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Support plan</label>
          <div className="est-chip-row">
            {estimator.support.map((s) => (
              <button
                type="button"
                key={s.value}
                className={`est-chip${support === s.value ? " is-selected" : ""}`}
                onClick={() => setSupport(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <label className="est-rush">
          <input type="checkbox" checked={rush} onChange={(e) => setRush(e.target.checked)} />
          <span>Expedited timeline (+20%)</span>
        </label>
      </div>

      <aside className="card est-result stack-md">
        <div className="eyebrow">Indicative estimate</div>
        <div className="est-price">
          {formatINR(result.low)} <span>–</span> {formatINR(result.high)}
        </div>
        <div className="est-timeline">
          Estimated timeline: <strong>{result.weeks}–{result.weeks + 2} weeks</strong>
        </div>
        <p className="est-note">
          This is a ballpark to help you plan. Final pricing is confirmed after a short
          consultation and a fixed scope. No obligation.
        </p>
        <div className="est-actions">
          <Link className="button button-primary" href="/consultation">
            Get an exact quote
          </Link>
          <Link className="button button-ghost" href="/services">
            Explore services
          </Link>
        </div>
      </aside>
    </div>
  );
}
