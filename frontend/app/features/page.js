import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { featureItems } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/features");

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Three ways we deliver"
        highlight="software that ships"
        text="On-demand dev sprints, technical architecture consulting, and full custom builds — each designed to fit where you are and get you where you need to be."
        primaryHref="/contact"
        primaryLabel="Start a Sprint"
        secondaryHref="/pricing"
        secondaryLabel="See Pricing"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Our Capabilities"
            title="What makes our delivery model different"
            text="We are engineers who consult, not a generic agency. Every engagement starts with a strategy conversation and ends with production-grade software your team can own."
          />
          <FeatureGrid items={featureItems} />
        </div>
      </section>
      <CtaBanner
        title="Want to understand which engagement model fits your situation?"
        text="Share what you are trying to build and we will recommend the right approach — sprint, consulting, or full custom build."
        secondaryHref="/case-studies"
        secondaryLabel="Read case studies"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/features" },
          ]),
          serviceJsonLd({
            name: "On-Demand Software Delivery Services",
            description:
              "Sprint-based delivery, technical consulting, and full custom software builds for product teams and founders.",
            path: "/features",
          }),
        ]}
      />
    </>
  );
}
