import { blogArticles } from "@/lib/blog-articles.mjs";
import { solutions } from "@/lib/solutions.mjs";
import { absoluteUrl, indexablePages } from "@/lib/seo.mjs";

export default function sitemap() {
  const now = new Date();

  const pages = indexablePages.map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.priority,
  }));

  const articles = blogArticles.map((article) => ({
    url: absoluteUrl(`/blog/${article.slug}`),
    lastModified: new Date(article.dateModified || article.datePublished),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const solutionPages = solutions.map((solution) => ({
    url: absoluteUrl(solution.path),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...pages, ...articles, ...solutionPages];
}
