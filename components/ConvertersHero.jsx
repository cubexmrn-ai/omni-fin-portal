"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ConvertersHero() {
  const { t } = useLanguage();
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {t("convertersPageTitle")}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          {t("convertersPageDesc")}
        </p>
      </div>
    </section>
  );
}
