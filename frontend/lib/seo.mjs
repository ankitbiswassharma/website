export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://muskit.in").replace(/\/$/, "");
export const SITE_NAME = "Musk-IT";
export const DEFAULT_DESCRIPTION =
  "Musk-IT is a B2B software company that builds custom software and workflow automation — tailored ERP, CRM, dashboards, and web or mobile apps designed around each business's exact demands and workflows.";

export const indexablePages = [
  {
    path: "/",
    title: "B2B Custom Software & Workflow Automation",
    description: DEFAULT_DESCRIPTION,
    priority: 1,
  },
  {
    path: "/features",
    title: "Custom Software Features for Business Operations",
    description:
      "Explore Musk-IT capabilities for governed workflows, real-time tracking, secure access, dashboards, automation, and scalable custom business software.",
    priority: 0.9,
  },
  {
    path: "/services",
    title: "Custom Software Development Services",
    description:
      "Explore Musk-IT B2B software services: custom ERP, CRM, workflow automation, web and mobile apps, and API integrations built around your operations.",
    priority: 0.9,
  },
  {
    path: "/services/erp",
    title: "Custom ERP System Development",
    description:
      "Musk-IT builds custom ERP systems that unify inventory, orders, production, procurement, and finance into one source of truth for your business.",
    priority: 0.8,
  },
  {
    path: "/services/crm",
    title: "Custom CRM Platform Development",
    description:
      "Musk-IT builds custom CRM platforms with lead capture, tailored pipelines, automated follow-ups, and reporting shaped around your sales process.",
    priority: 0.8,
  },
  {
    path: "/services/workflow-automation",
    title: "Business Workflow Automation",
    description:
      "Musk-IT automates manual, repetitive business processes end to end: approvals, notifications, data sync, document generation, and scheduled jobs.",
    priority: 0.8,
  },
  {
    path: "/services/web-mobile-apps",
    title: "Custom Web and Mobile App Development",
    description:
      "Musk-IT builds production-grade customer portals, internal tools, dashboards, and cross-platform mobile apps shaped around a specific workflow.",
    priority: 0.8,
  },
  {
    path: "/services/api-integrations",
    title: "API Development and System Integrations",
    description:
      "Musk-IT designs clean APIs and connects payments, email, ERP, CRM, and cloud tools with signed inbound and outbound webhooks for reliable connectivity.",
    priority: 0.8,
  },
  {
    path: "/integrations",
    title: "Integrations and Connectors",
    description:
      "See the systems Musk-IT connects to — payments, email, CRM, ERP, cloud, and data — plus signed webhooks and APIs for connecting anything else.",
    priority: 0.7,
  },
  {
    path: "/consultation",
    title: "Book a Software Consultation",
    description:
      "Book a free consultation with Musk-IT. Tell us about your workflows and pick a preferred time, and we will scope custom B2B software for your business.",
    priority: 0.8,
  },
  {
    path: "/modules",
    title: "ERP, CRM, Dashboard & Automation Modules",
    description:
      "Review custom software modules for ERP, CRM, inventory, attendance, dashboards, email automation, and business workflow management.",
    priority: 0.9,
  },
  {
    path: "/licensing",
    title: "Software Licensing and Pricing Models",
    description:
      "Understand Musk-IT commercial models for custom software delivery, build plus maintenance, managed SaaS, support, and platform expansion.",
    priority: 0.8,
  },
  {
    path: "/case-studies",
    title: "Custom Software Case Studies",
    description:
      "See representative examples of tailored ERP, CRM, inventory, tracking, and workflow automation systems built for operational control.",
    priority: 0.8,
  },
  {
    path: "/about",
    title: "About Musk-IT",
    description:
      "Learn how Musk-IT designs business software around real workflows, operational bottlenecks, reporting needs, and scalable growth.",
    priority: 0.7,
  },
  {
    path: "/docs",
    title: "Software Documentation and Support",
    description:
      "Learn how Musk-IT supports custom software deployments with onboarding documentation, usage guidance, FAQs, and post-launch support.",
    priority: 0.6,
  },
  {
    path: "/blog",
    title: "Business Software and Automation Insights",
    description:
      "Read Musk-IT insights on custom ERP, workflow automation, operational dashboards, digital transformation, and software adoption.",
    priority: 0.6,
  },
  {
    path: "/contact",
    title: "Contact Musk-IT",
    description:
      "Contact Musk-IT to discuss custom ERP, CRM, dashboard, automation, web app, or mobile app requirements for your business workflow.",
    priority: 0.8,
  },
  {
    path: "/privacy-policy.html",
    title: "Privacy Policy",
    description: "Read the Musk-IT privacy policy for enquiries, platform usage, client data, communications, and service delivery.",
    priority: 0.3,
  },
  {
    path: "/terms.html",
    title: "Terms and Conditions",
    description: "Read Musk-IT terms and conditions for software consulting, custom development, platform delivery, billing, and support.",
    priority: 0.3,
  },
];

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function pageByPath(path) {
  return indexablePages.find((page) => page.path === path);
}

export function buildMetadata(path, overrides = {}) {
  const page = pageByPath(path) || {};
  const title = overrides.title || page.title || SITE_NAME;
  const description = overrides.description || page.description || DEFAULT_DESCRIPTION;
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}

export function noIndexMetadata(title, description) {
  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: "admin@muskit.in",
    telephone: "+91 70478 59422",
    areaServed: "IN",
    sameAs: [SITE_URL],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd({ name, description, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: "IN",
    url: absoluteUrl(path),
  };
}

export function faqJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}
