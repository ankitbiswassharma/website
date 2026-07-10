"use client";

import { useEffect, useState } from "react";

/**
 * Accessible rotating word for hero headlines. Cross-fades through a list of
 * words on a timer. Under prefers-reduced-motion it holds the first word.
 * The full phrase is exposed to assistive tech via an sr-only span.
 */
export default function RotatingWords({
  words = [],
  intervalMs = 2200,
  className = "",
}) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (words.length <= 1) return undefined;
    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    setAnimate(true);
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words.length, intervalMs]);

  if (!words.length) return null;

  return (
    <span className={`rotating-words ${className}`.trim()}>
      <span className="sr-only">{words.join(", ")}</span>
      <span
        key={index}
        className={`rotating-words-item${animate ? " is-animating" : ""}`}
        aria-hidden="true"
      >
        {words[index]}
      </span>
    </span>
  );
}
