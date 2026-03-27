import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStates, getStateBySlug, getZipsByState, getIncentivesByState, getNationalAvgSunHours, getNationalAvgPayback } from "@/lib/db";
import { formatCurrency, formatSunHours, formatPercent, getPaybackColor, getNetMeteringLabel, getNetMeteringColor, getSunTextColor } from "@/lib/format";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const states = getAllStates();
  return states.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  return {
    title: `${state.state} Solar Panel Costs & Savings - ${state.avg_payback_years}yr Payback | SunPowerPeek`,
    description: `${state.state} gets ${state.avg_sun_hours} peak sun hours/day. Average 6kW system costs $${Math.round(state.avg_system_cost_per_watt * 6000).toLocaleString()} before the 30% federal tax credit. ${state.avg_payback_years}-year payback with ${formatCurrency(state.avg_20yr_savings)} in 20-year savings.`,
    alternates: { canonical: `https://sunpowerpeek.com/state/${slug}/` },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const zips = getZipsByState(state.abbr);
  const incentives = getIncentivesByState(state.abbr);
  const nationalSun = getNationalAvgSunHours();
  const nationalPayback = getNationalAvgPayback();
  const allStates = getAllStates();

  const systemCost6kw = Math.round(state.avg_system_cost_per_watt * 6000);
  const federalCredit = Math.round(systemCost6kw * 0.3);
  const netCost = systemCost6kw - federalCredit - (state.state_tax_credit > 0 ? Math.round(systemCost6kw * state.state_tax_credit / 100) : 0) - state.state_rebate;

  const sunDiff = state.avg_sun_hours - nationalSun;
  const isAboveAvgSun = sunDiff > 0;

  const faqs = [
    {
      question: `How much do solar panels cost in ${state.state}?`,
      answer: `A typical 6kW solar system in ${state.state} costs approximately $${systemCost6kw.toLocaleString()} before incentives. After the 30% federal tax credit ($${federalCredit.toLocaleString()})${state.state_tax_credit > 0 ? ` and state incentives` : ''}, the net cost is approximately $${netCost.toLocaleString()}.`,
    },
    {
      question: `How long does solar take to pay for itself in ${state.state}?`,
      answer: `The average solar payback period in ${state.state} is ${state.avg_payback_years} years, ${state.avg_payback_years < nationalPayback ? 'faster' : 'slower'} than the national average of ${nationalPayback} years. After payback, homeowners enjoy free electricity for the remaining system life.`,
    },
    {
      question: `Does ${state.state} have net metering?`,
      answer: `${state.state} has ${getNetMeteringLabel(state.net_metering).toLowerCase()}. ${state.net_metering === 'yes' ? 'Homeowners receive full retail rate credits for excess solar energy sent to the grid.' : state.net_metering === 'partial' ? 'Some utilities offer net metering programs with varying credit rates.' : 'Net metering is not currently available statewide, which may affect solar savings calculations.'}`,
    },
    {
      question: `How much sun does ${state.state} get for solar?`,
      answer: `${state.state} averages ${state.avg_sun_hours} peak sun hours per day, which is ${isAboveAvgSun ? `${sunDiff.toFixed(1)} hours above` : `${Math.abs(sunDiff).toFixed(1)} hours below`} the national average. A 6kW system produces approximately ${Math.round(6 * state.avg_sun_hours * 365).toLocaleString()} kWh per year.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", url: "/" }, { name: state.state, url: `/state/${slug}/` }])) }} />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: state.state }]} />

      <h1 className="text-3xl font-bold text-orange-800 mb-2">
        {state.state} Solar Panel Costs &amp; Savings
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        {state.state} averages <strong className={getSunTextColor(state.avg_sun_hours)}>{formatSunHours(state.avg_sun_hours)}</strong> of peak sun per day
        with an average payback period of <strong className={getPaybackColor(state.avg_payback_years)}>{state.avg_payback_years} years</strong>.
        Homeowners can save <strong className="text-green-700">{formatCurrency(state.avg_20yr_savings)}</strong> over 20 years.
      </p>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Peak Sun Hours</p>
          <p className="text-2xl font-bold text-orange-700">{formatSunHours(state.avg_sun_hours)}</p>
          <p className="text-xs text-slate-500">per day</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">6kW System Cost</p>
          <p className="text-2xl font-bold text-blue-700">${systemCost6kw.toLocaleString()}</p>
          <p className="text-xs text-slate-500">before incentives</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Payback Period</p>
          <p className="text-2xl font-bold text-green-700">{state.avg_payback_years} yrs</p>
          <p className="text-xs text-slate-500">average</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">20-Year Savings</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(state.avg_20yr_savings)}</p>
          <p className="text-xs text-slate-500">estimated</p>
        </div>
      </div>

      <AdSlot id="5678901234" />

      {/* Cost breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Solar Cost Breakdown in {state.state}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Item</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">6kW System Cost (${state.avg_system_cost_per_watt}/W)</td>
                <td className="px-4 py-2 text-right font-medium">${systemCost6kw.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2 text-green-700">Federal Tax Credit (30%)</td>
                <td className="px-4 py-2 text-right font-medium text-green-700">-${federalCredit.toLocaleString()}</td>
              </tr>
              {state.state_tax_credit > 0 && (
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-green-700">State Tax Credit ({state.state_tax_credit}%)</td>
                  <td className="px-4 py-2 text-right font-medium text-green-700">-${Math.round(systemCost6kw * state.state_tax_credit / 100).toLocaleString()}</td>
                </tr>
              )}
              {state.state_rebate > 0 && (
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-green-700">State Rebate</td>
                  <td className="px-4 py-2 text-right font-medium text-green-700">-${state.state_rebate.toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-t-2 border-slate-300 bg-orange-50">
                <td className="px-4 py-2 font-bold">Net Cost</td>
                <td className="px-4 py-2 text-right font-bold text-orange-700">${netCost.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Net metering & key facts */}
      <section className="mb-8 grid md:grid-cols-3 gap-4">
        <div className={`rounded-xl p-4 border ${getNetMeteringColor(state.net_metering)}`}>
          <p className="text-xs uppercase tracking-wider font-medium">Net Metering</p>
          <p className="text-lg font-bold mt-1">{getNetMeteringLabel(state.net_metering)}</p>
        </div>
        <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Electricity Rate</p>
          <p className="text-lg font-bold text-slate-800 mt-1">{state.avg_electricity_rate.toFixed(2)}¢/kWh</p>
        </div>
        <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Monthly Bill</p>
          <p className="text-lg font-bold text-slate-800 mt-1">${state.avg_monthly_bill}/mo</p>
        </div>
      </section>

      {/* Incentives */}
      {incentives.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Solar Incentives in {state.state}</h2>
          <div className="space-y-3">
            {incentives.map((inc, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{inc.incentive_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{inc.description}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">{inc.value}</span>
                </div>
                <div className="flex gap-3 mt-2 text-xs text-slate-400">
                  <span className="px-2 py-0.5 bg-slate-200 rounded">{inc.type.replace('_', ' ')}</span>
                  {inc.expiration && <span>Expires: {inc.expiration}</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm"><a href="/incentives/" className="text-orange-600 hover:underline">View all state solar incentives</a></p>
        </section>
      )}

      <AdSlot id="6789012345" />

      {/* ZIP code rankings */}
      {zips.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Solar Potential by ZIP Code in {state.state}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-600">ZIP</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-600">City</th>
                  <th className="text-right px-4 py-2 font-medium text-slate-600">Sun Hours</th>
                  <th className="text-right px-4 py-2 font-medium text-slate-600">Annual Savings</th>
                  <th className="text-right px-4 py-2 font-medium text-slate-600">Payback</th>
                </tr>
              </thead>
              <tbody>
                {zips.slice(0, 20).map(z => (
                  <tr key={z.zip_code} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      <a href={`/zip/${z.slug}/`} className="text-orange-600 hover:underline">{z.zip_code}</a>
                    </td>
                    <td className="px-4 py-2">{z.city}</td>
                    <td className="px-4 py-2 text-right">{formatSunHours(z.peak_sun_hours)}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-700">{formatCurrency(z.annual_savings)}</td>
                    <td className="px-4 py-2 text-right">{z.payback_years} yrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Compare with other states */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Compare With Other States</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {allStates
            .filter(s => s.abbr !== state.abbr)
            .sort((a, b) => b.avg_sun_hours - a.avg_sun_hours)
            .slice(0, 10)
            .map(s => (
            <a
              key={s.abbr}
              href={`/state/${s.slug}/`}
              className="p-3 text-center rounded-lg border border-slate-200 hover:border-orange-300 transition-colors"
            >
              <p className="font-semibold text-sm">{s.abbr}</p>
              <p className="text-xs text-slate-500">{formatSunHours(s.avg_sun_hours)}</p>
              <p className="text-xs text-slate-400">{s.avg_payback_years}yr</p>
            </a>
          ))}
        </div>
      </section>

      {/* Cross-references */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">More Data for {state.state}</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://powerbillpeek.com" className="text-orange-600 hover:underline">Electricity Rates</a>
          <a href="https://propertytaxpeek.com" className="text-orange-600 hover:underline">Property Tax</a>
          <a href="https://costbycity.com" className="text-orange-600 hover:underline">Cost of Living</a>
        </div>
      </section>

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

      <DataFeedback />
      <FreshnessTag source="NREL, DSIRE, EIA" />
    </>
  );
}
