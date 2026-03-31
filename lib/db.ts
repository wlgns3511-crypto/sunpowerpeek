import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'solar.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

// --- Types ---

export interface State {
  state: string;
  abbr: string;
  slug: string;
  avg_sun_hours: number;
  avg_system_cost_per_watt: number;
  federal_tax_credit_pct: number;
  state_tax_credit: number;
  state_rebate: number;
  net_metering: string;
  avg_electricity_rate: number;
  avg_monthly_bill: number;
  avg_payback_years: number;
  avg_20yr_savings: number;
}

export interface ZipSolar {
  zip_code: string;
  city: string;
  state: string;
  slug: string;
  peak_sun_hours: number;
  system_cost_6kw: number;
  annual_production_kwh: number;
  annual_savings: number;
  payback_years: number;
  co2_offset_tons: number;
}

export interface Incentive {
  id: number;
  state: string;
  incentive_name: string;
  type: string;
  value: string;
  description: string;
  expiration: string;
}

// --- State queries ---

export function getAllStates(): State[] {
  return getDb().prepare('SELECT * FROM states ORDER BY state').all() as State[];
}

export function getStateBySlug(slug: string): State | undefined {
  return getDb().prepare('SELECT * FROM states WHERE slug = ?').get(slug) as State | undefined;
}

export function getStateByAbbr(abbr: string): State | undefined {
  return getDb().prepare('SELECT * FROM states WHERE abbr = ?').get(abbr) as State | undefined;
}

export function getBestSolarStates(limit = 10): State[] {
  return getDb().prepare('SELECT * FROM states ORDER BY avg_sun_hours DESC LIMIT ?').all(limit) as State[];
}

export function getWorstSolarStates(limit = 10): State[] {
  return getDb().prepare('SELECT * FROM states ORDER BY avg_sun_hours ASC LIMIT ?').all(limit) as State[];
}

export function getFastestPaybackStates(limit = 10): State[] {
  return getDb().prepare('SELECT * FROM states ORDER BY avg_payback_years ASC LIMIT ?').all(limit) as State[];
}

export function getHighestSavingsStates(limit = 10): State[] {
  return getDb().prepare('SELECT * FROM states ORDER BY avg_20yr_savings DESC LIMIT ?').all(limit) as State[];
}

export function getNationalAvgSunHours(): number {
  const row = getDb().prepare('SELECT AVG(avg_sun_hours) as avg FROM states').get() as { avg: number };
  return Math.round(row.avg * 10) / 10;
}

export function getNationalAvgPayback(): number {
  const row = getDb().prepare('SELECT AVG(avg_payback_years) as avg FROM states').get() as { avg: number };
  return Math.round(row.avg * 10) / 10;
}

export function getNationalAvg20yrSavings(): number {
  const row = getDb().prepare('SELECT AVG(avg_20yr_savings) as avg FROM states').get() as { avg: number };
  return Math.round(row.avg);
}

// --- ZIP queries ---

export function getAllZips(): ZipSolar[] {
  return getDb().prepare('SELECT * FROM zip_solar ORDER BY zip_code').all() as ZipSolar[];
}

export function getZipBySlug(slug: string): ZipSolar | undefined {
  return getDb().prepare('SELECT * FROM zip_solar WHERE slug = ?').get(slug) as ZipSolar | undefined;
}

export function getZipsByState(stateAbbr: string): ZipSolar[] {
  return getDb().prepare('SELECT * FROM zip_solar WHERE state = ? ORDER BY annual_savings DESC').all(stateAbbr) as ZipSolar[];
}

export function getTopZipsBySavings(limit = 20): ZipSolar[] {
  return getDb().prepare('SELECT * FROM zip_solar ORDER BY annual_savings DESC LIMIT ?').all(limit) as ZipSolar[];
}

// --- Incentive queries ---

export function getIncentivesByState(stateAbbr: string): Incentive[] {
  return getDb().prepare('SELECT * FROM incentives WHERE state = ? OR state = ? ORDER BY type').all(stateAbbr, 'ALL') as Incentive[];
}

export function getAllIncentives(): Incentive[] {
  return getDb().prepare('SELECT * FROM incentives ORDER BY state, type').all() as Incentive[];
}

export function getStateIncentivesOnly(stateAbbr: string): Incentive[] {
  return getDb().prepare('SELECT * FROM incentives WHERE state = ? ORDER BY type').all(stateAbbr) as Incentive[];
}

// --- Neighboring states ---

const NEIGHBORS: Record<string, string[]> = {
  AL: ['MS', 'TN', 'GA', 'FL'],
  AK: [],
  AZ: ['CA', 'NV', 'UT', 'CO', 'NM'],
  AR: ['MO', 'TN', 'MS', 'LA', 'TX', 'OK'],
  CA: ['OR', 'NV', 'AZ'],
  CO: ['WY', 'NE', 'KS', 'OK', 'NM', 'UT'],
  CT: ['NY', 'MA', 'RI'],
  DE: ['MD', 'PA', 'NJ'],
  FL: ['GA', 'AL'],
  GA: ['FL', 'AL', 'TN', 'NC', 'SC'],
  HI: [],
  ID: ['MT', 'WY', 'UT', 'NV', 'OR', 'WA'],
  IL: ['WI', 'IA', 'MO', 'KY', 'IN'],
  IN: ['MI', 'OH', 'KY', 'IL'],
  IA: ['MN', 'WI', 'IL', 'MO', 'NE', 'SD'],
  KS: ['NE', 'MO', 'OK', 'CO'],
  KY: ['IN', 'OH', 'WV', 'VA', 'TN', 'MO', 'IL'],
  LA: ['TX', 'AR', 'MS'],
  ME: ['NH'],
  MD: ['PA', 'DE', 'WV', 'VA'],
  MA: ['NH', 'VT', 'NY', 'CT', 'RI'],
  MI: ['OH', 'IN', 'WI'],
  MN: ['WI', 'IA', 'SD', 'ND'],
  MS: ['TN', 'AL', 'LA', 'AR'],
  MO: ['IA', 'IL', 'KY', 'TN', 'AR', 'OK', 'KS', 'NE'],
  MT: ['ND', 'SD', 'WY', 'ID'],
  NE: ['SD', 'IA', 'MO', 'KS', 'CO', 'WY'],
  NV: ['OR', 'ID', 'UT', 'AZ', 'CA'],
  NH: ['VT', 'ME', 'MA'],
  NJ: ['NY', 'PA', 'DE'],
  NM: ['CO', 'OK', 'TX', 'AZ', 'UT'],
  NY: ['VT', 'MA', 'CT', 'NJ', 'PA'],
  NC: ['VA', 'TN', 'GA', 'SC'],
  ND: ['MN', 'SD', 'MT'],
  OH: ['MI', 'IN', 'KY', 'WV', 'PA'],
  OK: ['KS', 'MO', 'AR', 'TX', 'NM', 'CO'],
  OR: ['WA', 'ID', 'NV', 'CA'],
  PA: ['NY', 'NJ', 'DE', 'MD', 'WV', 'OH'],
  RI: ['CT', 'MA'],
  SC: ['NC', 'GA'],
  SD: ['ND', 'MN', 'IA', 'NE', 'WY', 'MT'],
  TN: ['KY', 'VA', 'NC', 'GA', 'AL', 'MS', 'AR', 'MO'],
  TX: ['NM', 'OK', 'AR', 'LA'],
  UT: ['ID', 'WY', 'CO', 'NM', 'AZ', 'NV'],
  VT: ['NH', 'MA', 'NY'],
  VA: ['MD', 'WV', 'KY', 'TN', 'NC'],
  WA: ['ID', 'OR'],
  WV: ['OH', 'PA', 'MD', 'VA', 'KY'],
  WI: ['MN', 'IA', 'IL', 'MI'],
  WY: ['MT', 'SD', 'NE', 'CO', 'UT', 'ID'],
};

export function getNeighboringStates(abbr: string): State[] {
  const neighborAbbrs = NEIGHBORS[abbr] || [];
  if (neighborAbbrs.length === 0) return [];
  const placeholders = neighborAbbrs.map(() => '?').join(',');
  return getDb().prepare(`SELECT * FROM states WHERE abbr IN (${placeholders}) ORDER BY state`).all(...neighborAbbrs) as State[];
}

// --- All state vs state comparison pairs (50*49/2 = 1,225 pairs) ---

export function searchZips(query: string, limit = 50): ZipSolar[] {
  const pattern = `%${query}%`;
  return getDb().prepare(
    'SELECT * FROM zip_solar WHERE zip_code LIKE ? OR city LIKE ? OR state LIKE ? ORDER BY annual_savings DESC LIMIT ?'
  ).all(pattern, pattern, pattern, limit) as ZipSolar[];
}

export function getTopComparisonPairs(): { state1: string; state2: string; slug: string }[] {
  const states = getDb().prepare('SELECT slug FROM states ORDER BY state').all() as { slug: string }[];
  const slugs = states.map((s) => s.slug);
  const pairs: { state1: string; state2: string; slug: string }[] = [];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      pairs.push({ state1: slugs[i], state2: slugs[j], slug: `${slugs[i]}-vs-${slugs[j]}-solar` });
    }
  }
  return pairs;
}

// --- Related zips (same state) ---

export function getRelatedZips(stateAbbr: string, excludeSlug: string, limit = 6): ZipSolar[] {
  return getDb().prepare(
    'SELECT * FROM zip_solar WHERE state = ? AND slug != ? ORDER BY annual_savings DESC LIMIT ?'
  ).all(stateAbbr, excludeSlug, limit) as ZipSolar[];
}
