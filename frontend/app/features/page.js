import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { featureItems } from "@/lib/site-data";

export const metadata = {
  title: "Features",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Capabilities"
        title="Core capabilities for"
        highlight="controlled, modern operations"
        text="Our systems are designed to replace manual coordination with governed workflows, live visibility, secure access, and software that can expand with the business."
        primaryHref="/contact"
        primaryLabel="Discuss Your Requirement"
        secondaryHref="/modules"
        secondaryLabel="Explore Modules"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Built for Adoption"
            title="The capabilities that make tailored software operationally valuable"
            text="We focus on the capabilities teams need to run daily operations with more control, not on unnecessary complexity or decorative features."
          />
          <FeatureGrid items={featureItems} />
        </div>
      </section>
      <CtaBanner
        title="Need these capabilities mapped to your exact workflow?"
        text="Share your current process and we will recommend the right architecture, modules, and implementation approach for the way your teams operate."
      />
    </>
  );
}
