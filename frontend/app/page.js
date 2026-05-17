import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import Hero from "@/components/Hero";
import InteractiveBuildShowcase from "@/components/InteractiveBuildShowcase";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import ProcessSteps from "@/components/ProcessSteps";
import SectionIntro from "@/components/SectionIntro";
import { buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";
import Testimonials from "@/components/Testimonials";
import {
  buildShowcaseItems,
  problemItems,
  processSteps,
  solutionItems,
  testimonials,
} from "@/lib/site-data";

export const metadata = buildMetadata("/");

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Operational Challenge"
            title="Manual coordination creates delay, weak visibility, and avoidable execution risk"
            text="When teams rely on spreadsheets, calls, and disconnected updates, execution becomes harder to govern and reporting becomes difficult to trust."
          />
          <FeatureGrid items={problemItems} />
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Platform Approach"
            title="Software shaped around your workflow instead of forcing your workflow into generic software"
            text="We build tailored systems that reflect how your business actually operates, making adoption smoother and operational control more measurable."
          />
          <FeatureGrid items={solutionItems} />
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="What We Build"
            title="Execution-grade modules, governed workflows, and decision-ready product surfaces"
            text="Explore the system layers below to see how Musk-IT approaches platform design: structured, operational, and built for high-value business workflows."
          />
          <InteractiveBuildShowcase items={buildShowcaseItems} />
        </div>
      </section>

      <section className="page-section" id="how-it-works">
        <div className="shell">
          <SectionIntro
            eyebrow="How It Works"
            title="A disciplined path from requirement discovery to working platform delivery"
            text="Our process is structured to understand the business clearly, define the right system shape, and deliver software that solves an operational problem properly."
          />
          <ProcessSteps items={processSteps} />
        </div>
      </section>

      <section className="page-section">
        <div className="shell two-column">
          <div>
            <SectionIntro
              eyebrow="Client Perspective"
              title="Teams choose Musk-IT when generic tools stop supporting the way they actually operate"
              text="Our projects are designed for practical adoption, stronger visibility, and cleaner day-to-day operational control."
            />
            <Testimonials items={testimonials} />
          </div>
          <LeadForm
            title="Tell us what the platform needs to solve"
            description="Share your workflow, current bottlenecks, reporting expectations, and the level of control or automation you want the system to deliver."
            submitLabel="Request a Consultation"
          />
        </div>
      </section>

      <CtaBanner
        title="Replace fragmented operations with a platform built for controlled execution."
        text="If your operations are outgrowing spreadsheets, disconnected tools, and manual follow-up, we can design the ERP, CRM, or execution platform your business actually needs."
        secondaryHref="/case-studies"
        secondaryLabel="View case studies"
      />
      <JsonLd
        data={serviceJsonLd({
          name: "Custom ERP, CRM and Workflow Automation Software",
          description:
            "Custom business software delivery for ERP, CRM, dashboards, workflow automation, approvals, reporting, and web or mobile access.",
          path: "/",
        })}
      />
    </>
  );
}
