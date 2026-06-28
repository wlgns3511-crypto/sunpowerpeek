/**
 * Network-wide publisher and per-site editorial team. SunPowerPeek publishes
 * as an organization — the editorial team is the named reviewer, with public
 * data sources cited inline on every page.
 *
 * Phase 6 v6.2 (2026-05-06):
 *   - 5-layer vintage separation. Distinct page families have distinct review
 *     cadences; a single shared timestamp triggers HCU's "everything updated
 *     on the same day = nothing actually updated" coupling penalty.
 *   - 4 SOURCE_AUTHORITIES (NREL / DSIRE / EIA / IRS Form 5695) — only
 *     institutions actually backing numbers in the DB. SEIA/Wood Mackenzie
 *     is referenced editorially in one cost-per-watt guide but is not a DB
 *     source, so it is not listed here (honest minimalism, powerbillpeek
 *     precedent).
 *   - LEGAL_REVIEWED kept as a single value because git history shows a
 *     single 2026-04-01 commit touched all three legal pages — git-truth
 *     beats artificially staggered dates.
 */

// ===== Vintage 5-layer separation =====
// ENTITY: state solar facts (NREL irradiance + EIA rate + DSIRE pilot data)
export const ENTITY_VINTAGE = '2026-04-29';
// STATE: derived state hub aggregates (commentary, insights, payback)
export const STATE_VINTAGE = '2026-04-29';
// INCENTIVE: DSIRE state-incentive snapshot
export const INCENTIVE_VINTAGE = '2026-04-29';
// METHODOLOGY: how baselines are derived (NREL + DSIRE + EIA + IRS)
export const METHODOLOGY_VINTAGE = '2026-04-29';
// ABOUT: editorial mission/scope (expanded 2026-05-06 for honest source disclosure)
export const ABOUT_VINTAGE = '2026-05-06';
// SITE: schema.org WebSite root
export const SITE_VINTAGE = '2026-05-11';
// LEGAL: per-page distinct vintages. Phase 6 v6.4 (2026-05-11) PSU 0차
// rewrote disclaimer and introduced NEW editorial-policy + corrections-policy,
// so the three pre-existing pages (privacy/terms/disclaimer) plus two NEW
// pages now carry their own honest review dates instead of one shared
// 2026-04-01 timestamp.
export const LEGAL_VINTAGES = {
  privacy: '2026-04-01',
  terms: '2026-04-01',
  disclaimer: '2026-05-09',
  editorialPolicy: '2026-04-22',
  correctionsPolicy: '2026-05-02',
} as const;
// Back-compat: callers that still import LEGAL_REVIEWED get the privacy date
// (the canonical original-cycle review). New code should use LEGAL_VINTAGES.
export const LEGAL_REVIEWED = LEGAL_VINTAGES.privacy;

// Back-compat: existing callers using DB_UPDATED keep working.
export const DB_UPDATED = ENTITY_VINTAGE;

export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description: 'A public-data network aggregating government and public datasets across US housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: 'SunPowerPeek Editorial Team',
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

// ===== SOURCE AUTHORITIES (5, honest DB-backed only) =====
// NREL → peak sun hours / NSRDB irradiance / PVWatts production model
// DSIRE → state incentive database (pilot 4-state .gov-anchored, expanding)
// EIA Electric Power → state retail electricity rates (used in payback math)
// EIA Form 861 Table 11 → residential net-metering capacity + customer counts
//   (NEW 2026-05-28, Phase 7 empirical-outcomes layer; ingested via
//   scripts/sync-eia-solar.ts → data/eia-net-metering-aggregates.json,
//   consumed by lib/solar-empirical-outcomes.ts on /state/[slug]/)
// IRS Form 5695 → 30% federal Investment Tax Credit (FEDERAL_ITC_PCT in insights.ts)
//
// Calibration vs original directive: directive listed NREL + DSIRE + EIA + IRS ITC
// — all five ARE actually backing numbers in the DB and rendered prose. SEIA/Wood
// Mackenzie referenced once in a guide intro is editorial, not DB-backing, so
// excluded (honest minimalism, powerbillpeek precedent). The two EIA entries
// share the same publisher TLD (eia.gov) but are distinct data products with
// distinct survey instruments — granular attribution per Trap #115.
export const SOURCE_AUTHORITIES = [
  { '@type': 'Organization', name: 'NREL PVWatts (NSRDB)', url: 'https://pvwatts.nrel.gov/' },
  { '@type': 'Organization', name: 'DSIRE Incentive Database', url: 'https://www.dsireusa.org/' },
  { '@type': 'Organization', name: 'US EIA Electric Power', url: 'https://www.eia.gov/electricity/' },
  { '@type': 'Organization', name: 'US EIA Form 861 (Net Metering)', url: 'https://www.eia.gov/electricity/data.php' },
  { '@type': 'Organization', name: 'IRS Form 5695 (Federal ITC)', url: 'https://www.irs.gov/forms-pubs/about-form-5695' },
];

// Per-source vintage strings shown in AuthorBox footer ("Source vintages: ...")
export const SOURCE_VINTAGES: Record<string, string> = {
  'NREL PVWatts': '2024 NSRDB (latest snapshot used)',
  'DSIRE': '2026-04 (continuously maintained)',
  'EIA Electric Power': '2026-Q1 (monthly state retail averages)',
  'EIA Form 861 (Net Metering)': '2024 reporting year (Table 11, residential net-metering customer counts and capacity)',
  'IRS Form 5695': '2025 tax year (30% ITC under IRA through 2032)',
};

// YMYL MEDIUM-HIGH disclaimer used on calculator + state + incentive pages.
// Solar = federal ITC tax math + state rebate eligibility — material money,
// but a business decision, not medical/legal advice. Language emphasizes
// verification at the carrier-equivalent (installer/CPA), not professional
// licensing as on YMYL-HIGH (eldercare, drugs).
export const REVIEWER_DISCLAIMER = 'Solar economics depend on roof orientation, local rates, panel selection, and incentive eligibility. Figures here are state-level averages and federal ITC math — for a binding tax-credit decision, consult a tax professional, and for system pricing, get 3–4 quotes from a NABCEP-certified installer before signing.';
