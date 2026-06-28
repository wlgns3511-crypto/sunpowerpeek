/**
 * State-image lookup. Reads the manifest produced by
 * scripts/process-state-images.ts at module load (build time on Mac, then
 * baked into the SSG output — no runtime fs cost on the VPS).
 *
 * Shared asset with salarybycity (same Wikipedia state-capitol fallback
 * pipeline). 54 entries cover 50 states + DC + PR + Guam + USVI; only the
 * 50 states are reachable from sunpowerpeek's /state/[slug] route, the
 * other 4 entries are harmless (BY_SLUG misses → IIFE renders null).
 */
import manifest from '@/scripts/data/state-images-manifest.json';

export interface StateImage {
  slug: string;
  name: string;
  code: string;
  avifPath: string;
  jpgPath: string;
  finalWidth: number;
  finalHeight: number;
  commonsFileUrl: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistText: string | null;
  artistHtml: string | null;
}

interface ManifestEntry {
  slug: string;
  name: string;
  code: string;
  avifPath?: string;
  jpgPath?: string;
  finalWidth?: number;
  finalHeight?: number;
  commonsFileUrl: string;
  wikipediaUrl: string;
  wikipediaTitle: string;
  licenseShort: string;
  licenseUrl: string | null;
  artistText: string | null;
  artistHtml: string | null;
}

const BY_SLUG: ReadonlyMap<string, StateImage> = (() => {
  const m = new Map<string, StateImage>();
  for (const raw of (manifest as ManifestEntry[])) {
    if (!raw.avifPath || !raw.jpgPath || !raw.finalWidth || !raw.finalHeight) continue;
    m.set(raw.slug, {
      slug: raw.slug,
      name: raw.name,
      code: raw.code,
      avifPath: raw.avifPath,
      jpgPath: raw.jpgPath,
      finalWidth: raw.finalWidth,
      finalHeight: raw.finalHeight,
      commonsFileUrl: raw.commonsFileUrl,
      wikipediaUrl: raw.wikipediaUrl,
      wikipediaTitle: raw.wikipediaTitle,
      licenseShort: raw.licenseShort,
      licenseUrl: raw.licenseUrl,
      artistText: raw.artistText,
      artistHtml: raw.artistHtml,
    });
  }
  return m;
})();

export function getStateImage(slug: string): StateImage | undefined {
  return BY_SLUG.get(slug);
}

export function hasStateImage(slug: string): boolean {
  return BY_SLUG.has(slug);
}
