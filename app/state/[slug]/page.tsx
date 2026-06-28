import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStates, getStateBySlug, getZipsByState, getIncentivesByState, getNationalAvgSunHours, getNationalAvgPayback, getNationalAvg20yrSavings, getStateRankBySunHours, getPaybackRank, getSavingsRank, getTotalStatesCount, getNeighboringStates } from "@/lib/db";
import { formatCurrency, formatSunHours, formatPercent, getPaybackColor, getNetMeteringLabel, getNetMeteringColor, getSunTextColor } from "@/lib/format";
import { getStateInsights } from "@/lib/state-insights";
import { faqSchema, breadcrumbSchema, datasetSchema } from "@/lib/schema";
import { generateAutoFaqs } from "@/lib/auto-faqs";
import { ENTITY_VINTAGE } from "@/lib/authorship";
import { PaybackStateMap } from "@/components/PaybackStateMap";
import { classifyItcPaybackBand, tierToneColor, type ItcPaybackTier } from "@/lib/itc-payback-band";
import { classifyNetMeteringTier, netMeteringToneColor } from "@/lib/net-metering-tier";
import { classifySolarIrradianceTier, irradianceToneColor } from "@/lib/solar-irradiance-tier";
import { interpretSolar } from "@/lib/solar-interpretation";
import { SolarInterpretation } from "@/components/upgrades/SolarInterpretation";
import { SolarEmpiricalBlock } from "@/components/upgrades/SolarEmpiricalBlock";
import { getSolarEmpirical, EIA_VINTAGE } from "@/lib/solar-empirical-outcomes";
import { AuthorBox } from "@/components/AuthorBox";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { SolarCalculator } from "@/components/SolarCalculator";
import { InsightCards } from "@/components/InsightCards";
import { FreshnessTag } from "@/components/FreshnessTag";
import { CiteButton } from "@/components/CiteButton";
import { AnswerHero } from "@/components/upgrades/AnswerHero";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { RelatedEntities } from "@/components/upgrades/RelatedEntities";
import { DecisionNext } from "@/components/upgrades/DecisionNext";
import { TableOfContents } from "@/components/upgrades/TableOfContents";
import { SolarSavingsCalc } from "@/components/tools/SolarSavingsCalc";
import { FeedbackButton } from "@/components/FeedbackButton";
import { StateRich } from '@/components/state/StateRich';
import { StateAnalyticStrip } from '@/components/state/StateAnalyticStrip';
import { SourcedIncentiveCard } from '@/components/state/SourcedIncentiveCard';
import { getIncentiveBundle } from '@/lib/state-facts';
import { StateHeroImage } from '@/components/StateHeroImage';
import { getStateImage } from '@/lib/state-images';
import { calculateProprietaryMetrics } from '@/lib/proprietary-metrics';
import { ProprietaryMetricsBlock } from '@/components/upgrades/ProprietaryMetricsBlock';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const states = getAllStates();
  return states.map((s) => ({ slug: s.slug }));
}

// Phase 7 v7.0 (2026-05-20) — VERDICT_TITLE_LABEL maps the ItcPaybackTier A–E
// to a compressed scan-friendly head term. Mirrors wagepeek's pattern and
// florawize trap #112: replace boilerplate suffix chars with verdict-bearing
// chars. Worst-case state "District of Columbia" (20c) + ": " + "Excellent"
// (9c) + " Solar Payback · " (17c) + "12.3yr" (6c) = 54c — under the 60c cap.
// scripts/audit-phase7.ts asserts this across all 51 states.
const VERDICT_TITLE_LABEL: Record<ItcPaybackTier, string> = {
  A: 'Excellent',
  B: 'Strong',
  C: 'Moderate',
  D: 'Slow',
  E: 'Avoid',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  // Recompute payback tier so the title can carry the verdict signal —
  // mirrors the body-page classifyItcPaybackBand call so the title and body
  // always agree. If inputs are missing, tier is null and we fall back to a
  // non-verdict shape.
  const annualKwh = state.avg_sun_hours * 365 * 6;
  const itcBand = classifyItcPaybackBand({
    systemCostPerWatt: state.avg_system_cost_per_watt,
    systemSizeWatts: 6000,
    federalItcPct: state.federal_tax_credit_pct,
    stateRebateUsd: state.state_rebate,
    stateTaxCreditPct: state.state_tax_credit,
    annualKwh,
    retailRateCentsPerKwh: state.avg_electricity_rate,
  });
  const tierLabel = itcBand.tier ? VERDICT_TITLE_LABEL[itcBand.tier] : null;
  const title = tierLabel && itcBand.paybackYears != null
    ? `${state.state}: ${tierLabel} Solar Payback · ${itcBand.paybackYears.toFixed(1)}yr`
    : `${state.state} Solar Cost & Savings 2026`;
  const low = Math.round(state.avg_system_cost_per_watt * 4000);
  const high = Math.round(state.avg_system_cost_per_watt * 10000);

  const savingsRk = getSavingsRank(state.abbr);
  const metrics = calculateProprietaryMetrics(
    state.state,
    slug,
    state.avg_sun_hours,
    state.avg_payback_years,
    state.net_metering,
    savingsRk
  );

  const description = `[Solar Profile: Solar Grade ${metrics.overallGrade}, Payback Score ${metrics.paybackScore}/100] ${state.state} solar install ranges from $${low.toLocaleString()} (4kW) to $${high.toLocaleString()} (10kW) before the 30% federal tax credit. ${state.avg_sun_hours} peak sun hrs, ${state.avg_payback_years}-yr payback, ${formatCurrency(state.avg_20yr_savings)} 20-yr savings. Based on NREL and DSIRE inputs.`;
  return {
    // title.absolute bypasses the root layout's `%s | SunPowerPeek` (15c)
    // template — the verdict-bearing string is what Google indexes. Trap #117
    // (60c title-rewrite budget).
    title: { absolute: title },
    description,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: { title, description, url: `/state/${slug}/` },
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

  const stateInsights = getStateInsights(state);

  // ItcPaybackBand — 5-tier deterministic classifier (NREL + DSIRE + EIA + IRS Form 5695).
  // 6 kW reference system × NREL PVWatts annual kWh (avg_sun_hours × 365 × 6 kW)
  // × EIA retail rate, net of 30% federal ITC + DSIRE state rebate + state tax credit.
  const annualKwh = state.avg_sun_hours * 365 * 6;
  const itcBand = classifyItcPaybackBand({
    systemCostPerWatt: state.avg_system_cost_per_watt,
    systemSizeWatts: 6000,
    federalItcPct: state.federal_tax_credit_pct,
    stateRebateUsd: state.state_rebate,
    stateTaxCreditPct: state.state_tax_credit,
    annualKwh,
    retailRateCentsPerKwh: state.avg_electricity_rate,
  });
  const itcTone = tierToneColor(itcBand.tier);

  // NetMeteringTier — DSIRE 5-tier export-credit policy decoder (T1–T5).
  const incentiveTexts = incentives.map(i => `${i.incentive_name}\n${i.description}`);
  const nemTier = classifyNetMeteringTier({
    stateAbbr: state.abbr,
    netMeteringRaw: state.net_metering,
    incentiveTexts,
  });
  const nemTone = netMeteringToneColor(nemTier.tier);

  // SolarIrradianceTier — NREL PVWatts 5-band on avg_sun_hours (A–E).
  const irrTier = classifySolarIrradianceTier({
    stateAbbr: state.abbr,
    avgSunHours: state.avg_sun_hours,
  });
  const irrTone = irradianceToneColor(irrTier.tier);

  // Phase 7 Empirical-Outcomes — EIA Form 861 Table 11 residential net-metering
  // aggregates (cumulative capacity + customer counts + YoY growth). Loaded
  // here so the dataset schema variableMeasured can carry the empirical
  // dimensions that SolarEmpiricalBlock renders below SolarInterpretation.
  const eiaEmpirical = getSolarEmpirical(slug);

  // SolarInterpretation — composite verdict atop the three deterministic levers.
  const interp = interpretSolar({
    paybackTier: itcBand.tier,
    netMeteringTier: nemTier.tier,
    irradianceTier: irrTier.tier,
    paybackYears: itcBand.paybackYears,
    avgSunHours: irrTier.avgSunHours,
    retailRateCentsPerKwh: itcBand.retailRateCentsPerKwh,
    stateAbbr: state.abbr,
    stateName: state.state,
  });

  const sunDiff = state.avg_sun_hours - nationalSun;
  const isAboveAvgSun = sunDiff > 0;
  const sunRank = getStateRankBySunHours(state.abbr);
  const paybackRk = getPaybackRank(state.abbr);
  const savingsRk = getSavingsRank(state.abbr);
  const totalStCnt = getTotalStatesCount();
  const nationalSavings = getNationalAvg20yrSavings();

  const baseFaqs = [
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

  const autoFaqs = generateAutoFaqs({
    state: state.state,
    abbr: state.abbr,
    avg_sun_hours: state.avg_sun_hours,
    avg_system_cost_per_watt: state.avg_system_cost_per_watt,
    avg_payback_years: state.avg_payback_years,
    avg_20yr_savings: state.avg_20yr_savings,
    federal_tax_credit_pct: state.federal_tax_credit_pct,
    state_tax_credit: state.state_tax_credit,
    state_rebate: state.state_rebate,
    net_metering: state.net_metering,
    avg_electricity_rate: state.avg_electricity_rate,
    avg_monthly_bill: state.avg_monthly_bill,
    sunRank,
    totalStates: totalStCnt,
    nationalAvgSun: nationalSun,
    nationalAvgPayback: nationalPayback,
  });

  const faqs = [...baseFaqs, ...autoFaqs];

  const metrics = calculateProprietaryMetrics(
    state.state,
    slug,
    state.avg_sun_hours,
    state.avg_payback_years,
    state.net_metering,
    savingsRk
  );

  return (
    <article data-toc-root>
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([{ name: "Home", url: "/" }, { name: state.state, url: `/state/${slug}/` }])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(`${state.state} Solar Panel Costs, Savings & Incentives`, `Residential solar economics for ${state.state} — peak sun hours, system cost per watt, federal ITC math, state incentives, net metering policy, 20-year savings, and EIA-861 ${EIA_VINTAGE} residential net-metering installed-base outcomes.`, { spatialCoverage: state.state, vintage: ENTITY_VINTAGE, variableMeasured: ['Peak Sun Hours (hours per day)', 'System Cost per Watt (USD per watt)', 'Average Payback Years', '20-Year Savings (USD)', 'Federal ITC (30%, IRS Form 5695)', 'State Tax Credit (%)', 'Net Metering Policy', `ITC Payback Tier (${itcBand.tier ?? 'no-data'}: ${itcBand.label})`, `Net-Metering Tier (${nemTier.tier ?? 'no-data'}: ${nemTier.shortLabel})`, `Irradiance Band (${irrTier.tier ?? 'no-data'}: ${irrTier.shortLabel})`, ...(eiaEmpirical ? [`Cumulative Residential Net-Metering Capacity (megawatts, EIA-861 ${EIA_VINTAGE}: ${eiaEmpirical.capacityMW.toFixed(1)} MW)`, `Residential Net-Metering Customer Count (EIA-861 ${EIA_VINTAGE}: ${eiaEmpirical.customers.toLocaleString()})`, ...(eiaEmpirical.yoyCapacityPct != null ? [`YoY Net-Metering Capacity Growth (percent, EIA-861 ${EIA_VINTAGE}: ${eiaEmpirical.yoyCapacityPct >= 0 ? '+' : ''}${eiaEmpirical.yoyCapacityPct.toFixed(1)}%)`] : [])] : [])] })) }} />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: state.state }]} />

      <AnswerHero
        title={`${state.state} solar panel costs & savings`}
        subtitle={`NREL + DSIRE + EIA data`}
        tagline={`${state.state} averages ${formatSunHours(state.avg_sun_hours)} of peak sun per day. A typical 6 kW system costs about $${systemCost6kw.toLocaleString()} before incentives, ${state.avg_payback_years}-year payback, and ${formatCurrency(state.avg_20yr_savings)} in 20-year savings. After the 30% federal tax credit${state.state_tax_credit > 0 ? ' and state credits' : ''}, the net cost is roughly $${netCost.toLocaleString()}.`}
        badges={[
          { label: `${state.avg_payback_years}yr payback`, tone: "indigo" as const },
          { label: `30% federal credit`, tone: "emerald" as const },
          ...(state.net_metering === 'yes' ? [{ label: 'Net metering', tone: "emerald" as const }] : []),
        ]}
        alternatives={allStates.filter(s => s.slug !== slug).slice(0, 3).map(s => ({
          label: s.state,
          href: `/state/${s.slug}/`,
          sublabel: `${s.avg_payback_years}yr payback`,
        }))}
        alternativesLabel="Compare states"
      />

      {/* Above-the-fold Wikimedia photo (graceful null when manifest lacks an entry). */}
      {(() => {
        const img = getStateImage(slug);
        return img ? <StateHeroImage img={img} /> : null;
      })()}

      <TableOfContents />

      <StateAnalyticStrip slug={slug} stateName={state.state} />

      <TrustBlock
        sources={[
          { name: "NREL PVWatts", url: "https://pvwatts.nrel.gov/" },
          { name: "DSIRE Database", url: "https://www.dsireusa.org/" },
          { name: "EIA Solar Generation", url: "https://www.eia.gov/energyexplained/solar/" },
          { name: "IRS Form 5695 (Residential Energy Credits)", url: "https://www.irs.gov/forms-pubs/about-form-5695" },
          { name: "DOE Solar Energy Technologies Office", url: "https://www.energy.gov/eere/solar/solar-energy-technologies-office" },
        ]}
        updated={`${new Date().getFullYear()} NREL + DSIRE + IRS, refreshed monthly`}
      />

      <ProprietaryMetricsBlock {...metrics} />

      {/* SolarInterpretation — composite verdict over the 3 deterministic levers */}
      <SolarInterpretation result={interp} />

      {/* Phase 7 Empirical-Outcomes — EIA Form 861 Table 11 residential net-metering */}
      <SolarEmpiricalBlock stateSlug={slug} stateName={state.state} />

      {/* NetMeteringTier + SolarIrradianceTier cards (DSIRE / NREL) */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <section className={`rounded-xl border border-${nemTone}-200 bg-${nemTone}-50 p-5`} data-upgrade="net-metering-tier">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <h2 className={`text-base font-bold text-${nemTone}-900`}>
              Net-Metering Tier {nemTier.tier ?? '—'}: {nemTier.label}
            </h2>
            <span className={`text-xs font-medium text-${nemTone}-700`}>DSIRE</span>
          </div>
          <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1 mb-2">
            {nemTier.drivers.map((d, i) => (<li key={i}>{d}</li>))}
          </ul>
          <details className="text-xs text-slate-600">
            <summary className={`cursor-pointer font-medium text-${nemTone}-700`}>Caveats &amp; methodology</summary>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {nemTier.caveats.map((c, i) => (<li key={i}>{c}</li>))}
            </ul>
            <p className="mt-2">
              Source:{" "}
              <a href={nemTier.sourceUrl} className={`text-${nemTone}-700 underline`} rel="noopener" target="_blank">DSIRE Database</a>
              {" "}·{" "}
              Methodology
            </p>
          </details>
        </section>

        <section className={`rounded-xl border border-${irrTone}-200 bg-${irrTone}-50 p-5`} data-upgrade="solar-irradiance-tier">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <h2 className={`text-base font-bold text-${irrTone}-900`}>
              Irradiance Band {irrTier.tier ?? '—'}: {irrTier.label}
            </h2>
            <span className={`text-xs font-medium text-${irrTone}-700`}>NREL PVWatts</span>
          </div>
          <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1 mb-2">
            {irrTier.drivers.map((d, i) => (<li key={i}>{d}</li>))}
          </ul>
          <details className="text-xs text-slate-600">
            <summary className={`cursor-pointer font-medium text-${irrTone}-700`}>Caveats &amp; methodology</summary>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {irrTier.caveats.map((c, i) => (<li key={i}>{c}</li>))}
            </ul>
            <p className="mt-2">
              Source:{" "}
              <a href={irrTier.sourceUrl} className={`text-${irrTone}-700 underline`} rel="noopener" target="_blank">NREL PVWatts</a>
              {" "}·{" "}
              Methodology
            </p>
          </details>
        </section>
      </div>

      {/* ItcPaybackBand — 5-tier classifier (NREL + DSIRE + EIA + IRS Form 5695) */}
      <section className="mb-8" data-upgrade="itc-payback-band">
        <div className={`rounded-xl border border-${itcTone}-200 bg-${itcTone}-50 p-5`}>
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <h2 className={`text-lg font-bold text-${itcTone}-900`}>
              {state.state} ITC Payback Band — Tier {itcBand.tier ?? '—'}: {itcBand.label}
            </h2>
            {itcBand.paybackYears != null && (
              <span className={`text-sm font-semibold text-${itcTone}-700`}>
                ~{itcBand.paybackYears} years to recoup
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 mb-3">
            6 kW reference system, 30% federal ITC (IRS Form 5695), DSIRE state rebate
            {state.state_tax_credit > 0 ? ` + ${state.state_tax_credit}% state tax credit` : ''}, NREL PVWatts annual output, EIA retail rate.
          </p>
          {itcBand.tier && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
              <div className="bg-white rounded p-2 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase">Net cost</p>
                <p className="font-semibold text-slate-900">${itcBand.netSystemCostUsd?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded p-2 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase">Annual savings</p>
                <p className="font-semibold text-slate-900">${itcBand.annualSavingsUsd?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded p-2 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase">NREL annual kWh</p>
                <p className="font-semibold text-slate-900">{itcBand.annualKwh?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded p-2 border border-slate-200">
                <p className="text-xs text-slate-500 uppercase">EIA rate</p>
                <p className="font-semibold text-slate-900">{itcBand.retailRateCentsPerKwh}¢/kWh</p>
              </div>
            </div>
          )}
          <details className="text-sm text-slate-700">
            <summary className={`cursor-pointer font-medium text-${itcTone}-700`}>How this band is computed</summary>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {itcBand.drivers.map((d, i) => (<li key={i}>{d}</li>))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Tier cutoffs (years): A &lt;5 / B 5–8 / C 8–12 / D 12–20 / E 20+. Methodology:{" "}
              .
              Excluded items (panel degradation, inverter replacement, financing, SREC, NEM drift) on{" "}
              <a href="/disclaimer/" className={`text-${itcTone}-700 underline`}>/disclaimer/</a>.
            </p>
          </details>
        </div>
      </section>

      <p className="sr-only">
        {state.state} solar panel costs and savings overview.
      </p>

      {/* Data-Driven Insights */}
      <section className="mb-8 rounded-xl border border-orange-200 bg-orange-50/50 p-5">
        <h2 className="text-lg font-bold text-orange-900 mb-3">Data-Driven Insights for {state.state}</h2>
        <div className="space-y-4">
          {stateInsights.map((insight, i) => (
            <div key={i}>
              <h3 className="text-sm font-semibold text-orange-800 mb-1">{insight.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </section>

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

      {/* /roi-by-system-size/ leaf killed 2026-04-25 HCU Phase C — 0 GSC clicks */}

      <AdSlot id="5678901234" />

      <InsightCards
        stateName={state.state}
        sunHoursRank={sunRank}
        paybackRank={paybackRk}
        savingsRank={savingsRk}
        totalStates={totalStCnt}
        sunHours={state.avg_sun_hours}
        nationalAvgSun={nationalSun}
        paybackYears={state.avg_payback_years}
        nationalAvgPayback={nationalPayback}
        savings20yr={state.avg_20yr_savings}
        nationalAvgSavings={nationalSavings}
        federalCredit={state.federal_tax_credit_pct}
        stateCredit={state.state_tax_credit}
        stateRebate={state.state_rebate}
      />

      <SolarSavingsCalc
        stateName={state.state}
        avgSunHours={state.avg_sun_hours}
        avgSystemCostPerWatt={state.avg_system_cost_per_watt}
        federalTaxCreditPct={state.federal_tax_credit_pct}
        stateTaxCredit={state.state_tax_credit}
        stateRebate={state.state_rebate}
        avgElectricityRate={state.avg_electricity_rate}
        netMetering={state.net_metering}
      />

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

      {/* Incentives — source-anchored (HCU 5-청크 Layer 1) */}
      {(() => {
        const bundle = getIncentiveBundle(slug);
        if (!bundle || bundle.totalCount === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              Solar Incentives in {state.state}
            </h2>
            {bundle.federalRows.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-sm font-medium text-orange-700 uppercase tracking-wider">
                  Federal (available in all states)
                </p>
                {bundle.federalRows.map((row, i) => (
                  <SourcedIncentiveCard key={`fed-${i}`} row={row} variant="federal" />
                ))}
              </div>
            )}
            {bundle.stateRows.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700 uppercase tracking-wider">
                  {state.state}-specific
                </p>
                {bundle.stateRows.map((row, i) => (
                  <SourcedIncentiveCard key={`st-${i}`} row={row} variant="state" />
                ))}
              </div>
            )}
            <p className="mt-3 text-sm">
              <a href={`/incentives/${slug}/`} className="text-orange-600 hover:underline">
                Full {state.state} incentive page &rarr;
              </a>
            </p>
          </section>
        );
      })()}

      <AdSlot id="6789012345" />

      <SolarCalculator states={allStates.map(s => ({
        abbr: s.abbr,
        state: s.state,
        avg_sun_hours: s.avg_sun_hours,
        avg_system_cost_per_watt: s.avg_system_cost_per_watt,
        federal_tax_credit_pct: s.federal_tax_credit_pct,
        state_tax_credit: s.state_tax_credit,
        state_rebate: s.state_rebate,
        avg_electricity_rate: s.avg_electricity_rate,
        net_metering: s.net_metering,
      }))} />

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
                {zips.map(z => (
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

      {/* US solar payback map — focused on this state */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">{state.state} on the US Solar Payback Map</h2>
        <p className="text-sm text-slate-600 mb-3">
          Where {state.state}&apos;s {state.avg_payback_years}-year payback sits relative to the rest of the country.
          Sibling states are dimmed so the tier comparison is easy to read.
        </p>
        <PaybackStateMap
          states={allStates.map((s) => ({
            code: s.abbr,
            name: s.state,
            slug: s.slug,
            paybackYears: s.avg_payback_years,
          }))}
          currentStateCode={state.abbr}
          variant="compact"
          ariaLabel={`US solar payback map — ${state.state} highlighted`}
        />
      </section>

      {/* Compare with other states */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Compare With Other States</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {allStates
            .filter(s => s.abbr !== state.abbr)
            .sort((a, b) => b.avg_sun_hours - a.avg_sun_hours)
            
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

      {/* Cross-walk bridge — Energy/utility cluster siblings (Phase 7 P5).
          All four siblings use bare `{state-slug}` URLs (§8.3.1 convention).
          Anchors the household-finance crosswalk: solar economics here →
          electricity rate at PowerBillPeek → property-tax exemption at
          PropertyTaxPeek → take-home pay at NetPayPeek → rent-burden at
          FairRentWize. The 4-link budget is justified by the multi-axis nature
          of residential energy decisions (production × policy × tax × cost). */}
      <section className="mb-8 p-5 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl" data-upgrade="crosswalk-bridge">
        <h2 className="text-base font-bold text-orange-900 mb-1">
          {state.state} household-economics crosswalk
        </h2>
        <p className="text-sm text-slate-700 mb-3">
          Solar payback in {state.state} depends on inputs that live across four sibling sites. Each link drops you on the {state.state}-specific page.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <a href={`https://powerbillpeek.com/state/${slug}/`} className="block p-3 rounded-lg bg-white border border-orange-200 hover:border-orange-400 transition-colors">
            <p className="font-semibold text-orange-700">PowerBillPeek &rarr;</p>
            <p className="text-xs text-slate-600 mt-0.5">{state.state} electricity rates — the cents/kWh denominator behind solar payback math.</p>
          </a>
          <a href={`https://propertytaxpeek.com/state/${slug}/`} className="block p-3 rounded-lg bg-white border border-orange-200 hover:border-orange-400 transition-colors">
            <p className="font-semibold text-orange-700">PropertyTaxPeek &rarr;</p>
            <p className="text-xs text-slate-600 mt-0.5">{state.state} property-tax solar exemption — many states exclude solar value from assessment.</p>
          </a>
          <a href={`https://netpaypeek.com/state/${slug}/`} className="block p-3 rounded-lg bg-white border border-orange-200 hover:border-orange-400 transition-colors">
            <p className="font-semibold text-orange-700">NetPayPeek &rarr;</p>
            <p className="text-xs text-slate-600 mt-0.5">{state.state} take-home pay — household tax liability constrains first-year ITC capture (IRS Form 5695).</p>
          </a>
          <a href={`https://fairrentwize.com/state/${slug}/`} className="block p-3 rounded-lg bg-white border border-orange-200 hover:border-orange-400 transition-colors">
            <p className="font-semibold text-orange-700">FairRentWize &rarr;</p>
            <p className="text-xs text-slate-600 mt-0.5">{state.state} rent burden — homeowner / renter ratio shapes which households can actually capture solar incentives.</p>
          </a>
        </div>
      </section>

      <RelatedEntities
        entityName={state.state}
        heading={`States near ${state.state} — solar comparison`}
        statLabel="Payback"
        items={getNeighboringStates(state.abbr).slice(0, 8).map(s => ({
          name: s.state,
          href: `/state/${s.slug}/`,
          stat: `${s.avg_payback_years}yr payback`,
        }))}
      />

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

      {/* Why this matters — US homeowner solar economics context */}
      <section className="mb-8 mt-6" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why solar in {state.state} matters
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          <p>
            Residential solar economics in the US depend on three things
            that vary state-by-state: peak sun hours (how much energy
            your panels actually produce), the local electricity rate
            you&apos;re offsetting, and the incentive stack (federal +
            state + utility). {state.state} averages
            {" "}{formatSunHours(state.avg_sun_hours)} of peak sun
            &mdash; multiply that by your system size in kW and 365 to
            get expected annual production.
          </p>
          <p>
            The federal Investment Tax Credit (ITC) is currently 30% of
            the gross system cost, claimed via IRS Form 5695, and is
            scheduled at this rate through 2032 under the Inflation
            Reduction Act. On a ${systemCost6kw.toLocaleString()}
            system, that&apos;s ${federalCredit.toLocaleString()} back
            on your federal taxes &mdash; the single largest lever in
            most US solar deals.
          </p>
          <p>
            Net metering policy is the second biggest factor.
            {" "}{state.state} has{" "}
            {getNetMeteringLabel(state.net_metering).toLowerCase()},
            which directly affects how much value you get for excess
            generation sent back to the grid. States with full retail
            net metering produce the best paybacks; states with
            &ldquo;net billing&rdquo; or no net metering have longer
            paybacks even when the rate is high.
          </p>
          <p>
            For an actual purchase decision, get 3-4 quotes from
            installers (the industry has wide pricing variation), check
            DSIRE for any utility-level rebates that might not be
            captured in our state-level data, and run NREL PVWatts on
            your specific roof for a precise production estimate.
          </p>
          <p className="text-sm text-slate-500">
            Sources: NREL National Solar Radiation Database, DSIRE
            (NC State University), EIA Solar Generation, IRS Form 5695.
            Data refreshed monthly.
          </p>
        </div>
      </section>

      <DecisionNext
        cards={[
          {
            title: `Electricity rates in ${state.state}`,
            blurb: `Your local utility rate is what solar offsets &mdash; the higher it is, the better the payback.`,
            href: `https://powerbillpeek.com/state/${slug}/`,
            cta: `Open PowerBillPeek`,
            tone: "indigo" as const,
          },
          {
            title: `Property tax in ${state.state}`,
            blurb: `Many states exempt added solar value from property tax. Worth checking before you install.`,
            href: `https://propertytaxpeek.com/state/${slug}/`,
            cta: `Open PropertyTaxPeek`,
            tone: "amber" as const,
          },
          {
            title: `DSIRE incentive search`,
            blurb: `The authoritative database of US solar incentives. Always check before signing a contract.`,
            href: `https://www.dsireusa.org/`,
            cta: `Open DSIRE`,
            tone: "emerald" as const,
          },
        ]}
      />

      <FeedbackButton pageId={slug} />

      <DataFeedback />
      <FreshnessTag source="NREL National Solar Radiation Database + DSIRE incentive database + EIA solar generation data" />

      <div className="flex items-center gap-4 mt-4">
        <CiteButton title={`${state.state} Solar Panel Costs & Savings`} url={`https://sunpowerpeek.com/state/${slug}/`} source="SunPowerPeek (NREL Data)" />
      </div>

      <StateRich slug={slug} state={state} />

      <AuthorBox vintage={ENTITY_VINTAGE} source="NREL NSRDB + DSIRE + EIA + IRS Form 5695" showDisclaimer />
    </article>
  );
}
