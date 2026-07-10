import Link from "next/link";

import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { solutions, solutionsByIndustry } from "@/lib/solutions.mjs";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo.mjs";

export function generateMetadata() {
  return buildMetadata("/solutions", {
    title: "Industry Software Solutions",
    description:
      "Custom software solutions mapped to your industry — ERP, CRM, automation, apps, cloud, security, and IT for manufacturing, retail, logistics, healthcare, professional services, and education.",
  });
}

export default function SolutionsHubPage() {
  const groups = solutionsByIndustry();

  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Software solutions"
        highlight="for your industry"
        text={`Pick your industry and the outcome you need. We build custom software shaped around how your sector actually works — ${solutions.length} focused solutions across manufacturing, retail, logistics, healthcare, professional services, and education.`}
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/services"
        secondaryLabel="Browse by Service"
      />

      {groups.map((group) => (
        <section className="page-section" key={group.industry.key} id={group.industry.key}>
          <div className="shell stack-lg">
            <SectionIntro
              eyebrow={group.industry.name}
              title={`${group.industry.name} solutions`}
              text={group.industry.summary}
            />
            <div className="feature-grid">
              {group.items.map((item) => (
                <Link
                  className="card feature-card service-link-card"
                  key={item.slug}
                  href={item.path}
                >
                  <div className="eyebrow">{item.service.eyebrow}</div>
                  <h3>{item.h1}</h3>
                  <p>{item.service.summary}</p>
                  <span className="text-link">Explore this solution →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <CtaBanner
        gradient
        eyebrow="Not sure which fits?"
        title="Tell us your workflow — we'll map the solution."
        text="Book a short consultation. We'll understand how your business runs and recommend the right build, timeline, and team."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/estimate"
        secondaryLabel="Estimate Cost"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Solutions", path: "/solutions" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Industry Software Solutions",
            url: absoluteUrl("/solutions"),
            hasPart: solutions.slice(0, 25).map((item) => ({
              "@type": "WebPage",
              name: item.h1,
              url: absoluteUrl(item.path),
            })),
          },
        ]}
      />
    </>
  );
}
