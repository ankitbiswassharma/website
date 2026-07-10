import Link from "next/link";
import { notFound } from "next/navigation";

import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { getSolution, getRelatedSolutions, solutions } from "@/lib/solutions.mjs";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  serviceJsonLd,
} from "@/lib/seo.mjs";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) {
    return buildMetadata("/solutions");
  }
  return buildMetadata(solution.path, {
    title: solution.metaTitle,
    description: solution.metaDescription,
  });
}

export default async function SolutionDetailPage({ params }) {
  const { slug } = await params;
  const solution = getSolution(slug);

  if (!solution) {
    notFound();
  }

  const related = getRelatedSolutions(solution, 6);

  return (
    <>
      <PageHero
        eyebrow={solution.eyebrow}
        title={`${solution.service.name} for`}
        highlight={solution.industry.name}
        text={solution.intro}
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/estimate"
        secondaryLabel="Estimate Cost"
      />

      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro eyebrow="Why it matters" title={solution.whyTitle} text={solution.whyText} />
        </div>
      </section>

      <section className="page-section">
        <div className="shell stack-lg">
          <div className="service-detail-grid">
            <div className="card service-panel">
              <div className="eyebrow">What we build</div>
              <ul className="bullet-list">
                {solution.capabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card service-panel">
              <div className="eyebrow">Outcomes you can expect</div>
              <ul className="bullet-list">
                {solution.outcomes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card service-panel">
            <div className="eyebrow">{solution.industry.name} workflows we cover</div>
            <ul className="bullet-list">
              {solution.workflows.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {solution.tech?.length ? (
            <div className="stack-sm">
              <div className="eyebrow">Typical stack</div>
              <div className="tech-badge-row" style={{ justifyContent: "flex-start" }}>
                {solution.tech.map((tech) => (
                  <span className="tech-badge" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro eyebrow="FAQ" title="Common questions" />
          <div className="stack-md">
            {solution.faq.map((item) => (
              <div className="card service-panel" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="page-section">
          <div className="shell stack-lg">
            <SectionIntro eyebrow="Related solutions" title="You might also need" />
            <div className="feature-grid">
              {related.map((item) => (
                <Link
                  className="card feature-card service-link-card"
                  key={item.slug}
                  href={item.path}
                >
                  <div className="eyebrow">{item.eyebrow}</div>
                  <h3>{item.h1}</h3>
                  <p>{item.service.summary}</p>
                  <span className="text-link">Explore →</span>
                </Link>
              ))}
            </div>
            <div>
              <Link className="text-link" href="/solutions">
                ← Browse all solutions
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <CtaBanner
        gradient
        eyebrow="Get Started"
        title={`Let's scope your ${solution.industry.name.toLowerCase()} ${solution.service.eyebrow.toLowerCase()} project.`}
        text="Book a short consultation. We'll understand your workflows and recommend the right approach, timeline, and team."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/solutions" },
            { name: solution.h1, path: solution.path },
          ]),
          serviceJsonLd({
            name: solution.h1,
            description: solution.metaDescription,
            path: solution.path,
          }),
          faqJsonLd(solution.faq),
        ]}
      />
    </>
  );
}
