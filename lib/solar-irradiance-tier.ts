/**
 * SolarIrradianceTier — 5-band deterministic classifier for state-level
 * average peak sun hours, sourced from NREL PVWatts via the NSRDB.
 *
 * Inputs:
 *   - avgSunHours : `states.avg_sun_hours` (peak sun hours per day, NSRDB
 *                   typical-meteorological-year aggregate, 6 kW reference)
 *   - stateAbbr   : two-letter state code (for driver wording)
 *
 * Bands (peak sun hours / day):
 *   A: ≥ 6.0       Excellent  (Desert Southwest / Mountain)
 *   B: 5.0 – 5.9   Strong     (Southwest / Southeast band)
 *   C: 4.5 – 4.9   Good       (Central / Plains band)
 *   D: 4.0 – 4.4   Moderate   (Mid-Atlantic / Midwest band)
 *   E: < 4.0       Limited    (Pacific Northwest / Northeast / Alaska)
 *
 * The classifier is deterministic — given the same NSRDB snapshot, the band
 * output is reproducible. It is an editorial reading layer over the NREL
 * PVWatts production model, not a site-specific irradiance audit.
 *
 * Source authority: NREL PVWatts (https://pvwatts.nrel.gov/) backed by
 * the NSRDB typical-meteorological-year (TMY) dataset. See /editorial-policy/.
 */

export type IrradianceTier = 'A' | 'B' | 'C' | 'D' | 'E';

export type IrradianceConfidence = 'high' | 'low' | 'no-data';

export interface IrradianceDecodeOpts {
  avgSunHours?: number | null;
  stateAbbr?: string | null;
}

export interface IrradianceResult {
  tier: IrradianceTier | null;
  label: string;
  shortLabel: string;
  avgSunHours: number | null;
  sourceUrl: string;
  drivers: string[];
  caveats: string[];
  confidence: IrradianceConfidence;
}

export const IRRADIANCE_TIER_SUMMARY: { tier: IrradianceTier; lowHours: number; highHours: number | null; label: string; band: string }[] = [
  { tier: 'A', lowHours: 6.0, highHours: null, label: 'Excellent',  band: '≥ 6.0 sun hours / day' },
  { tier: 'B', lowHours: 5.0, highHours: 6.0,  label: 'Strong',     band: '5.0 – 5.9 sun hours / day' },
  { tier: 'C', lowHours: 4.5, highHours: 5.0,  label: 'Good',       band: '4.5 – 4.9 sun hours / day' },
  { tier: 'D', lowHours: 4.0, highHours: 4.5,  label: 'Moderate',   band: '4.0 – 4.4 sun hours / day' },
  { tier: 'E', lowHours: 0,   highHours: 4.0,  label: 'Limited',    band: '< 4.0 sun hours / day' },
];

const UNIVERSAL_CAVEATS = [
  'NREL PVWatts uses the NSRDB typical-meteorological-year (TMY) aggregate — actual year-to-year output varies with cloud cover, wildfire smoke, and seasonal soiling.',
  'State-level peak-sun-hours averages mask intra-state variation: a station near Lake Superior reports differently than a southwest-corner station within the same state.',
  'Production estimates assume a 14% system-loss factor and latitude-tilt orientation; non-optimal tilt, partial shading, and soiling each reduce real output 5–15% from the modeled baseline.',
];

const NREL_URL = 'https://pvwatts.nrel.gov/';

function isPosFinite(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}

export function classifySolarIrradianceTier(opts: IrradianceDecodeOpts): IrradianceResult {
  const stateAbbr = (opts.stateAbbr ?? '').trim().toUpperCase();

  if (!isPosFinite(opts.avgSunHours)) {
    return {
      tier: null,
      label: 'No data',
      shortLabel: 'NoData',
      avgSunHours: null,
      sourceUrl: NREL_URL,
      drivers: ['Missing or invalid peak-sun-hours input — band cannot be classified.'],
      caveats: UNIVERSAL_CAVEATS,
      confidence: 'no-data',
    };
  }

  const sh = opts.avgSunHours;

  let tier: IrradianceTier;
  let label: string;
  let shortLabel: string;
  if (sh >= 6.0)       { tier = 'A'; label = 'Excellent'; shortLabel = 'Excellent'; }
  else if (sh >= 5.0)  { tier = 'B'; label = 'Strong';    shortLabel = 'Strong'; }
  else if (sh >= 4.5)  { tier = 'C'; label = 'Good';      shortLabel = 'Good'; }
  else if (sh >= 4.0)  { tier = 'D'; label = 'Moderate';  shortLabel = 'Moderate'; }
  else                 { tier = 'E'; label = 'Limited';   shortLabel = 'Limited'; }

  const drivers: string[] = [];
  drivers.push(`${stateAbbr || 'State'} averages ${sh.toFixed(1)} peak-sun hours / day on the NREL PVWatts NSRDB aggregate.`);
  switch (tier) {
    case 'A': drivers.push('This sits in the Desert Southwest / Mountain band — annual production per kW installed is among the highest in the lower 48.'); break;
    case 'B': drivers.push('This sits in the Southwest / Southeast band — annual production per kW installed is above the national typical.'); break;
    case 'C': drivers.push('This sits in the Central / Plains band — annual production per kW installed is near the national typical.'); break;
    case 'D': drivers.push('This sits in the Mid-Atlantic / Midwest band — annual production per kW installed is below the national typical but still economically viable with strong incentives and high retail rates.'); break;
    case 'E': drivers.push('This sits in the Pacific Northwest / Northeast / Alaska band — annual production per kW installed is well below the national typical; payback math depends heavily on state-level credits and high retail rates.'); break;
  }
  drivers.push('Reference 6 kW residential array; output scales linearly with system size in the production model.');

  return {
    tier,
    label,
    shortLabel,
    avgSunHours: Math.round(sh * 10) / 10,
    sourceUrl: NREL_URL,
    drivers,
    caveats: UNIVERSAL_CAVEATS,
    confidence: 'high',
  };
}

/** Tailwind color tone per tier — every color must be in lib/color-safelist.ts. */
export function irradianceToneColor(tier: IrradianceTier | null): 'emerald' | 'green' | 'amber' | 'orange' | 'rose' | 'slate' {
  switch (tier) {
    case 'A': return 'emerald';
    case 'B': return 'green';
    case 'C': return 'amber';
    case 'D': return 'orange';
    case 'E': return 'rose';
    default:  return 'slate';
  }
}
