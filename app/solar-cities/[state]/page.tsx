import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStates, getStateBySlug, getZipsByState } from "@/lib/db";
import { formatCurrency, formatSunHours, getPaybackColor } from "@/lib/format";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";
import { EditorNote } from "@/components/EditorNote";
import { DidYouKnow } from "@/components/DidYouKnow";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateStaticParams() {
  const states = getAllStates();
  return states.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) return {};
  return {
    title: `Best Cities for Solar in ${state.state} (2026) | SunPowerPeek`,
    description: `Find the best cities and ZIP codes for solar panels in ${state.state}. Compare peak sun hours, system costs, payback periods, and 20-year savings by location.`,
    alternates: { canonical: `/solar-cities/${stateSlug}/` },
    openGraph: { url: `/solar-cities/${stateSlug}/` },
    keywords: [
      `solar panels ${state.state}`,
      `best cities solar ${state.state}`,
      `${state.state} solar installation`,
      `${state.state} solar savings`,
      `${state.state} solar payback`,
    ],
  };
}

export default async function SolarCitiesPage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();

  const zips = getZipsByState(state.abbr);

  const bestZip = zips.length > 0 ? zips[0] : null; // sorted by annual_savings DESC
  const avgSun = zips.length > 0 ? zips.reduce((s, z) => s + z.peak_sun_hours, 0) / zips.length : state.avg_sun_hours;
  const avgSavings = zips.length > 0 ? zips.reduce((s, z) => s + z.annual_savings, 0) / zips.length : state.avg_20yr_savings / 20;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...breadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Solar Cities", url: "/solar-cities/" },
              { name: `${state.state} Solar Cities`, url: `/solar-cities/${stateSlug}/` },
            ]),
            dateModified: "2026-03-31",
            author: { "@type": "Organization", name: "DataPeek" },
          }),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Solar Cities", href: "/solar-cities/" },
          { label: `${state.state}` },
        ]}
      />

      <h1 className="text-3xl font-bold text-orange-800 mb-2">
        Best Cities for Solar in {state.state}
      </h1>
      <p className="text-lg text-slate-600 mb-6">
        {state.state} has {zips.length > 0 ? zips.length : "several"} tracked locations with an average of{" "}
        <strong>{formatSunHours(avgSun)}/day</strong> of peak sun and{" "}
        <strong>{formatCurrency(Math.round(avgSavings))}/year</strong> in average
        solar savings.
        {bestZip && (
          <>
            {" "}The best location is{" "}
            <a href={`/zip/${bestZip.slug}/`} className="text-orange-600 hover:underline">
              {bestZip.city} ({bestZip.zip_code})
            </a>{" "}
            with {formatCurrency(bestZip.annual_savings)}/year in savings.
          </>
        )}
      </p>

      <EditorNote note={`Solar potential varies significantly across ${state.state}. Peak sun hours, local incentives, and electricity rates all influence your real-world payback period. We recommend comparing at least 3 quotes from local installers.`} />

      <AdSlot id="1234509876" />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-center">
          <p className="text-2xl font-bold text-orange-700">{zips.length}</p>
          <p className="text-xs text-slate-500 mt-1">tracked locations</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
          <p className="text-2xl font-bold text-yellow-700">
            {formatSunHours(avgSun)}
          </p>
          <p className="text-xs text-slate-500 mt-1">avg peak sun/day</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <p className="text-xl font-bold text-green-700">
            {formatCurrency(Math.round(avgSavings))}
          </p>
          <p className="text-xs text-slate-500 mt-1">avg annual savings</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <p className="text-xl font-bold text-blue-700">
            {state.avg_payback_years} yrs
          </p>
          <p className="text-xs text-slate-500 mt-1">avg payback</p>
        </div>
      </div>

      {/* ZIP table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          Solar Data by ZIP Code in {state.state}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-slate-600">
                  City / ZIP
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  Peak Sun
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  6kW Cost
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  Annual Savings
                </th>
                <th className="text-right px-3 py-2 font-medium text-slate-600">
                  Payback
                </th>
              </tr>
            </thead>
            <tbody>
              {zips.map((z) => (
                <tr
                  key={z.zip_code}
                  className="border-t border-slate-100 hover:bg-orange-50/30"
                >
                  <td className="px-3 py-2">
                    <a
                      href={`/zip/${z.slug}/`}
                      className="text-orange-600 hover:underline"
                    >
                      {z.city}
                    </a>{" "}
                    <span className="text-slate-400 text-xs">{z.zip_code}</span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatSunHours(z.peak_sun_hours)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(z.system_cost_6kw)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-green-700">
                    {formatCurrency(z.annual_savings)}/yr
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-medium ${getPaybackColor(z.payback_years)}`}
                  >
                    {z.payback_years} yrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <DidYouKnow fact="A typical 6kW residential solar system can offset 7-10 tons of CO2 per year, equivalent to planting about 150 trees annually. With the 30% federal tax credit available through 2032, most homeowners see payback within 6-9 years." />

      {/* Links */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Explore More</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={`/state/${state.slug}/`}
            className="text-orange-600 hover:underline"
          >
            {state.state} Solar Overview
          </a>
          <a href="/compare/" className="text-orange-600 hover:underline">
            Compare States
          </a>
          <a href="/calculator/" className="text-orange-600 hover:underline">
            Solar Calculator
          </a>
          <a href="/incentives/" className="text-orange-600 hover:underline">
            {state.state} Incentives
          </a>
        </div>
      </section>

      <DataSourceBadge sources={[
        { name: "NREL", url: "https://www.nrel.gov" },
        { name: "EIA", url: "https://www.eia.gov" },
      ]} />

      <FreshnessTag source="NREL, DSIRE, EIA" />

      <CrossSiteLinks current="SunPowerPeek" />
    </>
  );
}
