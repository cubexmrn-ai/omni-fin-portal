import Link from "next/link";
import UtilityDropzone from "@/components/tools/UtilityDropzone";
import { buildMetadata } from "@/lib/pageMetadata";

// Small, dependency-free inline-SVG icons for the Utility Tools grid
// below (no icon library is installed in this project, so these are
// hand-drawn outline icons matching the rest of the codebase's
// existing inline-SVG convention — see the mobile-nav hamburger icon
// in components/Header.jsx for the same approach).
function WordCounterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6h16M4 12h10M4 18h7" />
    </svg>
  );
}
function JsonFormatterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 4c-2 0-3 1-3 3v2c0 1-.5 2-2 2.5 1.5.5 2 1.5 2 2.5v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1 .5 2 2 2.5-1.5.5-2 1.5-2 2.5v2c0 2-1 3-3 3" />
    </svg>
  );
}
function CaseConverterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 16 7 6l4 10M4.5 13h5M13 16l3-7 3 7M14.5 14h3" />
    </svg>
  );
}
function Base64Icon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6 4 12l5 6M15 6l5 6-5 6" />
    </svg>
  );
}
function PasswordIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 6l2 2M14 9l2 2" />
    </svg>
  );
}
function ImageCompressorIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4.5 17.5 9 13l2.5 2.5L15 12l4.5 5" />
    </svg>
  );
}
function MarkdownEditorIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19V8.5L12 4l8 4.5V19" />
      <path d="M4 19h16M9 13v4M9 13l2.5 3L14 13M16 11v6" />
    </svg>
  );
}
function DocumentSummarizerIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 11h6M9 14h6M9 17h3" />
      <path d="M18 2.5 19 4l1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1z" />
    </svg>
  );
}
function PdfTableExtractorIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M8.5 12h7M8.5 15h7M8.5 18h4M12 9v9" />
    </svg>
  );
}

export const metadata = buildMetadata({
  title: "Free Online Tools — Household Finance & Utility Tools | OmniFin Portal",
  description:
    "Free household finance calculators (gold & jewellery, loan EMI, zakat, savings & inflation) plus a full utility tools suite — word counter, JSON formatter, case converter, Base64 encoder, password generator, image compressor, PDF table extractor, and a Markdown editor. All run instantly in your browser.",
  path: "/tools",
});

const UTILITY_TOOLS = [
  {
    href: "/tools/word-counter",
    title: "Word & Character Counter",
    description: "Live word, character, sentence, and paragraph counts with a reading-time estimate.",
    Icon: WordCounterIcon,
  },
  {
    href: "/tools/json-formatter",
    title: "JSON Formatter, Validator & Minifier",
    description: "Pretty-print, minify, and validate JSON instantly with clear syntax-error messages.",
    Icon: JsonFormatterIcon,
  },
  {
    href: "/tools/case-converter",
    title: "Case Converter & Slugify Tool",
    description: "UPPERCASE, Title Case, camelCase, snake_case, or a URL-safe slug — in one click.",
    Icon: CaseConverterIcon,
  },
  {
    href: "/tools/base64-encoder",
    title: "Base64 Encoder & Decoder",
    description: "Encode or decode Base64 with full Unicode support for any script or emoji.",
    Icon: Base64Icon,
  },
  {
    href: "/tools/password-generator",
    title: "Secure Password Generator",
    description: "Cryptographically random passwords via the Web Crypto API — adjustable length & sets.",
    Icon: PasswordIcon,
  },
  {
    href: "/tools/image-compressor",
    title: "Image Compressor & Resizer",
    description: "Shrink JPEG, PNG, or WebP images with adjustable quality and max width.",
    Icon: ImageCompressorIcon,
  },
  {
    href: "/tools/markdown-editor",
    title: "Live Markdown Editor",
    description: "Write Markdown with a live preview, then export as .md or standalone .html.",
    Icon: MarkdownEditorIcon,
  },
  {
    href: "/tools/document-summarizer",
    title: "AI Document Summarizer",
    description: "Summarize long text into key points using Gemini AI.",
    Icon: DocumentSummarizerIcon,
  },
  {
    href: "/tools/pdf-table-extractor",
    title: "PDF Table Extractor",
    description: "Pull tabular data out of a PDF and export it as a CSV file, right in your browser.",
    Icon: PdfTableExtractorIcon,
  },
];

const HOUSEHOLD_TOOLS = [
  {
    href: "/tools/gold-jewellery-calculator",
    title: "Gold & Jewellery Price Calculator",
    description:
      "Live gold value by tola, gram or karat, plus making charges, GST/VAT, and an old-gold exchange credit.",
  },
  {
    href: "/tools/loan-emi-tax-calculator",
    title: "Loan EMI & Salary Tax Calculator",
    description:
      "Your monthly loan installment and payoff schedule, or a quick Pakistan salary-tax estimate.",
  },
  {
    href: "/tools/zakat-calculator",
    title: "Zakat Calculator",
    description:
      "Gold, silver, cash and savings checked against the live nisab threshold — 2.5% zakat-due estimate.",
  },
  {
    href: "/tools/savings-inflation-calculator",
    title: "Savings & Inflation Calculator",
    description:
      "What inflation does to cash left idle, versus saving and topping it up over time — in plain language.",
  },
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <span className="hover:text-brand-600">Dashboard</span>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Tools</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Free Online Tools
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Household finance calculators, plus a full utility suite — word counting, JSON
            formatting, encoding, password generation, image compression, and Markdown editing.
            Nearly everything here runs instantly in your browser: no sign-up, no upload, no wait.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <UtilityDropzone />

        <h2 className="mt-10 text-xl font-bold text-slate-900">Utility Tools</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fast, zero-friction browser tools for everyday text, data, and media tasks.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {UTILITY_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lg"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <tool.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-bold text-slate-900">{tool.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{tool.description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-600">
                Open tool →
              </span>
            </Link>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-bold text-slate-900">Household Financial Tools</h2>
        <p className="mt-1 text-sm text-slate-500">
          Everyday calculators for the household, not just the trading desk.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {HOUSEHOLD_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-lg"
            >
              <h3 className="text-base font-bold text-slate-900">{tool.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{tool.description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-600">
                Open calculator →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-6 text-sm">
          <Link href="/calculators" className="font-medium text-brand-600 hover:underline">
            Trading &amp; financial calculators
          </Link>
          <Link href="/converters" className="font-medium text-brand-600 hover:underline">
            Currency, metals &amp; crypto converter
          </Link>
          <Link href="/learn" className="font-medium text-brand-600 hover:underline">
            Learn the formulas in OmniFin Academy
          </Link>
          <Link href="/blog" className="font-medium text-brand-600 hover:underline">
            Read the OmniFin Guides
          </Link>
        </div>
      </section>
    </div>
  );
}
