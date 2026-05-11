import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { caseStudies } from "@/lib/site-data";

export const metadata = {
  title: "Case Studies",
};

export default function CaseStudiesPage() {
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        title="Examples of how"
        highlight="tailored systems improve operations"
        text="Every engagement starts with a business problem and ends with a platform that improves visibility, workflow control, and day-to-day execution."
        primaryHref="/contact"
        primaryLabel="Request a Consultation"
        secondaryHref="/modules"
        secondaryLabel="Explore Modules"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Sample Projects"
            title="Representative transformation stories"
            text="These sample case studies show how tailored ERP, CRM, tracking, and automation systems can solve practical operational problems."
          />
          <FeatureGrid items={caseStudies} />
        </div>
      </section>
      <CtaBanner
        title="Need a similar outcome for your own teams?"
        text="Share your workflow challenges and we will recommend a tailored platform built around your operational reality."
        secondaryHref="/contact"
        secondaryLabel="Start a Consultation"
      />
    </>
  );
}
