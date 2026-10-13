"use client";

// components/community/CommunityHub.jsx
//
// Client component powering app/community/page.jsx: stats header,
// category tabs, search bar, asset filter pills, "Share Trade Setup /
// Insight" trigger, and the post feed itself.
//
// HONESTY NOTE: "Active Traders" and "Shared Setups" below are genuinely
// derived from the visible post data (a real count of this demo data,
// not an invented number) — but the underlying post set is still seeded,
// illustrative content, not a live community, so the header carries an
// explicit "demo community" note. "Accuracy Rate" has no real backend
// tracking whether any setup's take-profit/stop-loss actually got hit,
// so rather than fabricate a percentage, it's labeled as not tracked yet
// instead of showing a made-up number — consistent with this project's
// established convention of never presenting simulated/unverified data
// as if it were real (see the Social Buzz Tracker's "Simulated" badge,
// the Pip Value Calculator's non-standard-instrument disclaimers).

import { useMemo, useState } from "react";
import { useCommunityPosts } from "@/hooks/useCommunityPosts";
import { CATEGORIES, ASSET_TAGS } from "@/lib/communityData";
import TradePostCard from "@/components/community/TradePostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SentimentGaugeSection from "@/components/community/setup/SentimentGaugeSection";
import SetupBoard from "@/components/community/setup/SetupBoard";

function StatCard({ label, value, footnote }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-card">
      <div className="text-xl font-extrabold text-slate-900">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-500">{label}</div>
      {footnote && (
        <div className="mt-1 text-[10px] text-slate-400">{footnote}</div>
      )}
    </div>
  );
}

export default function CommunityHub() {
  const { t } = useLanguage();
  const { hydrated, allPosts, addPost, setVote, toggleBullseye, getDisplayCounts } =
    useCommunityPosts();

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeAssetTags, setActiveAssetTags] = useState([]);
  const [search, setSearch] = useState("");

  function toggleAssetTag(tagId) {
    setActiveAssetTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allPosts.filter((post) => {
      if (activeCategory !== "all" && post.category !== activeCategory) {
        return false;
      }
      if (
        activeAssetTags.length > 0 &&
        !activeAssetTags.some((tag) => post.assetTags.includes(tag))
      ) {
        return false;
      }
      if (query) {
        const haystack = `${post.title} ${post.body} ${post.authorHandle}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [allPosts, activeCategory, activeAssetTags, search]);

  // Genuinely derived from the visible (seeded) post data — see the
  // honesty note at the top of this file.
  const stats = useMemo(() => {
    const uniqueAuthors = new Set(allPosts.map((p) => p.authorHandle));
    const setupCount = allPosts.filter(
      (p) => p.bias === "long" || p.bias === "short"
    ).length;
    return {
      activeTraders: uniqueAuthors.size,
      sharedSetups: setupCount,
    };
  }, [allPosts]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero — same light-surface header treatment as the Dashboard
          and Trading Lab, since this top section (Sentiment Gauge +
          Setup Board) shares their dark slate-900/blue-500 accent
          card language. */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trader Community & Setup Hub
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Vote on live sentiment, share trade setups with real entry/SL/TP levels, and swap
            setups, macro takes and financial-literacy lessons with the OmniFin community.{" "}
            <span className="font-medium text-slate-500">{t("communityDemoNote")}</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <SentimentGaugeSection />
        <SetupBoard />
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <header>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Community Discussions
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t("communityHubDesc")}</p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatCard label={t("activeTradersLabel")} value={stats.activeTraders} />
            <StatCard label={t("sharedSetupsLabel")} value={stats.sharedSetups} />
            <StatCard
              label={t("accuracyRateLabel")}
              value={t("notTrackedYetLabel")}
              footnote={t("noBackendVerifiesLabel")}
            />
          </div>

          <div className="mt-5">
            <CreatePostModal onSubmit={addPost} />
          </div>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                activeCategory === cat.id
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchDiscussionsPlaceholder")}
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-1.5">
            {ASSET_TAGS.map((tag) => {
              const active = activeAssetTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleAssetTag(tag.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    active
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {tag.hashtag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {!hydrated ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-card">
              {t("loadingDiscussions")}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-card">
              {t("noPostsMatch")}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <TradePostCard
                key={post.id}
                post={post}
                counts={getDisplayCounts(post)}
                onVote={setVote}
                onToggleBullseye={toggleBullseye}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
