import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { moduleItems } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/modules");

export default function ModulesPage() {
  return (
    <>
      <PageHero
        eyebrow="Modules"
        title="Software modules tailored to"
        highlight="serious business operations"
        text="We build complete systems and focused modules depending on what your operations need most, from ERP and CRM to execution tracking, dashboards, and workflow automation."
        primaryHref="/contact"
        primaryLabel="Discuss Your Requirement"
        secondaryHref="/case-studies"
        secondaryLabel="See Use Cases"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="System Types"
            title="The system layers we build for growing operational environments"
            text="Modules can operate as standalone tools or as part of a larger connected platform depending on your workflow, reporting needs, and scale."
          />
          <FeatureGrid items={moduleItems} />
        </div>
      </section>
      <CtaBanner
        title="Need multiple modules connected inside one platform?"
        text="We can design a unified software environment where operations, tracking, communication, and reporting work together under one governed workflow."
        secondaryHref="/licensing"
        secondaryLabel="View Licensing"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Modules", path: "/modules" },
          ]),
          serviceJsonLd({
            name: "ERP, CRM, Dashboard and Automation Modules",
            description:
              "Custom modules for ERP, attendance, inventory, CRM, reporting, analytics, and email automation workflows.",
            path: "/modules",
          }),
        ]}
      />
    </>
  );
}
