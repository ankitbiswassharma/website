import ConsultationForm from "@/components/ConsultationForm";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/consultation");

const STEPS = [
  {
    title: "1. Book a time",
    text: "Pick a date and slot that suits you and share a little about your business.",
  },
  {
    title: "2. We prepare",
    text: "We review your workflow notes before the call so we can come with ideas, not just questions.",
  },
  {
    title: "3. Get a clear path",
    text: "Leave the call with a recommended approach, rough timeline, and sensible next step — no pressure.",
  },
];

export default function ConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Book a Consultation"
        title="A free call to map"
        highlight="your custom software"
        text="Talk to a Musk-IT engineer about your workflows, the manual work you want gone, and the software you want built. No cost, no obligation."
      />

      <section className="page-section">
        <div className="shell">
          <div className="consultation-layout">
            <div className="stack-lg">
              <div className="stack-sm">
                <div className="eyebrow">How it works</div>
                <h2>Three simple steps</h2>
              </div>
              <div className="stack-md">
                {STEPS.map((step) => (
                  <div className="card feature-card" key={step.title}>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <ConsultationForm />
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Book a Consultation", path: "/consultation" },
          ]),
          serviceJsonLd({
            name: "Software Consultation",
            description:
              "Free consultation to scope custom B2B software and workflow automation around your business demands and workflows.",
            path: "/consultation",
          }),
        ]}
      />
    </>
  );
}
