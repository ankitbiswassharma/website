import CtaBanner from "@/components/CtaBanner";
import FeatureGrid from "@/components/FeatureGrid";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { blogPosts } from "@/lib/site-data";

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights on software,"
        highlight="operations, and system design"
        text="We write about the operational problems businesses face, how custom platforms solve them, and what stronger digital execution looks like in practice."
        primaryHref="/contact"
        primaryLabel="Discuss Your Workflow"
        secondaryHref="/case-studies"
        secondaryLabel="View Case Studies"
      />
      <section className="page-section">
        <div className="shell">
          <SectionIntro
            eyebrow="Latest Articles"
            title="Three useful reads for teams improving operational control"
            text="These articles reflect the same thinking we bring into discovery, solution design, and implementation."
          />
          <FeatureGrid items={blogPosts} />
        </div>
      </section>
      <CtaBanner
        title="Want these ideas applied to your own operational workflow?"
        text="Let’s review your current process and identify the right ERP, CRM, automation, or reporting platform for your business."
      />
    </>
  );
}
