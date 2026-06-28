/**
 * Phase 7 Empirical-Outcomes layer — EIA Form 861 Table 11 residential net-metering.
 *
 * Loads data/eia-net-metering-aggregates.json (baked by scripts/sync-eia-solar.ts)
 * and exposes a read API for /state/[slug]/. Provides the "actually installed
 * in this state" empirical dimension that the upstream ITC payback / DSIRE
 * incentive / NREL irradiance composite cannot derive from federal limits +
 * insolation models alone.
 *
 * Trap #111 disclosure: no uniform band assignment is forced. Each state gets
 * its raw cumulative capacity (MW), customer count, and YoY growth pp — the
 * dimensional surface is continuous, not bucketed.
 *
 * Trap #110 disclosure: this module's EIA_SOURCE_AUTHORITY hostname (eia.gov)
 * is a fresh TLD-level publisher distinct from the other SOURCE_AUTHORITIES
 * hosts in lib/authorship.ts. Must be registered there via Trap #115 to count
 * toward the ≥2-host empirical-outcomes minimum.
 */

import payload from '@/data/eia-net-metering-aggregates.json';

export const EIA_VINTAGE = (payload as { vintage: string }).vintage;
export const EIA_PRIOR_VINTAGE = (payload as { priorVintage: string }).priorVintage;
export const EIA_FETCHED_AT = (payload as { fetchedAt: string }).fetchedAt;
export const EIA_SOURCE_URL = (payload as { sourceUrl: string }).sourceUrl;
export const EIA_API_ENDPOINT = (payload as { apiEndpoint: string }).apiEndpoint;
export const EIA_METHODOLOGY = (payload as { methodology: string }).methodology;
export const EIA_TECHNOLOGY_NOTE = (payload as { technologyNote: string }).technologyNote;
export const EIA_TABLE = (payload as { table: string }).table;

export interface SolarStateRow {
  capacityMW: number;
  customers: number;
  priorCapacityMW: number | null;
  priorCustomers: number | null;
  yoyCapacityPct: number | null;
  yoyCustomersPct: number | null;
}

interface SolarPayloadShape {
  byState: Record<string, SolarStateRow>;
}

const BY_STATE = (payload as SolarPayloadShape).byState;

/**
 * Stable manifest entry for SOURCE_AUTHORITIES-style consumers. URL literal
 * inlined per Trap #105 (no const-substitution in audit grep).
 */
export const EIA_SOURCE_AUTHORITY = {
  name: 'U.S. EIA Form 861 — State Electricity Profiles, Table 11 Net Metering',
  url: 'https://www.eia.gov/electricity/data.php',
  role: `Tier-1 empirical outcomes (${EIA_VINTAGE} EIA-861): per-state cumulative residential net-metering capacity (MW) and customer counts from utility filings. Used to surface real adoption dimension alongside NREL irradiance × DSIRE × ITC composite verdict.`,
} as const;

export function getSolarEmpirical(stateSlug: string): SolarStateRow | null {
  return BY_STATE[stateSlug] ?? null;
}

/**
 * National totals across the 50-state cohort (DC + US national row excluded
 * during sync). Computed once at module init.
 */
const NATIONAL = (() => {
  let totalCapacityMW = 0;
  let totalCustomers = 0;
  let totalPriorCapacityMW = 0;
  let totalPriorCustomers = 0;
  let n = 0;
  for (const row of Object.values(BY_STATE)) {
    totalCapacityMW += row.capacityMW;
    totalCustomers += row.customers;
    if (row.priorCapacityMW != null) totalPriorCapacityMW += row.priorCapacityMW;
    if (row.priorCustomers != null) totalPriorCustomers += row.priorCustomers;
    n++;
  }
  const meanCapacityMW = n > 0 ? totalCapacityMW / n : 0;
  const meanCustomers = n > 0 ? totalCustomers / n : 0;
  const yoyCapacityPct =
    totalPriorCapacityMW > 0
      ? ((totalCapacityMW - totalPriorCapacityMW) / totalPriorCapacityMW) * 100
      : 0;
  const yoyCustomersPct =
    totalPriorCustomers > 0
      ? ((totalCustomers - totalPriorCustomers) / totalPriorCustomers) * 100
      : 0;
  return {
    totalCapacityMW,
    totalCustomers,
    meanCapacityMW,
    meanCustomers,
    yoyCapacityPct,
    yoyCustomersPct,
    cohortSize: n,
  };
})();

export function getNationalSolarTotals() {
  return NATIONAL;
}

/**
 * Multiplicative delta vs national mean (not pp — capacity values span 4
 * orders of magnitude from TN 0.6 MW to CA 12,772 MW; absolute deltas would
 * be illegible). Returns ratio so CA = ~18× mean, AL = ~0.001× mean.
 */
export function getCapacityRatio(stateSlug: string): number | null {
  const row = getSolarEmpirical(stateSlug);
  if (!row || NATIONAL.meanCapacityMW === 0) return null;
  return row.capacityMW / NATIONAL.meanCapacityMW;
}

/**
 * Signed pp delta of state YoY capacity growth vs national YoY capacity
 * growth. Positive = state is growing faster than the national fleet.
 */
export function getYoyCapacityDelta(stateSlug: string): number | null {
  const row = getSolarEmpirical(stateSlug);
  if (!row || row.yoyCapacityPct == null) return null;
  return row.yoyCapacityPct - NATIONAL.yoyCapacityPct;
}

/**
 * Plain-English verdict describing the empirical adoption tier. Continuous
 * sentence, not a band label. Tier cutoffs are ratio-based and chosen so the
 * 50-state cohort spreads across all four tiers (CA top, several flat states
 * at the bottom).
 */
export function describeCapacityRatio(ratio: number | null): string {
  if (ratio == null) return 'No EIA Form 861 aggregate available for this state.';
  if (ratio >= 5) {
    return `${ratio.toFixed(1)}× the 50-state mean — this state hosts an outsized share of the nation's residential net-metering fleet.`;
  }
  if (ratio >= 1.5) {
    return `${ratio.toFixed(1)}× the 50-state mean — adoption is well above the national average for residential net metering.`;
  }
  if (ratio >= 0.5) {
    return `${ratio.toFixed(1)}× the 50-state mean — adoption sits in the middle of the national distribution.`;
  }
  if (ratio >= 0.1) {
    return `${ratio.toFixed(2)}× the 50-state mean — adoption is well below the national average; small base, room to grow.`;
  }
  return `${ratio.toFixed(3)}× the 50-state mean — a very small installed base relative to the national fleet.`;
}

/**
 * Plain-English verdict for YoY growth delta. 4-cutoff continuous (Trap #111).
 */
export function describeYoyCapacityDelta(deltaPp: number | null): string {
  if (deltaPp == null) return 'No prior-year EIA Form 861 aggregate available for this state.';
  const sign = deltaPp >= 0 ? '+' : '';
  const abs = Math.abs(deltaPp);
  if (abs < 2) {
    return `${sign}${deltaPp.toFixed(1)} pp vs national — tracking the national capacity-growth rate.`;
  }
  if (abs < 6) {
    return `${sign}${deltaPp.toFixed(1)} pp vs national — modestly ${
      deltaPp > 0 ? 'faster than' : 'slower than'
    } the national capacity-growth rate.`;
  }
  if (abs < 15) {
    return `${sign}${deltaPp.toFixed(1)} pp vs national — meaningfully ${
      deltaPp > 0 ? 'accelerating beyond' : 'lagging'
    } the national fleet's capacity growth.`;
  }
  return `${sign}${deltaPp.toFixed(1)} pp vs national — wide divergence from the national capacity-growth rate; small-base states often show large YoY swings here.`;
}

/**
 * Audit helper — exported for scripts/audit-phase7.ts to verify the empirical
 * dimension actually varies across the cohort (Trap #111 negative check).
 */
export function capacityDistribution(): {
  min: number;
  max: number;
  median: number;
  ratioSpread: number;
} {
  const values = Object.values(BY_STATE)
    .map((r) => r.capacityMW)
    .sort((a, b) => a - b);
  if (values.length === 0) {
    return { min: 0, max: 0, median: 0, ratioSpread: 0 };
  }
  const min = values[0];
  const max = values[values.length - 1];
  const median = values[Math.floor(values.length / 2)];
  return {
    min,
    max,
    median,
    ratioSpread: min > 0 ? max / min : 0,
  };
}
