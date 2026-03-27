import type { Metadata } from "next";
import { getAllStates, getBestSolarStates, getWorstSolarStates, getFastestPaybackStates, getHighestSavingsStates, getNationalAvgSunHours, getNationalAvgPayback, getNationalAvg20yrSavings } from "@/lib/db";
import { formatCurrency, formatSunHours, getSunColor, getPaybackColor } from "@/lib/format";
import { datasetSchema, faqSchema } from "@/lib/schema";
import { SolarCalculator } from "@/components/SolarCalculator";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";

export const metadata: Metadata = {
  title: "US Solar Panel Costs, Savings & Incentives by State | SunPowerPeek",
  description:
    "Compare solar panel costs, savings, and government incentives across all 50 US states. The national average payback period is 9.8 years with $32,000+ in 20-year savings. Free solar calculator.",
  alternates: { canonical: "https://sunpowerpeek.com/" },
};

export default function HomePage() {
  const states = getAllStates();
  const bestSolar = getBestSolarStates(5);
  const worstSolar = getWorstSolarStates(5);
  const fastestPayback = getFastestPaybackStates(5);
  const highestSavings = getHighestSavingsStates(5);
  const avgSunHours = getNationalAvgSunHours();
  const avgPayback = getNationalAvgPayback();
  const avg20yrSavings = getNationalAvg20yrSavings();

  const faqs = [
    {
      question: "How much do solar panels cost in the US?",
      answer: `The average cost of a 6kW residential solar system in the US is $17,000-$21,000 before incentives. After the 30% federal tax credit, the net cost drops to $12,000-$15,000. Costs vary by state, with Southwest states generally being cheaper.`,
    },
    {
      question: "What is the federal solar tax credit for 2026?",
      answer: "The federal Solar Investment Tax Credit (ITC) is 30% of the total system cost for systems installed through 2032. It steps down to 26% in 2033 and 22% in 2034. There is no cap on the credit amount.",
    },
    {
      question: "How long does it take for solar panels to pay for themselves?",
      answer: `The national average payback period is ${avgPayback} years. States with high electricity rates and good sun exposure (like Hawaii, California, and Massachusetts) have the fastest payback at 4-6 years. States with low rates and less sun may take 12-15 years.`,
    },
    {
      question: "Which states are best for solar panels?",
      answer: `The best states for solar energy are ${bestSolar.map(s => s.state).join(', ')}. These states have the highest peak sun hours (5.5-6.5 hours/day), strong incentives, and net metering policies.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <h1 className="text-3xl md:text-4xl font-bold text-orange-800 mb-4">
        US Solar Panel Costs, Savings &amp; Incentives by State
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Compare solar potential across all 50 states. The national average payback period is{" "}
        <strong>{avgPayback} years</strong> with average 20-year savings of{" "}
        <strong>{formatCurrency(avg20yrSavings)}</strong>. Use our calculator below to estimate your solar ROI.
      </p>

      <AdSlot id="2345678901" />

      {/* State grid with sun hours color */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Solar Potential by State</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {states.map((s) => (
            <a
              key={s.abbr}
              href={`/state/${s.slug}/`}
              className="block p-3 rounded-lg border border-slate-200 hover:shadow-md transition-shadow hover:border-orange-300"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{s.abbr}</span>
                <span className={`w-3 h-3 rounded-full ${getSunColor(s.avg_sun_hours)}`} />
              </div>
              <p className="text-lg font-bold text-slate-800">{formatSunHours(s.avg_sun_hours)}</p>
              <p className="text-xs text-slate-500">{s.state}</p>
              <p className="text-xs text-slate-400">{s.avg_payback_years}yr payback</p>
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> Excellent (6+hrs)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Good (5-6hrs)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-300" /> Moderate (4-5hrs)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-200" /> Low (&lt;4hrs)</span>
        </div>
      </section>

      {/* Best/Worst states */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-xl font-bold text-orange-700 mb-3">Top 5 States for Solar</h2>
          <div className="space-y-2">
            {bestSolar.map((s, i) => (
              <a key={s.abbr} href={`/state/${s.slug}/`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-orange-600">#{i + 1}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{s.state}</p>
                    <p className="text-xs text-slate-500">{s.avg_payback_years}yr payback &middot; {formatCurrency(s.avg_20yr_savings)} savings</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-600">{formatSunHours(s.avg_sun_hours)}</span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-green-700 mb-3">Fastest Solar Payback</h2>
          <div className="space-y-2">
            {fastestPayback.map((s, i) => (
              <a key={s.abbr} href={`/state/${s.slug}/`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-600">#{i + 1}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{s.state}</p>
                    <p className="text-xs text-slate-500">{formatSunHours(s.avg_sun_hours)} &middot; {formatCurrency(s.avg_20yr_savings)} savings</p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${getPaybackColor(s.avg_payback_years)}`}>{s.avg_payback_years}yr</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <AdSlot id="3456789012" />

      {/* Calculator */}
      <section className="mb-12">
        <SolarCalculator
          states={states.map(s => ({
            abbr: s.abbr,
            state: s.state,
            avg_sun_hours: s.avg_sun_hours,
            avg_system_cost_per_watt: s.avg_system_cost_per_watt,
            federal_tax_credit_pct: s.federal_tax_credit_pct,
            state_tax_credit: s.state_tax_credit,
            state_rebate: s.state_rebate,
            avg_electricity_rate: s.avg_electricity_rate,
            net_metering: s.net_metering,
          }))}
        />
      </section>

      {/* Highest 20yr savings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Highest 20-Year Solar Savings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Rank</th>
                <th className="text-left px-4 py-2 font-medium text-slate-600">State</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Sun Hours</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Payback</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">20-Year Savings</th>
              </tr>
            </thead>
            <tbody>
              {highestSavings.map((s, i) => (
                <tr key={s.abbr} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-bold text-orange-600">#{i + 1}</td>
                  <td className="px-4 py-2"><a href={`/state/${s.slug}/`} className="text-orange-600 hover:underline">{s.state}</a></td>
                  <td className="px-4 py-2 text-right">{formatSunHours(s.avg_sun_hours)}</td>
                  <td className="px-4 py-2 text-right">{s.avg_payback_years} years</td>
                  <td className="px-4 py-2 text-right font-bold text-green-700">{formatCurrency(s.avg_20yr_savings)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot id="4567890123" />

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-slate-50 rounded-lg border border-slate-200 p-4" open={i === 0}>
              <summary className="font-semibold text-slate-800 cursor-pointer">{faq.question}</summary>
              <p className="mt-2 text-slate-600 text-sm">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cross-references */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-3 text-sm">
          <a href="https://powerbillpeek.com" className="text-orange-600 hover:underline">Electricity Rates by State</a>
          <a href="https://propertytaxpeek.com" className="text-orange-600 hover:underline">Property Tax Data</a>
          <a href="https://costbycity.com" className="text-orange-600 hover:underline">Cost of Living by City</a>
        </div>
      </section>

      <FreshnessTag source="NREL, DSIRE, EIA" />
    </>
  );
}
