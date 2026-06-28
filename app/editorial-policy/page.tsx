import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "How SunPowerPeek selects, attributes, and reviews solar economic data — anchored to NREL PVWatts, DSIRE, EIA retail rates, and IRS Form 5695, with explicit ItcPaybackBand methodology and NABCEP non-certification disclosure.",
  alternates: { canonical: "/editorial-policy/" },
  openGraph: { url: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  const reviewed = LEGAL_VINTAGES.editorialPolicy;
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Editorial Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed: <time dateTime={reviewed}>{reviewed}</time>
      </p>

      <p>
        SunPowerPeek publishes US residential solar economics — state-by-state production estimates, incentive
        snapshots, ITC payback bands, and methodology guides. This page explains who writes and reviews the content,
        which authorities back which numbers, and how methodology choices are made.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Editorial Team Scope</h2>
      <p>
        SunPowerPeek is published by the DataPeek Research Network. Editorial work is done by the SunPowerPeek
        Editorial Team — an organizational byline, not a named individual. We do not publish under personal bylines
        because the site renders the same NREL / DSIRE / EIA / IRS-derived numbers in every state surface; attributing
        a 50-state aggregate to a single person would misrepresent how the data is produced. The schema.org reviewer
        node on every page surfaces the editorial team; the schema.org Dataset.creator surfaces NREL PVWatts as the
        dominant data origin.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Primary Source Authorities</h2>
      <p>
        Four authorities back the numbers rendered on this site, in proportion to their use across page surfaces:
      </p>
      <ul>
        <li>
          <strong>NREL PVWatts (NSRDB)</strong> — National Renewable Energy Laboratory production model. Backs peak
          sun hours, system-output kWh/yr, latitude-tilt assumptions, and the 14% default-loss factor. The PVWatts
          calculator is publicly documented at <code>pvwatts.nrel.gov</code>. NREL is the schema.org{" "}
          <code>creator</code> on Dataset surfaces because PVWatts output is the dominant headline metric site-wide.
        </li>
        <li>
          <strong>DSIRE</strong> — Database of State Incentives for Renewables &amp; Efficiency (NC Clean Energy
          Technology Center). Backs the state-incentive snapshot rendered on every state page (program count,
          last-updated date, top-3 rebates). DSIRE is continuously maintained but lags real-program-window changes by
          days to weeks; we render the DSIRE-published vintage date.
        </li>
        <li>
          <strong>US EIA Electric Power</strong> — Energy Information Administration monthly state retail-rate
          series. Backs the displaced-cost cents/kWh figure used in 20-year savings and ItcPaybackBand math. We pin
          the EIA vintage to the most recent published quarter and do not project rate escalation.
        </li>
        <li>
          <strong>IRS Form 5695</strong> — Residential Clean Energy Credit instructions. Backs the 30% federal ITC
          rate under the Inflation Reduction Act through tax year 2032, the 2033 step-down to 26%, and the 2034 step
          to 22%. We render the IRS Form 5695 instruction language; we are not a tax advisor.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Cross-References (Body-Only, Not DB-Backing)</h2>
      <p>
        Two organizations appear in editorial commentary but do not back numbers in the DB:
      </p>
      <ul>
        <li>
          <strong>SEIA</strong> (Solar Energy Industries Association) — cited for industry-context commentary on
          installation trends. Not used for state-level production or pricing math.
        </li>
        <li>
          <strong>Wood Mackenzie</strong> — cited in cost-per-watt guide context for market-research framing. Not
          used as a primary data source; their full reports are paywalled.
        </li>
        <li>
          <strong>NABCEP</strong> — North American Board of Certified Energy Practitioners. Cited as the credential
          to verify on a contracted installer, not a data source. SunPowerPeek editorial staff hold no NABCEP
          certification (see Section 8).
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. ItcPaybackBand Methodology</h2>
      <p>
        The ItcPaybackBand is a 5-tier deterministic classifier that surfaces a years-to-payback figure for each
        state:
      </p>
      <ul>
        <li>net system cost = NREL-baseline-priced installed cost − 30% IRS Form 5695 ITC − DSIRE state-rebate snapshot;</li>
        <li>annual savings = NREL PVWatts annual kWh × EIA state retail rate (cents/kWh);</li>
        <li>payback years = net system cost ÷ annual savings;</li>
        <li>band = A under 5 years / B 5–8 years / C 8–12 years / D 12–20 years / E 20+ years.</li>
      </ul>
      <p>
        Inputs are 100% deterministic — no random sampling, no time-of-page-render fallbacks, no synthetic guess-work.
        If any input is missing (DSIRE coverage gap, EIA vintage stale beyond 90 days), the band returns confidence
        &quot;no-data&quot; rather than a falsely-precise number. The full set of excluded items (panel degradation,
        inverter replacement, financing cost, SREC value, etc.) is documented on the Disclaimer page.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. ItcPaybackBand Editorial Framing</h2>
      <p>
        Where the band is rendered, the prose names the authority for each input — NREL PVWatts for production, DSIRE
        for rebate, EIA for retail rate, IRS Form 5695 for ITC math — so the reader can audit the chain. Band
        thresholds (5/8/12/20 years) are editorial choices anchored to typical installer payback claims; we
        document the thresholds publicly so they cannot be re-tuned silently.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Verification Chain</h2>
      <p>
        Every numeric claim on a state page traces back to one of the four authorities by direct citation or by the
        page&apos;s schema.org Dataset.sourceOrganization enumeration. The Dataset.creator field attributes the dominant
        origin (NREL PVWatts); Dataset.reviewedBy attributes the editorial team review. We do not render numbers
        that we cannot trace to a public NREL / DSIRE / EIA / IRS document or extract from those authorities&apos;
        machine-readable feeds.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Vintage Labeling</h2>
      <p>
        The AuthorBox at the bottom of every state, incentive, and methodology page lists each source&apos;s vintage —
        NREL PVWatts (2024 NSRDB snapshot), DSIRE (continuously maintained, last-pulled date shown), EIA (current
        published quarter), IRS Form 5695 (current tax year, ITC through 2032 under IRA). Vintages are intentionally
        de-coupled across pages: a single shared timestamp is a Google HCU coupling signal we explicitly avoid.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. NABCEP Non-Certification (Disclosure)</h2>
      <p>
        SunPowerPeek editorial staff hold no NABCEP certification — no PV Installation Professional, no PV Technical
        Sales, no PV System Inspector credential. NABCEP is the accreditation that identifies installers competent to
        design and commission residential PV. Any installer recommendation rendered here is editorial framing of
        DSIRE-tracked program eligibility, not a NABCEP credential audit. Readers should verify NABCEP status on
        installer records before signing.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Korean Operator Outside-US Disclosure</h2>
      <p>
        SunPowerPeek is operated from South Korea. We have no US business presence, no US tax-resident editorial
        staff, no US installer relationships, and no field-survey capacity. The site exists because US solar
        economics are entirely derivable from public NREL / DSIRE / EIA / IRS data — production, incentives, retail
        rates, and ITC math are all publicly maintained. Any state-level installer context is editorial framing of
        public DSIRE program data, not first-hand market reporting.
      </p>

      <p className="mt-8">
        For corrections to NREL-derived production figures, DSIRE incentive metadata, EIA retail rates, or IRS Form
        5695 ITC framing, see our{" "}
        <a href="/corrections-policy" className="text-orange-700 hover:underline">Corrections Policy</a>.
      </p>
    </article>
  );
}
