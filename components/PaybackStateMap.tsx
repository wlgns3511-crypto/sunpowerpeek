/**
 * US solar payback-years choropleth — server-rendered SVG, zero client JS.
 *
 * Renders 50 state polygons via lib/payback-state-map.ts (geoAlbersUsa
 * projection of us-atlas/states-10m), coloured by each state's
 * `avg_payback_years` from the EIA + NREL PVWatts + DSIRE + IRS Form 5695
 * pipeline (residential 6 kW reference system after the 30% ITC) through a
 * 5-band classifier mirroring `lib/itc-payback-band.ts`:
 *
 *   - A: < 5y   Excellent   green
 *   - B: 5–8y   Strong       lime
 *   - C: 8–12y  Moderate     yellow
 *   - D: 12–20y Slow         orange
 *   - E: ≥ 20y  Avoid        red
 *
 * Honest scope:
 *  - Data covers 50 states from EIA Form 861 (retail rate) × NREL PVWatts
 *    (irradiance) × DSIRE (state rebates) × IRS Form 5695 (federal ITC).
 *    DC has no row in sunpowerpeek's `states` table and is excluded.
 *  - PVWatts uses default 14% loss + latitude tilt; real installs vary
 *    5–15% from baseline. Net-metering policy drift (NEM 2.0 → 3.0) is
 *    not amortized here — see /disclaimer/.
 *
 * Variants:
 *  - `full`    — homepage / methodology, no dimming
 *  - `compact` — state detail (dim siblings + 2.5px navy outline)
 */
import {
  getStatePaths,
  getStateBordersPath,
  NO_DATA_FILL,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '@/lib/payback-state-map';

export interface StatePaybackDatum {
  /** USPS 2-letter code (uppercase) */
  code: string;
  /** Display name */
  name: string;
  /** State slug for href */
  slug: string;
  /** Payback years (lower = better) */
  paybackYears: number;
}

interface Props {
  /** State rows with payback years */
  states: StatePaybackDatum[];
  /** USPS 2-letter to highlight (e.g. 'CA') */
  currentStateCode?: string;
  /** 'full' = no dimming; 'compact' = dim sibling states */
  variant?: 'full' | 'compact';
  /** Override figcaption text */
  caption?: string;
  /** Optional aria-label override */
  ariaLabel?: string;
}

// 5-band payback-years classifier (low = better)
const PAYBACK_BUCKETS: { label: string; max: number; fill: string }[] = [
  { label: 'Excellent (<5y)', max: 5,   fill: '#10b981' }, // emerald-500
  { label: 'Strong (5–8y)',   max: 8,   fill: '#84cc16' }, // lime-500
  { label: 'Moderate (8–12y)', max: 12,  fill: '#eab308' }, // yellow-500
  { label: 'Slow (12–20y)',   max: 20,  fill: '#f97316' }, // orange-500
  { label: 'Avoid (≥20y)',    max: 999, fill: '#dc2626' }, // red-600
];

function colorForPayback(years: number): string {
  for (const b of PAYBACK_BUCKETS) if (years < b.max) return b.fill;
  return PAYBACK_BUCKETS[PAYBACK_BUCKETS.length - 1].fill;
}

function labelForPayback(years: number): string {
  for (const b of PAYBACK_BUCKETS) if (years < b.max) return b.label.replace(/ \(.*$/, '');
  return 'Avoid';
}

export function PaybackStateMap({
  states,
  currentStateCode,
  variant = 'full',
  caption,
  ariaLabel,
}: Props) {
  const paths = getStatePaths();
  const borders = getStateBordersPath();
  const currentUpper = currentStateCode?.toUpperCase();

  const dataByCode = new Map<string, StatePaybackDatum>();
  for (const s of states) dataByCode.set(s.code.toUpperCase(), s);

  const focused = currentUpper
    ? paths.find((p) => p.usps === currentUpper)
    : undefined;

  const bucketCounts = new Array(PAYBACK_BUCKETS.length).fill(0);
  for (const s of states) {
    for (let i = 0; i < PAYBACK_BUCKETS.length; i++) {
      if (s.paybackYears < PAYBACK_BUCKETS[i].max) {
        bucketCounts[i]++;
        break;
      }
    }
  }

  const focusedDatum = currentUpper ? dataByCode.get(currentUpper) : undefined;
  const defaultAria = focusedDatum
    ? `US solar payback map — ${focusedDatum.name} highlighted`
    : 'US solar payback map — states shaded by years to break even';

  return (
    <figure className="my-6">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel ?? defaultAria}
        className="w-full h-auto bg-slate-50 rounded-xl border border-slate-200"
      >
        <title>{ariaLabel ?? defaultAria}</title>
        {paths.map((p) => {
          const datum = dataByCode.get(p.usps);
          const fill = datum ? colorForPayback(datum.paybackYears) : NO_DATA_FILL;
          const isHighlighted = currentUpper === p.usps;
          const dimmed =
            variant === 'compact' && Boolean(currentUpper) && !isHighlighted;
          const opacity = dimmed ? 0.3 : 1;
          const tooltip = datum
            ? `${datum.name} — ${datum.paybackYears.toFixed(1)} years (${labelForPayback(datum.paybackYears)})`
            : `${p.name} — no payback data in dataset`;
          return (
            <path
              key={p.fips}
              d={p.d}
              fill={fill}
              fillOpacity={opacity}
              stroke="#ffffff"
              strokeWidth={0.5}
            >
              <title>{tooltip}</title>
            </path>
          );
        })}
        <path d={borders} fill="none" stroke="#ffffff" strokeWidth={1} />
        {focused && (
          <path d={focused.d} fill="none" stroke="#0f172a" strokeWidth={2.5} />
        )}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
        <span className="font-medium text-slate-700">Payback tier:</span>
        {PAYBACK_BUCKETS.map((b, i) => {
          const count = bucketCounts[i];
          return (
            <span key={b.label} className="inline-flex items-center gap-1">
              <span
                className="inline-block w-3 h-3 rounded-sm border border-slate-300"
                style={{ background: b.fill }}
                aria-hidden="true"
              />
              <span>
                {b.label}
                {count > 0 && <span className="text-slate-400"> ({count})</span>}
              </span>
            </span>
          );
        })}
      </div>

      <figcaption className="mt-3 text-xs text-slate-500">
        {caption ??
          `States shaded by residential solar payback years from the ${states.length}-state dataset (EIA Form 861 retail rates × NREL PVWatts irradiance × DSIRE rebates × IRS Form 5695 30% ITC). Tier cutoffs (5 / 8 / 12 / 20 years) mirror lib/itc-payback-band.ts. State boundaries: US Census TIGER/Line via us-atlas/states-10m. Excludes panel degradation, inverter replacement, financing, SREC value, and net-metering policy drift (NEM 2.0 vs 3.0) — see /disclaimer/.`}
      </figcaption>
    </figure>
  );
}
