export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://muskit.in").replace(/\/$/, "");
export const SITE_NAME = "Musk-IT";
export const OG_IMAGE = "/og-image.png";
export const SITE_KEYWORDS = [
  "custom software development",
  "custom software development company India",
  "B2B software company",
  "IT solutions provider",
  "IT solutions provider India",
  "IT services company India",
  "managed IT services",
  "cloud infrastructure services",
  "cybersecurity services",
  "IT consulting and digital transformation",
  "workflow automation",
  "custom ERP software",
  "custom CRM software",
  "business process automation",
  "web application development",
  "API integration services",
  "software for businesses India",
];
export const DEFAULT_DESCRIPTION =
  "Musk-IT is a B2B custom software and IT solutions provider — building tailored ERP, CRM, dashboards, web and mobile apps, plus cloud infrastructure, managed IT support, cybersecurity, and IT consulting around each business's exact demands and workflows.";

export const indexablePages = [
  {
    path: "/",
    title: "B2B Custom Software & IT Solutions Provider",
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
    title: "Custom Software & IT Solutions Services",
    description:
      "Explore Musk-IT B2B services: custom ERP, CRM, workflow automation, web and mobile apps, API integrations, plus cloud infrastructure, managed IT, cybersecurity, and IT consulting.",
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
    path: "/services/cloud-infrastructure",
    title: "Cloud & Infrastructure Services",
    description:
      "Musk-IT handles cloud migration, hosting, and managed infrastructure on AWS, Azure, and Google Cloud — with infrastructure-as-code, CI/CD, monitoring, and cost optimisation.",
    priority: 0.8,
  },
  {
    path: "/services/managed-it-support",
    title: "Managed IT Services and Support",
    description:
      "Musk-IT provides managed IT services — 24/7 monitoring, proactive maintenance, helpdesk, patching, and uptime management so your systems stay secure and running.",
    priority: 0.8,
  },
  {
    path: "/services/cybersecurity",
    title: "Cybersecurity Services",
    description:
      "Musk-IT delivers security audits, infrastructure and application hardening, access control, encryption, and compliance readiness to protect your business and data.",
    priority: 0.8,
  },
  {
    path: "/services/it-consulting",
    title: "IT Consulting and Digital Transformation",
    description:
      "Musk-IT provides IT strategy, systems modernisation, and digital transformation advisory — assessing your stack and mapping an IT roadmap aligned to business outcomes.",
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
    path: "/industries",
    title: "Industries We Build Software For",
    description:
      "See how Musk-IT builds custom software and workflow automation for manufacturing, retail, logistics, healthcare, professional services, and education.",
    priority: 0.8,
  },
  {
    path: "/work",
    title: "Our Work and Project Portfolio",
    description:
      "A portfolio of custom ERP, CRM, automation, and integration projects Musk-IT has delivered for B2B businesses, with outcomes and the stack used.",
    priority: 0.8,
  },
  {
    path: "/faq",
    title: "Frequently Asked Questions",
    description:
      "Answers to common questions about working with Musk-IT — what we build, pricing and engagement, delivery and handover, and support and security.",
    priority: 0.6,
  },
  {
    path: "/testimonials",
    title: "Client Testimonials and Reviews",
    description:
      "Read what businesses say about working with Musk-IT on custom software and workflow automation — delivery quality, pricing, and ongoing support.",
    priority: 0.6,
  },
  {
    path: "/estimate",
    title: "Software Cost Estimator",
    description:
      "Use the Musk-IT cost estimator to get an indicative budget and timeline for custom ERP, CRM, automation, web, mobile, or integration projects.",
    priority: 0.7,
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

  const ogImage = absoluteUrl(OG_IMAGE);

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
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
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
    legalName: "Musk-IT",
    url: SITE_URL,
    logo: absoluteUrl(OG_IMAGE),
    image: absoluteUrl(OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: "admin@muskit.in",
    telephone: "+91 70478 59422",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    areaServed: "IN",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91 70478 59422",
      email: "admin@muskit.in",
      contactType: "sales",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: [SITE_URL],
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl(OG_IMAGE),
    logo: absoluteUrl(OG_IMAGE),
    description: DEFAULT_DESCRIPTION,
    email: "admin@muskit.in",
    telephone: "+91 70478 59422",
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    areaServed: { "@type": "Country", name: "India" },
    knowsAbout: [
      "Custom software development",
      "Workflow automation",
      "ERP development",
      "CRM development",
      "API integration",
      "Cloud infrastructure",
      "Managed IT services",
      "Cybersecurity",
      "IT consulting and digital transformation",
    ],
    serviceType: "Custom software development and IT solutions",
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
