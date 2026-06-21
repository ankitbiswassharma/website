"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Stats strip with count-up animation that fires when scrolled into view.
 * Each stat is a string like "48h", "100%", "3×", "5★" — we split it into a
 * numeric part (animated) and the surrounding prefix/suffix (kept static).
 */

function parseStat(value) {
  const match = String(value).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: "", target: null, suffix: value, decimals: 0 };
  const [, prefix, num, suffix] = match;
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  return { prefix, target: parseFloat(num), suffix, decimals };
}

function StatItem({ stat, run }) {
  const parsed = parseStat(stat.num);
  const [display, setDisplay] = useState(
    parsed.target === null ? stat.num : `${parsed.prefix}0${parsed.suffix}`
  );

  useEffect(() => {
    if (!run || parsed.target === null) return;

    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplay(stat.num);
      return;
    }

    const duration = 1400;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = parsed.target * eased;
      const shown =
        parsed.decimals > 0
          ? current.toFixed(parsed.decimals)
          : Math.round(current).toString();
      setDisplay(`${parsed.prefix}${shown}${parsed.suffix}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, parsed.target, parsed.prefix, parsed.suffix, parsed.decimals, stat.num]);

  return (
    <div className="stats-strip-item">
      <div className="stats-strip-num">{display}</div>
      <div className="stats-strip-label">{stat.label}</div>
    </div>
  );
}

export default function StatsStrip({ items }) {
  const ref = useRef(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (!ref.current || !("IntersectionObserver" in window)) {
      setRun(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stats-strip-inner" ref={ref}>
      {items.map((stat) => (
        <StatItem stat={stat} run={run} key={stat.num + stat.label} />
      ))}
    </div>
  );
}
