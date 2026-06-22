import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { portfolioProjects } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/work");

export default function WorkPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Real systems,"
        highlight="real outcomes"
        text="A selection of representative projects we've delivered — custom ERP, CRM, automation, and integrations — and the difference they made to how each business runs."
        primaryHref="/consultation"
        primaryLabel="Start Your Project"
        secondaryHref="/services"
        secondaryLabel="Explore Services"
      />

      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Project Portfolio"
            title="Selected projects"
            text="Details are anonymised to respect client confidentiality, but the scope, stack, and outcomes are real."
          />
          <div className="work-grid">
            {portfolioProjects.map((project) => (
              <article className="card work-card" key={project.title}>
                <div className="work-card-head">
                  <span className="work-sector">{project.sector}</span>
                  <span className="work-metric">{project.metric}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <ul className="bullet-list compact">
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="tech-badge-row" style={{ justifyContent: "flex-start" }}>
                  {project.tech.map((tech) => (
                    <span className="tech-badge" key={tech}>
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        gradient
        eyebrow="Your project next"
        title="Let's build the next one for you."
        text="Tell us what you're trying to run better. We'll scope it, build it, and hand it over — production-ready."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/estimate"
        secondaryLabel="Estimate Cost"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Our Work", path: "/work" },
          ]),
          serviceJsonLd({
            name: "Custom Software Project Portfolio",
            description:
              "Representative custom ERP, CRM, workflow automation, and integration projects delivered by Musk-IT for B2B businesses.",
            path: "/work",
          }),
        ]}
      />
    </>
  );
}
