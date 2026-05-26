import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { contactDetails, processSteps } from "@/lib/site-data";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/contact");

const contactPageEmail = "admin@muskit.in";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Brief us on what you"
        highlight="need to build"
        text="Tell us about your product idea, current codebase, or engineering challenge. We review it, ask the right questions, and get back to you within one business day."
        primaryHref="#contact-form"
        primaryLabel="Send Your Brief"
        secondaryHref="/features"
        secondaryLabel="Explore Services"
      />
      <section className="page-section">
        <div className="shell" id="contact-form">
          <SectionIntro
            eyebrow="Get in Touch"
            title="Start a sprint, book a consulting session, or ask a question"
            text="Whether you know exactly what you need or are still figuring it out, we are happy to help you get clarity before committing to anything."
          />
          <div className="two-column">
            <LeadForm
              title="Send Your Brief"
              description="Describe what you need built, your timeline, your stack preferences, and the outcome you want. We'll respond within one business day."
              submitLabel="Send Brief"
            />
            <article className="card feature-card stack-md">
              <div className="eyebrow">Contact Details</div>
              <h3>Reach us directly</h3>
              <p>{contactDetails.consultationNote}</p>
              <div className="contact-detail-list">
                <div>
                  <span className="muted">Email</span>
                  <strong>{contactPageEmail}</strong>
                </div>
                <div>
                  <span className="muted">Phone</span>
                  <strong>{contactDetails.phone}</strong>
                </div>
              </div>
              <div className="stack-sm">
                <span className="muted">What happens after you send your brief</span>
                <ul className="bullet-list compact">
                  {processSteps.map((step) => (
                    <li key={step.title}>{step.title}</li>
                  ))}
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>
      <CtaBanner
        title="Not ready to brief yet? Start with a quick call."
        text="We are happy to have a 30-minute conversation to understand your situation and tell you honestly whether we are the right fit before anything is scoped."
        secondaryHref="/features"
        secondaryLabel="Review Services"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Musk-IT",
            url: absoluteUrl("/contact"),
            email: contactPageEmail,
            telephone: contactDetails.phone,
            address: {
              "@type": "PostalAddress",
              addressCountry: "IN",
            },
          },
        ]}
      />
    </>
  );
}
