/**
 * Phase 7 audit script — verifies Traps #110, #111, #117 against sunpowerpeek.
 * Runs as a one-shot:  npx tsx scripts/audit-phase7.ts
 *
 * v7.0 (2026-05-20): atomic-bundle P1+P4+P5 deploy.
 *   - Title.absolute pattern with VERDICT_TITLE_LABEL × ItcPaybackTier mirrors
 *     app/state/[slug]/page.tsx generateMetadata; keep in sync.
 *   - Tier distribution audit verifies 3-axis composite gives a populated
 *     5-band spread (Trap #111 — no single dominant tier from a flat input).
 *   - Multi-creator schema audit verifies datasetSchema().creator is an array
 *     with ≥2 organizations (Trap #117).
 */
import { classifyItcPaybackBand, type ItcPaybackTier } from '../lib/itc-payback-band';
import { classifyNetMeteringTier } from '../lib/net-metering-tier';
import { classifySolarIrradianceTier } from '../lib/solar-irradiance-tier';
import { getAllStates, getStateBySlug, getIncentivesByState } from '../lib/db';
import { SOURCE_AUTHORITIES } from '../lib/authorship';
import { datasetSchema } from '../lib/schema';

// ---------- visible-char helper (mirrors _shared/scripts/audit-phase7-helpers.ts) ----------
// Per playbook v2.3 §4.0 + §9.5 — title length must reflect what Google sees on
// the SERP (decoded entities, code-point count) not the HTML-source char count.
// Keep this block in sync with _shared/scripts/audit-phase7-helpers.ts.
const HTML_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', middot: '·',
};
function decodeHtmlEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, body) => {
    if (body[0] === '#') {
      const cp = body[1]?.toLowerCase() === 'x'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isNaN(cp) ? m : String.fromCodePoint(cp);
    }
    return HTML_ENTITIES[body.toLowerCase()] ?? m;
  });
}
function visibleCharCount(s: string): number {
  return Array.from(decodeHtmlEntities(s)).length;
}
// ----------------------------------------------------------------------------

console.log('=== Phase 7 audit — sunpowerpeek ===');

// Trap #110 — source publisher count (need ≥2 distinct .gov / authority hosts)
const publisherHosts = SOURCE_AUTHORITIES.map((s) => {
  try {
    return new URL(s.url).host;
  } catch {
    return s.url;
  }
});
const distinctHosts = new Set(publisherHosts);
console.log('\n[#110] SOURCE_AUTHORITIES hosts:', publisherHosts);
console.log('       distinct count:', distinctHosts.size, distinctHosts.size >= 2 ? 'PASS' : 'FAIL');

// Trap #117 (schema creator) — Dataset.creator must be a multi-org array.
const sampleSchema = datasetSchema('Sample', 'Sample desc', { spatialCoverage: 'California' });
const creator = (sampleSchema as { creator: unknown }).creator;
const creatorIsArray = Array.isArray(creator);
const creatorLen = creatorIsArray ? (creator as unknown[]).length : 0;
console.log('\n[#117 creator] Dataset.creator is array:', creatorIsArray, creatorIsArray ? 'PASS' : 'FAIL');
console.log('               creator count:', creatorLen, creatorLen >= 2 ? 'PASS' : 'FAIL');

// Trap #111 — composite 5-band distribution across the 51-state surface.
// We audit ItcPaybackTier (the title-bearing axis); NetMetering and Irradiance
// tiers are also computed and reported so the 3-axis composite spread is visible.
const itcDist: Record<ItcPaybackTier | 'null', number> = { A: 0, B: 0, C: 0, D: 0, E: 0, null: 0 };
const nemDist: Record<string, number> = { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, null: 0 };
const irrDist: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, null: 0 };

for (const s of getAllStates()) {
  const state = getStateBySlug(s.slug);
  if (!state) continue;
  const annualKwh = state.avg_sun_hours * 365 * 6;
  const itc = classifyItcPaybackBand({
    systemCostPerWatt: state.avg_system_cost_per_watt,
    systemSizeWatts: 6000,
    federalItcPct: state.federal_tax_credit_pct,
    stateRebateUsd: state.state_rebate,
    stateTaxCreditPct: state.state_tax_credit,
    annualKwh,
    retailRateCentsPerKwh: state.avg_electricity_rate,
  });
  itcDist[itc.tier ?? 'null'] += 1;

  const incentives = getIncentivesByState(state.abbr);
  const incentiveTexts = incentives.map((i) => `${i.incentive_name}\n${i.description}`);
  const nem = classifyNetMeteringTier({
    stateAbbr: state.abbr,
    netMeteringRaw: state.net_metering,
    incentiveTexts,
  });
  nemDist[nem.tier ?? 'null'] += 1;

  const irr = classifySolarIrradianceTier({
    stateAbbr: state.abbr,
    avgSunHours: state.avg_sun_hours,
  });
  irrDist[irr.tier ?? 'null'] += 1;
}

console.log('\n[#111 ItcPaybackTier] distribution:', itcDist);
const itcKeys = ['A', 'B', 'C', 'D', 'E'] as const;
const itcPopulated = itcKeys.filter((k) => itcDist[k] > 0).length;
console.log('       bands populated:', itcPopulated, '/ 5', itcPopulated >= 3 ? 'PASS' : 'FAIL');

console.log('\n[#111 NetMeteringTier] distribution:', nemDist);
const nemKeys = ['T1', 'T2', 'T3', 'T4', 'T5'];
const nemPopulated = nemKeys.filter((k) => nemDist[k] > 0).length;
console.log('       tiers populated:', nemPopulated, '/ 5', nemPopulated >= 3 ? 'PASS' : 'FAIL');

console.log('\n[#111 IrradianceTier] distribution:', irrDist);
const irrKeys = ['A', 'B', 'C', 'D', 'E'];
const irrPopulated = irrKeys.filter((k) => irrDist[k] > 0).length;
console.log('       bands populated:', irrPopulated, '/ 5', irrPopulated >= 3 ? 'PASS' : 'FAIL');

// Trap #117 (title-length) — title.absolute bypasses layout `%s | SunPowerPeek`
// suffix, so the verdict-bearing string is what Google sees. Cap = 60 chars.
// Mirrors app/state/[slug]/page.tsx VERDICT_TITLE_LABEL — keep in sync.
const VERDICT_TITLE_LABEL: Record<ItcPaybackTier, string> = {
  A: 'Excellent',
  B: 'Strong',
  C: 'Moderate',
  D: 'Slow',
  E: 'Avoid',
};

let titleMax = 0;
let titleMaxStr = '';
let titleOver60 = 0;
let verdictInTitle = 0;
let counted = 0;

for (const s of getAllStates()) {
  const state = getStateBySlug(s.slug);
  if (!state) continue;
  const annualKwh = state.avg_sun_hours * 365 * 6;
  const itc = classifyItcPaybackBand({
    systemCostPerWatt: state.avg_system_cost_per_watt,
    systemSizeWatts: 6000,
    federalItcPct: state.federal_tax_credit_pct,
    stateRebateUsd: state.state_rebate,
    stateTaxCreditPct: state.state_tax_credit,
    annualKwh,
    retailRateCentsPerKwh: state.avg_electricity_rate,
  });
  const tierLabel = itc.tier ? VERDICT_TITLE_LABEL[itc.tier] : null;
  const title = tierLabel && itc.paybackYears != null
    ? `${state.state}: ${tierLabel} Solar Payback · ${itc.paybackYears.toFixed(1)}yr`
    : `${state.state} Solar Cost & Savings 2026`;
  counted += 1;
  const titleLen = visibleCharCount(title);
  if (titleLen > titleMax) {
    titleMax = titleLen;
    titleMaxStr = title;
  }
  if (titleLen > 60) titleOver60 += 1;
  if (/ Solar Payback · /.test(title)) verdictInTitle += 1;
}

console.log('\n[#117 title] title.absolute length audit (cap=60, layout suffix bypassed)');
console.log('       max length:', titleMax, '/', titleMaxStr);
console.log('       >60 chars:', titleOver60, titleOver60 === 0 ? 'PASS' : 'FAIL');
console.log(
  '       verdict-in-title:',
  verdictInTitle,
  '/',
  counted,
  '(' + ((verdictInTitle / counted) * 100).toFixed(1) + '%)',
  verdictInTitle === counted ? 'PASS' : 'WARN — some states fell back to no-verdict shape',
);

// Per-state sample
const sample = ['california', 'new-york', 'arizona', 'south-dakota', 'washington', 'district-of-columbia'];
console.log('\n[sample]');
for (const slug of sample) {
  const state = getStateBySlug(slug);
  if (!state) continue;
  const annualKwh = state.avg_sun_hours * 365 * 6;
  const itc = classifyItcPaybackBand({
    systemCostPerWatt: state.avg_system_cost_per_watt,
    systemSizeWatts: 6000,
    federalItcPct: state.federal_tax_credit_pct,
    stateRebateUsd: state.state_rebate,
    stateTaxCreditPct: state.state_tax_credit,
    annualKwh,
    retailRateCentsPerKwh: state.avg_electricity_rate,
  });
  const tierLabel = itc.tier ? VERDICT_TITLE_LABEL[itc.tier] : null;
  const title = tierLabel && itc.paybackYears != null
    ? `${state.state}: ${tierLabel} Solar Payback · ${itc.paybackYears.toFixed(1)}yr`
    : `${state.state} Solar Cost & Savings 2026`;
  console.log(`  ${slug}: tier ${itc.tier ?? '?'}  ${itc.paybackYears ?? '?'}yr  $${itc.netSystemCostUsd?.toLocaleString() ?? '?'} net cost`);
  console.log(`    title (${visibleCharCount(title)}c): "${title}"`);
}

// Exit non-zero if any title overflows 60.
if (titleOver60 > 0) {
  console.error('\n❌ FAIL: ' + titleOver60 + ' title(s) exceed 60-char cap.');
  process.exit(1);
}
console.log('\n✅ All title-length checks pass.');
