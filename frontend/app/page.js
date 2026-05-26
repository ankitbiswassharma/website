import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import Hero from "@/components/Hero";
import BentoShowcase from "@/components/BentoShowcase";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import ProcessSteps from "@/components/ProcessSteps";
import SectionIntro from "@/components/SectionIntro";
import Testimonials from "@/components/Testimonials";
import { buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";
import {
  buildShowcaseItems,
  problemItems,
  processSteps,
  solutionItems,
  testimonials,
} from "@/lib/site-data";

export const metadata = buildMetadata("/");

const STATS = [
  { num: "48h", label: "Average sprint kickoff time" },
  { num: "100%", label: "Senior engineers on every project" },
  { num: "3×", label: "Faster than in-house hiring" },
  { num: "5★", label: "Average client satisfaction" },
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
        <div className="shell">
          <div className="stats-strip-inner">
            {STATS.map((s) => (
              <div className="stats-strip-item" key={s.num}>
                <div className="stats-strip-num">{s.num}</div>
                <div className="stats-strip-label">{s.label}</div>
              </div>
            ))}
          </div>
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
            title="A better way to build software"
            text="Musk-IT replaces the broken agency model with a consulting-led, sprint-based delivery service. You get senior engineers who understand your product, fast kickoffs, and software that lasts beyond delivery."
          />
          <FeatureGrid items={solutionItems} variant="solution" />
        </div>
      </section>

      {/* ── Tech strip ──────────────────────────────────────────── */}
      <section className="page-section" style={{ paddingBlock: "2rem" }}>
        <div className="shell">
          <div className="tech-badge-row">
            {TECH.map((t) => (
              <span className="tech-badge" key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Showcase ─────────────────────────────────────────────── */}
      <section className="page-section section-dark">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What We Deliver"
            title="Four ways to work with Musk-IT"
            text="Sprint delivery, technical consulting, full custom builds, or a pre-built SaaS foundation — we have an engagement model that fits where you are."
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
            eyebrow="Client Feedback"
            title="Trusted by product teams and founders"
            text="Here's what teams say about delivery speed, code quality, and what it's like to work with Musk-IT."
          />
          <Testimonials items={testimonials} />
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
        title="Your sprint team is 48 hours away."
        text="Stop waiting on hiring cycles or agency timelines. Brief us today and your dedicated engineering team kicks off within 48 hours."
        primaryHref="/contact"
        primaryLabel="Start a Sprint"
        secondaryHref="/case-studies"
        secondaryLabel="Read Case Studies"
      />

      <JsonLd
        data={serviceJsonLd({
          name: "On-Demand Software Delivery and Technical Consulting",
          description:
            "Sprint-based software delivery, technical architecture consulting, and full custom builds for product teams and founders.",
          path: "/",
        })}
      />
    </>
  );
}
