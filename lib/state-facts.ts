// Layer 1 — derived solar facts anchored to fresh sources (states EIA-derived
// avg + zip_solar 32,386 ZIPs NREL peak_sun_hours + incentives DSIRE/.gov pilot).
//
// Why a separate module from lib/db.ts:
//  - db.ts surfaces the raw `states` table whose `avg_system_cost_per_watt`,
//    `avg_payback_years`, `avg_20yr_savings` are pre-computed at build time.
//    New cards rebuild from primary fields (avg_sun_hours, federal_tax_credit_pct,
//    state_rebate, electricity rate) so changes ripple consistently.
//  - Existing pages (state/[slug] etc) keep using db.ts; this module feeds the
//    HCU 5-청크 depth-injection cards.
//
// What is intentionally NOT exposed:
//  - zip_solar.system_cost_6kw — propagated state-level value, 1 distinct per
//    state. Any "low/high ZIP install cost" angle would fabricate variance that
//    does not exist in the data (함정 #15 ZIP-level rate state-propagated pattern).
//  - Incentives without source_url — pilot 4 states (TN/WA/UT/AL) + federal are
//    .gov-anchored. The other 23 historical state rows have no source attribution
//    and may include outdated or incorrect entries (cf. 거부권 #7 — YMYL data
//    without source verification = liability). We surface them as raw count, not
//    as bundled claims.

import Database from 'better-sqlite3';
import path from 'path';
import { getAllStates, getNationalAvgSunHours, getStateBySlug } from './db';

const DB_PATH = path.join(process.cwd(), 'data', 'solar.db');

let _db: Database.Database | null = null;
function db(): Database.Database {
  if (!_db) _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

// ─────────────── Card A: solar payback breakdown ───────────────

export interface SolarPayback {
  systemCost6kw: number;          // $ from states.avg_system_cost_per_watt × 6000
  federalItcUsd: number;          // 30% federal credit on systemCost6kw
  stateRebateUsd: number;         // states.state_rebate ($)
  stateTaxCreditUsd: number;      // states.state_tax_credit ($)
  netCostUsd: number;             // systemCost6kw − ITC − rebate − stateTaxCredit
  annualSavingsUsd: number;       // median ZIP-level annual_savings for the state
  paybackYears: number;           // round1 of states.avg_payback_years
  twentyYearSavingsUsd: number;   // states.avg_20yr_savings
}

export function getSolarPayback(slug: string): SolarPayback | null {
  const s = getStateBySlug(slug);
  if (!s) return null;

  const systemCost = s.avg_system_cost_per_watt * 6000;
  const federalItc = (s.federal_tax_credit_pct / 100) * systemCost;
  const stateRebate = s.state_rebate;
  const stateTaxCredit = s.state_tax_credit;
  const netCost = systemCost - federalItc - stateRebate - stateTaxCredit;

  const zipMedianRow = db().prepare(`
    SELECT annual_savings FROM zip_solar
    WHERE state = ?
    ORDER BY annual_savings ASC
    LIMIT 1 OFFSET (SELECT COUNT(*) / 2 FROM zip_solar WHERE state = ?)
  `).get(s.abbr, s.abbr) as { annual_savings: number } | undefined;

  return {
    systemCost6kw: Math.round(systemCost),
    federalItcUsd: Math.round(federalItc),
    stateRebateUsd: Math.round(stateRebate),
    stateTaxCreditUsd: Math.round(stateTaxCredit),
    netCostUsd: Math.round(netCost),
    annualSavingsUsd: Math.round(zipMedianRow?.annual_savings ?? s.avg_20yr_savings / 20),
    paybackYears: round1(s.avg_payback_years),
    twentyYearSavingsUsd: Math.round(s.avg_20yr_savings),
  };
}

// ─────────────── Card B: incentive bundle (source-anchored) ───────────────

export interface IncentiveRow {
  name: string;
  type: string;
  value: string;
  description: string;
  expiration: string | null;
  source: string | null;
  sourceUrl: string | null;
  lastVerified: string | null;
}

export interface IncentiveBundle {
  state: string;                        // abbr
  stateRows: IncentiveRow[];            // state-specific (excl. ALL)
  federalRows: IncentiveRow[];          // ALL rows
  totalCount: number;                   // stateRows.length + federalRows.length
  withSourceCount: number;              // count of rows with source_url
  hasFederalItc: boolean;
  hasNetMetering: boolean;
  hasStateTaxCredit: boolean;
  hasRebate: boolean;
  hasSalesTaxExemption: boolean;
  isPilotState: boolean;                // pilot 4 (TN/WA/UT/AL) — fully source-anchored
}

const PILOT_STATES = new Set(['TN', 'WA', 'UT', 'AL']);

function rowToIncentive(r: Record<string, unknown>): IncentiveRow {
  return {
    name: r.incentive_name as string,
    type: r.type as string,
    value: r.value as string,
    description: r.description as string,
    expiration: (r.expiration as string) ?? null,
    source: (r.source as string) ?? null,
    sourceUrl: (r.source_url as string) ?? null,
    lastVerified: (r.last_verified as string) ?? null,
  };
}

export function getIncentiveBundle(slug: string): IncentiveBundle | null {
  const s = getStateBySlug(slug);
  if (!s) return null;

  const stateRows = db().prepare(
    'SELECT * FROM incentives WHERE state = ? ORDER BY type, incentive_name'
  ).all(s.abbr) as Record<string, unknown>[];

  const federalRows = db().prepare(
    'SELECT * FROM incentives WHERE state = ? ORDER BY type, incentive_name'
  ).all('ALL') as Record<string, unknown>[];

  const all = [...stateRows, ...federalRows];
  const types = new Set(all.map((r) => r.type as string));
  const withSource = all.filter((r) => r.source_url).length;

  return {
    state: s.abbr,
    stateRows: stateRows.map(rowToIncentive),
    federalRows: federalRows.map(rowToIncentive),
    totalCount: all.length,
    withSourceCount: withSource,
    hasFederalItc: federalRows.some((r) => (r.type as string) === 'tax_credit'),
    hasNetMetering: types.has('net_metering'),
    hasStateTaxCredit: stateRows.some((r) => (r.type as string) === 'tax_credit'),
    hasRebate: types.has('rebate'),
    hasSalesTaxExemption: types.has('sales_tax_exemption'),
    isPilotState: PILOT_STATES.has(s.abbr),
  };
}

// ─────────────── Card C: sun resource ranking ───────────────

export interface SunResource {
  abbr: string;
  state: string;
  avgSunHours: number;            // states.avg_sun_hours
  rankNational: number;           // 1 = sunniest
  totalStates: number;
  nationalAvg: number;
  diffVsNational: number;         // hours
  diffPctVsNational: number;
}

export function getSunResource(slug: string): SunResource | null {
  const s = getStateBySlug(slug);
  if (!s) return null;

  const rank = (db().prepare(
    'SELECT COUNT(*) + 1 AS r FROM states WHERE avg_sun_hours > (SELECT avg_sun_hours FROM states WHERE abbr = ?)'
  ).get(s.abbr) as { r: number }).r;

  const total = (db().prepare('SELECT COUNT(*) AS c FROM states').get() as { c: number }).c;
  const nationalAvg = getNationalAvgSunHours();
  const diff = s.avg_sun_hours - nationalAvg;
  const diffPct = (diff / nationalAvg) * 100;

  return {
    abbr: s.abbr,
    state: s.state,
    avgSunHours: round2(s.avg_sun_hours),
    rankNational: rank,
    totalStates: total,
    nationalAvg: round2(nationalAvg),
    diffVsNational: round2(diff),
    diffPctVsNational: round1(diffPct),
  };
}

// ─────────────── Card D: ZIP irradiance variance (NREL bucket coverage) ───────────────

export interface ZipIrradianceCoverage {
  zipCount: number;
  distinctSunBuckets: number;     // distinct peak_sun_hours values (NREL grid resolution)
  sunMin: number;
  sunMax: number;
  sunSpread: number;              // max − min, hours/day
  annualSavingsP25: number;       // 25th percentile across ZIPs
  annualSavingsP50: number;
  annualSavingsP75: number;
  topCity: { zip: string; city: string; sunHours: number; annualSavings: number } | null;
}

export function getZipIrradianceCoverage(slug: string): ZipIrradianceCoverage | null {
  const s = getStateBySlug(slug);
  if (!s) return null;

  const total = (db().prepare(
    'SELECT COUNT(*) AS c FROM zip_solar WHERE state = ?'
  ).get(s.abbr) as { c: number }).c;
  if (total < 5) return null;

  const sun = db().prepare(`
    SELECT COUNT(DISTINCT peak_sun_hours) AS distinct_sun,
           MIN(peak_sun_hours) AS min_sun,
           MAX(peak_sun_hours) AS max_sun
    FROM zip_solar WHERE state = ?
  `).get(s.abbr) as { distinct_sun: number; min_sun: number; max_sun: number };

  const savings = db().prepare(
    'SELECT annual_savings FROM zip_solar WHERE state = ? ORDER BY annual_savings ASC'
  ).all(s.abbr) as { annual_savings: number }[];
  const vals = savings.map((r) => r.annual_savings);
  const n = vals.length;

  const top = db().prepare(`
    SELECT zip_code, city, peak_sun_hours, annual_savings
    FROM zip_solar WHERE state = ?
    ORDER BY annual_savings DESC, peak_sun_hours DESC
    LIMIT 1
  `).get(s.abbr) as
    | { zip_code: string; city: string; peak_sun_hours: number; annual_savings: number }
    | undefined;

  return {
    zipCount: total,
    distinctSunBuckets: sun.distinct_sun,
    sunMin: round2(sun.min_sun),
    sunMax: round2(sun.max_sun),
    sunSpread: round2(sun.max_sun - sun.min_sun),
    annualSavingsP25: vals[Math.floor(n * 0.25)],
    annualSavingsP50: vals[Math.floor(n * 0.5)],
    annualSavingsP75: vals[Math.floor(n * 0.75)],
    topCity: top
      ? {
          zip: top.zip_code,
          city: top.city,
          sunHours: round2(top.peak_sun_hours),
          annualSavings: Math.round(top.annual_savings),
        }
      : null,
  };
}

// ─────────────── Card E: peer cluster ───────────────

export interface PeerState {
  abbr: string;
  state: string;
  slug: string;
  avgSunHours: number;
  paybackYears: number;
  similarity: number;             // distance score (lower = closer)
}

export function getPeerStates(slug: string, k = 4): PeerState[] {
  const s = getStateBySlug(slug);
  if (!s) return [];

  const all = db().prepare(
    'SELECT state, abbr, slug, avg_sun_hours, avg_payback_years FROM states WHERE abbr != ?'
  ).all(s.abbr) as {
    state: string; abbr: string; slug: string; avg_sun_hours: number; avg_payback_years: number;
  }[];

  // Normalize sun hours to ~0-1 (range ~3.0-6.5) and payback to ~0-1 (range ~7-15)
  const sunRange = 4;     // 3 → 7
  const payRange = 10;    // 5 → 15
  const peers = all
    .map((p) => {
      const sunDiff = (p.avg_sun_hours - s.avg_sun_hours) / sunRange;
      const payDiff = (p.avg_payback_years - s.avg_payback_years) / payRange;
      const dist = Math.sqrt(sunDiff * sunDiff + payDiff * payDiff);
      return {
        abbr: p.abbr,
        state: p.state,
        slug: p.slug,
        avgSunHours: round2(p.avg_sun_hours),
        paybackYears: round1(p.avg_payback_years),
        similarity: round2(dist),
      };
    })
    .sort((a, b) => a.similarity - b.similarity);

  return peers.slice(0, k);
}

// ─────────────── Trust meta (hub/policy strip) ───────────────

export interface TrustMeta {
  states: number;
  zips: number;
  incentivesTotal: number;
  incentivesWithSource: number;
  pilotStates: number;            // states with full .gov source coverage
  distinctSources: number;
  buildMonth: string;
}

export function getTrustMeta(): TrustMeta {
  const states = getAllStates().length;
  const zips = (db().prepare('SELECT COUNT(*) AS c FROM zip_solar').get() as { c: number }).c;
  const incTotal = (db().prepare('SELECT COUNT(*) AS c FROM incentives').get() as { c: number }).c;
  const incSrc = (db().prepare(
    "SELECT COUNT(*) AS c FROM incentives WHERE source_url IS NOT NULL"
  ).get() as { c: number }).c;
  const sources = (db().prepare(
    'SELECT COUNT(DISTINCT source) AS c FROM incentives WHERE source IS NOT NULL'
  ).get() as { c: number }).c;
  const now = new Date();
  const buildMonth = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return {
    states,
    zips,
    incentivesTotal: incTotal,
    incentivesWithSource: incSrc,
    pilotStates: PILOT_STATES.size,
    distinctSources: sources,
    buildMonth,
  };
}

// ─────────────── Formatters ───────────────

export function formatHours(h: number): string {
  return `${h.toFixed(2)} h/day`;
}

export function formatUSD(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`;
}

export function formatPct(pct: number, opts: { sign?: boolean } = {}): string {
  const s = opts.sign && pct > 0 ? '+' : '';
  return `${s}${pct.toFixed(1)}%`;
}

export function formatYears(y: number): string {
  return `${y.toFixed(1)} yr`;
}

function round1(n: number): number { return Math.round(n * 10) / 10; }
function round2(n: number): number { return Math.round(n * 100) / 100; }
