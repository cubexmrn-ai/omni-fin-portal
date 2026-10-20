"use client";

// components/Header.jsx
//
// OmniFin Portal's primary site header — extracted out of app/layout.jsx
// (which previously defined an inline `SiteHeader` function) into its
// own standalone, self-contained component so it can carry its own
// interactive state (the "Tools & Calculators" dropdown needs
// useState + an outside-click/Escape listener, which a plain server
// component in layout.jsx can't have without becoming "use client"
// itself).
//
// NAV STRUCTURE:
//   - Dashboard (/)
//   - "Tools & Calculators" — ONE dropdown (click-to-open, not
//     hover-only, so it works the same on touch devices) merging what
//     used to be three separate top-level items ("Metals &
//     Commodities", "Converters", "Calculators") into:
//       * Metals & Commodities Converter -> /#metals-calculator
//       * Universal Currency Converter    -> /converters
//       * Trading & Financial Calculators -> /calculators
//       * Household Tools (gold making-charges, loan EMI/salary tax,
//         zakat, savings & inflation) -> /tools
//   - Market Analysis, News, Academy, Community, About — unchanged,
//     ungrouped top-level links, exactly as before.
//   - The top-right primary "Open Calculator" button is untouched and
//     still points directly at the Metals Calculator
//     (/#metals-calculator), per spec — it's a shortcut to the single
//     most-used tool, not part of the new dropdown.
//
// GLOBAL BASE CURRENCY SWITCHER: this header also owns the site-wide
// Base Currency dropdown (USD, EUR, GBP, INR, PKR, AED, and every
// other currency in lib/currencies.js). It reads/writes the shared
// BaseCurrencyProvider context (see lib/baseCurrencyContext.js, wired
// up in app/layout.jsx) rather than local state, so the choice made
// here becomes the default account/local currency across the Metals
// Calculator, the Universal Currency Converter, and the Trading
// Calculator Suite — while every one of those tools keeps its own
// manual-override dropdown intact. This is the one deliberate
// exception to this file's original "zero imports" design note below
// (now out of date): a Context import carries no risk of a missing
// *component* dependency, since lib/baseCurrencyContext.js has no
// imports of its own beyond React/Next primitives.

// LANGUAGE SWITCHER: this header also owns a compact Language pill,
// right beside the Base Currency one, backed by LanguageProvider (see
// lib/i18n/LanguageContext.js, wired up in app/layout.jsx). It covers
// 16 languages — including Roman Urdu as a prominent, dedicated entry
// alongside Urdu's own script — and its `t()` helper translates this
// header's own nav labels via lib/i18n/translations.js's core-term
// dictionary (Dashboard, Tools & Calculators, Open Calculator, Base
// Currency, Language, and the per-link nav terms below).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CURRENCIES, POPULAR_CURRENCY_CODES, getCurrency } from "@/lib/currencies";
import { useBaseCurrency } from "@/lib/baseCurrencyContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGES } from "@/lib/i18n/translations";

// FINANCIAL_TOOLS_LINKS — unchanged from before the Utility Tools Suite
// launch (see ToolsCalculatorsDropdown's header note below for how
// this and UTILITY_TOOLS_LINKS are rendered as two labeled groups
// inside the same dropdown, rather than as one flat list).
const FINANCIAL_TOOLS_LINKS = [
  {
    label: "Metals & Commodities Converter",
    description: "Live gold, silver, platinum, and commodity rates.",
    href: "/#metals-calculator",
  },
  {
    label: "Universal Currency Converter",
    description: "Convert between 140+ world currencies & major crypto.",
    href: "/converters",
  },
  {
    label: "Trading & Financial Calculators",
    description: "Position sizing, pip value, margin, and more.",
    href: "/calculators",
  },
  {
    label: "Household Tools",
    description: "Gold jewellery pricing, loan EMI, zakat, and savings vs. inflation.",
    href: "/tools",
  },
];

// UTILITY_TOOLS_LINKS — the 100%-client-side Utility Tools Suite
// (see app/tools/page.jsx's own "Utility Tools" grid, the single
// source of truth this list mirrors for nav purposes) plus the one
// AI-backed tool (Document Summarizer). Kept as a separate array from
// FINANCIAL_TOOLS_LINKS specifically so the dropdown/mobile nav can
// render them as two distinct, labeled groups instead of one long
// undifferentiated list.
const UTILITY_TOOLS_LINKS = [
  {
    label: "Word Counter",
    description: "Live word, character, sentence & paragraph counts.",
    href: "/tools/word-counter",
  },
  {
    label: "JSON Formatter",
    description: "Format, validate, and minify JSON instantly.",
    href: "/tools/json-formatter",
  },
  {
    label: "Case Converter",
    description: "UPPERCASE, Title Case, camelCase, slug, and more.",
    href: "/tools/case-converter",
  },
  {
    label: "Base64 Encoder/Decoder",
    description: "Unicode-safe Base64 encoding and decoding.",
    href: "/tools/base64-encoder",
  },
  {
    label: "Password Generator",
    description: "Cryptographically secure, adjustable-length passwords.",
    href: "/tools/password-generator",
  },
  {
    label: "Image Compressor",
    description: "Resize and compress JPEG, WebP, or PNG images.",
    href: "/tools/image-compressor",
  },
  {
    label: "Markdown Editor",
    description: "Live-preview Markdown editor with .md/.html export.",
    href: "/tools/markdown-editor",
  },
  {
    label: "Document Summarizer",
    description: "AI-generated bullet-point summaries (Gemini).",
    href: "/tools/document-summarizer",
  },
];

// `labelKey` maps each link to lib/i18n/translations.js's dictionary;
// `label` stays as the English fallback/default for anywhere this
// array is read without a translator (there is none currently, but
// it keeps the array self-describing).
const OTHER_NAV_LINKS = [
  { label: "Market Analysis", labelKey: "marketAnalysis", href: "/market-analysis" },
  { label: "News", labelKey: "news", href: "/ai-news" },
  { label: "Academy", labelKey: "academy", href: "/learn" },
  { label: "Journal", labelKey: "journal", href: "/journal" },
  { label: "Community", labelKey: "community", href: "/community" },
  { label: "About", labelKey: "about", href: "/about" },
];

function HeaderLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-card">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 17L9 11L13 15L21 7"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 7H21V13"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">
        OmniFin<span className="text-brand-600">Portal</span>
      </span>
    </Link>
  );
}

/** The "Tools & Calculators" dropdown — click-to-toggle (works on
 * touch and desktop alike), closes on outside click, Escape, or
 * choosing a link. */
function ToolsCalculatorsDropdown() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        {t("toolsCalculators")}
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 w-80 max-h-[28rem] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10"
        >
          <p className="px-4 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Financial Calculators
          </p>
          {FINANCIAL_TOOLS_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 transition-colors hover:bg-slate-50"
            >
              <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{item.description}</span>
            </Link>
          ))}

          <div className="my-1.5 border-t border-slate-100" />

          <p className="px-4 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Utility Tools
          </p>
          {UTILITY_TOOLS_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 transition-colors hover:bg-slate-50"
            >
              <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{item.description}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/** Compact Base Currency pill dropdown for the top nav — a native
 * <select> so it's fully keyboard/touch accessible, grouped into a
 * short "Popular" set plus every other supported currency. Sized down
 * to a tight, sleek pill (text-xs, px-2 py-1, a subtle translucent
 * blue border) so it sits naturally among the other header controls
 * without adding to the header's height or crowding the nav links.
 * Changing it updates BaseCurrencyProvider immediately, which every
 * synced tool (Metals Calculator, Currency Converter, Trading
 * Calculators) picks up as its new default — without touching any
 * manual override the person already made inside a specific tool. */
function BaseCurrencySelect({ className = "" }) {
  const { baseCurrency, setBaseCurrency } = useBaseCurrency();
  const popular = POPULAR_CURRENCY_CODES.map((code) => getCurrency(code)).filter(Boolean);
  const popularCodes = new Set(POPULAR_CURRENCY_CODES);
  const rest = CURRENCIES.filter((c) => !popularCodes.has(c.code));

  return (
    <label className={`relative inline-flex ${className}`}>
      <span className="sr-only">Base currency</span>
      <select
        value={baseCurrency}
        onChange={(e) => setBaseCurrency(e.target.value)}
        aria-label="Base currency"
        title="Base currency — sets the default account/local currency across OmniFin Portal's tools"
        className="w-[76px] appearance-none truncate overflow-hidden whitespace-nowrap rounded-full border border-blue-500/30 bg-blue-50/60 px-2 py-1 pr-5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-500/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <optgroup label="Popular">
          {popular.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </optgroup>
        <optgroup label="All Currencies">
          {rest.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} — {c.name}
            </option>
          ))}
        </optgroup>
      </select>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
      >
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

/** Compact Language pill, styled identically to BaseCurrencySelect
 * right next to it — 16 languages including Roman Urdu as a
 * dedicated, prominent entry (not folded into "Urdu"). Changing it
 * updates LanguageProvider immediately, which re-translates this
 * header's own nav labels via useLanguage()'s t() helper. */
function LanguageSelect({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <label className={`relative inline-flex ${className}`}>
      <span className="sr-only">Language</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Language"
        title="Language — translates OmniFin Portal's core navigation and trading terms"
        className="w-[76px] appearance-none truncate overflow-hidden whitespace-nowrap rounded-full border border-blue-500/30 bg-blue-50/60 px-2 py-1 pr-5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-500/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native}
          </option>
        ))}
      </select>
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
      >
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

/** A single collapsible group inside the mobile nav drawer — closed by
 * default, expands/collapses smoothly via a CSS grid-rows transition
 * (no JS height measurement needed: animating 0fr -> 1fr on a grid
 * track animates its rendered height smoothly, and the inner
 * `overflow-hidden` wrapper clips the content while collapsed). Used
 * for "Financial Calculators" and "Utility Tools" so the drawer opens
 * short by default instead of dumping both full sub-lists on screen
 * immediately. */
function MobileNavAccordionSection({ title, items, onLinkClick }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
      >
        {title}
        <span className={`text-sm transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll lock: while the mobile drawer is open, the background page
  // must not scroll underneath it — otherwise a touch-scroll starting
  // on the drawer's own content can "bleed through" once the drawer's
  // scroll reaches its end. Restored on close and on unmount so a
  // navigation away (or a hot-reload) never leaves the body stuck
  // locked.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <HeaderLogo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {/* Plain English "Home", not t("dashboard") — that i18n key
              still literally translates to "Dashboard" in every
              language (see translate() in lib/i18n/translations.js),
              which now collides with the real /dashboard link right
              after it. Renaming the KEY would also change the
              breadcrumb text other pages derive from the same t()
              call (e.g. components/academy/AcademyHub.jsx), so this
              stays a local override here rather than a dictionary
              edit with wider, untested blast radius. */}
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Home
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            My Dashboard
          </Link>

          <ToolsCalculatorsDropdown />

          {OTHER_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live rates · 5m cache
          </span>

          {/* Global Base Currency + Language switchers — desktop only;
              mobile gets its own copies inside the slide-down menu below. */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <BaseCurrencySelect />
            <LanguageSelect />
          </div>

          {/* Primary action — untouched, still a direct shortcut to the
              Metals Calculator, independent of the dropdown above. */}
          <Link
            href="/#metals-calculator"
            className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-700"
          >
            {t("openCalculator")}
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {mobileOpen ? (
                <path
                  d="M6 6L18 18M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav — flattened (no hover dropdown on touch), closed
          short by default: "Financial Calculators" and "Utility
          Tools" are collapsible accordions (MobileNavAccordionSection,
          closed until tapped) rather than two always-expanded
          sub-lists, so opening the drawer doesn't immediately dump 12
          extra links on screen. The drawer itself is height-capped
          with its own scroll (max-h-[calc(100vh-4rem)] overflow-y-auto
          — 4rem matches the h-16 header above it) so every link below
          the fold (News, Journal, Community, About, etc.) is reachable
          by scrolling the drawer, not the background page — which is
          itself scroll-locked while open (see the useEffect above). */}
      {mobileOpen && (
        <nav
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-slate-100 px-4 py-3 md:hidden"
          aria-label="Primary mobile"
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between gap-3 px-3 py-1.5 sm:hidden">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("baseCurrency")}
              </span>
              <BaseCurrencySelect />
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-1.5 sm:hidden">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {t("language")}
              </span>
              <LanguageSelect />
            </div>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              My Dashboard
            </Link>

            <MobileNavAccordionSection
              title={t("toolsCalculators")}
              items={FINANCIAL_TOOLS_LINKS}
              onLinkClick={() => setMobileOpen(false)}
            />

            <MobileNavAccordionSection
              title="Utility Tools"
              items={UTILITY_TOOLS_LINKS}
              onLinkClick={() => setMobileOpen(false)}
            />

            <div className="mt-2 border-t border-slate-100 pt-2">
              {OTHER_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
