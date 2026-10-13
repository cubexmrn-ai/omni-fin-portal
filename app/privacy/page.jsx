// app/privacy/page.jsx
//
// Static Privacy Policy page — the standard set of disclosures a site
// serving Google AdSense needs: what data is collected (including
// localStorage usage for Academy progress, Community Forum drafts, and
// vote/Bullseye state — all client-side-only, never transmitted to a
// server, which this policy says explicitly), cookies/ads/analytics,
// third-party data providers, user rights, and children's-privacy
// language. Pure server component — static legal text.

import Link from "next/link";
import LegalNoticeBanner from "@/components/LegalNoticeBanner";
import { buildMetadata } from "@/lib/pageMetadata";

export const metadata = buildMetadata({
  title: "Privacy Policy | OmniFin Portal",
  description:
    "How OmniFin Portal collects, uses, and protects information — including local-storage-only features, third-party market-data providers, cookies and advertising, and your rights.",
  path: "/privacy",
});

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Privacy Policy</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Last updated: October 2026. This policy explains what
            information OmniFin Portal collects, how it&apos;s used, and the
            choices you have.
          </p>
          <LegalNoticeBanner />
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-sm leading-relaxed text-slate-600 sm:px-6 lg:px-8">
        <Section title="1. Information we collect">
          <p>OmniFin Portal collects information in three ways:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <span className="font-medium text-slate-700">
                Local-storage-only data (never sent to our servers).
              </span>{" "}
              Features like OmniFin Academy progress tracking, Community
              Forum vote and &quot;Bullseye Setup&quot; tag state, and
              user-submitted Community Forum posts are stored entirely
              in your browser&apos;s local storage. This data stays on your
              device, is never transmitted to OmniFin Portal or any
              third party, and is cleared if you clear your browser&apos;s
              site data.
            </li>
            <li>
              <span className="font-medium text-slate-700">
                Automatically collected technical data.
              </span>{" "}
              Like most websites, our hosting and analytics
              infrastructure may automatically log standard technical
              information such as IP address, browser type, device
              type, pages visited, and referring URLs, for security,
              performance, and aggregate usage-analytics purposes.
            </li>
            <li>
              <span className="font-medium text-slate-700">
                Information you voluntarily provide.
              </span>{" "}
              If you submit a post in the Community Forum or otherwise
              contact us, we process the content you choose to share.
              Community posts in the current version of this site are
              stored locally in your browser only (see above) rather
              than on a server-side database.
            </li>
          </ul>
        </Section>

        <Section title="2. Cookies and similar technologies">
          <p>
            OmniFin Portal may use cookies and browser local storage to
            remember your preferences, keep site features (like Academy
            progress) working across visits, and to support advertising
            and analytics as described below. You can control or delete
            cookies through your browser settings; disabling cookies may
            affect some site features.
          </p>
        </Section>

        <Section title="3. Advertising">
          <p>
            OmniFin Portal may display advertisements served by
            third-party advertising networks, including Google AdSense.
            These networks may use cookies and similar technologies to
            serve ads based on your prior visits to this and other
            websites. You can learn more about how Google uses
            information from sites that use its services, and opt out of
            personalized advertising, via Google&apos;s own Ads Settings and
            policies. We do not control the privacy practices of
            third-party advertising networks and encourage you to review
            their policies directly.
          </p>
        </Section>

        <Section title="4. Third-party data providers">
          <p>
            Exchange rates, cryptocurrency prices, metals/commodity
            prices, news headlines, and similar content displayed on
            this site are retrieved from third-party data providers.
            Requests to these providers are made server-side by OmniFin
            Portal&apos;s own infrastructure, not directly from your browser,
            so these providers do not independently receive your
            personal browsing data as a result of using our converters
            or calculators.
          </p>
        </Section>

        <Section title="5. Analytics">
          <p>
            We may use standard web analytics tools to understand
            aggregate site usage (such as which pages are visited and
            how often) in order to improve the site. Analytics data is
            generally aggregated and not used to personally identify
            individual visitors.
          </p>
        </Section>

        <Section title="6. Children&apos;s privacy">
          <p>
            OmniFin Portal is not directed at children under the age of
            13, and we do not knowingly collect personal information
            from children under 13. If you believe a child has provided
            us with personal information, please contact us so we can
            take appropriate action.
          </p>
        </Section>

        <Section title="7. Your choices and rights">
          <p>
            You can clear any locally-stored data (Academy progress,
            Community Forum state, submitted posts) at any time by
            clearing your browser&apos;s site data for OmniFin Portal.
            Depending on your jurisdiction, you may also have additional
            rights regarding any personal information we process, such
            as the right to request access to, correction of, or
            deletion of that information.
          </p>
        </Section>

        <Section title="8. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time to
            reflect changes to our practices or for legal, operational,
            or regulatory reasons. We&apos;ll update the &quot;Last updated&quot; date
            above when we do. See also our{" "}
            <Link
              href="/terms"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/disclaimer"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Financial Disclaimer
            </Link>
            .
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            If you have questions about this Privacy Policy, you can
            reach out through the contact details provided on this
            site.
          </p>
        </Section>
      </section>
    </>
  );
}
