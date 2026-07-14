import { faqItems } from "@/lib/site-data";

/**
 * Lightweight FAQ accordion built on native <details> — no JS, fully
 * accessible and keyboard-friendly. Styling lives in globals.css.
 */
export default function HomeFaq({ items = faqItems }) {
  return (
    <div className="home-faq">
      {items.map((item, i) => (
        <details className="faq-item" key={item.q} open={i === 0}>
          <summary>{item.q}</summary>
          <div className="faq-a">{item.a}</div>
        </details>
      ))}
    </div>
  );
}
