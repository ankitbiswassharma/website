import assert from "node:assert/strict";
import test from "node:test";

import {
  absoluteUrl,
  buildMetadata,
  breadcrumbJsonLd,
  indexablePages,
  noIndexMetadata,
} from "../lib/seo.mjs";

test("indexable pages have unique canonical URLs and descriptions", () => {
  const urls = new Set();
  const titles = new Set();

  for (const page of indexablePages) {
    assert.match(page.path, /^\//);
    assert.ok(page.title.length > 8, page.path);
    assert.ok(page.description.length > 50, page.path);
    urls.add(absoluteUrl(page.path));
    titles.add(page.title);
  }

  assert.equal(urls.size, indexablePages.length);
  assert.equal(titles.size, indexablePages.length);
});

test("metadata includes canonical, Open Graph, and Twitter fields", () => {
  const metadata = buildMetadata("/features");

  assert.equal(metadata.alternates.canonical, "https://muskit.in/features");
  assert.equal(metadata.openGraph.url, "https://muskit.in/features");
  assert.equal(metadata.openGraph.type, "website");
  assert.equal(metadata.twitter.card, "summary");
});

test("private metadata is noindex and nofollow", () => {
  const metadata = noIndexMetadata("Private", "Private route");

  assert.equal(metadata.robots.index, false);
  assert.equal(metadata.robots.follow, false);
});

test("breadcrumb JSON-LD has stable item positions", () => {
  const jsonLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
  ]);

  assert.equal(jsonLd["@type"], "BreadcrumbList");
  assert.equal(jsonLd.itemListElement[1].position, 2);
  assert.equal(jsonLd.itemListElement[1].item, "https://muskit.in/features");
});
