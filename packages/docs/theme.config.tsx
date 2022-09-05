import type { DocsThemeConfig } from "nextra-theme-docs";
const config: DocsThemeConfig = {
  logo: <strong>Next Fetch</strong>,
  github: "https://github.com/vercel-labs/next-fetch",
  titleSuffix: " | Next Fetch",
  docsRepositoryBase: `https://github.com/vercel-labs/next-fetch/blob/main/packages/docs`,
  unstable_faviconGlyph: "🕊️",
  head: function Head() {
    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Next Fetch" />
      </>
    );
  },
};
export default config;
