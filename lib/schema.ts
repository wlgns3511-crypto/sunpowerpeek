import { PUBLISHER, EDITORIAL_TEAM } from './authorship';

const SITE_NAME = 'SunPowerPeek';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sunpowerpeek.com';

export function datasetSchema(reviewedAt?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'US Solar Panel Efficiency, Costs & Savings by State and ZIP Code',
    description: 'Solar panel costs, savings, incentives, and efficiency data for all 50 US states and 500+ ZIP codes based on NREL data.',
    url: SITE_URL,
    creator: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    temporalCoverage: '2026',
    ...(reviewedAt && { dateModified: reviewedAt }),
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: `${SITE_URL}/` },
    spatialCoverage: {
      '@type': 'Place',
      name: 'United States',
    },
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'Peak Sun Hours', unitText: 'hours per day' },
      { '@type': 'PropertyValue', name: 'System Cost per Watt', unitText: 'USD per watt' },
      { '@type': 'PropertyValue', name: '20-Year Savings', unitText: 'USD' },
    ],
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function webPageSchema(title: string, description: string, url: string, reviewedAt?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `${SITE_URL}${url}`,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(reviewedAt && { dateModified: reviewedAt }),
  };
}

export function itemListSchema(name: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${SITE_URL}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${SITE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}
