import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import { faqGroups } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/faq");

const allFaqs = faqGroups.flatMap((group) => group.items);

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Questions,"
        highlight="answered"
        text="Everything you might want to know about working with Musk-IT — what we build, how pricing works, how delivery runs, and how we handle support and security."
        primaryHref="/consultation"
        primaryLabel="Still have questions? Talk to us"
      />

      <section className="page-section">
        <div className="shell stack-lg">
          {faqGroups.map((group) => (
            <div className="stack-md" key={group.category}>
              <div className="eyebrow faq-group-eyebrow">{group.category}</div>
              <div className="faq-list">
                {group.items.map((item) => (
                  <details className="faq-item" key={item.q}>
                    <summary>
                      <span>{item.q}</span>
                      <span className="faq-chevron" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M4 6l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner
        eyebrow="Didn't find it?"
        title="Ask us directly."
        text="If your question isn't here, book a quick consultation and we'll answer it and scope your project at the same time."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/services"
        secondaryLabel="Explore Services"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
          faqJsonLd(allFaqs),
        ]}
      />
    </>
  );
}
