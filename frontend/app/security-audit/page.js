import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/security-audit");

const AUDIT_AREAS = [
  {
    eyebrow: "Infrastructure",
    title: "Cloud & infrastructure review",
    text: "How your servers, cloud accounts, and deployments are set up — and where reliability or cost is at risk.",
    bullets: ["Hosting & cloud configuration", "Backups & disaster recovery", "Cost & scaling headroom"],
  },
  {
    eyebrow: "Security",
    title: "Security & access posture",
    text: "Where you're exposed — from access control to patching — and what an attacker would look for first.",
    bullets: ["Access control & accounts", "Patching & known vulnerabilities", "Data protection & encryption"],
  },
  {
    eyebrow: "Systems",
    title: "Software & process check",
    text: "Whether your tools and workflows are holding the business back, and where automation would pay off.",
    bullets: ["Tooling & integration gaps", "Manual, automatable workflows", "Tech-debt & modernisation risks"],
  },
];

const DELIVERABLES = [
  {
    eyebrow: "1",
    title: "A prioritised findings report",
    text: "A clear, jargon-free summary of what's working, what's at risk, and what to fix first — ranked by impact.",
  },
  {
    eyebrow: "2",
    title: "A practical action plan",
    text: "Concrete next steps with rough effort and cost, so you can act on it with us or your own team — no lock-in.",
  },
  {
    eyebrow: "3",
    title: "A 30-minute walkthrough",
    text: "We talk you through the findings live and answer questions. Useful whether or not you work with us afterwards.",
  },
];

export default function SecurityAuditPage() {
  return (
    <>
      <PageHero
        eyebrow="Free Assessment"
        title="Free IT & Security Audit"
        highlight="for your business"
        text="A no-cost, no-obligation review of your cloud, security, and systems. We find what's at risk and what to fix first — and hand you a clear action plan, whether or not you work with us."
        primaryHref="#request"
        primaryLabel="Claim your free audit"
        secondaryHref="/services/cybersecurity"
        secondaryLabel="See our security services"
      />

      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What We Review"
            title="A practical look across your IT, end to end"
            text="In about a week, we assess the three areas that most often cost businesses money, uptime, or trust."
          />
          <FeatureGrid items={AUDIT_AREAS} variant="solution" />
        </div>
      </section>

      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What You Get"
            title="A report you can actually act on"
            text="No sales deck dressed up as an audit — you get findings, priorities, and a plan you own."
          />
          <FeatureGrid items={DELIVERABLES} />
        </div>
      </section>

      <section className="page-section section-tinted" id="request">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Request Your Audit"
            title="Book your free IT & security audit"
            text="Tell us where to reach you. We'll confirm scope and a start date within one business day."
            centered
          />
          <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
            <LeadMagnetForm
              source="security_audit"
              projectType="Free IT & Security Audit"
              note="Requested a free IT & security audit via the audit landing page."
              eyebrow="Free IT & Security Audit"
              title="Claim your free audit"
              description="No cost, no obligation. We'll review your cloud, security, and systems and send a prioritised action plan."
              submitLabel="Request my free audit"
              loadingLabel="Sending request…"
              successTitle="Your audit request is in."
              successMessage="We'll confirm scope and a start date by email within one business day."
            />
          </div>
        </div>
      </section>

      <CtaBanner
        gradient
        eyebrow="Prefer to talk first?"
        title="Have questions before you book?"
        text="Book a quick consultation instead and we'll help you decide whether an audit is the right next step."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/services"
        secondaryLabel="Explore Services"
      />

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Free IT & Security Audit", path: "/security-audit" },
          ]),
          serviceJsonLd({
            name: "Free IT & Security Audit",
            description:
              "A free, no-obligation review of your cloud, security, and systems with a prioritised findings report and action plan.",
            path: "/security-audit",
          }),
        ]}
      />
    </>
  );
}
