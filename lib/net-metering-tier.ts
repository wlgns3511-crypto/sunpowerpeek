/**
 * NetMeteringTier — 5-tier deterministic classifier for residential
 * solar export-credit policy at the state level.
 *
 * Inputs:
 *   - stateAbbr        : two-letter state code
 *   - netMeteringRaw   : DB raw value from `states.net_metering` ('yes' | 'partial' | 'no')
 *   - incentiveTexts[] : array of incentive_name + description strings from
 *                        the `incentives` table for that state (cross-ref
 *                        for NEM 3.0 / TOU / capacity-cap signal extraction)
 *
 * Tiers:
 *   T1 FullRetail            — retail-rate kWh credit (AZ/NY/MA pattern)
 *   T2 AvoidedCostHybrid     — TOU-rate export, post-NEM 3.0 (CA pattern)
 *   T3 NetBilling            — capacity cap or grid-supply tariff (HI/NV pattern)
 *   T4 PartialPolicy         — utility-discretion / sunset (10 partial states)
 *   T5 NoStatePolicy         — no statutory framework (KY/TN/WV)
 *
 * The classifier is deterministic — given the same DB values and same
 * incentives-table text snapshot, the tier output is reproducible. It is
 * an editorial reading layer, not legal advice. Live policy verification
 * requires reading the state-PUC tariff filing in force.
 *
 * Source authority: DSIRE Incentive Database (https://www.dsireusa.org/),
 * cross-checked with state PUC tariff filings. See /editorial-policy/ for
 * the full attribution chain.
 */

export type NetMeteringTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export type NetMeteringConfidence = 'high' | 'moderate' | 'low' | 'no-data';

export interface NetMeteringDecodeOpts {
  stateAbbr?: string | null;
  netMeteringRaw?: string | null;
  incentiveTexts?: string[];
}

export interface NetMeteringResult {
  tier: NetMeteringTier | null;
  label: string;
  shortLabel: string;
  sourceUrl: string;
  drivers: string[];
  caveats: string[];
  confidence: NetMeteringConfidence;
}

export const NET_METERING_TIER_SUMMARY: { tier: NetMeteringTier; label: string; shortLabel: string }[] = [
  { tier: 'T1', label: 'Full retail-rate credit',            shortLabel: 'FullRetail' },
  { tier: 'T2', label: 'Avoided-cost / TOU hybrid (post-NEM-3 pattern)', shortLabel: 'AvoidedCostHybrid' },
  { tier: 'T3', label: 'Net billing / capacity-capped tariff', shortLabel: 'NetBilling' },
  { tier: 'T4', label: 'Partial / utility-discretion policy',  shortLabel: 'PartialPolicy' },
  { tier: 'T5', label: 'No statutory state policy',            shortLabel: 'NoStatePolicy' },
];

// Three universal caveats, surfaced site-wide for honest disclosure.
const UNIVERSAL_CAVEATS = [
  'DSIRE snapshots are reviewed regularly but state-PUC tariff filings can update between snapshots — confirm the live tariff with the serving utility before signing.',
  'Net-metering classification reflects the dominant state-level framework; investor-owned utilities, municipal utilities, and electric cooperatives within a single state often operate under distinct tariffs that may sit in a different tier.',
  'Export-credit value is a function of the credit mechanism plus retail/time-of-use rate structure — a Tier 1 credit at a low EIA rate can yield less than a Tier 2 credit at a high TOU peak.',
];

const DSIRE_URL = 'https://www.dsireusa.org/';

// T2 — explicit CA-style avoided-cost / TOU hybrid. Empirically only CA after
// the 2023 NEM 3.0 transition documented by CPUC.
const T2_STATES = new Set(['CA']);
// T3 — net-billing / capacity-capped tariff (HI grid-supply, NV NEM cap).
const T3_STATES = new Set(['HI', 'NV']);
// T5 — no statutory state policy (matches DB rows where net_metering='no').
const T5_STATES = new Set(['KY', 'TN', 'WV']);

function normalizeRaw(raw: string | null | undefined): 'yes' | 'partial' | 'no' | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase();
  if (v === 'yes' || v === 'partial' || v === 'no') return v;
  return null;
}

function detectNem3Pattern(texts: string[] | undefined): boolean {
  if (!texts || texts.length === 0) return false;
  const blob = texts.join('\n').toLowerCase();
  return blob.includes('nem 3') || blob.includes('time-of-use') || blob.includes('avoided cost') || blob.includes('export rate');
}

function detectCapacityCap(texts: string[] | undefined): boolean {
  if (!texts || texts.length === 0) return false;
  const blob = texts.join('\n').toLowerCase();
  return blob.includes('grid-supply') || blob.includes('grid supply') || blob.includes('capacity cap') || blob.includes('aggregate cap');
}

export function classifyNetMeteringTier(opts: NetMeteringDecodeOpts): NetMeteringResult {
  const stateAbbr = (opts.stateAbbr ?? '').trim().toUpperCase();
  const raw = normalizeRaw(opts.netMeteringRaw);
  const texts = opts.incentiveTexts ?? [];

  const noData = (): NetMeteringResult => ({
    tier: null,
    label: 'No data',
    shortLabel: 'NoData',
    sourceUrl: DSIRE_URL,
    drivers: ['Missing or invalid state net-metering value — tier cannot be classified.'],
    caveats: UNIVERSAL_CAVEATS,
    confidence: 'no-data',
  });

  if (!stateAbbr || raw === null) return noData();

  // Honest set classification first (T2/T3/T5 are explicit lists), then
  // fall back to DB raw value for T1 / T4 split.
  let tier: NetMeteringTier;
  let label: string;
  let shortLabel: string;
  let confidence: NetMeteringConfidence = 'high';
  const drivers: string[] = [];

  if (T5_STATES.has(stateAbbr)) {
    tier = 'T5'; label = 'No statutory state policy'; shortLabel = 'NoStatePolicy';
    drivers.push(`${stateAbbr} has no state-level net-metering statute on the DSIRE summary — utility-by-utility programs only.`);
    drivers.push('Excess generation typically rolls forward at a utility-set credit, not a retail-rate equivalent.');
  } else if (T2_STATES.has(stateAbbr)) {
    tier = 'T2'; label = 'Avoided-cost / TOU hybrid (post-NEM-3 pattern)'; shortLabel = 'AvoidedCostHybrid';
    drivers.push(`${stateAbbr} replaced retail-rate NEM with a time-of-use export structure (NEM 3.0 transition, 2023).`);
    drivers.push('Exports during low-load hours credit at avoided-cost, not retail — pairing storage to shift exports into peak windows is the dominant economic strategy.');
    if (detectNem3Pattern(texts)) {
      drivers.push('Incentives table corroborates NEM 3.0 / TOU export wording on file.');
    } else {
      confidence = 'moderate';
    }
  } else if (T3_STATES.has(stateAbbr)) {
    tier = 'T3'; label = 'Net billing / capacity-capped tariff'; shortLabel = 'NetBilling';
    drivers.push(`${stateAbbr} operates a net-billing or capacity-capped export framework (grid-supply tariff or NEM cap).`);
    drivers.push('Export credit is metered separately from import consumption and may be valued at an approved export rate distinct from the retail rate.');
    if (detectCapacityCap(texts)) {
      drivers.push('Incentives table corroborates grid-supply / capacity-cap wording on file.');
    } else {
      confidence = 'moderate';
    }
  } else if (raw === 'yes') {
    tier = 'T1'; label = 'Full retail-rate credit'; shortLabel = 'FullRetail';
    drivers.push(`${stateAbbr} maintains a retail-rate net-metering framework on the DSIRE summary.`);
    drivers.push('Excess kWh exported to the grid credit at the full retail rate (1:1 kWh banking) within the state\'s aggregate cap.');
  } else if (raw === 'partial') {
    tier = 'T4'; label = 'Partial / utility-discretion policy'; shortLabel = 'PartialPolicy';
    drivers.push(`${stateAbbr} is classified as partial on the DSIRE summary — coverage may be utility-specific, sunsetted, or limited to certain customer classes.`);
    drivers.push('Verify the serving utility\'s active tariff: investor-owned, municipal, and cooperative utilities within the state may sit in different sub-tiers.');
    confidence = 'moderate';
  } else {
    // raw === 'no' but state is not in the T5 hardcoded set — treat as T5 by data, low confidence.
    tier = 'T5'; label = 'No statutory state policy'; shortLabel = 'NoStatePolicy';
    drivers.push(`${stateAbbr} reports no state-level net-metering on the DSIRE summary.`);
    confidence = 'low';
  }

  return {
    tier,
    label,
    shortLabel,
    sourceUrl: DSIRE_URL,
    drivers,
    caveats: UNIVERSAL_CAVEATS,
    confidence,
  };
}

/** Tailwind color tone per tier — every color must be in lib/color-safelist.ts. */
export function netMeteringToneColor(tier: NetMeteringTier | null): 'emerald' | 'green' | 'amber' | 'orange' | 'rose' | 'slate' {
  switch (tier) {
    case 'T1': return 'emerald';
    case 'T2': return 'amber';
    case 'T3': return 'amber';
    case 'T4': return 'orange';
    case 'T5': return 'rose';
    default:   return 'slate';
  }
}
