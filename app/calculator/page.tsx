import type { Metadata } from "next";
import { getAllStates } from "@/lib/db";
import { SolarCalculator } from "@/components/SolarCalculator";
import { EmbedButton } from "@/components/EmbedButton";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";
import { TrustMetaStrip } from "@/components/TrustMetaStrip";
import { AuthorBox } from "@/components/AuthorBox";
import { METHODOLOGY_VINTAGE } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Solar Savings Calculator - Estimate Your Solar Panel ROI | SunPowerPeek",
  description: "Free solar savings calculator. Enter your state, electric bill, and roof size to estimate solar panel costs, tax credits, payback period, and 20-year savings.",
  alternates: { canonical: "https://sunpowerpeek.com/calculator/" },
  openGraph: { url: "/calculator/" },
};

export default function CalculatorPage() {
  const states = getAllStates();

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Solar Calculator" }]} />

      <h1 className="text-3xl font-bold text-orange-800 mb-4">
        Solar Savings Calculator
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Estimate your solar panel costs, federal and state tax credits, payback period, and 20-year savings.
        Select your state, adjust your system size, and see how much you can save by going solar.
      </p>

      <TrustMetaStrip />

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

      <EmbedButton
        url="https://sunpowerpeek.com/embed/solar-calc/"
        title="Solar Savings Calculator"
        site="SunPowerPeek"
        siteUrl="https://sunpowerpeek.com"
      />

      <AdSlot id="3456789012" />

      <section className="mt-8 prose prose-slate max-w-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-3">How to Use This Calculator</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
          <li><strong>Select your state</strong> to use local sun hours, costs, and incentive data.</li>
          <li><strong>Enter your monthly electric bill</strong> to understand your current energy costs.</li>
          <li><strong>Adjust system size</strong> based on your roof space and energy needs.</li>
          <li><strong>Choose financing</strong>: Cash (buy outright), Loan (finance over time), or Lease ($0 down).</li>
          <li>View your estimated <strong>net cost, monthly savings, payback period, and 20-year savings</strong>.</li>
        </ol>

        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Understanding Solar Costs</h2>
        <p className="text-sm text-slate-600">
          The cost of solar panels depends on system size, your location, and available incentives. The average 6kW residential
          system costs $17,000-$21,000 before incentives. The <strong>30% federal solar investment tax credit (ITC)</strong> reduces
          this significantly. Many states offer additional credits, rebates, or SREC programs that further lower costs.
        </p>

        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Key Factors Affecting Solar ROI</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
          <li><strong>Sun exposure</strong>: More peak sun hours means more energy production.</li>
          <li><strong>Electricity rates</strong>: Higher rates mean faster payback and bigger savings.</li>
          <li><strong>Net metering</strong>: Full net metering credits you at retail rates for excess power.</li>
          <li><strong>State incentives</strong>: Tax credits and rebates reduce upfront costs.</li>
          <li><strong>System size</strong>: Larger systems produce more energy but cost more upfront.</li>
          <li><strong>Roof orientation</strong>: South-facing roofs in the Northern Hemisphere are ideal.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3" data-upgrade="itc-payback-band-methodology">ItcPaybackBand Methodology</h2>
        <p className="text-sm text-slate-600">
          Every state page surfaces an{" "}
          ItcPaybackBand{" "}
          — a 5-tier deterministic classifier (A under 5 years / B 5–8 years / C 8–12 years /
          D 12–20 years / E 20+ years) anchored to the same four authorities the calculator above pulls from:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 mt-2">
          <li><strong>NREL PVWatts</strong> — annual kWh production for a 6 kW reference system at state-average peak sun hours.</li>
          <li><strong>DSIRE</strong> — state rebate and state tax credit snapshot (rendered net of installed cost).</li>
          <li><strong>EIA</strong> — most-recent published state retail electricity rate, used to price displaced kWh.</li>
          <li><strong>IRS Form 5695</strong> — 30% Residential Clean Energy Credit under the Inflation Reduction Act through tax year 2032.</li>
        </ul>
        <p className="text-sm text-slate-600 mt-2">
          Payback years = (installed cost − federal ITC − DSIRE rebate − state credit) / (NREL annual kWh × EIA rate).
          The band intentionally excludes panel degradation, inverter replacement, financing, SREC value, and net-metering
          policy drift — see <a href="/disclaimer/" className="text-orange-700 underline">/disclaimer/</a> for the full list.
        </p>
      </section>

      <FreshnessTag source="NREL, DSIRE, EIA" />

      <AuthorBox vintage={METHODOLOGY_VINTAGE} source="NREL PVWatts + IRS Form 5695 ITC math" showDisclaimer />
    </>
  );
}
