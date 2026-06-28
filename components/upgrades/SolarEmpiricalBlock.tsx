/**
 * Phase 7 Empirical-Outcomes block — renders real EIA Form 861 residential
 * net-metering data for a single state. Sits below SolarInterpretation
 * (composite NREL × DSIRE × ITC verdict) so the reader sees the theoretical
 * verdict and the actual installed-base outcome side-by-side.
 *
 * Returns null when no EIA aggregate is available for this state. Caller is
 * responsible for handling the null case if a layout slot must stay
 * occupied.
 */

import {
  getSolarEmpirical,
  getCapacityRatio,
  getYoyCapacityDelta,
  getNationalSolarTotals,
  describeCapacityRatio,
  describeYoyCapacityDelta,
  EIA_VINTAGE,
  EIA_PRIOR_VINTAGE,
  EIA_SOURCE_URL,
  EIA_TABLE,
} from "@/lib/solar-empirical-outcomes";

interface SolarEmpiricalBlockProps {
  stateSlug: string;
  stateName: string;
}

const integerFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const mwFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function formatMW(v: number): string {
  if (v >= 1000) return `${mwFmt.format(v / 1000)} GW`;
  if (v >= 10) return `${mwFmt.format(v)} MW`;
  return `${v.toFixed(2)} MW`;
}

function formatSignedPct(v: number | null): string {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export function SolarEmpiricalBlock({ stateSlug, stateName }: SolarEmpiricalBlockProps) {
  const row = getSolarEmpirical(stateSlug);
  if (!row) return null;

  const national = getNationalSolarTotals();
  const capacityRatio = getCapacityRatio(stateSlug);
  const yoyDelta = getYoyCapacityDelta(stateSlug);

  return (
    <section className="my-8 rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">
          Empirical outcomes — EIA Form 861 {EIA_VINTAGE}
        </h2>
        <span className="text-xs text-slate-500">
          n={integerFmt.format(row.customers)} residential customers
        </span>
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-700">
        Across the {EIA_VINTAGE} EIA-861 reporting year, retail electric utilities in {stateName} reported{" "}
        <strong>{formatMW(row.capacityMW)}</strong> of cumulative residential net-metering capacity serving{" "}
        <strong>{integerFmt.format(row.customers)}</strong> customers (50-state mean: {formatMW(national.meanCapacityMW)}).{" "}
        {describeCapacityRatio(capacityRatio)}
        {row.yoyCapacityPct != null && (
          <>
            {" "}
            Capacity grew <strong>{formatSignedPct(row.yoyCapacityPct)}</strong> from {EIA_PRIOR_VINTAGE} to {EIA_VINTAGE}{" "}
            (national fleet: {formatSignedPct(national.yoyCapacityPct)}). {describeYoyCapacityDelta(yoyDelta)}
          </>
        )}
      </p>

      <div className="grid grid-cols-2 gap-2 text-center text-sm sm:grid-cols-4">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
          <div className="text-xs uppercase tracking-wide text-emerald-700">Capacity</div>
          <div className="font-bold text-emerald-900">{formatMW(row.capacityMW)}</div>
        </div>
        <div className="rounded-md border border-slate-200 p-2">
          <div className="text-xs uppercase tracking-wide text-stone-600">Customers</div>
          <div className="font-semibold text-slate-900">{integerFmt.format(row.customers)}</div>
        </div>
        <div className="rounded-md border border-slate-200 p-2">
          <div className="text-xs uppercase tracking-wide text-stone-600">YoY capacity</div>
          <div className="font-semibold text-slate-900">{formatSignedPct(row.yoyCapacityPct)}</div>
        </div>
        <div className="rounded-md border border-slate-200 p-2">
          <div className="text-xs uppercase tracking-wide text-stone-600">YoY customers</div>
          <div className="font-semibold text-slate-900">{formatSignedPct(row.yoyCustomersPct)}</div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        Source:{" "}
        <a
          href={EIA_SOURCE_URL}
          rel="noopener"
          className="underline hover:text-slate-900"
        >
          U.S. Energy Information Administration — {EIA_TABLE}
        </a>
        . Values reflect cumulative year-end installed nameplate capacity (megawatts) and customer counts as reported by retail electric utilities on Form EIA-861. From 2020 onward EIA aggregates residential net-metering into a single &ldquo;All Technologies&rdquo; row; residential installations are predominantly photovoltaic systems (typically &gt;95%), with minor contributions from small wind.
      </p>
    </section>
  );
}
