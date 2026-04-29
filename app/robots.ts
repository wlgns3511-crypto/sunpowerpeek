import type { MetadataRoute } from 'next';

const SITE_URL = 'https://sunpowerpeek.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /embed/, /zip/, /compare/, /es/, /state/{slug}/roi-by-system-size/
        // all return HTTP 410 via middleware (HCU Phase C 2026-04-25).
        disallow: ['/api/', '/_next/'],
      },
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
      { userAgent: 'MJ12bot', disallow: '/' },
      { userAgent: 'DotBot', disallow: '/' },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
