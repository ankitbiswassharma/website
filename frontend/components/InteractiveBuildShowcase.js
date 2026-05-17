"use client";

import { useState } from "react";

export default function InteractiveBuildShowcase({ items }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <section className="build-showcase">
      <div className="build-showcase-rail">
        {items.map((item) => {
          const isActive = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`build-showcase-tab${isActive ? " is-active" : ""}`}
              onClick={() => setActiveId(item.id)}
              onMouseEnter={() => setActiveId(item.id)}
            >
              <span className="build-showcase-tab-eyebrow">{item.eyebrow}</span>
              <strong>{item.title}</strong>
              <span>{item.metric}</span>
            </button>
          );
        })}
      </div>

      <article className="card build-showcase-stage">
        <div className="build-showcase-stage-copy">
          <div className="eyebrow">{activeItem.eyebrow}</div>
          <h3>{activeItem.title}</h3>
          <p>{activeItem.text}</p>
          <div className="build-showcase-metric">{activeItem.metric}</div>
          <ul className="bullet-list compact">
            {activeItem.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
        <div className="build-showcase-stage-media">
          <img alt={activeItem.title} src={activeItem.image} loading="lazy" decoding="async" />
        </div>
      </article>
    </section>
  );
}
