import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { integrationCategories } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/integrations");

const CONNECTIVITY = [
  {
    title: "Outbound webhooks",
    text: "Every meaningful event — a new lead, a consultation request, a payment — can be pushed to your systems as a signed, verifiable webhook.",
  },
  {
    title: "Inbound webhooks",
    text: "Other platforms can notify yours securely. We verify an HMAC signature on every inbound call before acting on it.",
  },
  {
    title: "REST & GraphQL APIs",
    text: "Clean, documented APIs so your software can read and write data programmatically — ready for whatever you connect next.",
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Integrations & Connectors"
        title="Your tools,"
        highlight="finally talking to each other"
        text="We connect the software your business already runs on — and build the APIs and signed webhooks that keep it connected as you grow. This is the 'future connectivity' layer under every Musk-IT build."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/services/api-integrations"
        secondaryLabel="API & Integrations"
      />

      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What We Connect"
            title="Connectors across your stack"
            text="A representative set of the systems we integrate with. Don't see yours? If it has an API or webhooks, we can connect it."
          />
          <div className="feature-grid">
            {integrationCategories.map((category) => (
              <article className="card feature-card" key={category.key}>
                <h3>{category.label}</h3>
                <p>{category.text}</p>
                <div className="tech-badge-row" style={{ justifyContent: "flex-start" }}>
                  {category.connectors.map((connector) => (
                    <span className="tech-badge" key={connector}>
                      {connector}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Future Connectivity"
            title="Built to connect to whatever comes next"
            text="Every platform we build ships with a connectivity layer, so adding a new tool later is configuration — not a rebuild."
          />
          <div className="feature-grid">
            {CONNECTIVITY.map((item) => (
              <article className="card feature-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        gradient
        eyebrow="Connect your stack"
        title="Tell us what needs to talk to what."
        text="Share the tools your business depends on. We'll map the integrations and the events that should flow between them."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/services"
        secondaryLabel="Explore Services"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Integrations", path: "/integrations" },
          ]),
          serviceJsonLd({
            name: "Software Integrations and Connectors",
            description:
              "Integration services connecting payments, email, CRM, ERP, cloud, and data tools with signed inbound and outbound webhooks and APIs.",
            path: "/integrations",
          }),
        ]}
      />
    </>
  );
}
