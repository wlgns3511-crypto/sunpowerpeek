import type { Metadata } from "next";
import { TrustMetaStrip } from "@/components/TrustMetaStrip";
import { AuthorBox } from "@/components/AuthorBox";
import { METHODOLOGY_VINTAGE } from "@/lib/authorship";
import { datasetSchema } from "@/lib/schema";
import { PaybackStateMap } from "@/components/PaybackStateMap";
import { getAllStates } from "@/lib/db";

export const metadata: Metadata = {
  title: "Our Methodology — How SunPowerPeek Builds Its Solar Data",
  description:
    "How SunPowerPeek sources US residential solar data — anchored in NREL National Solar Radiation Database (PVWatts), DSIRE state incentives, EIA solar generation, and IRS Form 5695.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  const states = getAllStates();
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(
        'SunPowerPeek Methodology — NREL × DSIRE × EIA × IRS Form 5695 with ItcPaybackBand, NetMeteringTier, SolarIrradianceTier, SolarInterpretation Editorial Layers',
        'Methodology for the US residential solar dataset SunPowerPeek publishes — NREL PVWatts NSRDB peak-sun-hours, DSIRE state incentive snapshots, EIA monthly retail-rate publications, IRS Form 5695 30% federal Investment Tax Credit, and four editorial reading layers (ItcPaybackBand 5-tier payback economics, NetMeteringTier 5-tier DSIRE export-credit decoder, SolarIrradianceTier 5-band NREL PVWatts irradiance classifier, SolarInterpretation composite verdict).',
        {
          spatialCoverage: 'United States',
          vintage: METHODOLOGY_VINTAGE,
          creatorIndex: 0,
          variableMeasured: [
            'NREL PVWatts Peak Sun Hours (hours per day)',
            'DSIRE State Rebate (USD)',
            'DSIRE State Tax Credit (percent of installed cost)',
            'EIA Retail Rate (cents per kWh)',
            'IRS Form 5695 Federal ITC (percent, 30% under IRA)',
            'ItcPaybackBand Tier (A through E, payback years)',
            'NetMeteringTier Tier (T1 through T5, DSIRE export-credit framework)',
            'SolarIrradianceTier Band (A through E, NSRDB peak-sun-hours)',
            'SolarInterpretation DecisionFraming (8 branches plus data-incomplete)',
          ],
        }
      )) }} />
      <h1>Our Methodology</h1>
      <div className="not-prose">
        <TrustMetaStrip />
      </div>
      <p className="lead text-lg text-slate-600">
        Installing residential solar is a multi-decade financial
        commitment. You deserve to know exactly where our payback,
        savings, and incentive figures come from, and what they cannot
        tell you about your specific roof.
      </p>

      <h2>Geographic coverage at a glance</h2>
      <div className="not-prose">
        <PaybackStateMap
          states={states.map((s) => ({
            code: s.abbr,
            name: s.state,
            slug: s.slug,
            paybackYears: s.avg_payback_years,
          }))}
          variant="full"
          caption={`Verbatim render of the states.avg_payback_years column (${states.length} state rows). Each row is computed from EIA Form 861 retail rate × NREL PVWatts annual kWh × DSIRE state rebates × IRS Form 5695 30% federal ITC, mirroring lib/itc-payback-band.ts. Tier cutoffs (5 / 8 / 12 / 20 years) are deterministic markers, not regulatory cutoffs. State boundaries: US Census TIGER/Line via us-atlas/states-10m (public domain). DC has no residential row in the upstream dataset we ingest, so the choropleth covers 50 states only. Excludes panel degradation, inverter replacement, financing, SREC value, and net-metering policy drift — see /disclaimer/.`}
        />
      </div>

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

      <h2>Four editorial reading layers atop NREL × DSIRE × EIA × IRS Form 5695</h2>
      <p>
        Every SunPowerPeek state page renders four editorial reading
        layers above the raw NREL / DSIRE / EIA / IRS Form 5695 inputs.
        Each layer is deterministic — given the same source inputs, the
        layer output is reproducible. Each layer is an editorial reading
        layer, not a binding quote or a tax-credit opinion.
      </p>
      <h3>ItcPaybackBand (0차 baseline, 5-tier)</h3>
      <p>
        Collapses the NREL PVWatts annual production × EIA retail rate
        savings stream into the years-to-recoup the net post-incentive
        system cost. Tiers: A under 5 years, B 5 to 8, C 8 to 12, D 12
        to 20, E 20 plus. Full methodology at{" "}
        .
      </p>
      <h3>NetMeteringTier (1차 NEW, 5-tier DSIRE decoder)</h3>
      <p>
        Classifies the DSIRE-published state net-metering framework into
        five tiers: T1 full retail-rate banking, T2 avoided-cost / TOU
        hybrid post NEM 3.0, T3 net billing / capacity-capped tariff, T4
        partial / utility-discretion policy, T5 no statutory state
        policy. T2 hardcodes California; T3 hardcodes Hawaii and Nevada;
        T5 hardcodes Kentucky, Tennessee, West Virginia. Full
        methodology at{" "}
        .
      </p>
      <h3>SolarIrradianceTier (1차 NEW, 5-band NREL PVWatts classifier)</h3>
      <p>
        Classifies the NREL PVWatts NSRDB peak-sun-hours-per-day into
        five bands: A ≥ 6.0 sun hours (Desert Southwest / Mountain), B
        5.0 to 5.9 (Southwest / Southeast), C 4.5 to 4.9 (Central /
        Plains), D 4.0 to 4.4 (Mid-Atlantic / Midwest), E under 4.0
        (Pacific Northwest / Northeast / Alaska). Full methodology at{" "}
        .
      </p>
      <h3>SolarInterpretation (composite verdict, 8 decision-framing branches)</h3>
      <p>
        Synthesizes the three deterministic levers above (payback ×
        net-metering × irradiance) into one of eight decision-framing
        branches with a four-paragraph deterministic prose verdict.
        Honest-null contract: if two or more inputs are null, the
        verdict is data-incomplete with no fallback guess. Full
        methodology at{" "}
        .
      </p>

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
        This methodology page was last reviewed on{" "}
        <time dateTime={METHODOLOGY_VINTAGE}>{METHODOLOGY_VINTAGE}</time>.
        Material changes to how we source or compute the data will be
        reflected here before they reach production pages.
      </p>

      <AuthorBox vintage={METHODOLOGY_VINTAGE} source="NREL PVWatts methodology + DSIRE + EIA + IRS Form 5695" />
    </article>
  );
}
