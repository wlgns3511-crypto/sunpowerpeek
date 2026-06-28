/**
 * Server-side US state map projection helpers for the solar payback-years
 * choropleth.
 *
 * Loads `us-atlas/states-10m.json` (US Census TIGER/Line via topojson-client),
 * projects every state polygon through geoAlbersUsa() once at module init,
 * and exposes `{fips, usps, name, d}` tuples per state + inter-state border
 * mesh. Payback data is joined at render time inside PaybackStateMap, NOT baked
 * into this module — `states.avg_payback_years` is mutable EIA + NREL PVWatts
 * + DSIRE + IRS Form 5695-derived data, the projection is static.
 *
 * Pure-server SVG: no client JS, no MapBox/Leaflet/Plotly licence — module-
 * level cache so the projection compute runs once per server boot.
 *
 * Used by PaybackStateMap to render 50 state polygons (sunpowerpeek's `states`
 * table has no DC row, so DC is filtered here too) coloured by each state's
 * `avg_payback_years` through a 5-band A-E payback classifier mirroring
 * lib/itc-payback-band.ts (<5 / <8 / <12 / <20 / ≥20 years).
 */
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import statesTopo from 'us-atlas/states-10m.json';
import type { Feature, Geometry } from 'geojson';
import type { Topology, Objects, GeometryObject } from 'topojson-specification';

export const MAP_WIDTH = 960;
export const MAP_HEIGHT = 600;

// State FIPS prefix → USPS 2-letter (50 states; DC + PR/GU/AS/MP/VI excluded
// because sunpowerpeek's `states` table has 50 rows only).
export const STATE_FIPS_TO_USPS: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO',
  '09': 'CT', '10': 'DE', '12': 'FL', '13': 'GA', '15': 'HI',
  '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY',
  '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH',
  '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY',
};

export const NO_DATA_FILL = '#e2e8f0'; // slate-200

export interface StatePath {
  fips: string;
  usps: string;
  name: string;
  d: string;
}

// ─────────────────────────────────────────────────────────────
// Module-level cache — projection runs once per server boot
// ─────────────────────────────────────────────────────────────
let _statePaths: StatePath[] | null = null;
let _stateBorders: string | null = null;

function project() {
  // us-atlas TopoJSON has `states` and `nation` GeometryCollections.
  // Cast through Topology<Objects> because topojson-specification's
  // GeometryCollection differs structurally from geojson's, and we don't
  // need the narrow generic for runtime correctness.
  const topo = statesTopo as unknown as Topology<Objects>;

  const projection = geoAlbersUsa().fitSize(
    [MAP_WIDTH, MAP_HEIGHT],
    feature(topo, topo.objects.nation as GeometryObject) as Feature<Geometry>,
  );
  const path = geoPath(projection);

  const stateFc = feature(topo, topo.objects.states as GeometryObject) as unknown as {
    features: Feature<Geometry, { name: string }>[];
  };
  _statePaths = [];
  for (const f of stateFc.features) {
    const fips = String(f.id).padStart(2, '0');
    const usps = STATE_FIPS_TO_USPS[fips];
    if (!usps) continue; // Filters DC + PR/GU/AS/MP/VI
    const d = path(f);
    if (!d) continue;    // Outside Albers projection
    _statePaths.push({
      fips,
      usps,
      name: f.properties?.name ?? '',
      d,
    });
  }

  // Inter-state borders mesh (cleaner than redrawing each state outline)
  const meshGeom = mesh(topo, topo.objects.states as GeometryObject, (a, b) => a !== b);
  _stateBorders = path(meshGeom);
}

export function getStatePaths(): StatePath[] {
  if (_statePaths == null) project();
  return _statePaths!;
}

export function getStateBordersPath(): string {
  if (_stateBorders == null) project();
  return _stateBorders ?? '';
}
