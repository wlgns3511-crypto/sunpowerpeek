import type { Metadata } from "next";
import { LEGAL_VINTAGES } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: "How SunPowerPeek handles errata and vintage rotations for NREL PVWatts, DSIRE, EIA retail-rate, and IRS Form 5695 ITC data — 2-day SLA, audit log via dateModified, and explicit distinction between vintage-refresh and correction.",
  alternates: { canonical: "/corrections-policy/" },
  openGraph: { url: "/corrections-policy/" },
};

export default function CorrectionsPolicyPage() {
  const reviewed = LEGAL_VINTAGES.correctionsPolicy;
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">Corrections Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed: <time dateTime={reviewed}>{reviewed}</time>
      </p>

      <p>
        SunPowerPeek renders four public-data feeds — NREL PVWatts production, DSIRE incentive snapshot, EIA monthly
        retail rate, IRS Form 5695 ITC instruction language. Each authority operates on a different rotation cadence,
        and we draw an explicit line between routine vintage refresh and a content correction. This page documents
        both.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Two Types of Editorial Change</h2>
      <p>We treat the following as distinct categories:</p>
      <ul>
        <li>
          <strong>Vintage refresh</strong> — pulling the next published NREL / DSIRE / EIA / IRS Form 5695 release on
          its normal cadence. We update the AuthorBox vintage label and the schema.org Dataset.dateModified field,
          but no narrative claim has been retracted.
        </li>
        <li>
          <strong>Correction</strong> — a number, claim, or methodology decision rendered previously was wrong, not
          merely stale. Corrections are logged via the page&apos;s schema.org dateModified plus an inline editorial note
          explaining what changed and why.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. NREL PVWatts NSRDB Rotation</h2>
      <p>
        NREL publishes National Solar Radiation Database (NSRDB) updates on a multi-year release cycle. Our pages
        currently reference the 2024 NSRDB snapshot via PVWatts; when NREL publishes the next NSRDB release, we
        rotate the snapshot, update the AuthorBox vintage, and update Dataset.dateModified on every state surface.
        This is a vintage refresh, not a correction — the prior numbers were correct as of their NREL vintage.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. DSIRE Continuous-Update Rotation</h2>
      <p>
        DSIRE is continuously maintained — programs are added, expired, or revised on rolling intervals. We pull the
        DSIRE state snapshot on each editorial cycle and render the DSIRE-published last-updated date for each
        program. When a program disappears from DSIRE or its last-updated date moves, we rotate the snapshot. If a
        DSIRE program was rendered with the wrong rebate amount or wrong eligibility rule, that is a correction —
        not a routine rotation.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. EIA Monthly State-Retail-Rate Rotation</h2>
      <p>
        EIA publishes state-level monthly retail electricity rates approximately 6–8 weeks after the data month
        closes. Our payback math is anchored to the most-recent EIA published quarter. When EIA publishes the next
        quarter, we rotate the rate vintage, update the AuthorBox, and update Dataset.dateModified. If an EIA rate
        was transcribed incorrectly into our prose (typo, wrong state, decimal-place error), that is a correction.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. IRS Form 5695 Publication Revisions</h2>
      <p>
        IRS Form 5695 instructions are published annually for each tax year. Under the Inflation Reduction Act, the
        Residential Clean Energy Credit is 30% through tax year 2032, 26% in 2033, 22% in 2034. When the IRS
        publishes a new tax-year Form 5695 instruction with revised eligibility or rate language, we rotate the
        reference. If we render an ITC percentage or sunset year that contradicts the current Form 5695 instruction
        text, that is a correction.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. ItcPaybackBand Recomputation Triggers</h2>
      <p>
        The ItcPaybackBand depends on four inputs (NREL kWh, DSIRE rebate, EIA rate, IRS ITC). Any rotation of any
        of those inputs triggers a band recomputation. The thresholds (5/8/12/20 years) are editorial constants that
        do not change with vintage rotation. If we revise a threshold, that is a methodology change documented on
        the Editorial Policy and is treated as a correction (not a refresh), even though no upstream data moved.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. What Vintage Refresh Is NOT</h2>
      <p>
        We do not bulk-touch every page&apos;s dateModified to the current calendar date. Google&apos;s HCU coupling penalty
        treats &quot;everything updated on the same day&quot; as a signal of fake freshness. NREL, DSIRE, EIA, and
        IRS Form 5695 each have honest, distinct rotation cadences (multi-year NSRDB / continuous DSIRE / monthly
        EIA / annual IRS), and our vintages reflect those cadences. A page whose underlying authorities have not
        rotated will carry its prior dateModified, by design.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. What Counts as a Correction</h2>
      <ul>
        <li>NREL PVWatts output transcribed incorrectly (wrong state, wrong tilt assumption, wrong loss factor).</li>
        <li>DSIRE program metadata mis-rendered (wrong rebate amount, wrong eligibility, wrong expiration).</li>
        <li>EIA retail rate mis-transcribed (typo, wrong column, wrong vintage label).</li>
        <li>IRS Form 5695 framing wrong (wrong ITC percentage, wrong sunset year, wrong carry-forward claim).</li>
        <li>ItcPaybackBand threshold edited without an Editorial Policy methodology update.</li>
        <li>Cross-reference (SEIA, Wood Mackenzie, NABCEP) attributed in a way that misrepresents the source.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">9. Escalation and 2-Day SLA</h2>
      <p>
        Reader-flagged corrections sent via{" "}
        <a href="/contact" className="text-orange-700 hover:underline">our Contact page</a>{" "}
        are triaged within 2 business days. Triage outcomes are: (a) confirmed correction (we patch the page and
        update dateModified within 2 business days of triage), (b) declined (we explain why the rendered figure
        matches the cited NREL / DSIRE / EIA / IRS source as published), or (c) escalation (we request the reader to
        cite the specific NREL technical report, DSIRE program page, EIA series ID, or IRS Form 5695 instruction
        paragraph that contradicts our rendering).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">10. Audit Log via schema.org dateModified</h2>
      <p>
        We do not maintain a separate change-log page. The schema.org Dataset.dateModified field on each state and
        methodology surface is the audit trail — when it advances, something on that page&apos;s NREL / DSIRE / EIA /
        IRS data or methodology rendering changed. For machine-readable consumers, the JSON-LD is the canonical
        record; for human readers, the AuthorBox vintage list states the same fact in prose.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">11. Limitations of This Policy</h2>
      <p>
        This policy covers what SunPowerPeek can control — our rendering of NREL / DSIRE / EIA / IRS Form 5695 data.
        It does not bind the authorities themselves; NREL can publish a corrected NSRDB years later, DSIRE can
        retroactively revise a program&apos;s last-updated date, EIA can revise a back-quarter retail rate, and IRS can
        re-issue Form 5695 instructions. Where any of those authorities issues a back-correction, we follow with a
        forward-dated correction on our end.
      </p>
    </article>
  );
}
