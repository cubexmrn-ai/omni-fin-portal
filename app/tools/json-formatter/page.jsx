import Link from "next/link";
import JsonFormatterTool from "@/components/tools/JsonFormatterTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "JSON Formatter, Validator & Minifier | OmniFin Portal",
  description:
    "Free online JSON formatter and validator — pretty-print, minify, and validate JSON instantly in your browser, with clear error messages for invalid syntax. No upload, no server round-trip.",
  path: "/tools/json-formatter",
});

const FAQS = [
  {
    question: "Does this JSON formatter send my data to a server?",
    answer:
      "No. Formatting, minifying, and validation all run locally using the browser's native JSON.parse and JSON.stringify — your JSON never leaves your device.",
  },
  {
    question: "What does the error message tell me?",
    answer:
      "It shows the browser's own JSON parser error, which typically includes the character position of the problem (an unexpected token, a missing comma, an unclosed bracket, etc.) — the same detail you'd get from a browser's developer console.",
  },
  {
    question: "What's the difference between formatting and minifying?",
    answer:
      "Formatting (pretty-printing) adds indentation and line breaks to make JSON human-readable. Minifying strips all unnecessary whitespace to produce the smallest possible valid JSON string, typically used for production payloads.",
  },
  {
    question: "Is there a size limit?",
    answer:
      "No artificial limit is enforced, but very large JSON documents (tens of megabytes) may be slow to parse depending on your device, since parsing happens entirely in your browser's memory.",
  },
];

export default function JsonFormatterPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/json-formatter"
        name="OmniFin JSON Formatter & Validator"
        description="Free client-side JSON formatter, validator, and minifier with clear syntax-error messages."
        featureList={["Pretty-print JSON", "Minify JSON", "Validate with clear error messages", "Copy & download output", "100% client-side"]}
        faqs={FAQS}
        applicationCategory="DeveloperApplication"
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/tools" className="hover:text-brand-600">
              Tools
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">JSON Formatter</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            JSON Formatter, Validator &amp; Minifier
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Paste raw JSON, get a clean, indented version with instant validation — or minify it
            down to the smallest valid string. Nothing is uploaded.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <JsonFormatterTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">How to use the JSON formatter</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Paste your raw or minified JSON into the input box.</li>
            <li>Click &ldquo;Format &amp; Validate&rdquo; for a readable, indented version, or &ldquo;Minify&rdquo; to compress it.</li>
            <li>If the JSON is invalid, a clear error message shows what&apos;s wrong and roughly where.</li>
            <li>Copy the result or download it directly as a .json file.</li>
          </ol>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Action</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Format &amp; Validate</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Parses then re-stringifies with 2-space indentation</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Minify</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Parses then re-stringifies with no whitespace</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A JSON formatter takes raw or minified JSON and re-prints it with consistent indentation so it's readable, while validating the syntax at the same time — any missing comma, unclosed bracket, or stray character produces an immediate, specific error message rather than a silent failure. This tool does both formatting and validation in one step, entirely in your browser." />
        </div>

        <FAQAccordion title="JSON Formatter — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/base64-encoder", label: "Base64 Encoder/Decoder" },
            { href: "/tools/case-converter", label: "Case Converter" },
            { href: "/calculators", label: "Trading Calculator Suite" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
