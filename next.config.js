/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Canonical-host redirect: every URL this project generates (sitemap
  // entries via lib/siteUrl.js's getSiteUrl(), robots.txt's Sitemap:
  // line, canonical/OG tags) is hardcoded to the `www` host — but
  // Vercel was serving the bare apex domain (omnifinportal.com, no
  // www) directly too, with no redirect between the two. That split
  // the site across two hosts with identical content and no
  // consolidation signal, which is very likely why Google Search
  // Console reported "No referring sitemaps detected" for a
  // URL-prefix property verified on the apex domain: crawling its
  // robots.txt found a Sitemap: line pointing at a DIFFERENT host
  // (www), which GSC doesn't credit as that property's own sitemap.
  //
  // This permanently (308) redirects any request arriving on the bare
  // apex host to the same path on www.omnifinportal.com, so there is
  // exactly one serving host site-wide, matching what every canonical
  // tag and the sitemap already claim. Matched by exact Host header
  // value, so it never fires in local dev (host is localhost) or for
  // www itself (a different exact string).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "omnifinportal.com" }],
        destination: "https://www.omnifinportal.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
