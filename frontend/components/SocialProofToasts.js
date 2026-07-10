"use client";

import { useEffect, useRef, useState } from "react";

import { socialProofToasts } from "@/lib/site-data";

/**
 * Rotating social-proof / activity toasts (bottom-left).
 *
 * These are marketing prompts sourced from a fixed config list — not a live
 * feed of specific conversions — so nothing is fabricated. Toasts appear one at
 * a time on a timer, can be dismissed for the session, and are fully disabled
 * under prefers-reduced-motion.
 */
export default function SocialProofToasts() {
  const { enabled, items, intervalMs, startDelayMs } = socialProofToasts;
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    if (!enabled || !items?.length) return undefined;

    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    try {
      if (sessionStorage.getItem("muskit-toasts") === "off") {
        setDismissed(true);
        return undefined;
      }
    } catch (e) {
      /* ignore */
    }

    const clearAll = () => timers.current.forEach((t) => clearTimeout(t));

    // Cycle: show for ~5.2s, hide for the remainder, then advance.
    const showFor = Math.max(4000, intervalMs - 3800);
    const start = setTimeout(function loop() {
      setShown(true);
      const hide = setTimeout(() => {
        setShown(false);
        const next = setTimeout(() => {
          setIndex((i) => (i + 1) % items.length);
          loop();
        }, 600);
        timers.current.push(next);
      }, showFor);
      timers.current.push(hide);
    }, startDelayMs);
    timers.current.push(start);

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setShown(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("muskit-toasts", "off");
    } catch (e) {
      /* ignore */
    }
  }

  if (!enabled || dismissed || !items?.length) return null;
  const item = items[index];

  return (
    <div
      className={`sp-toast${shown ? " is-shown" : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={shown ? undefined : "true"}
    >
      <span className="sp-toast-icon" aria-hidden="true">
        {item.icon}
      </span>
      <div className="sp-toast-body">
        <span className="sp-toast-text">{item.text}</span>
        {item.meta ? <span className="sp-toast-meta">{item.meta}</span> : null}
      </div>
      <button
        type="button"
        className="sp-toast-close"
        onClick={dismiss}
        aria-label="Dismiss notifications"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
