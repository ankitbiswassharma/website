import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { caseStudies } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/case-studies");

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="Real sprints."
        highlight="Real results."
        text="Examples of how our consulting-led delivery model has helped founders and product teams ship faster, build better, and avoid expensive architectural mistakes."
        primaryHref="/contact"
        primaryLabel="Start a Sprint"
        secondaryHref="/pricing"
        secondaryLabel="See Pricing"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Our Work"
            title="Three engagements that show what we deliver"
            text="Each engagement started with a brief, moved through a consulting session, and ended with production-grade software handed over to the client's team."
          />
          <FeatureGrid items={caseStudies} />
        </div>
      </section>
      <CtaBanner
        title="Ready to start your own sprint?"
        text="Tell us what you need to build. We will scope the engagement and kick off within 48 hours of agreement."
        secondaryHref="/contact"
        secondaryLabel="Get in Touch"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Case Studies", path: "/case-studies" },
        ])}
      />
    </>
  );
}
