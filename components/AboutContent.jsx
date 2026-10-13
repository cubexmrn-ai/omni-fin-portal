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
