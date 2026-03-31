import type { Metadata } from "next";
import { getAllStates, getTopComparisonPairs } from "@/lib/db";
import { formatCurrency, formatSunHours } from "@/lib/format";
import { itemListSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";

export const metadata: Metadata = {
  title: "Compare Solar Potential Between States | SunPowerPeek",
  description:
    "Compare solar panel potential, payback periods, and 20-year savings between any two US states. Find the best states for solar energy investment.",
  alternates: { canonical: "https://sunpowerpeek.com/compare/" },
};

export default function SolarComparePage() {
  const states = getAllStates();
  const pairs = getTopComparisonPairs();

  // Show popular comparisons (first 50 pairs for display)
  const popularPairs = pairs.slice(0, 50);

  // Sort states by 20-year savings
  const sortedBySavings = [...states].sort(
    (a, b) => b.avg_20yr_savings - a.avg_20yr_savings
  );

  const listItems = sortedBySavings.map(s => ({ name: s.state, url: `/state/${s.slug}/` }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema('US States Ranked by Solar Savings', '/compare', listItems)) }} />
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Compare States" }]}
      />

      <h1 className="text-3xl font-bold text-orange-800 mb-4">
        Compare Solar Potential Between States
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Compare solar panel costs, savings, and payback periods between any two US
        states. We have {pairs.length.toLocaleString()} state comparisons covering
        all 50 states.
      </p>

      <AdSlot id="0123456789" />

      {/* Popular comparisons */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Popular Solar Comparisons
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {popularPairs.map((p) => (
            <a
              key={p.slug}
              href={`/compare/${p.slug}/`}
              className="p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-sm"
            >
              <span className="text-orange-800 font-medium">
                {p.state1
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
              <span className="text-slate-400 mx-2">vs</span>
              <span className="text-orange-800 font-medium">
                {p.state2
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* All states ranked by 20-year savings */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          All 50 States Ranked by 20-Year Solar Savings
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  #
                </th>
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  State
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  Peak Sun
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  Payback
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  20yr Savings
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBySavings.map((s, i) => (
                <tr
                  key={s.abbr}
                  className="border-t border-slate-100 hover:bg-orange-50/30"
                >
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2">
                    <a
                      href={`/state/${s.slug}/`}
                      className="text-orange-600 hover:underline"
                    >
                      {s.state}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatSunHours(s.avg_sun_hours)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {s.avg_payback_years} yrs
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-green-700">
                    {formatCurrency(s.avg_20yr_savings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FreshnessTag source="NREL, DSIRE, EIA" />
    </>
  );
}
