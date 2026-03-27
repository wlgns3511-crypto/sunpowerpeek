const SITE_NAME = 'SunPowerPeek';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sunpowerpeek.com';

export function datasetSchema() {
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
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
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

export function webPageSchema(title: string, description: string, url: string) {
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
    dateModified: new Date().toISOString(),
  };
}
