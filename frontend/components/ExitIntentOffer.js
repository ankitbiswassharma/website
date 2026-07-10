"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { exitOffer } from "@/lib/site-data";

/**
 * Two conversion hooks in one mount:
 *  1. Exit-intent modal (desktop) — fires once per session when the cursor
 *     leaves the top of the viewport. Suppressed on touch devices where
 *     mouseleave is unreliable.
 *  2. Sticky call-to-action bar (mobile only, via CSS) — always available so
 *     small-screen visitors have a persistent "book a call" action.
 */
export default function ExitIntentOffer() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!exitOffer.enabled) return undefined;

    try {
      if (sessionStorage.getItem("muskit-exit") === "seen") return undefined;
    } catch (e) {
      /* ignore */
    }

    // Skip exit-intent on touch / coarse pointers (no reliable exit signal).
    const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return undefined;

    let armed = false;
    // Arm after a short dwell so it never fires on immediate bounce.
    const armTimer = setTimeout(() => {
      armed = true;
    }, 8000);

    const onLeave = (e) => {
      if (!armed) return;
      if (e.clientY <= 0) {
        setOpen(true);
        markSeen();
        cleanup();
      }
    };

    function markSeen() {
      try {
        sessionStorage.setItem("muskit-exit", "seen");
      } catch (e) {
        /* ignore */
      }
    }
    function cleanup() {
      document.removeEventListener("mouseout", onLeave);
      clearTimeout(armTimer);
    }

    document.addEventListener("mouseout", onLeave);
    return cleanup;
  }, []);

  function close() {
    setOpen(false);
  }

  return (
    <>
      {open ? (
        <div className="exit-overlay" role="dialog" aria-modal="true" aria-labelledby="exit-title">
          <div className="exit-modal">
            <button type="button" className="exit-close" onClick={close} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <div className="exit-glow" aria-hidden="true" />
            <div className="eyebrow">{exitOffer.eyebrow}</div>
            <h2 id="exit-title" className="exit-title">
              {exitOffer.title}
            </h2>
            <p className="exit-text">{exitOffer.text}</p>
            <div className="exit-actions">
              <Link className="button button-primary" href={exitOffer.ctaHref} onClick={close}>
                {exitOffer.ctaLabel}
              </Link>
              <button type="button" className="exit-dismiss" onClick={close}>
                {exitOffer.dismissLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {exitOffer.enabled ? (
        <Link className="sticky-cta" href={exitOffer.stickyHref} aria-label={exitOffer.stickyLabel}>
          <span className="sticky-cta-pip" aria-hidden="true" />
          {exitOffer.stickyLabel}
          <span aria-hidden="true"> →</span>
        </Link>
      ) : null}
    </>
  );
}
