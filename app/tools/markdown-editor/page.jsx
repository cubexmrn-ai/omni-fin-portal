import Link from "next/link";
import MarkdownEditorTool from "@/components/tools/MarkdownEditorTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Live Markdown Editor & Previewer | OmniFin Portal",
  description:
    "Write Markdown with a live side-by-side preview, then export as a .md or standalone .html file. Supports headings, bold/italic, lists, links, code blocks, and blockquotes — entirely in your browser.",
  path: "/tools/markdown-editor",
});

const FAQS = [
  {
    question: "Is my document saved anywhere while I type?",
    answer:
      "No — everything lives only in your browser tab's memory while you're editing. Nothing is uploaded or auto-saved to a server, so be sure to download your work (as .md or .html) before closing or refreshing the page.",
  },
  {
    question: "Does this support full Markdown syntax?",
    answer:
      "It covers the Markdown syntax people use most often: headings, bold, italic, inline code, fenced code blocks, links, images, blockquotes, horizontal rules, and ordered/unordered lists. It's a lightweight renderer, not a full CommonMark implementation, so some rarer or more exotic syntax may render differently than in other tools.",
  },
  {
    question: "What's the difference between the .md and .html export?",
    answer:
      "The .md download is your raw Markdown source, editable in any text editor or Markdown tool. The .html download is the rendered preview wrapped in a standalone HTML file, viewable directly in any browser without needing a Markdown renderer.",
  },
];

export default function MarkdownEditorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/markdown-editor"
        name="OmniFin Live Markdown Editor"
        description="Free client-side Markdown editor with live preview, exporting to .md or standalone .html."
        featureList={["Live side-by-side preview", "Headings, lists, links, code blocks, blockquotes", "Export as .md or .html", "100% client-side"]}
        faqs={FAQS}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/tools" className="hover:text-brand-600">
              Tools
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Markdown Editor</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Live Markdown Editor &amp; Previewer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Write in Markdown on the left, see the formatted result instantly on the right, then
            export as .md or standalone .html.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <MarkdownEditorTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">Markdown syntax quick reference</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Syntax</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Renders as</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600"># Heading</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Heading level 1</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">**bold**</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600"><strong>bold</strong></td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">*italic*</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600"><em>italic</em></td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">- item</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Bulleted list item</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 font-mono text-xs text-slate-600">[text](url)</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Hyperlink</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A live Markdown editor renders Markdown syntax — headings, bold/italic text, lists, links, and code blocks — into formatted HTML in real time as you type, shown side by side with the raw source. This tool runs entirely in your browser and lets you export the result as either a raw .md file or a standalone .html file." />
        </div>

        <FAQAccordion title="Markdown Editor — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/word-counter", label: "Word Counter" },
            { href: "/tools/case-converter", label: "Case Converter" },
            { href: "/blog", label: "OmniFin Guides" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
