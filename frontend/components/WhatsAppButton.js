"use client";

import { usePathname } from "next/navigation";

// Digits only, international format (matches contactDetails.phone +91 70478 59422).
const WHATSAPP_NUMBER = "917047859422";
const PREFILL =
  "Hi Musk-IT, I'd like to talk about custom software / IT solutions for my business.";

export default function WhatsAppButton() {
  const pathname = usePathname();

  const onApp =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/staff") ||
    pathname?.startsWith("/portal") ||
    pathname?.startsWith("/enterprise-login");

  if (onApp) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILL)}`;

  return (
    <a
      className="whatsapp-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Musk-IT on WhatsApp"
    >
      <span className="whatsapp-fab-pulse" aria-hidden="true" />
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.07 8.07 0 0 1 2.37 5.72c0 4.46-3.63 8.09-8.1 8.09a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.19-.31a8.06 8.06 0 0 1-1.24-4.3c0-4.46 3.63-8.1 8.1-8.1zm-4.46 4.4c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.39 5.38 4.62 2.63 1.02 3.16.82 3.73.77.57-.05 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.36-.31-.16-1.85-.91-2.13-1.02-.29-.1-.5-.16-.71.16-.21.31-.81 1.02-.99 1.23-.18.21-.37.24-.68.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.03-.55-.08-.16-.7-1.71-.96-2.34-.25-.61-.51-.53-.71-.54l-.6-.01z" />
      </svg>
    </a>
  );
}
