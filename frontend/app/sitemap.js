import { absoluteUrl, indexablePages } from "@/lib/seo.mjs";

export default function sitemap() {
  const now = new Date();

  return indexablePages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.priority,
  }));
}
