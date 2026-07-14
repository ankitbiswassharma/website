import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import Hero from "@/components/Hero";
import BentoShowcase from "@/components/BentoShowcase";
import InteractiveShowcase from "@/components/InteractiveShowcase";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import ProcessSteps from "@/components/ProcessSteps";
import SectionIntro from "@/components/SectionIntro";
import StatsStrip from "@/components/StatsStrip";
import TechMarquee from "@/components/TechMarquee";
import TrustStrip from "@/components/TrustStrip";
import ImpactBand from "@/components/ImpactBand";
import WhyUsCompare from "@/components/WhyUsCompare";
import IntegrationsWall from "@/components/IntegrationsWall";
import GuaranteeStrip from "@/components/GuaranteeStrip";
import HomeFaq from "@/components/HomeFaq";
import { buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";
import {
  buildShowcaseItems,
  clientCommitments,
  problemItems,
  processSteps,
  services,
  solutionItems,
} from "@/lib/site-data";

export const metadata = buildMetadata("/");

// Interactive explorer tabs — derived from real service data so the tabbed
// section stays in sync with what we offer (distinct from the bento above).
const IX_ITEMS = services.slice(0, 6).map((service) => ({
  id: service.slug,
  eyebrow: service.eyebrow,
  title: service.name,
  text: service.summary,
  metric: service.outcomes?.[0],
  bullets: service.capabilities,
}));

const STATS = [
  { num: "48h", label: "From scope sign-off to sprint kickoff" },
  { num: "54", label: "Industry solutions across 6 sectors" },
  { num: "24h", label: "We reply to new enquiries within one business day" },
  { num: "100%", label: "Code, data, and IP ownership — no lock-in" },
];

// Punchy metrics for the gradient impact band.
const IMPACT_STATS = [
  { num: "100%", label: "Code & IP ownership handed to you" },
  { num: "48h", label: "Sprint kickoff after scope sign-off" },
  { num: "6", label: "Sectors with ready-built solutions" },
  { num: "24/7", label: "Managed cloud, security & monitoring" },
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

const TECH_SECONDARY = [
  "AWS",
  "Azure",
  "Google Cloud",
  "Kubernetes",
  "Terraform",
  "Redis",
  "Webhooks",
  "OAuth",
  "CI/CD",
  "REST APIs",
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

      {/* ── Impact band (gradient metrics) ──────────────────────── */}
      <section className="page-section" style={{ paddingBlock: "2.5rem" }}>
        <div className="shell">
          <ImpactBand items={IMPACT_STATS} />
        </div>
      </section>

      {/* ── Tech strip (dual-direction marquee) ─────────────────── */}
      <section className="page-section" style={{ paddingBlock: "2rem" }}>
        <div className="shell stack-sm">
          <TechMarquee items={TECH} />
          <TechMarquee items={TECH_SECONDARY} reverse />
        </div>
      </section>

      {/* ── Showcase (bento + interactive explorer) ──────────────── */}
      <section className="page-section section-dark">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What We Deliver"
            title="Custom software & IT solutions for your business"
            text="Custom B2B builds, workflow automation, cloud and infrastructure, managed IT and security, or technical consulting — every engagement is shaped around your operations, not a one-size-fits-all template."
            centered
          />
          <BentoShowcase items={buildShowcaseItems} />
          <InteractiveShowcase items={IX_ITEMS} />
        </div>
      </section>

      {/* ── Why us (comparison table) ───────────────────────────── */}
      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Why Musk-IT"
            title="The speed of a startup, the ownership of in-house"
            text="Hiring a team is slow and expensive. Agencies template your product and license it back. We give you custom software built around your workflows — that you own outright — and run the IT behind it."
          />
          <WhyUsCompare />
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

      {/* ── Integrations wall ───────────────────────────────────── */}
      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Plugs Into Your Stack"
            eyebrowClassName="eyebrow-cyan"
            title="Connects with the tools you already run on"
            text="Payments, CRM, ERP, accounting, cloud, messaging — whatever you already use, we integrate with it over first-party connectors, REST, GraphQL, or signed webhooks."
          />
          <IntegrationsWall />
        </div>
      </section>

      {/* ── Guarantees / trust ──────────────────────────────────── */}
      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Our Commitments"
            eyebrowClassName="eyebrow-emerald"
            title="Low-risk by design"
            text="Every engagement comes with the same guarantees — so choosing us is an easy, reversible decision."
            centered
          />
          <GuaranteeStrip />
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

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Questions"
            eyebrowClassName="eyebrow-amber"
            title="Everything you might be wondering"
            text="Still unsure about something? Book a free call and we'll answer it directly."
            centered
          />
          <HomeFaq />
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
