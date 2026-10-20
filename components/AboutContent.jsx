"use client";

// components/AboutContent.jsx
//
// Client-side body of app/about/page.jsx, extracted so the page shell
// can keep its `metadata` export (a Server Component requirement)
// while this part uses useLanguage()/t() for translation — same
// server-shell + client-component split used across the rest of the
// site's i18n work (see components/HomeSections.jsx).

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AboutContent() {
  const { t } = useLanguage();
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              {t("dashboard")}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">{t("about")}</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {t("aboutTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {t("aboutSubtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 lg:px-8">
        {/* Brand Entity SEO/LLMO callout — same dark-accent card style
            as the Dashboard/Trading Lab/Community Hub modules (see
            components/dashboard/PresetsCard.jsx etc.) so this reads as
            a deliberate "about the brand itself" block rather than
            just another plain white content section. Text is
            hardcoded (not run through t()) by design — this is a
            literal etymology/entity definition meant to appear
            byte-for-byte identical everywhere it's embedded (this
            page, the footer, llms.txt, and the Organization JSON-LD),
            not a UI label that should vary by viewer language. */}
        <div className="rounded-2xl border border-blue-500/30 bg-slate-900 p-6 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-400">
            Why &ldquo;OmniFin&rdquo;? — Etymology &amp; Mission
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            The name is built from three parts, each one a deliberate scope statement rather than
            a marketing flourish:
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-sm font-bold text-brand-300">Omni-</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                From the Latin <em>omnis</em>, meaning &ldquo;all&rdquo; or &ldquo;universal&rdquo;
                — the promise that this platform isn&apos;t scoped to one market, one currency, or
                one region.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-sm font-bold text-brand-300">Fin</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                Financial systems, global markets, and personal wealth — the subject matter every
                tool here ultimately serves, from a household zakat calculation to a trader&apos;s
                position size.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="font-mono text-sm font-bold text-brand-300">Portal</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                A unified digital gateway: browser-based client utilities, AI analysis, real-time
                sentiment, news feeds, price charts, trading journals, and interactive calculators
                — under one roof, not scattered across a dozen single-purpose sites.
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-slate-300">
            Put together, <strong className="text-white">OmniFin Portal</strong> is our mission
            statement as much as our name: a single, universal gateway to the financial tools and
            information people actually need — global in scope, grounded in real financial
            systems and markets, and built to be used, not just browsed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-sm leading-relaxed text-slate-600 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("aboutPurposeHeading")}</h2>
          <p className="mt-2">{t("aboutPurposeIntro")}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-slate-700">{t("aboutConvertersLabel")}</span>{" "}
              {t("aboutConvertersDesc")}
            </li>
            <li>
              <span className="font-medium text-slate-700">{t("aboutCalculatorsLabel")}</span>{" "}
              {t("aboutCalculatorsDesc")}
            </li>
            <li>
              <span className="font-medium text-slate-700">{t("aboutEducationLabel")}</span>{" "}
              {t("aboutEducationDesc")}
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("aboutMandateHeading")}</h2>
          <p className="mt-2">
            {t("aboutMandateBefore")}
            <Link
              href="/disclaimer"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              {t("aboutMandateLinkText")}
            </Link>
            {t("aboutMandateAfter")}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("aboutTransparencyHeading")}</h2>
          <p className="mt-2">{t("aboutTransparencyIntro")}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>{t("aboutTransparencyRates")}</li>
            <li>{t("aboutTransparencyAnalysis")}</li>
            <li>{t("aboutTransparencySimulated")}</li>
            <li>{t("aboutTransparencyNews")}</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("aboutCommunityHeading")}</h2>
          <p className="mt-2">{t("aboutCommunityDesc")}</p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("aboutQuestionsHeading")}</h2>
          <p className="mt-2">
            {t("aboutQuestionsBefore")}
            <Link
              href="/privacy"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              {t("aboutPrivacyLinkText")}
            </Link>
            {t("aboutQuestionsAnd")}
            <Link
              href="/terms"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              {t("aboutTermsLinkText")}
            </Link>
            {t("aboutQuestionsAfter")}
          </p>
        </div>
      </section>
    </>
  );
}
