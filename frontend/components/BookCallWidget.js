"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Floating, dismissible "Book a call" CTA. Appears on marketing pages after a
 * short delay, hides itself inside the admin dashboard, and stays dismissed
 * for the rest of the browsing session.
 */
export default function BookCallWidget() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("muskit-cta-dismissed")) {
      setDismissed(true);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("muskit-cta-dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  const onAdmin =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/enterprise-login") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/staff") ||
    pathname === "/consultation";

  if (dismissed || onAdmin) {
    return null;
  }

  return (
    <div className={`book-call-widget${visible ? " is-visible" : ""}`} aria-hidden={!visible}>
      <button className="book-call-dismiss" type="button" onClick={dismiss} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <Link className="book-call-link" href="/consultation">
        <span className="book-call-pulse" aria-hidden="true" />
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M5.5 3.5h2l1 2.5-1.5 1a7 7 0 0 0 3 3l1-1.5 2.5 1v2c0 .6-.5 1-1 1A9.5 9.5 0 0 1 4.5 6c0-.5.4-1 1-1z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
        <span className="book-call-text">Book a free call</span>
      </Link>
    </div>
  );
}
