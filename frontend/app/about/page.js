import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { aboutCards } from "@/lib/site-data";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/about");

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Engineers who consult."
        highlight="Not consultants who outsource."
        text="We are a senior engineering team that delivers software on demand — with a consulting-first approach that makes sure we build the right thing before we build it fast."
        primaryHref="/contact"
        primaryLabel="Start a Conversation"
        secondaryHref="/docs"
        secondaryLabel="View Documentation"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Who We Are"
            title="A software delivery partner built around quality and transparency"
            text="We work with product teams and founders who need to move fast without cutting corners. Every sprint we run is backed by architectural thinking and production-grade standards."
          />
          <FeatureGrid items={aboutCards} />
        </div>
      </section>
      <CtaBanner
        title="Want a software partner who thinks before they build?"
        text="We can help you figure out what to build, how to build it, and get the first sprint scoped and started in 48 hours."
        secondaryHref="/docs"
        secondaryLabel="View Documentation"
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </>
  );
}
