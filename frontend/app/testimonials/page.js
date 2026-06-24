import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { clientCommitments } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/testimonials");

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="What To Expect"
        title="What it's like to"
        highlight="work with us"
        text="We're a focused, early-stage partner. Rather than publish testimonials we can't yet attribute to named clients, here's exactly what we commit to on every engagement — and we'll add real client stories here as projects complete."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/work"
        secondaryLabel="See Our Work"
      />

      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Our Commitments"
            title="The standards we hold on every project"
            text="Delivery speed, honest scoping, and code you can own — these are the things we hold ourselves to, whatever the engagement."
          />
          <FeatureGrid items={clientCommitments} variant="solution" />
        </div>
      </section>

      <CtaBanner
        gradient
        eyebrow="Get Started"
        title="Let's build something you'll recommend."
        text="Book a consultation and tell us what you need. We'll scope it honestly and deliver software your team will actually use."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/estimate"
        secondaryLabel="Estimate a Project"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Testimonials", path: "/testimonials" },
          ]),
          serviceJsonLd({
            name: "Custom Software Development",
            description:
              "What to expect when working with Musk-IT on custom software development and workflow automation — our delivery commitments.",
            path: "/testimonials",
          }),
        ]}
      />
    </>
  );
}
