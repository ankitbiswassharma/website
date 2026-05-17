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
        title="Let’s discuss the platform"
        highlight="your operations actually need"
        text="Tell us how the workflow runs today, where execution breaks down, and what kind of visibility, control, or automation the platform should deliver."
        primaryHref="#contact-form"
        primaryLabel="Send Your Requirement"
        secondaryHref="/modules"
        secondaryLabel="Explore Modules"
      />
      <section className="page-section">
        <div className="shell" id="contact-form">
          <SectionIntro
            eyebrow="Start the Conversation"
            title="Book a consultation or send the requirement directly"
            text="Once we receive your enquiry, we review the workflow, identify improvement opportunities, and recommend the right system direction."
          />
          <div className="two-column">
            <LeadForm
              title="Request a Consultation"
              description="Share your process, pain points, and platform goals. We will contact you to understand the workflow in detail."
              submitLabel="Send Requirement"
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
                <span className="muted">What happens next</span>
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
        title="Need a walkthrough before you define the full requirement?"
        text="Contact us for a consultation and we will help define the right starting scope for your ERP, CRM, dashboard, or automation initiative."
        secondaryHref="/features"
        secondaryLabel="Review Capabilities"
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
