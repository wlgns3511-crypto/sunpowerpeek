import type { Metadata } from "next";
import { searchZips, getTopZipsBySavings } from "@/lib/db";
import { formatCurrency, formatSunHours, getPaybackColor } from "@/lib/format";

export const metadata: Metadata = {
  title: "Search Solar Data by ZIP Code - SunPowerPeek",
  description: "Search solar panel costs, payback periods, and annual savings for any US ZIP code or city.",
  alternates: { canonical: "/search/" },
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

const POPULAR_SEARCHES = [
  "California",
  "Texas",
  "Florida",
  "Arizona",
  "New York",
  "Nevada",
  "Colorado",
  "Hawaii",
];

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const results = query.length >= 2 ? searchZips(query, 50) : [];
  const popular = query ? [] : getTopZipsBySavings(12);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-800 mb-2">Search Solar Data by ZIP Code</h1>
      <p className="text-slate-600 mb-6">
        Find solar panel costs, peak sun hours, and estimated savings for any US ZIP code or city.
      </p>

      <form method="get" action="/search" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="ZIP code, city, or state (e.g. 90210, Austin, California)..."
            autoFocus
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {query && (
        <p className="text-sm text-slate-500 mb-4">
          {results.length > 0
            ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
            : `No results found for "${query}"`}
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-3 mb-10">
          {results.map((z) => (
            <a
              key={z.slug}
              href={`/zip/${z.slug}/`}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
            >
              <div>
                <span className="font-semibold text-orange-800 text-sm">
                  {z.zip_code} {z.city}, {z.state}
                </span>
                <div className="flex gap-4 mt-1 text-xs text-slate-500">
                  <span>Sun: {formatSunHours(z.peak_sun_hours)}/day</span>
                  <span>Savings: {formatCurrency(z.annual_savings)}/yr</span>
                  <span className={`font-medium ${getPaybackColor(z.payback_years)}`}>{z.payback_years}yr payback</span>
                </div>
              </div>
              <span className="text-xs text-orange-600 font-medium">View →</span>
            </a>
          ))}
        </div>
      )}

      {!query && popular.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Top ZIP Codes by Solar Savings</h2>
          <div className="space-y-3">
            {popular.map((z) => (
              <a
                key={z.slug}
                href={`/zip/${z.slug}/`}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
              >
                <div>
                  <span className="font-semibold text-orange-800 text-sm">
                    {z.zip_code} {z.city}, {z.state}
                  </span>
                  <div className="flex gap-4 mt-1 text-xs text-slate-500">
                    <span>Sun: {formatSunHours(z.peak_sun_hours)}/day</span>
                    <span>Savings: {formatCurrency(z.annual_savings)}/yr</span>
                    <span className={`font-medium ${getPaybackColor(z.payback_years)}`}>{z.payback_years}yr payback</span>
                  </div>
                </div>
                <span className="text-xs text-orange-600 font-medium">View →</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map((term) => (
            <a
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-full hover:bg-orange-100 transition-colors"
            >
              {term}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
