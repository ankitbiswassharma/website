import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { aboutCards } from "@/lib/site-data";

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="We build business software"
        highlight="around real operational demands"
        text="Our work starts with understanding how a business actually runs, where execution slows down, and what type of system can create measurable improvement."
        primaryHref="/contact"
        primaryLabel="Start a Conversation"
        secondaryHref="/docs"
        secondaryLabel="View Documentation"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Who We Are"
            title="A software partner focused on workflow clarity, operational control, and scalable growth"
            text="We help businesses move from manual coordination to structured systems that improve visibility, accountability, and execution quality."
          />
          <FeatureGrid items={aboutCards} />
        </div>
      </section>
      <CtaBanner
        title="Need a software partner that starts with your workflow instead of a template?"
        text="We can help you define the right platform, the right modules, and the right rollout approach for your business."
        secondaryHref="/docs"
        secondaryLabel="View Documentation"
      />
    </>
  );
}
