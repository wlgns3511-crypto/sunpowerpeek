#!/usr/bin/env tsx
/**
 * build-sitemap.ts — Static sitemap XML generator for sunpowerpeek.
 *
 * PRUNING HISTORY (post-HCU March 2026):
 *   2026-04-XX: 32,734 URLs dominated by 32,386 /zip/[slug]/ leaves
 *               (entire ZIP universe). GSC indexation collapsed post-
 *               March 2026 HCU — thin "Solar in ZIP 01001 MA: NREL
 *               5.0 kWh/m²/day, ~$18k system" pages flagged.
 *   2026-04-22: Pruned to Option B (~348 URLs). Drops all 32,386
 *               /zip/ leaves. Everything else (state hubs, compare,
 *               cities, incentives, blog, guides) was legitimate IA
 *               and stays. /zip/[slug]/ route still renders on-demand
 *               via dynamicParams=true.
 *
 * Pre-render limits (from page.tsx files):
 *   /zip/[slug]       → top 500 hot set + on-demand ISR (dynamicParams=true)
 *   /compare/[slug]   → getTopComparisonPairs() (all, dynamicParams=false)
 *   /state/[slug]     → getAllStates() (all, dynamicParams=false)
 *   /solar-cities/[slug] → getAllStates() (all, dynamicParams=false)
 *   /incentives/[slug]   → getAllStates() (all, dynamicParams=false)
 *
 * GROWTH PROTOCOL:
 *   If Tier 1 hits >70% indexation, candidates to whitelist:
 *     1. /zip/ for top-100 ZIPs by population in CA/TX/FL/NY/AZ
 *     2. /zip/ for ZIPs with strongest NREL solar resource
 *   Do NOT re-add full 32,386. Lesson: quality not cardinality.
 *
 * USAGE:
 *   npx tsx scripts/build-sitemap.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAllStates, getTopComparisonPairs } from '../lib/db';
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

// Static pages + /es/
for (const [p, pr, cf] of [
  ['/', '1.0', 'monthly'],
  ['/calculator/', '0.9', 'monthly'],
  ['/incentives/', '0.9', 'monthly'],
  ['/compare/', '0.9', 'monthly'],
  ['/solar-cities/', '0.8', 'monthly'],
  ['/about/', '0.3', 'yearly'],
  ['/methodology/', '0.4', 'yearly'],
  ['/privacy/', '0.2', 'yearly'],
  ['/terms/', '0.2', 'yearly'],
  ['/contact/', '0.3', 'yearly'],
  ['/es/', '0.7', 'monthly'],
] as [string, string, string][]) {
  add({ url: `${SITE_URL}${p}`, priority: pr, changefreq: cf });
}

// Guide pages
const guides = getAllGuides();
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of guides) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt ? new Date(g.updatedAt).toISOString().split('T')[0] : NOW, priority: '0.7' });
}

// Blog pages
const posts = getAllPosts();
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of posts) {
  const lm = p.updatedAt ?? p.publishedAt;
  add({ url: `${SITE_URL}/blog/${p.slug}/`, lastmod: lm ? new Date(lm).toISOString().split('T')[0] : NOW, priority: '0.7' });
}

// State pages
const states = getAllStates();
for (const s of states) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.8' });
  // HCU Tier S expansion 2026-04-21 — ROI by system size
  add({ url: `${SITE_URL}/state/${s.slug}/roi-by-system-size/`, priority: '0.7', changefreq: 'monthly' });
}

// Solar cities pages (per state)
for (const s of states) {
  add({ url: `${SITE_URL}/solar-cities/${s.slug}/`, priority: '0.7' });
}

// Incentive state pages
for (const s of states) {
  add({ url: `${SITE_URL}/incentives/${s.slug}/`, priority: '0.7' });
}

// Compare pages (sitemap-capped at 100 — HCU defense 2026-04-22)
// getTopComparisonPairs() returns C(51,2)=1,275 state-vs-state combos.
// All 1,275 remain prebuilt via generateStaticParams in compare/[slug]/
// page.tsx (dynamicParams=false), but sitemap shows only the alphabetical
// top 100 as a quality signal to Search. Subset of the static set → 404-safe.
const comparisons = getTopComparisonPairs().slice(0, 100);
for (const c of comparisons) {
  add({ url: `${SITE_URL}/compare/${c.slug}/`, priority: '0.7' });
}

// ─── /zip/ leaves intentionally dropped 2026-04-22 (HCU defense) ──────────
// 32,386 ZIP pages caused cardinality collapse. Route still renders on-demand
// via dynamicParams=true. See PRUNING HISTORY at top of file.

// ─── Cardinality guard ────────────────────────────────────────────────────
if (entries.length > 500 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `sunpowerpeek sitemap has ${entries.length.toLocaleString()} URLs — Option B budget is ~348.\n` +
      `Did /zip/ (32,386 ZIP leaves) get re-added?\n` +
      `That's exactly the loop that caused the original cardinality collapse.\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand the tier.`,
  );
}

// ─── Clean old sitemaps ────────────────────────────────────────────────────
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

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
console.log(`✓ ${entries.length} URLs, ${shardCount || 1} shard(s)`);
