import Link from "next/link";
import ImageCompressorTool from "@/components/tools/ImageCompressorTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Image Compressor & Resizer | OmniFin Portal",
  description:
    "Compress and resize JPEG, PNG, or WebP images directly in your browser — adjustable quality and max width, with before/after file size comparison. No upload to any server.",
  path: "/tools/image-compressor",
});

const FAQS = [
  {
    question: "Is my image uploaded to a server?",
    answer:
      "No. The image is decoded and re-encoded entirely in your browser using the HTML Canvas API — it never leaves your device. This also means it works even on a slow connection, since there's nothing to upload or download.",
  },
  {
    question: "Which format should I choose — JPEG, WebP, or PNG?",
    answer:
      "JPEG and WebP use lossy compression and produce the smallest files for photos; WebP typically compresses smaller than JPEG at the same visual quality. PNG is lossless and best for images with sharp edges, text, or transparency, but produces larger files for photos.",
  },
  {
    question: "Why does my compressed image still look large?",
    answer:
      "Try lowering the quality slider and reducing the max width — both significantly affect file size. PNG ignores the quality slider entirely, since PNG compression is lossless and doesn't have a quality setting.",
  },
  {
    question: "Does resizing reduce image quality?",
    answer:
      "Reducing dimensions (max width) removes pixel data and can't be undone, but for most web use cases, a smaller image displayed at its natural size looks identical to the original — the quality loss only becomes visible if you try to display it larger than its new resolution.",
  },
];

// Same 4 steps the visible "How to use" list below shows — kept as one
// array so the schema can never drift from what the page actually
// displays (Oct 2026 GSC content-depth pass).
const HOW_TO_STEPS = [
  { name: "Choose an image", text: "Click to select a JPEG, PNG, or WebP image from your device." },
  { name: "Set max width and format", text: "Set the max width in pixels and pick an output format (JPEG, WebP, or lossless PNG)." },
  { name: "Adjust quality", text: "Drag the quality slider to balance file size against visual quality." },
  { name: "Compress and download", text: "Click \"Compress\", review the before/after file size, then download the result." },
];

export default function ImageCompressorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/image-compressor"
        name="OmniFin Image Compressor & Resizer"
        description="Free client-side image compressor and resizer (JPEG, WebP, PNG) using the Canvas API — no server upload."
        featureList={["Resize to a max width", "Adjustable compression quality", "JPEG, WebP, and PNG output", "Before/after file size comparison", "100% client-side"]}
        faqs={FAQS}
        howTo={{ name: "How to use the Image Compressor & Resizer", steps: HOW_TO_STEPS }}
        applicationCategory="MultimediaApplication"
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/tools" className="hover:text-brand-600">
              Tools
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Image Compressor</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Image Compressor &amp; Resizer
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Shrink an image&apos;s file size and dimensions right in your browser — no upload, no wait.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <ImageCompressorTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">How to use the image compressor</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {HOW_TO_STEPS.map((step) => (
              <li key={step.name}>{step.text}</li>
            ))}
          </ol>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">How client-side compression works</h2>
          <p className="mt-3">
            The browser decodes your chosen image into memory, draws it onto an off-screen canvas
            at the max width you set (scaling height to preserve the original aspect ratio), then
            re-encodes that canvas into a new file at the quality level you choose. This is the same
            underlying technique desktop image editors use — just running locally in your browser
            instead of a native app or a server.
          </p>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Format</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Compression</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">JPEG</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Lossy</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Photos, wide compatibility</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">WebP</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Lossy</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Photos, smaller than JPEG at same quality</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">PNG</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Lossless</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Logos, text, transparency</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="An image compressor reduces a photo's file size by re-encoding it at a lower quality setting and/or smaller pixel dimensions. This tool does that entirely in your browser using the Canvas API — the image is never uploaded to a server — letting you choose the output format (JPEG, WebP, or lossless PNG), quality level, and maximum width before downloading the result." />
        </div>

        <FAQAccordion title="Image Compressor — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/markdown-editor", label: "Markdown Editor" },
            { href: "/tools/word-counter", label: "Word Counter" },
            { href: "/blog", label: "OmniFin Guides" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
