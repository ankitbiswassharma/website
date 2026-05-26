import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import ProcessSteps from "@/components/ProcessSteps";
import SectionIntro from "@/components/SectionIntro";
import { moduleItems, processSteps } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/modules");

export default function ModulesPage() {
  return (
    <>
      <PageHero
        eyebrow="How It Works"
        title="From brief to shipped"
        highlight="in four clear steps"
        text="We keep the process simple and transparent — consulting discovery, sprint scoping, active delivery, and a clean handover with full documentation."
        primaryHref="/contact"
        primaryLabel="Start Your Sprint"
        secondaryHref="/case-studies"
        secondaryLabel="See Case Studies"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Our Process"
            title="A disciplined path from brief to production"
            text="Every engagement follows the same four-step structure — ensuring the right things get built, in the right order, with full transparency throughout."
          />
          <ProcessSteps items={processSteps} />
        </div>
      </section>
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="What We Deliver"
            title="The software types we build on every sprint"
            text="Whether standalone or combined into a larger platform, our delivery modules cover the most common product and operational software needs."
          />
          <FeatureGrid items={moduleItems} />
        </div>
      </section>
      <CtaBanner
        title="Need multiple delivery types in one engagement?"
        text="We can combine consulting, sprint delivery, and SaaS module configuration inside a single scoped engagement with clear milestones."
        secondaryHref="/pricing"
        secondaryLabel="View Pricing"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "How It Works", path: "/modules" },
          ]),
          serviceJsonLd({
            name: "On-Demand Software Delivery Process",
            description:
              "Sprint delivery, consulting, web apps, SaaS modules, mobile apps, and API development for product teams.",
            path: "/modules",
          }),
        ]}
      />
    </>
  );
}
