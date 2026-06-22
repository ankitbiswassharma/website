import EstimateCalculator from "@/components/EstimateCalculator";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import SectionIntro from "@/components/SectionIntro";
import { breadcrumbJsonLd, buildMetadata, serviceJsonLd } from "@/lib/seo.mjs";

export const metadata = buildMetadata("/estimate");

export default function EstimatePage() {
  return (
    <>
      <PageHero
        eyebrow="Cost Estimator"
        title="A quick, honest"
        highlight="ballpark for your build"
        text="Configure your project below to get an indicative budget and timeline in seconds. It's a planning tool — your exact quote comes after a short consultation."
      />

      <section className="page-section">
        <div className="shell stack-lg">
          <SectionIntro
            eyebrow="Estimate"
            title="Build your estimate"
            text="Pick a project type and adjust the details. The figure updates instantly. Estimates are kept realistic for the Indian SMB market."
          />
          <EstimateCalculator />
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Cost Estimator", path: "/estimate" },
          ]),
          serviceJsonLd({
            name: "Custom Software Cost Estimation",
            description:
              "Indicative budgeting and timeline estimation for custom ERP, CRM, automation, web, mobile, and integration projects.",
            path: "/estimate",
          }),
        ]}
      />
    </>
  );
}
