import Link from "next/link";
import Base64EncoderTool from "@/components/tools/Base64EncoderTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Base64 Encoder & Decoder | OmniFin Portal",
  description:
    "Free online Base64 encoder and decoder with full Unicode support — encode text to Base64 or decode Base64 back to readable text, entirely in your browser.",
  path: "/tools/base64-encoder",
});

const FAQS = [
  {
    question: "What is Base64 encoding used for?",
    answer:
      "Base64 converts binary or text data into a plain ASCII string made up of letters, numbers, and a few symbols, so it can be safely embedded in places that only support plain text — such as JSON payloads, email attachments, URLs, or data embedded directly in HTML/CSS.",
  },
  {
    question: "Does this tool support non-English text and emoji?",
    answer:
      "Yes — it uses the browser's TextEncoder/TextDecoder APIs to convert text to UTF-8 bytes before Base64-encoding, so Arabic, Urdu, Hindi, Chinese, emoji, and any other Unicode text encode and decode correctly, unlike the raw btoa()/atob() functions which only support Latin-1 text.",
  },
  {
    question: "Is Base64 encoding the same as encryption?",
    answer:
      "No. Base64 is a reversible encoding scheme, not encryption — anyone can decode a Base64 string back to its original content with this same tool or any standard library. It provides no confidentiality or security on its own.",
  },
  {
    question: "Why did decoding fail with an error?",
    answer:
      "A 'this doesn't look like valid Base64' error usually means the input has extra whitespace, is missing characters, or simply isn't a Base64 string in the first place — Base64 only uses the characters A-Z, a-z, 0-9, +, /, and = for padding.",
  },
];

export default function Base64EncoderPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/base64-encoder"
        name="OmniFin Base64 Encoder & Decoder"
        description="Free client-side Base64 encoder/decoder with full Unicode (UTF-8) support."
        featureList={["Encode text to Base64", "Decode Base64 to text", "Full Unicode support", "100% client-side"]}
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
            <span className="text-slate-500">Base64 Encoder</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Base64 Encoder &amp; Decoder
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Encode any text to Base64 or decode it back — with full support for non-English scripts
            and emoji, entirely in your browser.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Base64EncoderTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">How Base64 encoding works</h2>
          <p className="mt-3">
            Base64 takes every 3 bytes of input data and represents them as 4 printable ASCII
            characters, using an alphabet of 64 characters (A–Z, a–z, 0–9, +, /) plus = for padding
            when the input length isn&apos;t a multiple of 3 bytes. The result is roughly 33% larger than
            the original data, but is safe to transmit anywhere that only supports plain ASCII text.
          </p>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Input</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Base64 output</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">Hello</td>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">SGVsbG8=</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">OmniFin</td>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">T21uaUZpbg==</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="Base64 encoding converts text or binary data into a plain ASCII string using a 64-character alphabet, making it safe to embed anywhere only plain text is supported — such as JSON, URLs, or email. It's fully reversible and provides no encryption or security on its own; this tool encodes and decodes it instantly in your browser with full Unicode support." />
        </div>

        <FAQAccordion title="Base64 Encoder/Decoder — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/json-formatter", label: "JSON Formatter" },
            { href: "/tools/password-generator", label: "Password Generator" },
            { href: "/tools/case-converter", label: "Case Converter" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
