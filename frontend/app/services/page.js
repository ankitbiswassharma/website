import Link from "next/link";

import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { services } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/services");

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Custom B2B software,"
        highlight="built around your workflows"
        text="Five ways Musk-IT helps businesses run better — from full ERP and CRM systems to workflow automation, custom apps, and the integrations that tie everything together."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/integrations"
        secondaryLabel="See Integrations"
      />
      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What We Build"
            title="Pick where you need the most help"
            text="Every engagement starts from your real demands and workflows. Explore each service, or book a call and we'll recommend the right starting point."
          />
          <div className="feature-grid">
            {services.map((service) => (
              <Link
                className="card feature-card service-link-card"
                key={service.slug}
                href={`/services/${service.slug}`}
              >
                <div className="eyebrow">{service.eyebrow}</div>
                <h3>{service.name}</h3>
                <p>{service.summary}</p>
                <span className="text-link">Explore {service.eyebrow} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaBanner
        gradient
        eyebrow="Not sure where to start?"
        title="Tell us your workflow, we'll map the build."
        text="Share how your business runs today and where the manual work piles up. We'll scope the right custom software and automation for you."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/case-studies"
        secondaryLabel="Read Case Studies"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
          ]),
          serviceJsonLd({
            name: "Custom B2B Software Development Services",
            description:
              "Custom ERP, CRM, workflow automation, web and mobile apps, and API integrations for B2B businesses.",
            path: "/services",
          }),
        ]}
      />
    </>
  );
}
