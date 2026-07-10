"use client";

import { useState } from "react";

/**
 * Tabbed "what we build" explorer with animated panel transitions.
 * Expects items shaped like buildShowcaseItems: { id, eyebrow, title, text,
 * metric, bullets }. Fully keyboard-accessible (roving tab semantics via
 * button tablist).
 */
export default function InteractiveShowcase({ items = [] }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  const current = items[active];

  return (
    <div className="ix-showcase">
      <div className="ix-tabs" role="tablist" aria-label="What we build">
        {items.map((item, i) => (
          <button
            key={item.id || item.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={`ix-tab${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="ix-tab-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="ix-tab-label">{item.eyebrow}</span>
          </button>
        ))}
      </div>

      <div className="ix-panel" role="tabpanel" key={current.id || active}>
        <div className="ix-panel-body">
          <div className="eyebrow">{current.eyebrow}</div>
          <h3 className="ix-panel-title">{current.title}</h3>
          <p className="ix-panel-text">{current.text}</p>
          {current.bullets?.length ? (
            <ul className="ix-panel-list">
              {current.bullets.map((b) => (
                <li key={b}>
                  <span className="ix-check" aria-hidden="true">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {current.metric ? (
          <div className="ix-panel-metric" aria-hidden="true">
            <div className="ix-panel-metric-glow" />
            <span className="ix-panel-metric-text">{current.metric}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
