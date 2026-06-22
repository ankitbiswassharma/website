import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { industries } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/industries");

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Software shaped to"
        highlight="your industry's workflows"
        text="We've built custom software and automation across sectors. Whatever you run, we start from how your industry actually works — not a generic template."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/work"
        secondaryLabel="See Our Work"
      />

      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Use Cases"
            title="Where we make the biggest difference"
            text="A snapshot of the workflows we typically automate in each sector. Don't see yours? The approach is the same — we map your process and build around it."
          />
          <div className="feature-grid">
            {industries.map((industry) => (
              <article className="card feature-card industry-card" key={industry.key}>
                <h3>{industry.name}</h3>
                <p>{industry.summary}</p>
                <ul className="bullet-list compact">
                  {industry.workflows.map((workflow) => (
                    <li key={workflow}>{workflow}</li>
                  ))}
                </ul>
                <p className="industry-outcome">{industry.outcome}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        gradient
        eyebrow="Your sector"
        title="Let's map your industry's workflows."
        text="Tell us how your business runs day to day. We'll show you exactly what we'd automate and what it would take to build."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/estimate"
        secondaryLabel="Estimate a Project"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Industries", path: "/industries" },
          ]),
          serviceJsonLd({
            name: "Industry-Specific Custom Software",
            description:
              "Custom software and workflow automation for manufacturing, retail, logistics, healthcare, professional services, and education.",
            path: "/industries",
          }),
        ]}
      />
    </>
  );
}
