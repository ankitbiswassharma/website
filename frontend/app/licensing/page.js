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
        eyebrow="Licensing"
        title="Flexible commercial models for"
        highlight="tailored software delivery"
        text="Our commercials are shaped by your workflow complexity, delivery scope, support model, and long-term platform expectations."
        primaryHref="/contact"
        primaryLabel="Request a Consultation"
        secondaryHref="/modules"
        secondaryLabel="Explore Modules"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Pricing Model"
            title="How we structure engagement and commercial scope"
            text="We support one-time delivery, build plus maintenance, and subscription-style engagement depending on the platform model and support commitment you need."
          />
          <PricingCards plans={licensingModels} />
        </div>
      </section>
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="FAQs"
            title="Common commercial and scope questions"
            text="The final proposal depends on workflow complexity, modules, user roles, integrations, reporting requirements, and rollout depth."
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
        title="Need pricing built around your exact operational requirement?"
        text="Send us your workflow details and we will recommend the right scope, delivery model, and commercial structure for the platform."
        secondaryHref="/contact"
        secondaryLabel="Talk to Our Team"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Licensing", path: "/licensing" },
          ]),
          faqJsonLd(faqItems),
        ]}
      />
    </>
  );
}
