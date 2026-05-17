import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { contactDetails, docsItems } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/docs");

export default function DocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Docs"
        title="Documentation designed for"
        highlight="onboarding, adoption, and operational clarity"
        text="We support every deployment with clear onboarding, practical usage guidance, FAQs, and dependable post-launch support."
        primaryHref="/contact"
        primaryLabel="Talk to Our Team"
        secondaryHref="/modules"
        secondaryLabel="Explore Modules"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Documentation Structure"
            title="What your teams can expect after go-live"
            text="Our documentation is designed to help teams adopt the platform quickly and use it confidently in day-to-day operations."
          />
          <FeatureGrid items={docsItems} />
        </div>
      </section>
      <section className="page-section">
        <div className="shell">
          <article className="card feature-card support-card">
            <div className="eyebrow">Support</div>
            <h3>Need help after deployment?</h3>
            <p>
              We support clients with issue resolution, change requests, system
              improvements, and guided platform expansion as processes evolve.
            </p>
            <div className="contact-detail-list">
              <div>
                <span className="muted">Email</span>
                <strong>{contactDetails.email}</strong>
              </div>
              <div>
                <span className="muted">Phone</span>
                <strong>{contactDetails.phone}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
      <CtaBanner
        title="Looking for a platform your teams can adopt with confidence?"
        text="We combine software delivery with practical onboarding, documentation, and support so adoption is structured rather than left to chance."
        secondaryHref="/blog"
        secondaryLabel="Read Insights"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
        ])}
      />
    </>
  );
}
