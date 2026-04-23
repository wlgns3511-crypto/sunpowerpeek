import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllStates, getStateBySlug, type State } from '@/lib/db';
import { formatCurrency } from '@/lib/format';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { Breadcrumb } from '@/components/Breadcrumb';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { EditorNote } from '@/components/EditorNote';
import { FreshnessTag } from '@/components/FreshnessTag';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FeedbackButton } from '@/components/FeedbackButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

// System sizes (kW) and typical use cases
const SYSTEM_SIZES = [
  { kW: 4, label: '4 kW', use: 'Small home · 400–700 kWh/mo' },
  { kW: 6, label: '6 kW', use: 'Avg home · 700–1,000 kWh/mo' },
  { kW: 8, label: '8 kW', use: 'Large home · 1,000–1,400 kWh/mo' },
  { kW: 10, label: '10 kW', use: 'EV + AC · 1,400–1,800 kWh/mo' },
  { kW: 12, label: '12 kW', use: 'All-electric · 1,800–2,200 kWh/mo' },
  { kW: 15, label: '15 kW', use: 'Large all-electric + 2 EVs · 2,200+ kWh/mo' },
];

// Annual degradation = 0.5%/yr; DC-to-AC derate = 0.85; 20-yr avg output factor ~0.95 of yr-1
const DC_AC_DERATE = 0.85;

function calcForSize(state: State, kW: number) {
  const watts = kW * 1000;
  const grossCost = Math.round(state.avg_system_cost_per_watt * watts);
  const fedCredit = Math.round(grossCost * (state.federal_tax_credit_pct / 100));
  const stateCredit = Math.round(state.state_tax_credit); // flat $ per state
  const rebate = Math.round(state.state_rebate);          // flat $ per state
  const netCost = grossCost - fedCredit - stateCredit - rebate;

  // Annual output kWh (yr 1)
  const annualOutputKwh = Math.round(watts * state.avg_sun_hours * 365 * DC_AC_DERATE / 1000);
  // 20-yr output accounting for 0.5%/yr degradation ≈ 0.95 × 20 × yr1 = 19 × yr1
  const twentyYrOutputKwh = Math.round(annualOutputKwh * 19);
  // 20-yr $ savings = output × electricity rate (¢→$)
  const twentyYrSavings = Math.round(twentyYrOutputKwh * state.avg_electricity_rate / 100);
  // Annual savings yr-1
  const annualSavings = Math.round(annualOutputKwh * state.avg_electricity_rate / 100);
  // Payback years (yr-1 linear approximation)
  const paybackYears = annualSavings > 0 ? Number((netCost / annualSavings).toFixed(1)) : 0;
  // Net 20-yr profit
  const net20yrProfit = twentyYrSavings - netCost;
  return { grossCost, fedCredit, stateCredit, rebate, netCost, annualOutputKwh, annualSavings, twentyYrSavings, paybackYears, net20yrProfit };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const calc10 = calcForSize(state, 10);
  const title = `${state.state} Solar ROI by System Size: 4kW–15kW Payback Matrix (2026)`;
  const description = `${state.state} 10 kW net cost ${formatCurrency(calc10.netCost)} after ITC, ${calc10.paybackYears}-yr payback, ${formatCurrency(calc10.twentyYrSavings)} 20-yr savings. Compare 4/6/8/10/12/15 kW systems at ${state.avg_sun_hours} peak sun hrs, ${state.avg_electricity_rate}¢/kWh.`;
  return {
    title,
    description,
    alternates: { canonical: `/state/${slug}/roi-by-system-size/` },
    openGraph: { title, description, url: `/state/${slug}/roi-by-system-size/` },
  };
}

export default async function RoiBySystemSizePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const rows = SYSTEM_SIZES.map((s) => ({ ...s, calc: calcForSize(state, s.kW) }));

  // Find the cheapest net 10 kW + fastest payback + highest 20-yr savings (for context)
  const calc10 = calcForSize(state, 10);
  const calc6 = calcForSize(state, 6);
  const calc15 = calcForSize(state, 15);

  // Cheapest & fastest & savings leaders
  const allStates = getAllStates();
  const rankBy10kwPayback = [...allStates]
    .map((s) => ({ state: s, c: calcForSize(s, 10) }))
    .sort((a, b) => a.c.paybackYears - b.c.paybackYears);
  const thisPaybackRank = rankBy10kwPayback.findIndex((r) => r.state.slug === slug) + 1;

  const rankBy10kwSavings = [...allStates]
    .map((s) => ({ state: s, c: calcForSize(s, 10) }))
    .sort((a, b) => b.c.twentyYrSavings - a.c.twentyYrSavings);
  const thisSavingsRank = rankBy10kwSavings.findIndex((r) => r.state.slug === slug) + 1;

  // Peer states: 4 with closest avg_sun_hours
  const peers = allStates
    .filter((s) => s.slug !== slug)
    .map((s) => ({ state: s, diff: Math.abs(s.avg_sun_hours - state.avg_sun_hours) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 4)
    .map((p) => ({ ...p, c: calcForSize(p.state, 10) }));

  const breadcrumbsLd = [
    { name: 'Home', url: '/' },
    { name: state.state, url: `/state/${slug}/` },
    { name: 'ROI by System Size', url: `/state/${slug}/roi-by-system-size/` },
  ];
  const breadcrumbsUi = [
    { label: 'Home', href: '/' },
    { label: state.state, href: `/state/${slug}/` },
    { label: 'ROI by System Size' },
  ];

  const faqs = [
    {
      question: `What size solar system is best for an average home in ${state.state}?`,
      answer: `For 700–1,000 kWh/month homes in ${state.state}, a 6 kW system produces about ${calc6.annualOutputKwh.toLocaleString()} kWh/year at ${state.avg_sun_hours} peak sun hours, covering most bills. Net cost after the 30% federal tax credit: ${formatCurrency(calc6.netCost)}, payback in ${calc6.paybackYears} years, 20-year savings ${formatCurrency(calc6.twentyYrSavings)}.`,
    },
    {
      question: `Why does the 20-year savings vary so much between ${state.state} and other states?`,
      answer: `Two variables dominate: peak sun hours (${state.avg_sun_hours} in ${state.state}) and retail electricity rate (${state.avg_electricity_rate}¢/kWh). States with both high sun and high rates (e.g. Arizona, Hawaii) top 20-yr savings even though install cost per watt is similar. ${state.state} ranks #${thisSavingsRank} of 51 for 10 kW 20-yr savings.`,
    },
    {
      question: `Does the 30% federal ITC apply to the state rebate amount too?`,
      answer: `The federal Investment Tax Credit (ITC, 26 U.S.C. § 25D) is calculated on the gross system cost before state rebates reduce the base. State-level rebates come off the post-ITC net. Order of application: gross → 30% ITC → state tax credit → state rebate → net. ${state.state}'s state-specific add-ons: ${formatCurrency(state.state_tax_credit)} state credit + ${formatCurrency(state.state_rebate)} rebate.`,
    },
    {
      question: `How does net metering in ${state.state} affect the payback math?`,
      answer: `${state.state} uses ${state.net_metering} net metering. With full retail net metering, excess kWh export at the same rate you buy (${state.avg_electricity_rate}¢/kWh) — best for ROI. Partial or avoided-cost net metering pays wholesale (3–5¢/kWh) for exports, so sizing above your actual consumption loses money. Our table assumes consumption matches production.`,
    },
    {
      question: `Should I oversize my system for an EV I don't own yet?`,
      answer: `Slight oversize (10–15%) is reasonable — panels last 25–30 years and EV adoption is rising. But going from 8 kW to 12 kW costs ~${formatCurrency(calcForSize(state, 12).netCost - calcForSize(state, 8).netCost)} net in ${state.state} and only pays back if you actually add ~5,000 kWh/yr of EV charging load. Add capacity when you buy the EV — solar permits typically allow expansion.`,
    },
    {
      question: `Does ${state.state} allow stacking the federal ITC with the state tax credit?`,
      answer: `Yes — 49 states allow stacking. The federal ITC is nonrefundable (carries forward up to 5 years) and the state credit is separate. ${state.state}'s state tax credit is ${formatCurrency(state.state_tax_credit)}. Only caveat: state rebates reduce the federal ITC basis in some states (check with your installer and a CPA).`,
    },
    {
      question: `Why is the payback range 4x wider than the 20-yr savings range across system sizes?`,
      answer: `Net cost scales nearly linearly with size (cost/watt is roughly constant), but payback = net cost ÷ annual savings. Annual savings also scale linearly with size, so payback actually stays fairly constant across sizes (${rows[0].calc.paybackYears}–${rows[rows.length - 1].calc.paybackYears} yrs in ${state.state}). The real payback variance comes across states (${rankBy10kwPayback[0].c.paybackYears}–${rankBy10kwPayback[rankBy10kwPayback.length - 1].c.paybackYears} yrs for 10 kW nationally).`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbSchema(breadcrumbsLd), faqSchema(faqs)]) }}
      />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbsUi} />

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {state.state} Solar ROI by System Size: 4kW–15kW Payback Matrix
        </h1>
        <p className="text-slate-600 mb-4">
          See net cost after the 30% federal ITC, annual output, payback, and 20-year savings for six system sizes in {state.state} —
          at {state.avg_sun_hours} peak sun hours and {state.avg_electricity_rate}¢/kWh retail.
        </p>

        <FreshnessTag source="NREL PVWatts · DSIRE · state utility commissions" />

        <EditorNote
          note={`ROI numbers assume a ${DC_AC_DERATE} DC-to-AC derate (NREL PVWatts default), 0.5%/yr panel degradation, 20-yr ownership, and that production matches consumption (no excess export loss). Actual payback depends on your roof orientation, shading, and whether ${state.state}'s ${state.net_metering} net-metering policy credits exports at retail or avoided-cost rate.`}
        />

        {/* Spotlight cards */}
        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">6 kW (avg home)</p>
            <p className="text-2xl font-bold text-amber-900 mt-1">{formatCurrency(calc6.netCost)}</p>
            <p className="text-sm text-slate-600 mt-1">net · {calc6.paybackYears}-yr payback</p>
            <p className="text-xs text-slate-500 mt-2">20-yr savings: {formatCurrency(calc6.twentyYrSavings)}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">10 kW (EV + AC)</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(calc10.netCost)}</p>
            <p className="text-sm text-slate-600 mt-1">net · {calc10.paybackYears}-yr payback</p>
            <p className="text-xs text-slate-500 mt-2">Rank #{thisPaybackRank}/51 for payback, #{thisSavingsRank}/51 for savings</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">15 kW (all-electric+EVs)</p>
            <p className="text-2xl font-bold text-yellow-900 mt-1">{formatCurrency(calc15.netCost)}</p>
            <p className="text-sm text-slate-600 mt-1">net · {calc15.paybackYears}-yr payback</p>
            <p className="text-xs text-slate-500 mt-2">20-yr profit: {formatCurrency(calc15.net20yrProfit)}</p>
          </div>
        </section>

        <AdSlot id="6789012345" />

        {/* Main ROI matrix */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Full ROI Matrix — {state.state}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">Size</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Gross cost</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">30% ITC</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">State credits</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Net cost</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Annual kWh</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Payback</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">20-yr savings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.kW} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <div className="font-semibold text-slate-900">{r.label}</div>
                      <div className="text-xs text-slate-500">{r.use}</div>
                    </td>
                    <td className="text-right px-3 py-2">{formatCurrency(r.calc.grossCost)}</td>
                    <td className="text-right px-3 py-2 text-green-700">&minus;{formatCurrency(r.calc.fedCredit)}</td>
                    <td className="text-right px-3 py-2 text-green-700">
                      {r.calc.stateCredit + r.calc.rebate > 0 ? `−${formatCurrency(r.calc.stateCredit + r.calc.rebate)}` : '—'}
                    </td>
                    <td className="text-right px-3 py-2 font-semibold">{formatCurrency(r.calc.netCost)}</td>
                    <td className="text-right px-3 py-2">{r.calc.annualOutputKwh.toLocaleString()}</td>
                    <td className="text-right px-3 py-2">{r.calc.paybackYears} yr</td>
                    <td className="text-right px-3 py-2 font-semibold text-emerald-700">{formatCurrency(r.calc.twentyYrSavings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Which size for me? */}
        <section className="mb-8 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
          <h2 className="text-lg font-bold text-amber-900 mb-3">Which system size is right for your {state.state} home?</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-slate-800 mb-1">Rule of thumb:</p>
              <p className="text-slate-700">
                Take your last 12-month kWh from your utility bill, divide by 365, then divide by {state.avg_sun_hours} (your peak sun hours)
                and by {DC_AC_DERATE} (derate). The result is the kW size that covers 100% of your bill.
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-800 mb-1">Example ({state.state}):</p>
              <p className="text-slate-700">
                12,000 kWh/yr ÷ 365 ÷ {state.avg_sun_hours} ÷ {DC_AC_DERATE} ≈{' '}
                {(12000 / 365 / state.avg_sun_hours / DC_AC_DERATE).toFixed(1)} kW — pick the nearest size above.
                If export credit is avoided-cost only, undersize by 5–10% instead of oversizing.
              </p>
            </div>
          </div>
        </section>

        {/* Peer state comparison */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">
            Peer States — 10 kW Comparison (similar sun hours)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-slate-600">State</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Sun hrs</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Rate ¢/kWh</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">10 kW net</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">Payback</th>
                  <th className="text-right px-3 py-2 font-medium text-slate-600">20-yr savings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100 bg-amber-50/40 font-semibold">
                  <td className="px-3 py-2">
                    <span className="text-amber-700">◆ {state.state}</span>
                  </td>
                  <td className="text-right px-3 py-2">{state.avg_sun_hours}</td>
                  <td className="text-right px-3 py-2">{state.avg_electricity_rate}</td>
                  <td className="text-right px-3 py-2">{formatCurrency(calc10.netCost)}</td>
                  <td className="text-right px-3 py-2">{calc10.paybackYears} yr</td>
                  <td className="text-right px-3 py-2 text-emerald-700">{formatCurrency(calc10.twentyYrSavings)}</td>
                </tr>
                {peers.map((p) => (
                  <tr key={p.state.slug} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <Link href={`/state/${p.state.slug}/roi-by-system-size/`} className="text-blue-600 hover:underline">
                        {p.state.state}
                      </Link>
                    </td>
                    <td className="text-right px-3 py-2">{p.state.avg_sun_hours}</td>
                    <td className="text-right px-3 py-2">{p.state.avg_electricity_rate}</td>
                    <td className="text-right px-3 py-2">{formatCurrency(p.c.netCost)}</td>
                    <td className="text-right px-3 py-2">{p.c.paybackYears} yr</td>
                    <td className="text-right px-3 py-2 text-emerald-700">{formatCurrency(p.c.twentyYrSavings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Peer set: 4 states with avg peak sun hours within {Math.max(...peers.map((p) => p.diff)).toFixed(2)} of {state.state}&apos;s {state.avg_sun_hours}.
          </p>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">{state.state} Solar ROI FAQ</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group border border-slate-200 rounded-lg bg-white">
                <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 hover:bg-slate-50">
                  {f.question}
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-700 leading-6">{f.answer}</div>
              </details>
            ))}
          </div>
        </section>

        <DataSourceBadge
          sources={[
            { name: 'NREL PVWatts Calculator', url: 'https://pvwatts.nrel.gov/' },
            { name: 'DSIRE — Database of State Incentives', url: 'https://www.dsireusa.org/' },
            { name: 'EIA — Average Retail Rates', url: 'https://www.eia.gov/electricity/data.php' },
            { name: '26 U.S.C. § 25D (Federal ITC)', url: 'https://www.law.cornell.edu/uscode/text/26/25D' },
          ]}
        />

        <FeedbackButton pageId={`${slug}-roi-by-system-size`} label="Was this ROI matrix helpful?" />
        <AuthorBox />

        <div className="mt-8 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 mb-1">
            ← Back to overview
          </p>
          <Link
            href={`/state/${slug}/`}
            className="text-base font-semibold text-orange-900 hover:text-orange-700"
          >
            {state.state} solar costs, incentives, and full state overview →
          </Link>
        </div>

        <CrossSiteLinks current="sunpowerpeek" />
      </div>
    </>
  );
}
