import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStates, getStateBySlug } from "@/lib/db";
import { formatCurrency, formatSunHours, getNetMeteringLabel } from "@/lib/format";
import { breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";
import { SourcedIncentiveCard } from "@/components/state/SourcedIncentiveCard";
import {
  getIncentiveBundle,
  getSunResource,
  getSolarPayback,
  getZipIrradianceCoverage,
} from "@/lib/state-facts";
import { buildStateCommentary } from "@/lib/state-commentary";

interface PageProps {
  params: Promise<{ state: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const states = getAllStates();
  return states.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) return {};
  return {
    title: `${state.state} Solar Incentives - Tax Credits, Rebates & Net Metering`,
    description: `Complete guide to solar incentives in ${state.state}. Federal 30% ITC, ${state.state_tax_credit > 0 ? `${state.state_tax_credit}% state tax credit, ` : ""}${state.state_rebate > 0 ? `$${state.state_rebate.toLocaleString()} rebate, ` : ""}net metering policy, and payback of ${state.avg_payback_years} years.`,
    alternates: { canonical: `/incentives/${stateSlug}/` },
    openGraph: { url: `/incentives/${stateSlug}/` },
    keywords: [
      `${state.state} solar incentives`,
      `${state.state} solar tax credit`,
      `${state.state} solar rebate`,
      `${state.state} net metering`,
      `${state.state} solar panel incentives`,
    ],
  };
}

export default async function StateIncentivesPage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = getStateBySlug(stateSlug);
  if (!state) notFound();

  const bundle = getIncentiveBundle(stateSlug);
  const sun = getSunResource(stateSlug);
  const payback = getSolarPayback(stateSlug);
  const zip = getZipIrradianceCoverage(stateSlug);
  const commentary = buildStateCommentary(state.state, stateSlug, sun, payback, bundle, zip);

  const stateOnlyIncentives = bundle?.stateRows ?? [];
  const federalIncentives = bundle?.federalRows ?? [];

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
        {state.state} Solar Incentives
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

      {/* Layer 2 commentary — incentive overview sentence */}
      {commentary.incentiveSentence && (
        <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {commentary.incentiveSentence}
          </p>
          {bundle && bundle.withSourceCount > 0 && (
            <p className="mt-2 text-xs text-emerald-700 font-medium">
              {bundle.withSourceCount} of {bundle.totalCount} entries link to a verified .gov or utility-commission source.
            </p>
          )}
        </section>
      )}

      {/* Federal incentives */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">
          Federal Solar Incentives (Available in {state.state})
        </h2>
        <div className="space-y-3">
          {federalIncentives.map((row, i) => (
            <SourcedIncentiveCard key={`fed-${i}`} row={row} variant="federal" />
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
            {stateOnlyIncentives.map((row, i) => (
              <SourcedIncentiveCard key={`st-${i}`} row={row} variant="state" />
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

      {/* Disclaimer (YMYL guardrail) */}
      <section className="mb-8 p-3 rounded-lg border border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-600 italic leading-relaxed">
          {commentary.disclaimerSentence}
        </p>
      </section>

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
