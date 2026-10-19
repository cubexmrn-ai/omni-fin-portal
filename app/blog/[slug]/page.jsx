// app/blog/[slug]/page.jsx
//
// One static page per guide in lib/blogPosts.js — generateStaticParams
// pre-renders every known slug at build time (same pattern as
// app/converters/[pair]/page.jsx and app/learn/[level]/[lesson]/
// page.jsx), and app/sitemap.js's blog routes are built from the exact
// same BLOG_POSTS array, so a post can never exist on one and not the
// other. An unknown slug 404s via notFound() rather than rendering an
// empty page.
//
// Per-post optimization stack, top to bottom: an AEO callout (direct
// 2-sentence answer, for zero-click/AI-answer-engine extraction), the
// GEO content body (data tables + bolded formulas, via
// BlogContentBlocks), a visible internal cross-links list, a visible
// FAQ accordion, and — at the very end of the page — the Article +
// FAQPage JSON-LD (components/blog/BlogPostStructuredData.jsx).

import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPostBySlug, getAllBlogSlugs } from "@/lib/blogPosts";
import BlogPostStructuredData from "@/components/blog/BlogPostStructuredData";
import BlogContentBlocks from "@/components/blog/BlogContentBlocks";
import AeoCallout from "@/components/blog/AeoCallout";
import BreadcrumbStructuredData from "@/components/BreadcrumbStructuredData";
import FAQAccordion from "@/components/FAQAccordion";
import FinancialDisclaimerNote from "@/components/FinancialDisclaimerNote";
import { buildMetadata } from "@/lib/pageMetadata";

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return buildMetadata({
      title: "Guide Not Found | OmniFin Portal",
      description: "This guide doesn't exist or may have moved.",
      path: "/blog",
      noIndex: true,
    });
  }
  return buildMetadata({
    title: `${post.title} | OmniFin Portal`,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function BlogPostPage({ params }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  // A handful of OTHER posts, for a lightweight "Keep reading" list —
  // real internal linking between guides, not just out to tools.
  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", href: "/" },
          { name: "Guides", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ]}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/blog" className="hover:text-brand-600">
              Guides
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{post.category}</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {post.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
            <span>{post.category}</span>
            <span>·</span>
            <span>Published {formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <AeoCallout answer={post.aeoAnswer} />

        <div className="mt-6">
          <BlogContentBlocks blocks={post.blocks} />
        </div>

        <FinancialDisclaimerNote className="mt-8" />

        {post.internalLinks && post.internalLinks.length > 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Related tools
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {post.internalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-brand-600 transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        )}

        {post.faqs && post.faqs.length > 0 && (
          <div className="mt-8">
            <FAQAccordion title="FAQs" items={post.faqs} />
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Keep reading
            </p>
            <ul className="mt-2 space-y-1.5">
              {relatedPosts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    {p.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <BlogPostStructuredData post={post} />
    </>
  );
}
