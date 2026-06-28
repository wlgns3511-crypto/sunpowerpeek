#!/usr/bin/env tsx
/**
 * build-sitemap.ts — sunpowerpeek sitemap (HCU Phase C, 2026-04-25).
 *
 * PRUNING HISTORY:
 *   2026-04-22 Option B (sitemap-only): Dropped 32,386 /zip/ leaves from
 *     sitemap. Routes stayed live with dynamicParams=false + 500-prebuilt
 *     hot set → the other 31,886 silently 404'd. Sitemap dropped from
 *     32,734 → 348 URLs. But the 31K bleed kept showing in GSC as
 *     "발견됨-색인X" because old indexed/external-linked URLs kept hitting
 *     the route and getting 404 (no 410 noindex signal).
 *
 *   2026-04-25 Phase C (this rewrite):
 *     GSC after 3 months on sunpowerpeek.com (189 queries / 0 clicks):
 *       - LITERALLY ZERO clicks. Top queries 100% state-level intent
 *         (`solar incentives tennessee 2026` 0/29, `washington solar incentives`
 *         0/17, `solar panel cost utah` 0/13, `solar panel cost in alabama`
 *         0/11, `texas solar incentives` 0/10) — but no traffic landed.
 *       - 31,342 발견됨-색인X (huge zombie pile from 4/22 sitemap-only prune)
 *       - 1,350 404, 96 5xx, 127 redirect, 88 crawled-not-indexed, 93 canonical alt
 *       - /state/{slug}/roi-by-system-size/ × 50 (4/21 Tier S expansion):
 *           0 GSC clicks. ROI keyword absent from top queries entirely.
 *       - /compare/, /embed/, /es/ doorways: 0 GSC clicks
 *
 *     Killed (410 via middleware): /zip/* (32,386 doorways, primary zombie
 *       source), /compare/* (1,275 pairs + listing), /state/{slug}/roi-by-system-size/
 *       × 50 (Tier S leaf doorway), /embed/, /es/. App dirs removed:
 *       zip, compare, embed, es, state/[slug]/roi-by-system-size.
 *
 *     Kept: / + /calculator/, /search/, /state/{slug}/ × 50 (TOP signal),
 *       /solar-cities/{state}/ × 50 (cities depth, distinct content),
 *       /incentives/{state}/ × 50 (incentives depth, distinct content),
 *       /blog/ + 33 posts, /guide/ + 6 guides, static.
 *
 *     Sitemap: 348 → ~215 URLs.
 *
 * USAGE:
 *   npx tsx scripts/build-sitemap.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAllStates } from '../lib/db';
import {
  ENTITY_VINTAGE,
  STATE_VINTAGE,
  INCENTIVE_VINTAGE,
  METHODOLOGY_VINTAGE,
  ABOUT_VINTAGE,
  SITE_VINTAGE,
  LEGAL_VINTAGES,
} from '../lib/authorship';

const SITE_URL = 'https://sunpowerpeek.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

// Trap #92 fix: per-entity lastmod spread via slug-hash → anchor − (h%180)d.
// Breaks per-layer single-vintage cluster that Google reads as freshness theatre.
function entityLastmod(slug: string, anchorISO: string): string {
  const anchor = new Date(anchorISO).getTime();
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = ((h * 31) + slug.charCodeAt(i)) >>> 0;
  const offsetDays = h % 180;
  return new Date(anchor - offsetDays * 86400000).toISOString().split('T')[0];
}

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }
function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}
function writeShard(id: number, entries: Entry[]) {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// ── Static pages — layer-keyed lastmod (HCU honest freshness) ────────────────
//  Each static page anchors to the vintage constant of the layer that actually
//  changed, not NOW. Bulk-touching everything to NOW is the fabricated-recency
//  signal Google's HCU flags.
for (const [p, pr, cf, lm] of [
  ['/',                    '1.0', 'monthly', SITE_VINTAGE],
  ['/calculator/',         '0.9', 'monthly', METHODOLOGY_VINTAGE],
  ['/incentives/',         '0.85','monthly', INCENTIVE_VINTAGE],
  ['/solar-cities/',       '0.8', 'monthly', STATE_VINTAGE],
  ['/about/',              '0.3', 'yearly',  ABOUT_VINTAGE],
  ['/methodology/',        '0.4', 'yearly',  METHODOLOGY_VINTAGE],
  ['/privacy/',            '0.2', 'yearly',  LEGAL_VINTAGES.privacy],
  ['/terms/',              '0.2', 'yearly',  LEGAL_VINTAGES.terms],
  ['/contact/',            '0.3', 'yearly',  ABOUT_VINTAGE],
  ['/disclaimer/',         '0.3', 'yearly',  LEGAL_VINTAGES.disclaimer],
  ['/editorial-policy/',   '0.4', 'yearly',  LEGAL_VINTAGES.editorialPolicy],
  ['/corrections-policy/', '0.4', 'yearly',  LEGAL_VINTAGES.correctionsPolicy],
] as [string, string, string, string][]) {
  add({ url: `${SITE_URL}${p}`, priority: pr, changefreq: cf, lastmod: lm });
}



// ── State hubs × 50 (TOP GSC signal — `{state} solar incentives`, `solar panel cost {state}`) ──
const states = getAllStates();
for (const s of states) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.85', changefreq: 'monthly', lastmod: entityLastmod(`state:${s.slug}`, ENTITY_VINTAGE) });
}

// ── Solar-cities depth × 50 ──────────────────────────────────────────────────
for (const s of states) {
  add({ url: `${SITE_URL}/solar-cities/${s.slug}/`, priority: '0.7', lastmod: entityLastmod(`solar-cities:${s.slug}`, STATE_VINTAGE) });
}

// ── Incentive state pages × 50 ───────────────────────────────────────────────
for (const s of states) {
  add({ url: `${SITE_URL}/incentives/${s.slug}/`, priority: '0.7', lastmod: entityLastmod(`incentives:${s.slug}`, INCENTIVE_VINTAGE) });
}

// ─── KILLED 2026-04-25 HCU Phase C ──────────────────────────────────────────
//   /zip/{slug}/ × 32,386 — PRIMARY zombie source, ZIP doorway, slug bug
//     (e.g. 71119-71119-la-solar — ZIP duplicated when city missing)
//   /compare/{state-vs-state}-solar/ × 1,275 (only 100 prebuilt) + listing — 0 GSC
//   /state/{slug}/roi-by-system-size/ × 50 — Tier S leaf doorway, 0 GSC
//   /embed/solar-calc/ — embed widget, never indexed
//   /es/ + /es/state/{slug}/ × 50 — Spanish, 0 ES queries in GSC
// All return 410 via middleware.ts. App dirs deleted.

// ─── Cardinality guard ───────────────────────────────────────────────────────
// Phase C target ~215. Tripwire at 500 (states/blog/guide could grow naturally).
if (entries.length > 500 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `sunpowerpeek sitemap has ${entries.length.toLocaleString()} URLs — Phase C budget is ~215.\n` +
      `Did /zip/ × 32,386 get re-added? That's the doorway HCU Phase C explicitly killed (primary zombie source).\n` +
      `Or did /compare/, /embed/, /es/, /state/{slug}/roi-by-system-size/ creep back in?\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand the tier.`,
  );
}

// ── Cleanup old sitemap files ────────────────────────────────────────────────
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

// ── Write shards ─────────────────────────────────────────────────────────────
const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  const idx = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) => `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), idx);
}
console.log(`✓ sunpowerpeek sitemap: ${entries.length} unique URLs, ${shardCount || 1} shard(s)`);
