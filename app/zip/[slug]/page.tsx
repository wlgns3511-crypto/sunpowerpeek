import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllZips, getZipBySlug, getStateByAbbr, getZipsByState, getNationalAvgSunHours, getNationalAvgPayback, getNationalAvgAnnualSavings, getStateRankBySunHours, getTotalStates, getNationalAvg20yrSavings } from "@/lib/db";
import { formatCurrency, formatSunHours, getPaybackColor } from "@/lib/format";
import { faqSchema, breadcrumbSchema } from "@/lib/schema";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { FreshnessTag } from "@/components/FreshnessTag";
import { AuthorBox } from "@/components/AuthorBox";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  // Pre-render top 500 ZIPs; rest served via ISR
  const zips = getAllZips().slice(0, 500);
  return zips.map((z) => ({ slug: z.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const zip = getZipBySlug(slug);
  if (!zip) return {};
  return {
    title: `Solar Panels in ${zip.zip_code} ${zip.city}, ${zip.state} - ${zip.payback_years}yr Payback`,
    description: `Solar panel data for ${zip.zip_code} ${zip.city}, ${zip.state}. ${zip.peak_sun_hours} peak sun hours, $${zip.annual_savings.toLocaleString()} annual savings, ${zip.payback_years}-year payback period. 6kW system costs $${zip.system_cost_6kw.toLocaleString()}.`,
    alternates: { canonical: `/zip/${slug}/` },
    openGraph: { url: `/zip/${slug}/` },
  };
}

export default async function ZipPage({ params }: PageProps) {
  const { slug } = await params;
  const zip = getZipBySlug(slug);
  if (!zip) notFound();

  const state = getStateByAbbr(zip.state);
  if (!state) notFound();

  const stateZips = getZipsByState(zip.state).filter(z => z.zip_code !== zip.zip_code).slice(0, 10);

  const netCost = Math.round(zip.system_cost_6kw * 0.7); // after 30% ITC
  const savings20yr = zip.annual_savings * 20 - netCost;

  const faqs = [
    {
      question: `How much do solar panels cost in ${zip.zip_code} ${zip.city}?`,
      answer: `A 6kW solar system in ${zip.zip_code} ${zip.city} costs approximately $${zip.system_cost_6kw.toLocaleString()} before the 30% federal tax credit. After the credit, net cost is approximately $${netCost.toLocaleString()}.`,
    },
    {
      question: `How much will I save with solar in ${zip.zip_code}?`,
      answer: `Homeowners in ${zip.zip_code} can save approximately $${zip.annual_savings.toLocaleString()} per year with a 6kW system, producing ${zip.annual_production_kwh.toLocaleString()} kWh annually. Over 20 years, total savings are approximately $${Math.round(savings20yr).toLocaleString()}.`,
    },
    {
      question: `How much sun does ${zip.zip_code} ${zip.city} get?`,
      answer: `${zip.zip_code} ${zip.city} averages ${zip.peak_sun_hours} peak sun hours per day, which determines solar panel output. A 6kW system here produces approximately ${zip.annual_production_kwh.toLocaleString()} kWh per year.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: state.state, url: `/state/${state.slug}/` },
        { name: `${zip.zip_code} ${zip.city}`, url: `/zip/${slug}/` },
      ])) }} />

      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: state.state, href: `/state/${state.slug}/` },
        { label: `${zip.zip_code} ${zip.city}` },
      ]} />

      <h1 className="text-3xl font-bold text-orange-800 mb-2">
        Solar Panels in {zip.zip_code} {zip.city}, {zip.state}
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        {zip.zip_code} {zip.city} receives <strong>{formatSunHours(zip.peak_sun_hours)}</strong> of peak sun daily.
        A 6kW system saves <strong className="text-green-700">{formatCurrency(zip.annual_savings)}/year</strong> with
        a <strong className={getPaybackColor(zip.payback_years)}>{zip.payback_years}-year payback</strong>.
      </p>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Peak Sun Hours</p>
          <p className="text-2xl font-bold text-orange-700">{formatSunHours(zip.peak_sun_hours)}</p>
          <p className="text-xs text-slate-500">per day</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">6kW System Cost</p>
          <p className="text-2xl font-bold text-blue-700">${zip.system_cost_6kw.toLocaleString()}</p>
          <p className="text-xs text-slate-500">before incentives</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Annual Savings</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(zip.annual_savings)}</p>
          <p className="text-xs text-slate-500">per year</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Annual Production</p>
          <p className="text-2xl font-bold text-emerald-700">{zip.annual_production_kwh.toLocaleString()}</p>
          <p className="text-xs text-slate-500">kWh/year</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Payback Period</p>
          <p className={`text-2xl font-bold ${getPaybackColor(zip.payback_years)}`}>{zip.payback_years} years</p>
          <p className="text-xs text-slate-500">estimated</p>
        </div>
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">CO2 Offset</p>
          <p className="text-2xl font-bold text-teal-700">{zip.co2_offset_tons} tons</p>
          <p className="text-xs text-slate-500">per year</p>
        </div>
      </div>

      {/* Solar Insights */}
      {(() => {
        const avgSun = getNationalAvgSunHours();
        const avgPayback = getNationalAvgPayback();
        const avgSavings = getNationalAvgAnnualSavings();
        const stateRank = getStateRankBySunHours(zip.state);
        const totalStates = getTotalStates();
        const avg20yr = getNationalAvg20yrSavings();
        const insights: string[] = [];

        const sunDiff = ((zip.peak_sun_hours - avgSun) / avgSun) * 100;
        insights.push(`Solar potential of ${zip.peak_sun_hours} peak sun hours/day is ${Math.abs(Math.round(sunDiff))}% ${sunDiff > 0 ? 'above' : 'below'} the national average of ${avgSun} hours`);

        const paybackDiff = zip.payback_years - avgPayback;
        insights.push(`Estimated payback of ${zip.payback_years} years is ${Math.abs(Math.round(Math.abs(paybackDiff) * 10) / 10)} years ${paybackDiff < 0 ? 'faster' : 'slower'} than the national average of ${avgPayback} years`);

        insights.push(`${state.state} ranks #${stateRank} out of ${totalStates} states for average peak sun hours`);

        const savDiff = ((zip.annual_savings - avgSavings) / avgSavings) * 100;
        insights.push(`Annual savings of ${formatCurrency(zip.annual_savings)} is ${Math.abs(Math.round(savDiff))}% ${savDiff > 0 ? 'above' : 'below'} the national average of ${formatCurrency(avgSavings)}`);

        const localNet20yr = zip.annual_savings * 20 - netCost;
        insights.push(`20-year net savings of ${formatCurrency(localNet20yr)} compare to a national average of ${formatCurrency(avg20yr)}`);

        return (
          <section className="mb-8 bg-amber-50 border border-amber-100 rounded-xl p-5">
            <h2 className="text-lg font-bold text-amber-900 mb-3">Solar Insights for {zip.zip_code} {zip.city}</h2>
            <ul className="space-y-2">
              {insights.map((insight, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5 font-bold">&bull;</span>
                  {insight}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-3">Source: NREL, DSIRE, EIA. Calculations based on a standard 6kW residential system.</p>
          </section>
        );
      })()}

      <AdSlot id="7890123456" />

      {/* Cost breakdown */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Solar Cost Breakdown for {zip.zip_code}</h2>
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
                <td className="px-4 py-2">6kW System Cost</td>
                <td className="px-4 py-2 text-right font-medium">${zip.system_cost_6kw.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2 text-green-700">Federal Tax Credit (30%)</td>
                <td className="px-4 py-2 text-right font-medium text-green-700">-${Math.round(zip.system_cost_6kw * 0.3).toLocaleString()}</td>
              </tr>
              <tr className="border-t-2 border-slate-300 bg-orange-50">
                <td className="px-4 py-2 font-bold">Net Cost (after federal credit)</td>
                <td className="px-4 py-2 text-right font-bold text-orange-700">${netCost.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Annual Savings</td>
                <td className="px-4 py-2 text-right font-medium text-green-700">{formatCurrency(zip.annual_savings)}/yr</td>
              </tr>
              <tr className="border-t border-slate-100 bg-green-50">
                <td className="px-4 py-2 font-bold">20-Year Net Savings</td>
                <td className="px-4 py-2 text-right font-bold text-green-700">{formatCurrency(savings20yr)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Nearby ZIPs */}
      {stateZips.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Other ZIP Codes in {state.state}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stateZips.map(z => (
              <a key={z.zip_code} href={`/zip/${z.slug}/`} className="p-3 text-center rounded-lg border border-slate-200 hover:border-orange-300 transition-colors">
                <p className="font-semibold text-sm">{z.zip_code}</p>
                <p className="text-xs text-slate-500">{z.city}</p>
                <p className="text-xs text-slate-400">{formatCurrency(z.annual_savings)}/yr</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Compare solar with other ZIPs */}
      {stateZips.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">
            Compare Solar in {zip.zip_code} vs Nearby ZIPs
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            See how solar potential in {zip.zip_code} {zip.city} compares with other areas in {state.state}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stateZips.slice(0, 6).map((nz) => {
              const savDiff = nz.annual_savings - zip.annual_savings;
              const diffLabel = savDiff > 0 ? `${formatCurrency(Math.abs(savDiff))}/yr more` : savDiff < 0 ? `${formatCurrency(Math.abs(savDiff))}/yr less` : "same savings";
              return (
                <a
                  key={nz.zip_code}
                  href={`/zip/${nz.slug}/`}
                  className="flex justify-between items-center p-3 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-sm"
                >
                  <span>
                    <span className="font-medium text-orange-700">{zip.zip_code} vs {nz.zip_code}</span>{" "}
                    <span className="text-slate-500">{nz.city}</span>
                  </span>
                  <span className={`text-xs font-medium ${savDiff > 0 ? "text-green-600" : savDiff < 0 ? "text-red-600" : "text-slate-500"}`}>
                    {diffLabel}
                  </span>
                </a>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            <a href={`/compare/${state.slug}-vs-${state.slug}-solar/`} className="text-orange-600 hover:underline">
              Compare {state.state} solar with other states
            </a>
          </p>
        </section>
      )}

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

      {/* Cross-references */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">More Data</h2>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href={`/state/${state.slug}/`} className="text-orange-600 hover:underline">{state.state} Solar Overview</a>
          <a href="/incentives/" className="text-orange-600 hover:underline">Solar Incentives</a>
          <a href="/calculator/" className="text-orange-600 hover:underline">Solar Calculator</a>
          <a href="https://powerbillpeek.com" className="text-orange-600 hover:underline">Electricity Rates</a>
        </div>
      </section>

      <DataFeedback />
      <FreshnessTag source="NREL, DSIRE, EIA" />
      <AuthorBox />
    </>
  );
}
