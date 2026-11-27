/**
 * Central brand asset configuration.
 *
 * The logo is managed from ONE folder:
 *   public/images/branding/logo/
 *
 * Drop the approved artwork there using one of the filenames below and refresh
 * the site — no React component or path needs editing. The header, footer and
 * auth screens all read the logo through <Logo /> which reads this file.
 *
 * If neither file exists, the component renders the original text/emblem
 * lockup, so the site never shows a broken image.
 */

export const BRAND = {
  name: "LEO JEWELS",
  shortName: "Leo Jewels",
  tagline: "Where elegance meets eternity",
  logo: {
    /** Folder the brand team manages manually. */
    directory: "/images/branding/logo",
    /** Tried in order; SVG is preferred for crispness at every size. */
    sources: [
      "/images/branding/logo/leo-jewels-logo.svg",
      "/images/branding/logo/leo-jewels-logo.png",
    ],
    preferredFilename: "leo-jewels-logo.svg",
    alternates: ["leo-jewels-logo.svg", "leo-jewels-logo.png"],
    alt: "LEO JEWELS — fine jewellery logo",
    /** Rendered max height per lockup size. Width follows the natural ratio. */
    maxHeight: { sm: 40, md: 54, lg: 80 },
  },
} as const;

export type BrandLogoSize = keyof typeof BRAND.logo.maxHeight;
