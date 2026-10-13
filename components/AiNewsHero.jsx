"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AiNewsHero() {
  const { t } = useLanguage();
  return (
    <>
      <nav className="text-xs text-slate-400">
        <Link href="/market-analysis" className="hover:text-brand-600">
          {t("marketAnalysis")}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-500">{t("aiNewsBreadcrumbLabel")}</span>
      </nav>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {t("globalFinancialNewsTitle")}
      </h1>
      <p className="mt-3 max-w-2xl text-base text-slate-600">
        {t("globalFinancialNewsDesc")}
      </p>
    </>
  );
}
