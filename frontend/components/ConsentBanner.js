"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_KEY = "muskit-cookie-consent"; // "accepted" | "rejected"
const GOOGLE_ANALYTICS_ID = "G-3KS2YBFJ87";
const GOOGLE_ADSENSE_CLIENT_ID = "ca-pub-6253460497373924";

export default function ConsentBanner() {
  const [consent, setConsent] = useState(null); // null until read
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored = null;
    try {
      stored = window.localStorage.getItem(CONSENT_KEY);
    } catch {
      /* ignore */
    }
    setConsent(stored);
    setReady(true);
  }, []);

  function choose(value) {
    setConsent(value);
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
      document.cookie = `${CONSENT_KEY}=${value}; path=/; max-age=15552000; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }

  const accepted = consent === "accepted";
  const showBanner = ready && consent === null;

  return (
    <>
      {/* Analytics + ads load only after explicit consent */}
      {accepted ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
            strategy="afterInteractive"
          />
          <Script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ANALYTICS_ID}');
            `}
          </Script>
        </>
      ) : null}

      {showBanner ? (
        <div className="consent-banner" role="dialog" aria-label="Cookie consent" aria-live="polite">
          <div className="consent-banner-inner shell">
            <div className="consent-banner-copy">
              <strong>We value your privacy</strong>
              <p>
                We use cookies for analytics and to improve your experience. You can accept or
                decline non-essential cookies. See our{" "}
                <a href="/privacy-policy.html">Privacy Policy</a>.
              </p>
            </div>
            <div className="consent-banner-actions">
              <button className="button button-ghost btn-sm" type="button" onClick={() => choose("rejected")}>
                Decline
              </button>
              <button className="button button-primary btn-sm" type="button" onClick={() => choose("accepted")}>
                Accept cookies
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
