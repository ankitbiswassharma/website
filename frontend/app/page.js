import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import Hero from "@/components/Hero";
import BentoShowcase from "@/components/BentoShowcase";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import ProcessSteps from "@/components/ProcessSteps";
import SectionIntro from "@/components/SectionIntro";
import StatsStrip from "@/components/StatsStrip";
import TechMarquee from "@/components/TechMarquee";
import TrustStrip from "@/components/TrustStrip";
import { buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";
import {
  buildShowcaseItems,
  clientCommitments,
  problemItems,
  processSteps,
  solutionItems,
} from "@/lib/site-data";

export const metadata = buildMetadata("/");

const STATS = [
  { num: "100%", label: "Custom-built around each client's workflows" },
  { num: "Software + IT", label: "One partner for builds and the IT behind them" },
  { num: "End-to-End", label: "From scoping and architecture to deployment and support" },
  { num: "No Lock-In", label: "You own the code, the data, and the IP" },
];

const TECH = [
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "PostgreSQL",
  "React Native",
  "FastAPI",
  "Docker",
  "Tailwind CSS",
  "GraphQL",
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <Hero />

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section className="page-section" style={{ paddingBlock: "2.5rem" }}>
        <div className="shell stack-lg">
          <StatsStrip items={STATS} />
          <TrustStrip />
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────── */}
      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="The Problem"
            title="Why software projects fail before they start"
            text="The barriers to great software aren't technical — they're structural. Hiring overhead, agency misalignment, and poor architecture decisions cost teams months and budget before a useful feature ships."
          />
          <FeatureGrid items={problemItems} variant="problem" />
        </div>
      </section>

      {/* ── Solution ─────────────────────────────────────────────── */}
      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Our Approach"
            title="Custom software and IT solutions, built around how you work"
            text="Musk-IT is a B2B custom software and IT solutions provider. We start from your business demands and real workflows, then design and build custom software around them — and run the IT it depends on, from cloud infrastructure and managed support to security and strategy."
          />
          <FeatureGrid items={solutionItems} variant="solution" />
        </div>
      </section>

      {/* ── Tech strip ──────────────────────────────────────────── */}
      <section className="page-section" style={{ paddingBlock: "2rem" }}>
        <div className="shell">
          <TechMarquee items={TECH} />
        </div>
      </section>

      {/* ── Showcase ─────────────────────────────────────────────── */}
      <section className="page-section section-dark">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What We Deliver"
            title="Custom software & IT solutions for your business"
            text="Custom B2B builds, workflow automation, cloud and infrastructure, managed IT and security, or technical consulting — every engagement is shaped around your operations, not a one-size-fits-all template."
            centered
          />
          <BentoShowcase items={buildShowcaseItems} />
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────── */}
      <section className="page-section" id="how-it-works">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="How It Works"
            title="From brief to shipped in four steps"
            text="Our process is designed for speed without shortcuts. Every engagement follows the same clear path so you always know what's happening and what's next."
          />
          <ProcessSteps items={processSteps} />
        </div>
      </section>

      {/* ── Testimonials + Contact ────────────────────────────────── */}
      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What To Expect"
            title="What working with us looks like"
            text="We're a focused, early-stage partner — so instead of borrowed quotes, here's exactly what we commit to on every engagement."
          />
          <FeatureGrid items={clientCommitments} variant="solution" />
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "3rem" }}>
            <LeadForm
              title="Tell us what you need to build"
              description="Share your product idea, current stack, timeline, and the problem you're trying to solve. We'll respond within one business day."
              submitLabel="Request a Consultation"
            />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <CtaBanner
        gradient
        eyebrow="Get Started"
        title="Let's build and run your software."
        text="Tell us how your business runs today and where the manual work piles up. We'll scope custom software and the IT solutions to support it, and kick off within 48 hours."
        primaryHref="/contact"
        primaryLabel="Book a Consultation"
        secondaryHref="/case-studies"
        secondaryLabel="Read Case Studies"
      />

      <JsonLd
        data={serviceJsonLd({
          name: "B2B Custom Software Development & IT Solutions",
          description:
            "B2B custom software and IT solutions — tailored ERP, CRM, dashboards, web and mobile apps, and integrations, plus cloud infrastructure, managed IT support, cybersecurity, and IT consulting built around each business's demands and workflows.",
          path: "/",
        })}
      />
    </>
  );
}
