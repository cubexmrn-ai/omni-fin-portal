import Link from "next/link";
import PdfTableExtractorTool from "@/components/tools/PdfTableExtractorTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "PDF Table Extractor — Convert PDF Tables to CSV | OmniFin Portal",
  description:
    "Extract tabular data from a PDF directly in your browser and export it as a CSV file. No upload to any server — pull a table out of a statement, invoice, or report in seconds.",
  path: "/tools/pdf-table-extractor",
});

const FAQS = [
  {
    question: "Is my PDF uploaded to a server?",
    answer:
      "No. The file is parsed entirely in your browser using the pdf.js library — it never leaves your device. Nothing is sent anywhere, and nothing is stored once you close the tab.",
  },
  {
    question: "Why are some columns or rows misaligned?",
    answer:
      "This tool reconstructs tables from the raw position of each piece of text on the page, since PDFs don't store an actual table structure — so alignment is a best estimate, not guaranteed. Every cell in the preview is editable, so you can fix anything before exporting.",
  },
  {
    question: "Why did it find no table at all?",
    answer:
      "If a page is a scanned image rather than real, selectable text, there's no text layer for the tool to read — this is a text-extraction tool, not OCR. Try selecting a different page, or a PDF that was generated digitally rather than scanned.",
  },
  {
    question: "Can I extract a table that spans multiple pages?",
    answer:
      "Yes — choose \"All pages\" in the page selector to combine every page's rows into one table before exporting.",
  },
];

export default function PdfTableExtractorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/pdf-table-extractor"
        name="OmniFin PDF Table Extractor"
        description="Free client-side PDF table extractor — pulls tabular data out of a PDF and exports it as CSV, entirely in the browser, no server upload."
        featureList={[
          "Upload any text-based PDF",
          "Extract a single page or all pages",
          "Editable preview before export",
          "Export as CSV",
          "100% client-side",
        ]}
        faqs={FAQS}
        applicationCategory="BusinessApplication"
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/tools" className="hover:text-brand-600">
              Tools
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">PDF Table Extractor</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            PDF Table Extractor
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Pull tabular data out of a PDF and export it as a CSV file — right in your browser, no
            upload, no wait.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PdfTableExtractorTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">How this works</h2>
          <p className="mt-3">
            A PDF has no real concept of &quot;a table&quot; — every piece of text just sits at an
            (x, y) position on the page. This tool reads those positions with the open-source
            pdf.js library, groups text that shares a similar vertical position into rows, and
            groups text that shares a similar horizontal position into columns, reconstructing a
            grid you can edit and export.
          </p>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A PDF table extractor pulls structured, tabular data out of a PDF so it can be exported as a CSV file. This tool does it entirely in your browser — reading each text run's position on the page to reconstruct rows and columns — without uploading the PDF to any server." />
        </div>

        <FAQAccordion title="PDF Table Extractor — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/document-summarizer", label: "AI Document Summarizer" },
            { href: "/tools/json-formatter", label: "JSON Formatter" },
            { href: "/blog", label: "OmniFin Guides" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
