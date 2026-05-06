import { PUBLISHER, EDITORIAL_TEAM, SOURCE_AUTHORITIES, ENTITY_VINTAGE } from './authorship';

const SITE_NAME = 'SunPowerPeek';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sunpowerpeek.com';

const PUBLISHER_NODE = { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url };
const EDITORIAL_NODE = {
  '@type': 'Organization',
  name: EDITORIAL_TEAM.name,
  url: EDITORIAL_TEAM.url,
  parentOrganization: PUBLISHER_NODE,
};

type DatasetSchemaOpts = {
  spatialCoverage?: string;
  variableMeasured?: string[];
  vintage?: string;
};

export function datasetSchema(
  nameOrReviewedAt?: string,
  description?: string,
  opts: DatasetSchemaOpts = {},
) {
  // Back-compat: original signature was datasetSchema(reviewedAt?: string).
  // If the first arg looks like a date (ISO YYYY-MM-DD) and there's no
  // description, treat it as the legacy reviewedAt.
  const isLegacyCall =
    typeof nameOrReviewedAt === 'string' &&
    description === undefined &&
    /^\d{4}-\d{2}-\d{2}$/.test(nameOrReviewedAt);

  const name = isLegacyCall || !nameOrReviewedAt
    ? 'US Solar Panel Efficiency, Costs & Savings by State and ZIP Code'
    : nameOrReviewedAt;
  const desc = isLegacyCall || !description
    ? 'Solar panel costs, savings, incentives, and efficiency data for all 50 US states and 500+ ZIP codes based on NREL PVWatts, DSIRE incentive database, EIA retail rates, and IRS Form 5695 ITC math.'
    : description;
  const dateModified = isLegacyCall ? nameOrReviewedAt : (opts.vintage ?? ENTITY_VINTAGE);

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description: desc,
    url: SITE_URL,
    creator: PUBLISHER_NODE,
    publisher: PUBLISHER_NODE,
    sourceOrganization: SOURCE_AUTHORITIES.map(s => ({
      '@type': 'Organization',
      name: s.name,
      url: s.url,
    })),
    isBasedOn: SOURCE_AUTHORITIES.map(s => s.url),
    reviewedBy: EDITORIAL_NODE,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    temporalCoverage: '2024/2026',
    dateModified,
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: `${SITE_URL}/` },
    spatialCoverage: {
      '@type': 'Place',
      name: opts.spatialCoverage ?? 'United States',
    },
    variableMeasured: (opts.variableMeasured ?? [
      'Peak Sun Hours (hours per day)',
      'System Cost per Watt (USD per watt)',
      '20-Year Savings (USD)',
      'Federal ITC (30%, IRS Form 5695)',
      'Net Metering Policy',
    ]).map(label => {
      const m = label.match(/^(.+?)\s*\(([^)]+)\)$/);
      return m
        ? { '@type': 'PropertyValue', name: m[1].trim(), unitText: m[2].trim() }
        : { '@type': 'PropertyValue', name: label };
    }),
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
