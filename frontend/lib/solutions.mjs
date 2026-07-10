// Programmatic SEO: service × industry "solution" pages.
//
// Each combination (e.g. "Custom ERP Systems for Manufacturing") becomes a
// dedicated, indexable landing page targeting a specific long-tail search
// intent. Content is composed from real service + industry data plus
// combo-specific framing so every page carries unique, substantive copy
// rather than thin duplicated boilerplate.

import { services, industries } from "@/lib/site-data";

// Industry-specific framing used to make each combo page unique. Keeps copy
// grounded in the buyer, the pain, and the language of that sector.
const industryContext = {
  manufacturing: {
    buyer: "plant and operations teams",
    pain: "spreadsheets, paper job cards, and disconnected shop-floor tools",
    stakes: "production delays, stock-outs, and reconciliation errors",
    hub: "the shop floor",
  },
  retail: {
    buyer: "store, e-commerce, and back-office teams",
    pain: "stock that drifts out of sync across channels and manual billing",
    stakes: "overselling, missed reorders, and blind spots in margin",
    hub: "every sales channel",
  },
  logistics: {
    buyer: "dispatch, fleet, and customer-service teams",
    pain: "manual dispatch paperwork and endless status phone calls",
    stakes: "slow turnaround, lost consignments, and frustrated clients",
    hub: "every consignment",
  },
  healthcare: {
    buyer: "clinic administrators and front-desk staff",
    pain: "fragmented records, manual billing, and missed follow-ups",
    stakes: "no-shows, billing leakage, and compliance risk",
    hub: "every patient interaction",
  },
  "professional-services": {
    buyer: "partners, project leads, and client-facing teams",
    pain: "work scattered across email, spreadsheets, and shared drives",
    stakes: "slow onboarding, version chaos, and an unprofessional client experience",
    hub: "every client engagement",
  },
  education: {
    buyer: "admissions, accounts, and administration teams",
    pain: "manual admissions, attendance registers, and fee tracking",
    stakes: "leaked enquiries, fee-collection gaps, and communication overload",
    hub: "the whole student lifecycle",
  },
};

function titleCaseService(service) {
  return service.name;
}

// Build a single solution combo from a service and an industry.
function buildSolution(service, industry) {
  const ctx = industryContext[industry.key] || {
    buyer: "your team",
    pain: "manual, disconnected tools",
    stakes: "wasted hours and avoidable errors",
    hub: "your operations",
  };

  const slug = `${service.slug}-for-${industry.key}`;
  const path = `/solutions/${slug}`;
  const h1 = `${service.name} for ${industry.name}`;

  // First clause of the pain phrase, cleaned of trailing punctuation.
  const primaryPain = ctx.pain.split(" and ")[0].replace(/[,\s]+$/, "");

  const metaTitle = `${service.name} for ${industry.name} | Musk-IT`;
  const metaDescription =
    `Custom ${service.eyebrow} software built for ${industry.name.toLowerCase()} businesses. ` +
    `Musk-IT replaces ${ctx.pain} with software shaped around ${ctx.hub} — ${service.outcomes[0].toLowerCase()}.`;

  const intro =
    `${industry.name} businesses run on ${ctx.hub}, but ${ctx.buyer} are often held back by ${ctx.pain}. ` +
    `Musk-IT builds ${service.name.toLowerCase()} tailored to how your business actually works — ${service.summary}`;

  const whyTitle = `Why ${industry.name.toLowerCase()} teams need ${service.eyebrow.toLowerCase()}`;
  const whyText =
    `${industry.summary} Left unaddressed, ${ctx.pain} lead to ${ctx.stakes}. ` +
    `${service.problem} We fix that with a system designed around ${ctx.hub}, not a generic template.`;

  // FAQ — combo-specific questions that also target question-style search queries.
  const faq = [
    {
      q: `Can you build ${service.eyebrow.toLowerCase()} specifically for a ${industry.name.toLowerCase()} business?`,
      a: `Yes. We build ${service.name.toLowerCase()} shaped around ${industry.name.toLowerCase()} workflows — ${industry.workflows[0].toLowerCase()}, ${industry.workflows[1].toLowerCase()}, and more — rather than forcing you into an off-the-shelf product. ${industry.outcome}`,
    },
    {
      q: `How does this replace our current ${primaryPain}?`,
      a: `We map your existing process first, then migrate it into one system with ${service.capabilities[0].toLowerCase()} and ${service.capabilities[1].toLowerCase()}. The result is ${service.outcomes[0].toLowerCase()} — with a clean handover so ${ctx.buyer} own it.`,
    },
    {
      q: `What does a ${service.eyebrow.toLowerCase()} project for ${industry.name.toLowerCase()} typically involve?`,
      a: `A short consultation to scope your workflows, a fixed proposal, then sprint-based delivery. Typical stack: ${(service.tech || []).join(", ")}. You get production-ready software with documentation and no vendor lock-in.`,
    },
  ];

  return {
    slug,
    path,
    h1,
    metaTitle,
    metaDescription,
    intro,
    whyTitle,
    whyText,
    faq,
    service,
    industry,
    eyebrow: `${service.eyebrow} · ${industry.name}`,
    highlight: `built for ${industry.name.toLowerCase()}`,
    capabilities: service.capabilities,
    outcomes: [...service.outcomes, industry.outcome].filter(Boolean),
    workflows: industry.workflows,
    tech: service.tech || [],
  };
}

// Full matrix of service × industry solution pages.
export const solutions = services.flatMap((service) =>
  industries.map((industry) => buildSolution(service, industry))
);

export function getSolution(slug) {
  return solutions.find((solution) => solution.slug === slug);
}

// Related solutions for internal linking: same service in other industries,
// and other services in the same industry. This builds a dense internal link
// mesh that helps search engines discover and rank the whole set.
export function getRelatedSolutions(solution, limit = 6) {
  const sameService = solutions.filter(
    (item) =>
      item.service.slug === solution.service.slug && item.slug !== solution.slug
  );
  const sameIndustry = solutions.filter(
    (item) =>
      item.industry.key === solution.industry.key &&
      item.service.slug !== solution.service.slug
  );

  const related = [];
  const seen = new Set([solution.slug]);
  // Interleave so both dimensions are represented.
  const max = Math.max(sameIndustry.length, sameService.length);
  for (let i = 0; i < max && related.length < limit; i += 1) {
    for (const source of [sameIndustry[i], sameService[i]]) {
      if (source && !seen.has(source.slug) && related.length < limit) {
        seen.add(source.slug);
        related.push(source);
      }
    }
  }
  return related;
}

// Grouped by industry for the hub page listing.
export function solutionsByIndustry() {
  return industries.map((industry) => ({
    industry,
    items: solutions.filter((solution) => solution.industry.key === industry.key),
  }));
}
