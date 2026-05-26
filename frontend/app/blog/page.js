import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { blogPosts } from "@/lib/site-data";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/blog");

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Engineering strategy,"
        highlight="product thinking, and SaaS insights"
        text="We write about software delivery, architecture decisions, and the thinking behind how we build. Useful reading for founders and product teams."
        primaryHref="/contact"
        primaryLabel="Start a Sprint"
        secondaryHref="/case-studies"
        secondaryLabel="View Case Studies"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Latest Articles"
            title="Practical writing on software delivery and product engineering"
            text="These articles reflect the same thinking we bring into consulting sessions and sprint delivery."
          />
          <FeatureGrid items={blogPosts} />
        </div>
      </section>
      <CtaBanner
        title="Want these ideas applied to your own product?"
        text="Let's have a consulting session where we review your situation and recommend the right architecture and delivery approach."
        secondaryHref="/contact"
        secondaryLabel="Book a Consultation"
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          ...blogPosts.map((post) => ({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.text,
            author: {
              "@type": "Organization",
              name: "Musk-IT",
            },
            publisher: {
              "@type": "Organization",
              name: "Musk-IT",
            },
            mainEntityOfPage: absoluteUrl("/blog"),
          })),
        ]}
      />
    </>
  );
}
