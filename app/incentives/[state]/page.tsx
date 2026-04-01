import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStates, getStateBySlug, getIncentivesByState } from "@/lib/db";
import { formatCurrency, formatSunHours, getNetMeteringLabel } from "@/lib/format";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";

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
    title: `${state.state} Solar Incentives 2026 - Tax Credits, Rebates & Net Metering`,
    description: `Complete guide to solar incentives in ${state.state} for 2026. Federal 30% ITC, ${state.state_tax_credit > 0 ? `${state.state_tax_credit}% state tax credit, ` : ""}${state.state_rebate > 0 ? `$${state.state_rebate.toLocaleString()} rebate, ` : ""}net metering policy, and payback of ${state.avg_payback_years} years.`,
    alternates: { canonical: `/incentives/${stateSlug}/` },
    openGraph: { url: `/incentives/${stateSlug}/` },
    keywords: [
      `${state.state} solar incentives`,
      `${state.state} solar tax credit`,
      `${state.state} solar rebate`,
      `${state.state} net metering`,
      `${state.state} solar panels 2026`,
    ],
  };
}

export default async function StateIncentivesPage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();

  const incentives = getIncentivesByState(state.abbr);
  const stateOnlyIncentives = incentives.filter((i) => i.state !== "ALL");
  const federalIncentives = incentives.filter((i) => i.state === "ALL");

  const typeLabels: Record<string, string> = {
    tax_credit: "Tax Credit",
    rebate: "Rebate",
    srec: "SREC / REC Program",
    net_metering: "Net Metering",
  };

  const typeColors: Record<string, string> = {
    tax_credit: "bg-blue-100 text-blue-800 border-blue-200",
    rebate: "bg-green-100 text-green-800 border-green-200",
    srec: "bg-purple-100 text-purple-800 border-purple-200",
    net_metering: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  const netMeteringLabel = getNetMeteringLabel(state.net_metering);
  const netMeteringColor =
    state.net_metering === "yes"
      ? "text-green-700"
      : state.net_metering === "partial"
      ? "text-yellow-700"
      : "text-red-600";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Solar Incentives", url: "/incentives/" },
              { name: `${state.state} Solar Incentives`, url: `/incentives/${stateSlug}/` },
            ])
          ),
        }}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Solar Incentives", href: "/incentives/" },
          { label: state.state },
        ]}
      />

      <h1 className="text-3xl font-bold text-orange-800 mb-2">
        {state.state} Solar Incentives (2026)
      </h1>
      <p className="text-lg text-slate-600 mb-6">
        {state.state} homeowners qualify for the <strong>30% federal solar tax credit</strong>
        {state.state_tax_credit > 0 && (
          <> plus a <strong>{state.state_tax_credit}% state tax credit</strong></>
        )}
        {state.state_rebate > 0 && (
          <> and a <strong>{formatCurrency(state.state_rebate)} state rebate</strong></>
        )}
        . Net metering policy:{" "}
        <span className={`font-medium ${netMeteringColor}`}>{netMeteringLabel}</span>
        . Average payback period:{" "}
        <strong>{state.avg_payback_years} years</strong>.
      </p>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-center">
          <p className="text-2xl font-bold text-orange-700">30%</p>
          <p className="text-xs text-slate-500 mt-1">Federal ITC</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <p className="text-2xl font-bold text-blue-700">
            {state.state_tax_credit > 0 ? `${state.state_tax_credit}%` : "None"}
          </p>
          <p className="text-xs text-slate-500 mt-1">State Tax Credit</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <p className="text-2xl font-bold text-green-700">
            {state.state_rebate > 0 ? formatCurrency(state.state_rebate) : "None"}
          </p>
          <p className="text-xs text-slate-500 mt-1">State Rebate</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
          <p className="text-sm font-bold text-yellow-700">{netMeteringLabel}</p>
          <p className="text-xs text-slate-500 mt-1">Net Metering</p>
        </div>
      </div>

      <AdSlot id="3456721098" />

      {/* Federal incentives */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          Federal Solar Incentives (Available in {state.state})
        </h2>
        <div className="space-y-3">
          {federalIncentives.map((inc) => (
            <div
              key={inc.id}
              className="p-4 bg-orange-50 rounded-lg border border-orange-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-orange-800">{inc.incentive_name}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${
                    typeColors[inc.type] || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {typeLabels[inc.type] || inc.type}
                </span>
              </div>
              <p className="text-sm font-medium text-orange-700 mb-1">{inc.value}</p>
              <p className="text-sm text-slate-600">{inc.description}</p>
              {inc.expiration && (
                <p className="text-xs text-slate-500 mt-2">
                  Expires: {inc.expiration}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* State-specific incentives */}
      {stateOnlyIncentives.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">
            {state.state}-Specific Solar Incentives
          </h2>
          <div className="space-y-3">
            {stateOnlyIncentives.map((inc) => (
              <div
                key={inc.id}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-800">{inc.incentive_name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${
                      typeColors[inc.type] || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {typeLabels[inc.type] || inc.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">{inc.value}</p>
                <p className="text-sm text-slate-600">{inc.description}</p>
                {inc.expiration && (
                  <p className="text-xs text-slate-500 mt-2">
                    Expires: {inc.expiration}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {stateOnlyIncentives.length === 0 && (
        <section className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600">
            {state.state} does not currently have additional state-specific solar
            incentives beyond the federal 30% ITC. However, the {netMeteringLabel.toLowerCase()}
            policy still allows homeowners to earn credits for excess solar generation.
          </p>
        </section>
      )}

      <AdSlot id="4567832109" />

      {/* Solar overview */}
      <section className="mb-8 p-5 bg-orange-50 rounded-xl border border-orange-200">
        <h2 className="text-xl font-bold text-orange-800 mb-2">
          {state.state} Solar Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Peak Sun Hours</p>
            <p className="font-bold text-orange-700">{formatSunHours(state.avg_sun_hours)}/day</p>
          </div>
          <div>
            <p className="text-slate-500">Avg Payback Period</p>
            <p className="font-bold text-slate-700">{state.avg_payback_years} years</p>
          </div>
          <div>
            <p className="text-slate-500">20-Year Savings</p>
            <p className="font-bold text-green-700">{formatCurrency(state.avg_20yr_savings)}</p>
          </div>
          <div>
            <p className="text-slate-500">Electricity Rate</p>
            <p className="font-bold text-slate-700">{state.avg_electricity_rate.toFixed(2)}¢/kWh</p>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Explore More</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={`/state/${state.slug}/`} className="text-orange-600 hover:underline">
            {state.state} Solar Overview
          </a>
          <a href={`/solar-cities/${state.slug}/`} className="text-orange-600 hover:underline">
            Best Cities in {state.state}
          </a>
          <a href="/incentives/" className="text-orange-600 hover:underline">
            All State Incentives
          </a>
          <a href="/calculator/" className="text-orange-600 hover:underline">
            Solar Calculator
          </a>
        </div>
      </section>

      <FreshnessTag source="DSIRE, NREL, EIA" />
    </>
  );
}
