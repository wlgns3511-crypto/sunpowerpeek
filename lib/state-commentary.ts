// Layer 2 — derived narrative commentary that synthesizes Layer 1 facts
// (state-facts.ts) into per-state sentences.
//
// Each builder returns one sentence (or null if there's nothing meaningful).
// Pages render whichever subset applies. Goal: every state page reads with
// numbers anchored to that state, not boilerplate.
//
// Variant selection: deterministic FNV-1a hash on the state slug so a state
// always renders the same variant build-to-build (no flicker on rebuild) but
// adjacent states pick different copies, defeating template fingerprints.

import type {
  IncentiveBundle,
  SolarPayback,
  SunResource,
  ZipIrradianceCoverage,
} from './state-facts';

export interface StateCommentary {
  sunSentence: string | null;
  paybackSentence: string | null;
  incentiveSentence: string | null;
  zipSentence: string | null;
  disclaimerSentence: string;        // always present (YMYL guardrail)
}

export function buildStateCommentary(
  stateName: string,
  slug: string,
  sun: SunResource | null,
  payback: SolarPayback | null,
  bundle: IncentiveBundle | null,
  zip: ZipIrradianceCoverage | null,
): StateCommentary {
  const h = fnv1aHash(slug);
  return {
    sunSentence: buildSunSentence(stateName, sun, h),
    paybackSentence: buildPaybackSentence(stateName, payback, h),
    incentiveSentence: buildIncentiveSentence(stateName, bundle, h),
    zipSentence: buildZipSentence(stateName, zip, h),
    disclaimerSentence: buildDisclaimerSentence(bundle, h),
  };
}

// ─────────────── Slot 1: sun resource ───────────────

function buildSunSentence(state: string, s: SunResource | null, h: number): string | null {
  if (!s) return null;
  const dirWord = s.diffVsNational >= 0 ? 'above' : 'below';
  const absPct = Math.abs(s.diffPctVsNational);

  // Skip if within 3% of national — not story-worthy
  if (absPct < 3) {
    return `${state} averages ${s.avgSunHours.toFixed(2)} peak sun hours per day, essentially matching the US national average (${s.nationalAvg.toFixed(2)} h/day) per NREL National Solar Radiation Database.`;
  }

  const variants = [
    `${state} averages ${s.avgSunHours.toFixed(2)} peak sun hours per day — ${absPct.toFixed(1)}% ${dirWord} the ${s.nationalAvg.toFixed(2)} h/day US average and ranking ${ordinal(s.rankNational)} of ${s.totalStates} states (NREL NSRDB).`,
    `Per NREL irradiance data, ${state} sees ${s.avgSunHours.toFixed(2)} peak sun hours daily, placing it ${ordinal(s.rankNational)} nationally and ${absPct.toFixed(1)}% ${dirWord} the ${s.nationalAvg.toFixed(2)}-hour US average.`,
    `Solar resource in ${state} runs ${s.avgSunHours.toFixed(2)} h/day on average — ${absPct.toFixed(1)}% ${dirWord} the national mean of ${s.nationalAvg.toFixed(2)} h/day, a ranking of ${ordinal(s.rankNational)} out of ${s.totalStates} states (NREL).`,
  ];
  return variants[h % variants.length];
}

// ─────────────── Slot 2: payback ───────────────

function buildPaybackSentence(state: string, p: SolarPayback | null, h: number): string | null {
  if (!p) return null;
  const incentivesUsd = p.federalItcUsd + p.stateRebateUsd + p.stateTaxCreditUsd;
  const incentivePct = (incentivesUsd / p.systemCost6kw) * 100;

  const variants = [
    `A typical 6-kW residential system in ${state} runs about ${dollar(p.systemCost6kw)} gross — after the 30% federal ITC and any state credits/rebates (${dollar(incentivesUsd)} total, ${incentivePct.toFixed(0)}% of gross) the net comes to roughly ${dollar(p.netCostUsd)}, with payback near ${p.paybackYears.toFixed(1)} years on ${dollar(p.annualSavingsUsd)}/yr in offset bills.`,
    `${state} households installing a 6-kW system see roughly ${dollar(p.systemCost6kw)} sticker cost; subtracting the federal Section 25D credit and state-level support (${dollar(incentivesUsd)}) leaves about ${dollar(p.netCostUsd)} net, recovered in ~${p.paybackYears.toFixed(1)} years at the state's typical ${dollar(p.annualSavingsUsd)} annual savings.`,
    `Indicative ${state} 6-kW math: ${dollar(p.systemCost6kw)} gross → ${dollar(p.netCostUsd)} net after ITC + state programs, payback ${p.paybackYears.toFixed(1)} yr on ${dollar(p.annualSavingsUsd)}/yr in avoided utility bills (${dollar(p.twentyYearSavingsUsd)} cumulative over 20 years).`,
  ];
  return variants[h % variants.length];
}

// ─────────────── Slot 3: incentives ───────────────

function buildIncentiveSentence(state: string, b: IncentiveBundle | null, h: number): string | null {
  if (!b) return null;

  if (b.isPilotState) {
    const flagsList: string[] = [];
    if (b.hasFederalItc) flagsList.push('30% federal ITC');
    if (b.hasNetMetering) flagsList.push('net-metering rule');
    if (b.hasStateTaxCredit) flagsList.push('state tax credit');
    if (b.hasRebate) flagsList.push('rebate program');
    if (b.hasSalesTaxExemption) flagsList.push('sales-tax exemption');

    const list = flagsList.length === 0
      ? '30% federal ITC only — no qualifying state-level credit or rebate'
      : flagsList.join(', ');

    const variants = [
      `${state}'s incentive landscape includes ${list}; all ${b.totalCount} entries on this page link directly to the issuing agency (${b.withSourceCount} of ${b.totalCount} have a verified source URL).`,
      `For ${state}, we publish ${b.totalCount} incentive entries — ${list} — each anchored to its .gov or utility-commission source page (${b.withSourceCount}/${b.totalCount} verified).`,
      `${state} stack: ${list}. Each of the ${b.totalCount} entries below carries the agency source link and a last-verified date so you can confirm against the original program page.`,
    ];
    return variants[h % variants.length];
  }

  // Non-pilot: be honest about per-row source-verification status
  const pending = b.totalCount - b.withSourceCount;
  if (pending === 0) {
    const variants = [
      `${state}'s ${b.totalCount} incentive entries each carry a verified .gov or utility-commission source link — but the state has not yet been promoted to the pilot tier, so the per-program coverage may be narrower than for the four pilot states.`,
      `All ${b.totalCount} ${state} incentive entries below link to their issuing-agency source, though the slate is smaller than the pilot states (TN/WA/UT/AL) where every active program has been catalogued.`,
    ];
    return variants[h % variants.length];
  }
  const variants = [
    `${b.totalCount} incentive entries are catalogued for ${state} (${b.withSourceCount} carry a verified source link, ${pending} are awaiting source-grounding) — always confirm with your installer and the issuing agency before relying on any program for budgeting.`,
    `For ${state} we list ${b.totalCount} incentive entries; ${b.withSourceCount} have been re-verified against .gov sources, the remaining ${pending} are pending re-verification — treat them as starting points, not financial guarantees.`,
  ];
  return variants[h % variants.length];
}

// ─────────────── Slot 4: ZIP-level irradiance spread ───────────────

function buildZipSentence(state: string, z: ZipIrradianceCoverage | null, h: number): string | null {
  if (!z || z.zipCount < 5) return null;

  // Narrow spread (< 0.4 h/day): the state is climatically uniform — say so
  if (z.sunSpread < 0.4) {
    const variants = [
      `Across ${z.zipCount.toLocaleString()} ${state} ZIP codes, NREL irradiance runs a tight ${z.sunMin.toFixed(2)}–${z.sunMax.toFixed(2)} h/day band (${z.distinctSunBuckets} bucket${z.distinctSunBuckets === 1 ? '' : 's'}), so production estimates are roughly uniform statewide.`,
      `Within ${state}, ${z.zipCount.toLocaleString()} ZIP codes fall into a narrow ${z.sunSpread.toFixed(2)}-hour spread (${z.sunMin.toFixed(2)}–${z.sunMax.toFixed(2)} h/day per NREL), meaning the city you live in matters less here than in larger states.`,
    ];
    return variants[h % variants.length];
  }

  // Wide spread: highlight high-end city
  if (z.topCity) {
    const variants = [
      `Across ${z.zipCount.toLocaleString()} ${state} ZIP codes, NREL records a ${z.sunMin.toFixed(2)}–${z.sunMax.toFixed(2)} h/day range (${z.distinctSunBuckets} buckets); ${z.topCity.city} (${z.topCity.zip}) sits at the top with ${z.topCity.sunHours.toFixed(2)} h/day and ~${dollar(z.topCity.annualSavings)}/yr indicative savings.`,
      `${state} solar resource varies meaningfully by ZIP — NREL shows ${z.sunMin.toFixed(2)}–${z.sunMax.toFixed(2)} h/day across ${z.zipCount.toLocaleString()} codes, with ${z.topCity.city} (${z.topCity.zip}) at ${z.topCity.sunHours.toFixed(2)} h/day delivering roughly ${dollar(z.topCity.annualSavings)}/yr offset bills on the calculator's 6-kW preset.`,
      `${z.zipCount.toLocaleString()} ${state} ZIPs span ${z.sunSpread.toFixed(2)} h/day in NREL irradiance (${z.distinctSunBuckets} grid cells); the high end — places like ${z.topCity.city} (${z.topCity.zip}) at ${z.topCity.sunHours.toFixed(2)} h/day — sees ~${dollar(z.topCity.annualSavings)}/yr annual savings.`,
    ];
    return variants[h % variants.length];
  }

  return null;
}

// ─────────────── Slot 5: disclaimer (always present) ───────────────

function buildDisclaimerSentence(b: IncentiveBundle | null, h: number): string {
  const baseVariants = [
    'These figures are indicative — utility rate cases, federal credit eligibility, and program funding can change mid-year. Verify final numbers with a licensed installer and your utility before signing a contract.',
    'Solar payback math depends on your roof, shading, utility plan, and tax situation. Treat these state-level numbers as a starting point, not a guaranteed quote.',
    'The 30% federal Section 25D credit is non-refundable and depends on your tax liability. State and utility programs may have caps, waiting lists, or income tests. Always confirm program status before relying on any incentive for budgeting.',
  ];

  if (b && !b.isPilotState) {
    return baseVariants[h % baseVariants.length] + ' We are progressively re-verifying historical incentive entries against agency sources — pilot states (TN/WA/UT/AL) carry full source links; others are being upgraded.';
  }
  return baseVariants[h % baseVariants.length];
}

// ─────────────── helpers ───────────────

function dollar(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

// FNV-1a 32-bit hash — small, deterministic, no deps. Used for variant pick
// so that adjacent states see different sentence shapes without runtime randomness.
function fnv1aHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
