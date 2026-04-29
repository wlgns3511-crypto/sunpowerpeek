import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * HCU Phase C — 2026-04-25.
 *
 * GSC 3-month: 189 queries / 0 clicks / 31,342 발견됨-색인X / 1,350 404 / 96 5xx.
 * Top GSC pattern 100% state-level intent (`{state} solar incentives`,
 * `solar panel cost {state}`) — landing was supposed to be /state/{slug}/.
 *
 * Killed (410 + noindex):
 *   - /zip/{slug}/                          × 32,386 ZIP doorways
 *       (zip_solar table; only 500 prebuilt with dynamicParams=false →
 *        the other 31,886 returned 404 anyway. Bulk of 31K zombie pile.
 *        Slug bug: ZIPs without city were duplicated, e.g. 71119-71119-la-solar.)
 *   - /compare/{state-vs-state}-solar/      × 1,275 (only 100 prebuilt) + listing
 *   - /state/{slug}/roi-by-system-size/     × 50  (4/21 Tier S expansion, 0 GSC)
 *   - /embed/solar-calc/                    embed widget, never indexed
 *   - /es/ + /es/state/{slug}/              Spanish, 0 ES queries in GSC
 *
 * Kept: / + /calculator/, /state/{slug}/ × 50 (real signal hubs),
 *       /solar-cities/{state}/ × 50, /incentives/{state}/ × 50,
 *       /blog/ + 33 posts, /guide/ + 6 guides, static.
 */

// /state/{slug}/roi-by-system-size/  → 3+ segments under /state/, leaf only.
// IMPORTANT: 1-segment hubs like /state/california/ MUST survive this.
const KILLED_STATE_LEAF = /^\/state\/[^/]+\/roi-by-system-size(?:\/|$)/;

// Flat doorway routes. Anchored with (?:\/|$) so /es matches /es/ and /es/foo
// but does NOT match /estimate/, /embedded/, /zipcodes/, /comparison/.
const KILLED_FLAT_ROUTES = /^\/(?:zip|compare|embed|es)(?:\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (KILLED_STATE_LEAF.test(pathname) || KILLED_FLAT_ROUTES.test(pathname)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  // Default — pass through with x-pathname header for downstream pages.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
