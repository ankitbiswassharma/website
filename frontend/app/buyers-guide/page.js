import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import SectionIntro from "@/components/SectionIntro";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/buyers-guide");

const GUIDE_PDF = "/downloads/musk-it-buyers-guide.pdf";

const CONTENTS = [
  { n: "01", t: "Build vs. buy vs. customise", d: "How to choose the right path — and why most teams pick wrong by default." },
  { n: "02", t: "The real cost of custom software", d: "The five costs to budget for, plus real INR pricing benchmarks by project type." },
  { n: "03", t: "11 questions to ask any partner", d: "The exact questions that surface lock-in, hidden costs, and weak teams." },
  { n: "04", t: "Red flags that predict failure", d: "The warning signs to walk away from — before you sign anything." },
  { n: "05", t: "Owning your software", d: "Handover, documentation, and no lock-in: what to insist on." },
  { n: "06", t: "Real project, real numbers", d: "A live, currently-running case study — not a portfolio mockup." },
  { n: "07", t: "Buying IT services the same way", d: "The same buyer discipline, applied to cloud, security, and managed IT." },
  { n: "08", t: "An 8-step scoping checklist", d: "A practical checklist to scope your first project with confidence." },
];

export default function BuyersGuidePage() {
  return (
    <>
      {/* ── Split hero: cover mockup + form ─────────────────────── */}
      <section className="page-section guide-hero">
        <div className="shell guide-hero-grid">
          <div className="stack-md">
            <div className="eyebrow">Free Guide · PDF</div>
            <h1 className="guide-hero-title">
              The B2B Software &amp; IT
              <br />
              <span className="text-gradient">Buyer&apos;s Guide</span>
            </h1>
            <p className="guide-hero-sub">
              A practical, no-fluff guide to choosing, scoping, and budgeting custom software and IT
              services — with real INR pricing benchmarks and a live case study, so you avoid the
              expensive mistakes most businesses make on their first project.
            </p>

            {/* Book-cover mockup */}
            <div className="guide-cover" aria-hidden="true">
              <div className="guide-cover-bars">
                <span /><span /><span />
              </div>
              <div className="guide-cover-brand">Musk-IT</div>
              <div className="guide-cover-pill">THE FREE GUIDE · 2ND EDITION</div>
              <div className="guide-cover-title">
                B2B Software &amp; IT
                <br />
                <span>Buyer&apos;s Guide</span>
              </div>
              <div className="guide-cover-foot">muskit.in · 8 chapters · 8 pages</div>
            </div>
          </div>

          <div id="download" className="guide-form-col">
            <LeadMagnetForm
              source="buyers_guide"
              projectType="Buyer's Guide download"
              note="Downloaded the B2B Software & IT Buyer's Guide."
              eyebrow="Free Download"
              title="Get the free guide"
              description="Enter your details and the PDF opens instantly. We'll only follow up if you'd like help applying it."
              submitLabel="Get the free guide (PDF)"
              loadingLabel="Preparing your guide…"
              successTitle="Your guide is ready."
              successMessage="The PDF should have opened in a new tab. If your browser blocked it, use the button below."
              downloadHref={GUIDE_PDF}
              downloadLabel="Download the guide (PDF)"
            />
          </div>
        </div>
      </section>

      {/* ── Contents grid ───────────────────────────────────────── */}
      <section className="page-section section-tinted">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="What's Inside"
            title="Everything you need to buy software with confidence"
            text="Written from real B2B delivery experience — the things we wish every client knew before starting."
          />
          <div className="guide-contents-grid">
            {CONTENTS.map((item) => (
              <article className="card feature-card guide-content-card" key={item.n}>
                <span className="guide-content-num">{item.n}</span>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        gradient
        eyebrow="Ready to go further?"
        title="Want help applying the guide to your project?"
        text="Book a free consultation and we'll help you scope the right build and budget for your business."
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/security-audit"
        secondaryLabel="Get a Free Audit"
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Buyer's Guide", path: "/buyers-guide" },
        ])}
      />
    </>
  );
}
