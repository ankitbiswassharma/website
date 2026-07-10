"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { announcementBar } from "@/lib/site-data";

/**
 * Dismissible top announcement bar for scarcity / offer messaging.
 * Remembers dismissal per-message via localStorage (keyed by config `id`, so
 * changing the message re-shows the bar). Renders nothing until mounted to
 * avoid a hydration flash.
 */
export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);
  const storageKey = `muskit-annc-${announcementBar.id}`;

  useEffect(() => {
    if (!announcementBar.enabled) return;
    try {
      if (localStorage.getItem(storageKey) === "dismissed") return;
    } catch (e) {
      /* ignore */
    }
    setVisible(true);
  }, [storageKey]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(storageKey, "dismissed");
    } catch (e) {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div className="annc-bar" role="region" aria-label="Announcement">
      <div className="shell annc-bar-inner">
        <p className="annc-bar-text">
          <span className="annc-bar-pip" aria-hidden="true" />
          {announcementBar.emphasis ? (
            <strong className="annc-bar-emphasis">{announcementBar.emphasis}</strong>
          ) : null}
          <span>{announcementBar.message}</span>
          <Link className="annc-bar-cta" href={announcementBar.ctaHref}>
            {announcementBar.ctaLabel}
            <span aria-hidden="true"> →</span>
          </Link>
        </p>
        <button
          type="button"
          className="annc-bar-close"
          onClick={dismiss}
          aria-label="Dismiss announcement"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
