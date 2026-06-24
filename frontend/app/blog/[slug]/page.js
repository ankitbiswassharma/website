import Link from "next/link";
import { notFound } from "next/navigation";

import CtaBanner from "@/components/CtaBanner";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import { blogArticles, getArticle, getArticleSlugs } from "@/lib/blog-articles.mjs";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  faqJsonLd,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo.mjs";

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {
      title: "Article not found",
      robots: { index: false, follow: true },
    };
  }

  const url = absoluteUrl(`/blog/${article.slug}`);
  const ogImage = absoluteUrl(OG_IMAGE);

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} | ${SITE_NAME}`,
      description: article.description,
      url,
      siteName: SITE_NAME,
      type: "article",
      locale: "en_IN",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified || article.datePublished,
      authors: [SITE_URL],
      section: article.eyebrow,
      tags: article.keywords,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | ${SITE_NAME}`,
      description: article.description,
      images: [ogImage],
    },
  };
}

function renderInline(content, keyPrefix) {
  if (typeof content === "string") {
    return content;
  }
  return content.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : (
      <Link key={`${keyPrefix}-${index}`} className="text-link" href={part.href}>
        {part.text}
      </Link>
    )
  );
}

function ArticleBlock({ block, index }) {
  switch (block.type) {
    case "heading":
      return <h2>{block.text}</h2>;
    case "subheading":
      return <h3>{block.text}</h3>;
    case "quote":
      return <blockquote className="article-quote">{block.text}</blockquote>;
    case "list":
      return (
        <ul className="bullet-list">
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `b${index}-li${itemIndex}`)}</li>
          ))}
        </ul>
      );
    case "paragraph":
    default:
      return <p>{renderInline(block.content, `b${index}`)}</p>;
  }
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return value;
  }
}

function articleWordCount(article) {
  const fromBlocks = article.body
    .map((block) => {
      if (block.type === "list") {
        return block.items
          .map((item) => (typeof item === "string" ? item : item.map((p) => (typeof p === "string" ? p : p.text)).join(" ")))
          .join(" ");
      }
      if (block.type === "paragraph") {
        return typeof block.content === "string"
          ? block.content
          : block.content.map((p) => (typeof p === "string" ? p : p.text)).join(" ");
      }
      return block.text || "";
    })
    .join(" ");
  return `${article.intro} ${fromBlocks}`.trim().split(/\s+/).length;
}

export default async function BlogArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const url = absoluteUrl(`/blog/${article.slug}`);
  const related = (article.related || []).filter(Boolean);
  const moreArticles = blogArticles.filter((item) => item.slug !== article.slug).slice(0, 2);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: absoluteUrl(OG_IMAGE),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    wordCount: articleWordCount(article),
    keywords: (article.keywords || []).join(", "),
    articleSection: article.eyebrow,
    inLanguage: "en-IN",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl(OG_IMAGE) },
    },
  };

  const jsonLd = [
    articleJsonLd,
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: article.title, path: `/blog/${article.slug}` },
    ]),
  ];
  if (article.faqs?.length) {
    jsonLd.push(faqJsonLd(article.faqs.map((item) => ({ q: item.q, a: item.a }))));
  }

  return (
    <>
      <PageHero
        eyebrow={article.eyebrow}
        title={article.heroTitle || article.title}
        highlight={article.heroHighlight}
        text={article.description}
        primaryHref="/consultation"
        primaryLabel="Book a Consultation"
        secondaryHref="/blog"
        secondaryLabel="All Articles"
      />

      <section className="page-section">
        <div className="shell">
          <article className="article-wrap">
            <div className="article-meta">
              <span>{formatDate(article.datePublished)}</span>
              <span aria-hidden="true">·</span>
              <span>{article.readingTime}</span>
            </div>

            <div className="article-body">
              <p className="article-lead">{article.intro}</p>
              {article.body.map((block, index) => (
                <ArticleBlock key={index} block={block} index={index} />
              ))}
            </div>

            {article.faqs?.length ? (
              <div className="article-faqs">
                <h2>Frequently asked questions</h2>
                {article.faqs.map((item, index) => (
                  <details key={index} className="faq-item">
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
            ) : null}

            {related.length ? (
              <div className="article-related">
                <h2>Related</h2>
                <ul className="bullet-list">
                  {related.map((item) => (
                    <li key={item.href}>
                      <Link className="text-link" href={item.href}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {moreArticles.length ? (
              <div className="article-more">
                <h2>Keep reading</h2>
                <div className="article-more-grid">
                  {moreArticles.map((item) => (
                    <Link key={item.slug} className="card article-more-card" href={`/blog/${item.slug}`}>
                      <div className="eyebrow">{item.eyebrow}</div>
                      <h3>{item.title}</h3>
                      <p>{item.cardText}</p>
                      <span className="text-link">Read the article</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </article>
        </div>
      </section>

      <CtaBanner
        title="Want this applied to your business?"
        text="Book a consultation and we will review your situation and recommend the right approach."
        secondaryHref="/services"
        secondaryLabel="Explore Services"
      />

      <JsonLd data={jsonLd} />
    </>
  );
}
