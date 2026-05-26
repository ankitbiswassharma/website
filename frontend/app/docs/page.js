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
        title="How sprints work,"
        highlight="start to finish"
        text="Everything you need to know about starting an engagement, how we run sprints, what delivery looks like, and how support and retainers work after launch."
        primaryHref="/contact"
        primaryLabel="Start a Sprint"
        secondaryHref="/features"
        secondaryLabel="Explore Services"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Documentation"
            title="Clear answers about how we work"
            text="Our process is straightforward — but we document it so there are no surprises at any stage of the engagement."
          />
          <FeatureGrid items={docsItems} />
        </div>
      </section>
      <section className="page-section">
        <div className="shell">
          <article className="card feature-card support-card">
            <div className="eyebrow">Support</div>
            <h3>Need help after delivery?</h3>
            <p>
              We support clients with bug fixes, change requests, retainer sprints,
              and structured handover assistance as the product evolves after launch.
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
        title="Have a question before you start?"
        text="We are happy to walk you through the engagement process, answer scope questions, or give you a quick consulting call before anything is committed."
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
