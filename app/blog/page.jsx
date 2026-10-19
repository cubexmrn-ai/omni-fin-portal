// app/blog/page.jsx
//
// /blog listing page — pSEO/AEO/GEO/LLMO content hub. Lists every post
// in lib/blogPosts.js as a card linking to /blog/[slug]. Pure server
// component (static content, no client state needed).

import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blogPosts";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Guides — Zakat, Loans, Trading & Currency Explained | OmniFin Portal",
  description:
    "In-depth guides on zakat calculation, home loan amortization, gold pricing, trading risk management, currency spreads, remittance rates, and personal finance basics.",
  path: "/blog",
});

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export default function BlogIndexPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Guides</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Guides
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            In-depth, worked-example guides on zakat, loans, gold pricing, trading risk management,
            currency spreads, remittance, and personal finance — the reasoning behind every
            calculator and tool on OmniFin Portal.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-colors hover:border-brand-300 hover:shadow-card-hover"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                {post.category}
              </span>
              <h2 className="mt-1.5 text-base font-bold text-slate-900">{post.title}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-500">{post.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.readingMinutes} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
