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
import { getAllPosts } from '../lib/blog';
import { getAllGuides } from '../lib/guides';

const SITE_URL = 'https://sunpowerpeek.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

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

// ── Static pages ─────────────────────────────────────────────────────────────
for (const [p, pr, cf] of [
  ['/', '1.0', 'monthly'],
  ['/calculator/', '0.9', 'monthly'],
  ['/incentives/', '0.85', 'monthly'],
  ['/solar-cities/', '0.8', 'monthly'],
  ['/about/', '0.3', 'yearly'],
  ['/methodology/', '0.4', 'yearly'],
  ['/privacy/', '0.2', 'yearly'],
  ['/terms/', '0.2', 'yearly'],
  ['/contact/', '0.3', 'yearly'],
  ['/disclaimer/', '0.3', 'yearly'],
] as [string, string, string][]) {
  add({ url: `${SITE_URL}${p}`, priority: pr, changefreq: cf });
}

// ── Guide pages ──────────────────────────────────────────────────────────────
const guides = getAllGuides();
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of guides) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt ? new Date(g.updatedAt).toISOString().split('T')[0] : NOW, priority: '0.7' });
}

// ── Blog pages ───────────────────────────────────────────────────────────────
const posts = getAllPosts();
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of posts) {
  const lm = p.updatedAt ?? p.publishedAt;
  add({ url: `${SITE_URL}/blog/${p.slug}/`, lastmod: lm ? new Date(lm).toISOString().split('T')[0] : NOW, priority: '0.7' });
}

// ── State hubs × 50 (TOP GSC signal — `{state} solar incentives`, `solar panel cost {state}`) ──
const states = getAllStates();
for (const s of states) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.85', changefreq: 'monthly' });
}

// ── Solar-cities depth × 50 ──────────────────────────────────────────────────
for (const s of states) {
  add({ url: `${SITE_URL}/solar-cities/${s.slug}/`, priority: '0.7' });
}

// ── Incentive state pages × 50 ───────────────────────────────────────────────
for (const s of states) {
  add({ url: `${SITE_URL}/incentives/${s.slug}/`, priority: '0.7' });
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
