#!/usr/bin/env tsx
/**
 * Sync EIA Form 861 Table 11 net-metering aggregates → data/eia-net-metering-aggregates.json.
 *
 * Source: U.S. EIA State Electricity Profiles, Table 11 "Net Metering"
 *   API:  /v2/electricity/state-electricity-profiles/net-metering
 *   Form: EIA-861 (annual electric utility report)
 *
 * Methodology note:
 *   EIA reports net-metering by (state, sector, technology) from 2013-2019 with
 *   explicit `Photovoltaic` technology. From 2020 onward EIA aggregates into a
 *   single `All Technologies` row per (state, sector). Residential net-metering
 *   installations are predominantly photovoltaic — wind/other are <5% of the
 *   residential category nationally. This script uses the latest `All
 *   Technologies` / `RES` aggregate as the empirical residential PV adoption
 *   proxy and discloses the aggregation explicitly downstream.
 *
 * Output schema:
 *   { vintage, fetchedAt, sourceUrl, apiEndpoint, methodology, technologyNote,
 *     byState: { [stateSlug]: {
 *       capacityMW, customers,
 *       priorCapacityMW, priorCustomers,
 *       yoyCapacityPct, yoyCustomersPct
 *     } } }
 *
 * Run: EIA_API_KEY=... npx tsx scripts/sync-eia-solar.ts
 */

import Database from 'better-sqlite3';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

const ROOT = resolve(__dirname, '..');
const DB = new Database(resolve(ROOT, 'data/solar.db'), {
  readonly: true,
  fileMustExist: true,
});
const OUT = resolve(ROOT, 'data/eia-net-metering-aggregates.json');

const API_KEY = process.env.EIA_API_KEY;
if (!API_KEY) {
  console.error('ERROR: EIA_API_KEY env variable required');
  process.exit(1);
}

const API_BASE = 'https://api.eia.gov/v2/electricity/state-electricity-profiles/net-metering/data/';
const LATEST_YEAR = 2024;
const PRIOR_YEAR = 2023;

interface EiaRow {
  period: string;
  state: string;
  stateName: string;
  technology: string;
  sector: string;
  capacity: string;
  customers: string;
}

interface StateRecord {
  capacityMW: number;
  customers: number;
  priorCapacityMW: number | null;
  priorCustomers: number | null;
  yoyCapacityPct: number | null;
  yoyCustomersPct: number | null;
}

async function fetchYear(year: number): Promise<EiaRow[]> {
  const url = new URL(API_BASE);
  url.searchParams.set('api_key', API_KEY!);
  url.searchParams.set('frequency', 'annual');
  url.searchParams.append('data[0]', 'capacity');
  url.searchParams.append('data[1]', 'customers');
  url.searchParams.append('facets[sector][]', 'RES');
  url.searchParams.set('start', String(year));
  url.searchParams.set('end', String(year));
  url.searchParams.set('length', '60');

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`EIA fetch failed (${res.status}): ${await res.text()}`);
  }
  const payload = (await res.json()) as { response: { data: EiaRow[] } };
  return payload.response.data.filter((r) => r.technology === 'All Technologies');
}

async function main() {
  const stateRows = DB.prepare<unknown[], { slug: string; abbr: string }>(
    'SELECT slug, abbr FROM states'
  ).all() as { slug: string; abbr: string }[];
  const abbrToSlug = new Map<string, string>();
  for (const row of stateRows) abbrToSlug.set(row.abbr, row.slug);

  console.log(`[eia] Fetching ${LATEST_YEAR} residential net-metering data...`);
  const latest = await fetchYear(LATEST_YEAR);
  console.log(`[eia] Fetched ${latest.length} rows for ${LATEST_YEAR}`);

  console.log(`[eia] Fetching ${PRIOR_YEAR} residential net-metering data...`);
  const prior = await fetchYear(PRIOR_YEAR);
  console.log(`[eia] Fetched ${prior.length} rows for ${PRIOR_YEAR}`);

  const priorByAbbr = new Map<string, EiaRow>();
  for (const row of prior) priorByAbbr.set(row.state, row);

  const byState: Record<string, StateRecord> = {};

  for (const row of latest) {
    const slug = abbrToSlug.get(row.state);
    if (!slug) continue; // skip DC, US national, anything not in our 50-state map
    const capacityMW = parseFloat(row.capacity);
    const customers = parseInt(row.customers, 10);
    const priorRow = priorByAbbr.get(row.state);
    const priorCapacityMW = priorRow ? parseFloat(priorRow.capacity) : null;
    const priorCustomers = priorRow ? parseInt(priorRow.customers, 10) : null;
    const yoyCapacityPct =
      priorCapacityMW && priorCapacityMW > 0
        ? ((capacityMW - priorCapacityMW) / priorCapacityMW) * 100
        : null;
    const yoyCustomersPct =
      priorCustomers && priorCustomers > 0
        ? ((customers - priorCustomers) / priorCustomers) * 100
        : null;

    byState[slug] = {
      capacityMW,
      customers,
      priorCapacityMW,
      priorCustomers,
      yoyCapacityPct,
      yoyCustomersPct,
    };
  }

  const out = {
    vintage: String(LATEST_YEAR),
    priorVintage: String(PRIOR_YEAR),
    fetchedAt: new Date().toISOString(),
    sourceUrl: 'https://www.eia.gov/electricity/data.php#sales',
    apiEndpoint: API_BASE,
    publisher: 'U.S. Energy Information Administration',
    survey: 'Form EIA-861 Annual Electric Power Industry Report',
    table: 'State Electricity Profiles, Table 11 (Net Metering)',
    methodology:
      'EIA aggregates post-2019 net-metering data into a single "All Technologies" row per (state, sector). Residential net-metering installations are predominantly photovoltaic systems (typically >95%) with minor contributions from small wind. Values reflect cumulative year-end installed nameplate capacity (megawatts) and customer counts as reported by retail electric utilities on Form EIA-861.',
    technologyNote:
      'After 2019, EIA stopped publishing separate Photovoltaic / Wind / Other rows for residential customers; the All Technologies aggregate is used here as a residential PV adoption proxy.',
    byState,
  };

  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`[eia] Wrote ${Object.keys(byState).length} states → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
