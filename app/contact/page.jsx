// app/contact/page.jsx
//
// Contact page — AdSense & Monetization Readiness item #1: AdSense's
// trust/compliance review expects a visible, working way to reach a
// site's operator, alongside About/Privacy/Terms/Disclaimer. Pure
// static server component (no client state needed), same shape as
// app/disclaimer/page.jsx — a hero section, then a plain content card.

import Link from "next/link";
import LegalNoticeBanner from "@/components/LegalNoticeBanner";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Contact Us | OmniFin Portal",
  description:
    "Get in touch with OmniFin Portal — questions, corrections, feedback, or advertising/partnership inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="text-xs text-slate-400">
          <Link href="/" className="hover:text-brand-600">
            Dashboard
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-500">Contact</span>
        </nav>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          Questions about a rate, a calculator, a correction to report, general feedback, or an
          advertising/partnership inquiry — reach us directly by email.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="text-base font-bold text-slate-900">Email</h2>
          <p className="mt-2 text-sm text-slate-600">
            <a
              href="mailto:contact@omnifinportal.com"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              contact@omnifinportal.com
            </a>
          </p>
          <p className="mt-3 text-sm text-slate-600">
            We read every message and aim to respond within a few business days. OmniFin Portal is
            an informational finance-utilities site — see our{" "}
            <Link href="/disclaimer" className="font-medium text-brand-600 hover:text-brand-700">
              Financial Disclaimer
            </Link>{" "}
            — so we can&apos;t advise on personal financial, trading, tax, zakat, or legal decisions;
            for those, please consult a licensed professional or qualified scholar.
          </p>
        </div>

        <LegalNoticeBanner />
      </div>
    </section>
  );
}
