import Link from "next/link";
import { notFound } from "next/navigation";

import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { getService, services } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!getService(slug)) {
    return buildMetadata("/services");
  }
  return buildMetadata(`/services/${slug}`);
}

export default async function ServiceDetailPage({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  const related = (service.related || [])
    .map((relatedSlug) => getService(relatedSlug))
    .filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={service.eyebrow}
        title={service.name}
        highlight={service.highlight}
        text={service.summary}
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/services"
        secondaryLabel="All Services"
      />

      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro eyebrow="The Problem" title="What this solves" text={service.problem} />
        </div>
      </section>

      <section className="page-section">
        <div className="shell stack-lg">
          <div className="service-detail-grid">
            <div className="card service-panel">
              <div className="eyebrow">What we build</div>
              <ul className="bullet-list">
                {service.capabilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="card service-panel">
              <div className="eyebrow">Outcomes you can expect</div>
              <ul className="bullet-list">
                {service.outcomes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {service.tech?.length ? (
            <div className="stack-sm">
              <div className="eyebrow">Typical stack</div>
              <div className="tech-badge-row" style={{ justifyContent: "flex-start" }}>
                {service.tech.map((tech) => (
                  <span className="tech-badge" key={tech}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {related.length ? (
        <section className="page-section section-tinted">
          <div className="shell stack-lg">
            <SectionIntro eyebrow="Related" title="Often built together" />
            <div className="feature-grid">
              {related.map((item) => (
                <Link
                  className="card feature-card service-link-card"
                  key={item.slug}
                  href={`/services/${item.slug}`}
                >
                  <div className="eyebrow">{item.eyebrow}</div>
                  <h3>{item.name}</h3>
                  <p>{item.summary}</p>
                  <span className="text-link">Explore {item.eyebrow} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBanner
        gradient
        eyebrow="Get Started"
        title={`Let's scope your ${service.eyebrow.toLowerCase()} project.`}
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
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.slug}` },
          ]),
          serviceJsonLd({
            name: service.name,
            description: service.summary,
            path: `/services/${service.slug}`,
          }),
        ]}
      />
    </>
  );
}
