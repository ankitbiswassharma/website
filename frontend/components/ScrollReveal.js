"use client";

import { useEffect } from "react";

/**
 * Progressive-enhancement scroll reveal.
 *
 * Tags a curated set of elements with [data-reveal] (and a staggered
 * --reveal-i custom property), then fades + lifts them in as they enter
 * the viewport. The hidden state lives behind `html.js-reveal` (set in an
 * inline head script before paint), so server-rendered content stays
 * visible for crawlers and users without JS. Honors reduced-motion.
 */

const SELECTORS = [
  ".section-intro",
  ".feature-card",
  ".bento-card",
  ".step-card",
  ".testimonial-card",
  ".pricing-card",
  ".stats-strip-item",
  ".cta-shell > *",
  ".page-hero .shell > *",
];

export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      root.classList.remove("js-reveal");
      return;
    }

    const seen = new Set();
    const targets = [];

    SELECTORS.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        targets.push(el);
      });
    });

    if (targets.length === 0) {
      root.classList.remove("js-reveal");
      return;
    }

    // Stagger siblings so groups (card grids) cascade in.
    const indexByParent = new Map();
    targets.forEach((el) => {
      el.setAttribute("data-reveal", "");
      const parent = el.parentElement || document.body;
      const i = indexByParent.get(parent) ?? 0;
      el.style.setProperty("--reveal-i", String(Math.min(i, 6)));
      indexByParent.set(parent, i + 1);
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    targets.forEach((el) => observer.observe(el));

    // Safety net: if anything never fires, reveal it after a beat.
    const fallback = window.setTimeout(() => {
      targets.forEach((el) => el.classList.add("is-inview"));
    }, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
