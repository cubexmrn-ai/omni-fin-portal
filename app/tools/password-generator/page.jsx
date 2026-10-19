import Link from "next/link";
import PasswordGeneratorTool from "@/components/tools/PasswordGeneratorTool";
import ToolStructuredData from "@/components/tools/ToolStructuredData";
import RelatedTools from "@/components/tools/RelatedTools";
import AeoCallout from "@/components/blog/AeoCallout";
import FAQAccordion from "@/components/FAQAccordion";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Secure Password Generator | OmniFin Portal",
  description:
    "Generate strong, random passwords using your browser's cryptographically secure random number generator (Web Crypto API). Adjustable length and character sets — nothing is sent over the network.",
  path: "/tools/password-generator",
});

const FAQS = [
  {
    question: "Is this password generator actually secure?",
    answer:
      "It uses the Web Crypto API's crypto.getRandomValues(), a cryptographically secure pseudo-random number generator built into every modern browser — the same category of randomness source used for cryptographic keys, not the weaker Math.random() function some simpler generators rely on.",
  },
  {
    question: "Are generated passwords sent to a server or stored anywhere?",
    answer:
      "No. The entire generation process runs in your browser's memory. Nothing is transmitted over the network, logged, or saved — closing or refreshing the page discards the password permanently unless you've copied it.",
  },
  {
    question: "How long should my password be?",
    answer:
      "Longer is generally stronger. 16 characters with a mix of uppercase, lowercase, numbers, and symbols is a reasonable baseline for most accounts; 20+ characters is a common recommendation for anything protecting financial or highly sensitive accounts.",
  },
  {
    question: "Should I reuse the same generated password across sites?",
    answer:
      "No — reusing passwords means a breach on one site can expose your account everywhere else that password is used. Generate a unique password for each account, ideally stored in a dedicated password manager rather than memorized or reused.",
  },
];

export default function PasswordGeneratorPage() {
  return (
    <>
      <ToolStructuredData
        path="/tools/password-generator"
        name="OmniFin Secure Password Generator"
        description="Free client-side password generator using the Web Crypto API (crypto.getRandomValues) with adjustable length and character sets."
        featureList={["Cryptographically secure randomness", "Adjustable length (6-64 characters)", "Toggle uppercase/lowercase/numbers/symbols", "Strength indicator", "100% client-side"]}
        faqs={FAQS}
      />

      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/tools" className="hover:text-brand-600">
              Tools
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Password Generator</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Secure Password Generator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Cryptographically random passwords, generated entirely on your device — nothing is ever
            transmitted or stored.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <PasswordGeneratorTool />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-card">
          <h2 className="text-base font-bold text-slate-900">What makes a password strong</h2>
          <p className="mt-3">
            Password strength comes down to two things: length and the size of the character pool
            each position is drawn from. A longer password drawn from a larger pool (uppercase +
            lowercase + numbers + symbols) has exponentially more possible combinations for an
            attacker to guess than a shorter password drawn from a smaller pool.
          </p>

          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Length</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Character sets</th>
                  <th className="border-b border-slate-200 px-4 py-2 font-bold text-slate-900">Relative strength</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">8</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Lowercase only</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Weak</td>
                </tr>
                <tr className="bg-slate-50/60">
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">12</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Upper + lower + numbers</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Fair</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">16+</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Upper + lower + numbers + symbols</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-slate-600">Strong to very strong</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <AeoCallout answer="A secure password generator should use a cryptographically secure random number source — like the Web Crypto API's crypto.getRandomValues(), which this tool uses — rather than Math.random(), which isn't designed to be unpredictable enough for security purposes. Combining at least 16 characters with uppercase, lowercase, numbers, and symbols produces a password that's extremely difficult to guess or brute-force." />
        </div>

        <FAQAccordion title="Password Generator — FAQs" items={FAQS} />

        <RelatedTools
          items={[
            { href: "/tools/base64-encoder", label: "Base64 Encoder/Decoder" },
            { href: "/tools/json-formatter", label: "JSON Formatter" },
            { href: "/learn", label: "OmniFin Academy" },
            { href: "/tools", label: "All Tools" },
          ]}
        />
      </section>
    </>
  );
}
