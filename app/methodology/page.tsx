import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Methodology — How SunPowerPeek Builds Its Solar Data",
  description:
    "How SunPowerPeek sources US residential solar data — anchored in NREL National Solar Radiation Database (PVWatts), DSIRE state incentives, EIA solar generation, and IRS Form 5695.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Installing residential solar is a multi-decade financial
        commitment. You deserve to know exactly where our payback,
        savings, and incentive figures come from, and what they cannot
        tell you about your specific roof.
      </p>

      <h2>Primary sources</h2>
      <ul>
        <li>
          <a
            href="https://pvwatts.nrel.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NREL PVWatts Calculator
          </a>{" "}
          &mdash; the National Renewable Energy Laboratory&apos;s tool
          for estimating solar PV production based on the National
          Solar Radiation Database (NSRDB). Peak sun hours and expected
          production figures here are derived from PVWatts methodology.
        </li>
        <li>
          <a
            href="https://www.dsireusa.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            DSIRE
          </a>{" "}
          &mdash; the Database of State Incentives for Renewables &amp;
          Efficiency, maintained by NC State University. The
          authoritative source for US state and local solar incentive
          programs.
        </li>
        <li>
          <a
            href="https://www.eia.gov/energyexplained/solar/"
            target="_blank"
            rel="noopener noreferrer"
          >
            EIA Solar Generation
          </a>{" "}
          &mdash; the Energy Information Administration&apos;s solar
          generation, capacity, and cost statistics by state.
        </li>
        <li>
          <a
            href="https://www.irs.gov/forms-pubs/about-form-5695"
            target="_blank"
            rel="noopener noreferrer"
          >
            IRS Form 5695 (Residential Energy Credits)
          </a>{" "}
          &mdash; the official IRS form for claiming the federal
          Investment Tax Credit (ITC), currently 30% through 2032
          under the Inflation Reduction Act.
        </li>
        <li>
          <a
            href="https://www.energy.gov/eere/solar/solar-energy-technologies-office"
            target="_blank"
            rel="noopener noreferrer"
          >
            DOE Solar Energy Technologies Office
          </a>{" "}
          &mdash; the Department of Energy office coordinating federal
          solar research.
        </li>
      </ul>

      <h2>What we publish per state</h2>
      <ul>
        <li>
          <strong>Peak sun hours</strong> &mdash; average daily
          equivalent of full-strength sunlight, derived from NSRDB.
        </li>
        <li>
          <strong>System cost per watt</strong> &mdash; turnkey
          installed cost (panels, inverter, racking, labor, permitting,
          installer margin).
        </li>
        <li>
          <strong>Average payback years</strong> &mdash; time for
          electricity bill savings to recoup net cost after incentives.
        </li>
        <li>
          <strong>20-year savings estimate</strong>.
        </li>
        <li>
          <strong>State tax credit</strong> &mdash; any state-level
          income tax credit on top of the federal ITC.
        </li>
        <li>
          <strong>State rebate</strong> &mdash; any state-level
          upfront rebate.
        </li>
        <li>
          <strong>Net metering policy</strong>.
        </li>
      </ul>

      <h2>How we calculate payback</h2>
      <ol>
        <li>
          Gross system cost = system size (kW) × installed cost per
          watt for the state.
        </li>
        <li>
          Federal ITC = 30% of gross system cost.
        </li>
        <li>
          State incentives = state tax credit + state rebate (where
          applicable).
        </li>
        <li>
          Net cost = gross cost &minus; federal ITC &minus; state
          incentives.
        </li>
        <li>
          Annual production = system size (kW) × peak sun hours × 365
          × derate factor.
        </li>
        <li>
          Annual savings = annual production × local electricity rate
          (sourced from EIA).
        </li>
        <li>
          Payback years = net cost / annual savings.
        </li>
      </ol>

      <h2>Update frequency</h2>
      <p>
        NREL updates NSRDB periodically. DSIRE maintains incentive
        data continuously. EIA solar statistics update monthly. We
        refresh our combined dataset monthly, immediately when an IRS
        or major state policy change is announced.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>State average ≠ your roof.</strong> Your actual
          production depends on roof orientation, pitch, shading, panel
          quality, and inverter efficiency. Use PVWatts directly for a
          precise per-address estimate.
        </li>
        <li>
          <strong>Installer pricing varies by 30-50%.</strong> The
          residential solar market has wide pricing variation. Get
          3-4 quotes before signing.
        </li>
        <li>
          <strong>Net metering rules change.</strong> Several states
          have transitioned from full retail net metering to net
          billing or successor tariffs (California NEM 3.0 is the
          best-known example).
        </li>
        <li>
          <strong>No financing modeled.</strong> Most US residential
          solar is financed (loan, lease, or PPA). Our cash payback
          calculation assumes upfront payment.
        </li>
        <li>
          <strong>Roof condition not modeled.</strong> If your roof
          needs replacement within 5 years, factor that in.
        </li>
        <li>
          <strong>Not financial or installation advice.</strong> For
          decisions with real money on the line, work with a licensed
          installer, CPA, and your utility.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If a published NREL or DSIRE figure disagrees with what you
        see here, please <a href="/contact">contact us</a> with the
        source URL.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
