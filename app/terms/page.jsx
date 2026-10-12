// app/terms/page.jsx
//
// Static Terms of Service page — standard acceptable-use, no-warranty,
// limitation-of-liability, and intellectual-property terms for a free
// finance-utilities site carrying third-party ads (Google AdSense) and
// user-generated content (the Community Forum). Pure server component.

import Link from "next/link";

export const metadata = {
  title: "Terms of Service | OmniFin Portal",
  description:
    "The terms governing your use of OmniFin Portal's converters, calculators, market analysis, news, Academy, and Community Forum.",
};

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="text-xs text-slate-400">
            <Link href="/" className="hover:text-brand-600">
              Dashboard
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-500">Terms of Service</span>
          </nav>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Terms of Service
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Last updated: October 2026. By using OmniFin Portal, you
            agree to the terms below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-sm leading-relaxed text-slate-600 sm:px-6 lg:px-8">
        <Section title="1. Acceptance of terms">
          <p>
            By accessing or using OmniFin Portal (the "Site"), you agree
            to be bound by these Terms of Service, our{" "}
            <Link
              href="/privacy"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Privacy Policy
            </Link>
            , and our{" "}
            <Link
              href="/disclaimer"
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Financial Disclaimer
            </Link>
            . If you do not agree to these terms, please do not use the
            Site.
          </p>
        </Section>

        <Section title="2. Description of service">
          <p>
            OmniFin Portal provides free currency, metals/commodities,
            and unit converters; trading and personal-finance
            calculators; market data and analysis tools; a news feed; an
            educational Academy; and a Community Forum for discussion.
            All content is provided for educational and informational
            purposes only, as described in our Financial Disclaimer —
            nothing on the Site is financial, investment, trading,
            legal, or tax advice.
          </p>
        </Section>

        <Section title="3. Eligibility">
          <p>
            You must be at least 13 years old to use the Site. By using
            the Site, you represent that you meet this requirement and
            that your use of the Site complies with all laws applicable
            to you.
          </p>
        </Section>

        <Section title="4. Acceptable use">
          <p>
            You agree not to: use the Site for any unlawful purpose;
            attempt to interfere with, disrupt, or gain unauthorized
            access to the Site, its infrastructure, or its data sources;
            scrape or systematically extract data from the Site other
            than through normal, individual browsing; impersonate any
            person or entity; or submit content to the Community Forum
            that is defamatory, harassing, fraudulent, infringing, or
            otherwise unlawful.
          </p>
        </Section>

        <Section title="5. User-generated content (Community Forum)">
          <p>
            If you submit a post, trade setup, or other content to the
            Community Forum, you remain solely responsible for that
            content. You represent that you have the right to share it,
            and you grant OmniFin Portal a non-exclusive, royalty-free
            license to display it on the Site for as long as it remains
            posted. OmniFin Portal does not endorse, verify, or guarantee
            any user-submitted content and may remove content that
            violates these Terms, at its discretion. In the current
            version of the Site, Community Forum posts you submit are
            stored in your own browser&apos;s local storage rather than on a
            central server — see our Privacy Policy for detail.
          </p>
        </Section>

        <Section title="6. Intellectual property">
          <p>
            The Site&apos;s design, code, calculators, and original written
            content are the property of OmniFin Portal or its licensors
            and are protected by applicable intellectual-property laws.
            You may use the Site for personal, non-commercial purposes;
            you may not copy, reproduce, or redistribute the Site&apos;s
            underlying code or design without permission. Market data,
            news content, and similar material displayed on the Site may
            be owned by the respective third-party providers credited or
            implied as its source.
          </p>
        </Section>

        <Section title="7. Third-party links and advertising">
          <p>
            The Site may display advertisements and links to third-party
            websites, including through Google AdSense. OmniFin Portal
            does not control and is not responsible for the content,
            accuracy, or practices of any third-party site or
            advertiser. Your interactions with any third-party site or
            advertiser are solely between you and that third party.
          </p>
        </Section>

        <Section title="8. No warranty">
          <p>
            The Site and all content on it are provided "as is" and "as
            available," without warranties of any kind, express or
            implied, including but not limited to warranties of
            accuracy, merchantability, fitness for a particular purpose,
            or non-infringement. We do not warrant that the Site will be
            uninterrupted, error-free, or free of harmful components.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the fullest extent permitted by law, OmniFin Portal and
            its operators will not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or
            any loss of profits or financial loss, arising from your use
            of, or inability to use, the Site — including any decision
            made in reliance on a calculator result, converter rate,
            market analysis, news item, or Community Forum post.
          </p>
        </Section>

        <Section title="10. Changes to the Site and these Terms">
          <p>
            We may modify, suspend, or discontinue any part of the Site
            at any time, and may update these Terms from time to time.
            We&apos;ll update the "Last updated" date above when we do.
            Continued use of the Site after a change constitutes
            acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="11. Governing law">
          <p>
            These Terms are governed by applicable law without regard to
            conflict-of-law principles, and any dispute arising from
            your use of the Site will be subject to the exclusive
            jurisdiction of the competent courts, except where
            applicable law provides otherwise.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            If you have questions about these Terms, you can reach out
            through the contact details provided on this site.
          </p>
        </Section>
      </section>
    </>
  );
}
