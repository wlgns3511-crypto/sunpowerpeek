import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStateBySlug, getTopComparisonPairs, getIncentivesByState } from "@/lib/db";
import { formatCurrency, formatSunHours, getPaybackColor, getNetMeteringLabel } from "@/lib/format";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function parseCompareSlug(slug: string): { state1Slug: string; state2Slug: string } | null {
  const match = slug.match(/^(.+)-vs-(.+)-solar$/);
  if (!match) return null;
  return { state1Slug: match[1], state2Slug: match[2] };
}

export async function generateStaticParams() {
  const pairs = getTopComparisonPairs();
  return pairs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) return {};
  const state1 = getStateBySlug(parsed.state1Slug);
  const state2 = getStateBySlug(parsed.state2Slug);
  if (!state1 || !state2) return {};

  return {
    title: `${state1.state} vs ${state2.state} Solar Comparison (2026)`,
    description: `Compare solar panels in ${state1.state} (${state1.avg_sun_hours} sun hrs, ${state1.avg_payback_years}yr payback) vs ${state2.state} (${state2.avg_sun_hours} sun hrs, ${state2.avg_payback_years}yr payback). Side-by-side costs, savings, and incentives.`,
    alternates: { canonical: `https://sunpowerpeek.com/compare/${slug}/` },
  };
}

export default async function CompareStatePage({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);
  if (!parsed) notFound();

  const state1 = getStateBySlug(parsed.state1Slug);
  const state2 = getStateBySlug(parsed.state2Slug);
  if (!state1 || !state2) notFound();

  const inc1 = getIncentivesByState(state1.abbr);
  const inc2 = getIncentivesByState(state2.abbr);

  const cost1 = Math.round(state1.avg_system_cost_per_watt * 6000);
  const cost2 = Math.round(state2.avg_system_cost_per_watt * 6000);
  const betterSolar = state1.avg_sun_hours >= state2.avg_sun_hours ? state1 : state2;
  const betterPayback = state1.avg_payback_years <= state2.avg_payback_years ? state1 : state2;
  const betterSavings = state1.avg_20yr_savings >= state2.avg_20yr_savings ? state1 : state2;

  const faqs = [
    {
      question: `Is solar better in ${state1.state} or ${state2.state}?`,
      answer: `${betterSolar.state} gets more sun (${betterSolar.avg_sun_hours} peak hours/day vs ${betterSolar === state1 ? state2.avg_sun_hours : state1.avg_sun_hours}). ${betterPayback.state} has a faster payback (${betterPayback.avg_payback_years} years) and ${betterSavings.state} offers higher 20-year savings (${formatCurrency(betterSavings.avg_20yr_savings)}).`,
    },
    {
      question: `How do solar costs compare between ${state1.state} and ${state2.state}?`,
      answer: `A 6kW system costs $${cost1.toLocaleString()} in ${state1.state} vs $${cost2.toLocaleString()} in ${state2.state} before incentives. Both qualify for the 30% federal tax credit.`,
    },
  ];

  const rows = [
    { label: "Peak Sun Hours", v1: formatSunHours(state1.avg_sun_hours), v2: formatSunHours(state2.avg_sun_hours), better: state1.avg_sun_hours >= state2.avg_sun_hours ? 1 : 2 },
    { label: "Cost per Watt", v1: `$${state1.avg_system_cost_per_watt.toFixed(2)}`, v2: `$${state2.avg_system_cost_per_watt.toFixed(2)}`, better: state1.avg_system_cost_per_watt <= state2.avg_system_cost_per_watt ? 1 : 2 },
    { label: "6kW System Cost", v1: `$${cost1.toLocaleString()}`, v2: `$${cost2.toLocaleString()}`, better: cost1 <= cost2 ? 1 : 2 },
    { label: "Federal Tax Credit", v1: "30%", v2: "30%", better: 0 },
    { label: "State Tax Credit", v1: state1.state_tax_credit > 0 ? `${state1.state_tax_credit}%` : "None", v2: state2.state_tax_credit > 0 ? `${state2.state_tax_credit}%` : "None", better: state1.state_tax_credit >= state2.state_tax_credit ? 1 : 2 },
    { label: "State Rebate", v1: state1.state_rebate > 0 ? formatCurrency(state1.state_rebate) : "None", v2: state2.state_rebate > 0 ? formatCurrency(state2.state_rebate) : "None", better: state1.state_rebate >= state2.state_rebate ? 1 : 2 },
    { label: "Net Metering", v1: getNetMeteringLabel(state1.net_metering), v2: getNetMeteringLabel(state2.net_metering), better: state1.net_metering === "yes" ? 1 : state2.net_metering === "yes" ? 2 : 0 },
    { label: "Electricity Rate", v1: `${state1.avg_electricity_rate.toFixed(2)}¢/kWh`, v2: `${state2.avg_electricity_rate.toFixed(2)}¢/kWh`, better: state1.avg_electricity_rate >= state2.avg_electricity_rate ? 1 : 2 },
    { label: "Payback Period", v1: `${state1.avg_payback_years} years`, v2: `${state2.avg_payback_years} years`, better: state1.avg_payback_years <= state2.avg_payback_years ? 1 : 2 },
    { label: "20-Year Savings", v1: formatCurrency(state1.avg_20yr_savings), v2: formatCurrency(state2.avg_20yr_savings), better: state1.avg_20yr_savings >= state2.avg_20yr_savings ? 1 : 2 },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: `${state1.state} vs ${state2.state}`, url: `/compare/${slug}/` },
      ])) }} />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: `${state1.state} vs ${state2.state} Solar` }]} />

      <h1 className="text-3xl font-bold text-orange-800 mb-2">
        {state1.state} vs {state2.state} Solar Comparison
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        {betterSolar.state} gets more sun ({formatSunHours(betterSolar.avg_sun_hours)}/day) while{" "}
        {betterPayback.state} has the faster payback ({betterPayback.avg_payback_years} years).
        {betterSavings.state} offers higher 20-year savings at {formatCurrency(betterSavings.avg_20yr_savings)}.
      </p>

      {/* Side-by-side summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-5 border border-orange-200 text-center">
          <p className="text-sm text-slate-500">{state1.state}</p>
          <p className="text-3xl font-bold text-orange-700">{formatSunHours(state1.avg_sun_hours)}</p>
          <p className="text-sm text-slate-600 mt-1">{state1.avg_payback_years}yr payback</p>
          <p className="text-lg font-bold text-green-700 mt-1">{formatCurrency(state1.avg_20yr_savings)}</p>
          <p className="text-xs text-slate-500">20yr savings</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 text-center">
          <p className="text-sm text-slate-500">{state2.state}</p>
          <p className="text-3xl font-bold text-yellow-700">{formatSunHours(state2.avg_sun_hours)}</p>
          <p className="text-sm text-slate-600 mt-1">{state2.avg_payback_years}yr payback</p>
          <p className="text-lg font-bold text-green-700 mt-1">{formatCurrency(state2.avg_20yr_savings)}</p>
          <p className="text-xs text-slate-500">20yr savings</p>
        </div>
      </div>

      <AdSlot id="1234567890" />

      {/* Comparison table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Side-by-Side Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Metric</th>
                <th className="text-right px-4 py-2 font-medium text-orange-700">{state1.state}</th>
                <th className="text-right px-4 py-2 font-medium text-yellow-700">{state2.state}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium">{row.label}</td>
                  <td className={`px-4 py-2 text-right ${row.better === 1 ? 'font-bold text-green-700' : ''}`}>{row.v1}</td>
                  <td className={`px-4 py-2 text-right ${row.better === 2 ? 'font-bold text-green-700' : ''}`}>{row.v2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Verdict */}
      <section className="mb-8 p-5 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
        <h2 className="text-xl font-bold text-orange-800 mb-2">Verdict</h2>
        <p className="text-slate-700 text-sm">
          <strong>{betterSavings.state}</strong> is the better state for solar ROI with {formatCurrency(betterSavings.avg_20yr_savings)} in 20-year savings
          and a {betterSavings.avg_payback_years}-year payback period. {betterSolar.state} has more sun exposure at {formatSunHours(betterSolar.avg_sun_hours)}/day,
          making it ideal for maximum energy production. Both states qualify for the 30% federal solar tax credit.
        </p>
      </section>

      <AdSlot id="2345678901" />

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-slate-50 rounded-lg border border-slate-200 p-4" open={i === 0}>
              <summary className="font-semibold text-slate-800 cursor-pointer">{faq.question}</summary>
              <p className="mt-2 text-slate-600 text-sm">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Explore More</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={`/state/${state1.slug}/`} className="text-orange-600 hover:underline">{state1.state} Solar Details</a>
          <a href={`/state/${state2.slug}/`} className="text-orange-600 hover:underline">{state2.state} Solar Details</a>
          <a href="/incentives/" className="text-orange-600 hover:underline">All Incentives</a>
          <a href="/calculator/" className="text-orange-600 hover:underline">Solar Calculator</a>
        </div>
      </section>

      <DataFeedback />
      <FreshnessTag source="NREL, DSIRE, EIA" />
    </>
  );
}
