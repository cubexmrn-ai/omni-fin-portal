import Link from "next/link";
import CaseConverterTool from "@/components/tools/CaseConverterTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Case Converter & Slugify Tool | OmniFin Portal",
  description:
    "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, or a URL-safe slug — instantly, entirely in your browser.",
  path: "/tools/case-converter",
});

const FAQS = [
  {
    question: "What is a 'slug' and why would I need one?",
    answer:
      "A slug is a URL-safe version of text — lowercase, with spaces and special characters replaced by hyphens — commonly used for blog post URLs, file names, and identifiers. For example, 'Weekly Market Update!' becomes 'weekly-market-update'.",
  },
  {
    question: "What's the difference between camelCase and PascalCase?",
    answer:
      "camelCase starts with a lowercase letter (e.g. 'marketAnalysis'); PascalCase starts with an uppercase letter (e.g. 'MarketAnalysis'). Both are common variable/class naming conventions in programming.",
  },
  {
    question: "Does this tool store the text I convert?",
    answer:
      "No — all conversions happen with plain JavaScript string functions directly in your browser. Nothing is sent to a server or saved anywhere.",
  },
];

export default function CaseConverterPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/case-converter"
        name="OmniFin Case Converter & Slugify Tool"
        description="Free client-side text case converter: uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, and slug."
        featureList={["8 case conversion formats", "URL-safe slug generator", "One-click copy", "100% client-side"]}
        faqs={FAQS}
        applicationCategory="UtilitiesApplication"
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/tools" className="hover:text-brand-600">
              Tools
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Case Converter</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Case Converter &amp; Slugify Tool
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Switch any text between eight common cases — including a URL-safe slug — in one click.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <CaseConverterTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">Case format reference</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Format</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Example</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Common use</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">UPPERCASE</td>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">MARKET UPDATE</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Headlines, emphasis</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Title Case</td>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">Market Update</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Titles, headings</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">camelCase</td>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">marketUpdate</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">JavaScript variables</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">snake_case</td>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">market_update</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Python, database columns</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">kebab-case / slug</td>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">market-update</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">URLs, file names</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A case converter instantly rewrites text into a chosen format — UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, or a URL-safe kebab-case slug — using plain string transformations in your browser, with no text ever uploaded to a server." />
        </div>

        <FAQAccordion title="Case Converter — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/word-counter", label: "Word Counter" },
            { href: "/tools/base64-encoder", label: "Base64 Encoder/Decoder" },
            { href: "/tools/json-formatter", label: "JSON Formatter" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
