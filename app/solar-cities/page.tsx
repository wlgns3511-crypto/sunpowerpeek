import type { Metadata } from "next";
import { getAllStates } from "@/lib/db";
import { formatCurrency, formatSunHours } from "@/lib/format";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";

export const metadata: Metadata = {
  title: "Best Cities for Solar Panels by State (2026) | SunPowerPeek",
  description:
    "Find the best cities and locations for solar panels in every US state. Browse solar data by city, ZIP code, and state for optimal solar investment decisions.",
  alternates: { canonical: "https://sunpowerpeek.com/solar-cities/" },
  openGraph: { url: "/solar-cities/" },
};

export default function SolarCitiesIndexPage() {
  const states = getAllStates();
  const sortedByState = [...states].sort((a, b) => a.state.localeCompare(b.state));
  const bestStates = [...states]
    .sort((a, b) => b.avg_20yr_savings - a.avg_20yr_savings)
    .slice(0, 10);

  return (
    <>
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Solar Cities" }]}
      />

      <h1 className="text-3xl font-bold text-orange-800 mb-4">
        Best Cities for Solar Panels by State
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Browse solar installation data for cities and ZIP codes across all 50 US
        states. Find the best locations for solar panels near you.
      </p>

      <AdSlot id="2345610987" />

      {/* Top states */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          Top States for Solar Savings
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bestStates.map((s) => (
            <a
              key={s.abbr}
              href={`/solar-cities/${s.slug}/`}
              className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-orange-800">{s.state}</p>
                <p className="text-sm text-slate-600">
                  {formatSunHours(s.avg_sun_hours)}/day
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-700">
                  {formatCurrency(s.avg_20yr_savings)}
                </p>
                <p className="text-xs text-slate-500">20yr savings</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* All states */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          Browse Solar Cities by State
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {sortedByState.map((s) => (
            <a
              key={s.abbr}
              href={`/solar-cities/${s.slug}/`}
              className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-orange-50 hover:border-orange-200 transition-colors text-sm"
            >
              <span className="text-orange-600 hover:underline font-medium">
                {s.state}
              </span>
            </a>
          ))}
        </div>
      </section>

      <FreshnessTag source="NREL, DSIRE, EIA" />
    </>
  );
}
