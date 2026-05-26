import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PricingCards from "@/components/PricingCards";
import SectionIntro from "@/components/SectionIntro";
import { faqItems, licensingModels } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/licensing");

export default function LicensingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        highlight="for every stage of the build"
        text="Choose a single sprint to move fast, a retainer for continuous delivery, or a fully scoped custom build — all with clear pricing and no hidden costs."
        primaryHref="/contact"
        primaryLabel="Start a Sprint"
        secondaryHref="/features"
        secondaryLabel="Explore Services"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Engagement Models"
            title="Three ways to work with us"
            text="Every engagement is scoped with transparency. You always know what you are paying for, when it delivers, and what you get at the end."
          />
          <PricingCards plans={licensingModels} />
        </div>
      </section>
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="FAQs"
            title="Common questions about how we work"
            text="Answers to the questions we hear most often before a sprint kicks off or a consulting engagement begins."
          />
          <div className="feature-grid">
            {faqItems.map((item) => (
              <article className="card feature-card" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner
        title="Not sure which model fits? Let's figure it out together."
        text="Tell us what you are building, your timeline, and your team situation — and we will recommend the right engagement model and give you a clear quote."
        secondaryHref="/contact"
        secondaryLabel="Talk to Our Team"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/licensing" },
          ]),
          faqJsonLd(faqItems),
        ]}
      />
    </>
  );
}
