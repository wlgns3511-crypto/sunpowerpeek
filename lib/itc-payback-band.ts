/**
 * ItcPaybackBand — 5-tier deterministic classifier for residential solar
 * payback years.
 *
 * Inputs (per state, derived from public authorities):
 *   - systemCostPerWatt (USD/W) — NREL/SEIA-style baseline used in DB
 *   - systemSizeWatts (W) — reference size (default 6 kW = 6000 W)
 *   - federalItcPct (%) — IRS Form 5695 Residential Clean Energy Credit
 *     (30% under IRA through 2032)
 *   - stateRebateUsd (USD) — DSIRE state-rebate snapshot ($)
 *   - stateTaxCreditPct (%) — state credit on pre-ITC system cost (DSIRE)
 *   - annualKwh — NREL PVWatts annual output (6 × avg_sun_hours × 365)
 *   - retailRateCentsPerKwh — EIA monthly state retail rate
 *
 * Computation:
 *   netSystemCost  = installedCost − federalItc − stateRebate − stateTaxCredit
 *   annualSavings  = annualKwh × retailRateCentsPerKwh / 100
 *   paybackYears   = netSystemCost / annualSavings
 *
 * Tier cutoffs (years):
 *   A: < 5    Excellent  (high-irradiance + low cost + strong incentives)
 *   B: 5–8    Strong
 *   C: 8–12   Moderate   (national average band)
 *   D: 12–20  Slow
 *   E: 20+    Avoid      (low irradiance, high cost, weak incentives, or low rate)
 *
 * Honest no-data: any missing/non-finite input → tier: null, confidence: 'no-data'.
 *
 * Universal caveats (5, surfaced site-wide):
 *   1. NREL PVWatts default assumptions (14% loss, latitude tilt) — real
 *      installs vary 5–15% from baseline.
 *   2. DSIRE coverage lag — utility rebates can change between snapshots.
 *   3. EIA retail-rate vintage — no escalation projection; 2–4%/yr is industry
 *      default but is editorial commentary.
 *   4. IRS Form 5695 ITC nonrefundable — household tax liability constrains
 *      first-year capture; carry-forward rules are statute-bound.
 *   5. Excludes panel degradation, inverter replacement, financing, SREC value,
 *      and net-metering policy drift (NEM 2.0 vs 3.0). See /disclaimer/.
 */

export type ItcPaybackTier = 'A' | 'B' | 'C' | 'D' | 'E';

export type ItcPaybackConfidence = 'high' | 'moderate' | 'low' | 'no-data';

export interface ItcPaybackDecodeOpts {
  systemCostPerWatt?: number | null;
  systemSizeWatts?: number | null;       // default 6000
  federalItcPct?: number | null;          // default 30 (IRA through 2032)
  stateRebateUsd?: number | null;
  stateTaxCreditPct?: number | null;
  annualKwh?: number | null;              // NREL PVWatts output
  retailRateCentsPerKwh?: number | null;  // EIA state retail
}

export interface ItcPaybackResult {
  tier: ItcPaybackTier | null;
  label: string;
  paybackYears: number | null;
  netSystemCostUsd: number | null;
  installedCostUsd: number | null;
  federalItcUsd: number | null;
  stateRebateUsd: number | null;
  stateTaxCreditUsd: number | null;
  annualSavingsUsd: number | null;
  annualKwh: number | null;
  retailRateCentsPerKwh: number | null;
  drivers: string[];
  caveats: string[];
  confidence: ItcPaybackConfidence;
}

export const TIER_CUTOFF_SUMMARY: { tier: ItcPaybackTier; lowYears: number; highYears: number | null; label: string }[] = [
  { tier: 'A', lowYears: 0,  highYears: 5,   label: 'Excellent' },
  { tier: 'B', lowYears: 5,  highYears: 8,   label: 'Strong' },
  { tier: 'C', lowYears: 8,  highYears: 12,  label: 'Moderate' },
  { tier: 'D', lowYears: 12, highYears: 20,  label: 'Slow' },
  { tier: 'E', lowYears: 20, highYears: null, label: 'Avoid' },
];

const UNIVERSAL_CAVEATS = [
  'NREL PVWatts assumes 14% system loss + latitude tilt; real installs typically vary 5–15% from baseline.',
  'DSIRE incentive snapshots can lag utility rebate changes by weeks.',
  'EIA retail-rate vintage held flat — no escalation projection.',
  'IRS Form 5695 ITC is nonrefundable; first-year capture depends on household tax liability.',
  'Excludes panel degradation curve, inverter replacement, financing cost, SREC value, and net-metering policy drift.',
];

function isPos(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n > 0;
}
function isNonNeg(n: number | null | undefined): n is number {
  return typeof n === 'number' && Number.isFinite(n) && n >= 0;
}

export function classifyItcPaybackBand(opts: ItcPaybackDecodeOpts): ItcPaybackResult {
  const systemSizeWatts = opts.systemSizeWatts ?? 6000;
  const federalItcPct = opts.federalItcPct ?? 30;

  const noData = (): ItcPaybackResult => ({
    tier: null,
    label: 'No data',
    paybackYears: null,
    netSystemCostUsd: null,
    installedCostUsd: null,
    federalItcUsd: null,
    stateRebateUsd: null,
    stateTaxCreditUsd: null,
    annualSavingsUsd: null,
    annualKwh: null,
    retailRateCentsPerKwh: null,
    drivers: ['Missing or invalid input — payback cannot be computed.'],
    caveats: UNIVERSAL_CAVEATS,
    confidence: 'no-data',
  });

  if (!isPos(opts.systemCostPerWatt)) return noData();
  if (!isPos(opts.annualKwh)) return noData();
  if (!isPos(opts.retailRateCentsPerKwh)) return noData();

  const installedCost = opts.systemCostPerWatt * systemSizeWatts;
  const federalItc = installedCost * (federalItcPct / 100);
  const stateRebate = isNonNeg(opts.stateRebateUsd) ? opts.stateRebateUsd : 0;
  const stateTaxCredit = isNonNeg(opts.stateTaxCreditPct)
    ? installedCost * (opts.stateTaxCreditPct / 100)
    : 0;
  const netSystemCost = Math.max(installedCost - federalItc - stateRebate - stateTaxCredit, 0);
  const annualSavings = opts.annualKwh * (opts.retailRateCentsPerKwh / 100);
  const paybackYears = annualSavings > 0 ? netSystemCost / annualSavings : null;

  let tier: ItcPaybackTier;
  let label: string;
  if (paybackYears == null) {
    return noData();
  } else if (paybackYears < 5)  { tier = 'A'; label = 'Excellent'; }
  else if (paybackYears < 8)    { tier = 'B'; label = 'Strong'; }
  else if (paybackYears < 12)   { tier = 'C'; label = 'Moderate'; }
  else if (paybackYears < 20)   { tier = 'D'; label = 'Slow'; }
  else                          { tier = 'E'; label = 'Avoid'; }

  const drivers: string[] = [];
  drivers.push(`Installed cost: $${Math.round(installedCost).toLocaleString()} at $${opts.systemCostPerWatt.toFixed(2)}/W × ${(systemSizeWatts / 1000).toFixed(1)} kW (NREL/SEIA-baseline DB).`);
  drivers.push(`Federal ITC: −$${Math.round(federalItc).toLocaleString()} (${federalItcPct}% IRS Form 5695, IRA through 2032).`);
  if (stateRebate > 0) drivers.push(`DSIRE state rebate: −$${Math.round(stateRebate).toLocaleString()} (snapshot).`);
  if (stateTaxCredit > 0) drivers.push(`State tax credit: −$${Math.round(stateTaxCredit).toLocaleString()} (${opts.stateTaxCreditPct}% of installed, DSIRE).`);
  drivers.push(`Net system cost after incentives: $${Math.round(netSystemCost).toLocaleString()}.`);
  drivers.push(`Annual production: ${Math.round(opts.annualKwh).toLocaleString()} kWh (NREL PVWatts).`);
  drivers.push(`Retail rate: ${opts.retailRateCentsPerKwh.toFixed(1)}¢/kWh (EIA).`);
  drivers.push(`Annual savings: $${Math.round(annualSavings).toLocaleString()} → payback ${paybackYears.toFixed(1)} years.`);

  // Confidence: how many of the 4 optional incentive/policy inputs are explicit?
  let optionalSignals = 0;
  if (isNonNeg(opts.stateRebateUsd)) optionalSignals++;
  if (isNonNeg(opts.stateTaxCreditPct)) optionalSignals++;
  if (opts.systemSizeWatts != null) optionalSignals++;
  if (opts.federalItcPct != null) optionalSignals++;
  let confidence: ItcPaybackConfidence;
  if (optionalSignals >= 3) confidence = 'high';
  else if (optionalSignals === 2) confidence = 'moderate';
  else confidence = 'low';

  return {
    tier,
    label,
    paybackYears: Math.round(paybackYears * 10) / 10,
    netSystemCostUsd: Math.round(netSystemCost),
    installedCostUsd: Math.round(installedCost),
    federalItcUsd: Math.round(federalItc),
    stateRebateUsd: Math.round(stateRebate),
    stateTaxCreditUsd: Math.round(stateTaxCredit),
    annualSavingsUsd: Math.round(annualSavings),
    annualKwh: Math.round(opts.annualKwh),
    retailRateCentsPerKwh: Math.round(opts.retailRateCentsPerKwh * 10) / 10,
    drivers,
    caveats: UNIVERSAL_CAVEATS,
    confidence,
  };
}

/** Tailwind color tone per tier — every color must be in lib/color-safelist.ts. */
export function tierToneColor(tier: ItcPaybackTier | null): 'emerald' | 'green' | 'amber' | 'orange' | 'rose' | 'slate' {
  switch (tier) {
    case 'A': return 'emerald';
    case 'B': return 'green';
    case 'C': return 'amber';
    case 'D': return 'orange';
    case 'E': return 'rose';
    default:  return 'slate';
  }
}
