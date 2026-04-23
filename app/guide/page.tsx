import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { itemListSchema } from '@/lib/schema';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sunpowerpeek.com';

export const metadata: Metadata = {
  title: 'Solar Energy Guides — Cost Per Watt, ITC 30%, Degradation, Grid Types, Community Solar',
  description: 'In-depth guides on residential solar economics — cost per watt by state, the 30% federal tax credit, panel degradation, on-grid vs off-grid, and community solar.',
  alternates: { canonical: '/guide/' },
  openGraph: { url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();

  const listJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Solar Energy Guides',
    url: `${SITE_URL}/guide/`,
    numberOfItems: guides.length,
    itemListElement: guides.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.title,
      url: `${SITE_URL}/guide/${g.slug}/`,
    })),
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Solar Energy Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, data-backed guides on residential solar economics — installation costs by state,
          the 30% federal tax credit, panel degradation over time, grid connection options, and
          community solar programs. Every guide links to our state and ZIP code data so you can see
          exactly how the numbers apply to your location.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
