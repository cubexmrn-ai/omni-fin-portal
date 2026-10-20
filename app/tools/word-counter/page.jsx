import Link from "next/link";
import WordCounterTool from "@/components/tools/WordCounterTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Word Counter — Words, Characters & Reading Time | OmniFin Portal",
  description:
    "Free online word counter: live word count, character count (with and without spaces), sentence and paragraph count, and estimated reading time. Runs entirely in your browser.",
  path: "/tools/word-counter",
});

const FAQS = [
  {
    question: "Does this word counter store or upload my text?",
    answer:
      "No. The counting runs entirely in your browser using JavaScript — nothing you type is sent to a server, logged, or stored anywhere, including after you close or refresh the page.",
  },
  {
    question: "How is the reading time estimated?",
    answer:
      "It divides your word count by 225, a commonly cited average adult silent-reading speed in words per minute, then rounds up to the nearest minute. Actual reading speed varies by person and by how dense the text is.",
  },
  {
    question: "How are sentences and paragraphs counted?",
    answer:
      "Sentences are counted by splitting text on sentence-ending punctuation (., !, ?). Paragraphs are counted by splitting on blank lines. Both are close approximations — unusual punctuation or formatting can occasionally throw off the count by one or two.",
  },
  {
    question: "Is there a limit to how much text I can paste in?",
    answer:
      "No hard limit is enforced, but extremely large documents (hundreds of thousands of words) may slow down typing responsiveness in some browsers, since every keystroke recalculates all five stats.",
  },
];

export default function WordCounterPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/word-counter"
        name="OmniFin Word Counter"
        description="Free client-side word, character, sentence, and paragraph counter with reading-time estimate."
        featureList={["Live word & character count", "Sentence & paragraph count", "Reading-time estimate", "100% client-side, no upload"]}
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
            <span className="text-slate-500">Word Counter</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Word &amp; Character Counter
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Instant word, character, sentence, and paragraph counts with a reading-time estimate —
            nothing you type ever leaves your browser.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <WordCounterTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">How to use the word counter</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Paste or type your text into the box above.</li>
            <li>Watch the five stat tiles update instantly as you type — no button to press.</li>
            <li>Use the reading-time estimate to gauge how long a piece will take an average reader.</li>
            <li>Click &ldquo;Clear text&rdquo; to start over.</li>
          </ol>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Metric</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">How it&apos;s counted</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Words</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Text split on whitespace</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Characters</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Every character, including spaces</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Reading time</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Words ÷ 225 words/minute</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Formula used:</p>
            <p className="mt-1 font-mono text-sm font-bold text-brand-700">
              Reading Time (minutes) = Word Count ÷ 225
            </p>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="This free word counter instantly shows your word count, character count (with and without spaces), sentence count, paragraph count, and estimated reading time as you type — all calculated directly in your browser with no upload, no sign-up, and no limit on text length." />
        </div>

        <FAQAccordion title="Word Counter — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/case-converter", label: "Case Converter" },
            { href: "/tools/markdown-editor", label: "Markdown Editor" },
            { href: "/blog", label: "OmniFin Guides" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
