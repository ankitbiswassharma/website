import { absoluteUrl, SITE_URL } from "@/lib/seo.mjs";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/dashboard",
          "/enterprise-login",
          "/pay/",
          "/_next/data/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
