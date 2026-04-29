// HCU 5-청크 Layer 3 — hub/policy page meta strip surfacing the data
// fingerprint (states × ZIPs × incentives × sources × build month) so every
// landing has a consistent, source-anchored introduction that mirrors the
// portfolio's TrustMetaStrip pattern (powerbillpeek, ingredipeek, etc).

import { getTrustMeta } from '@/lib/state-facts';

export function TrustMetaStrip() {
  const m = getTrustMeta();

  const items = [
    { label: 'States covered', value: `${m.states}` },
    { label: 'ZIP-level NREL data', value: m.zips.toLocaleString() },
    { label: 'Incentive entries', value: `${m.incentivesTotal}` },
    { label: 'with .gov source', value: `${m.incentivesWithSource}` },
    { label: 'Distinct agencies', value: `${m.distinctSources}` },
    { label: 'Built', value: m.buildMonth },
  ];

  return (
    <div
      data-upgrade="trust-meta-strip"
      className="mb-6 rounded-xl border border-amber-200 bg-amber-50/40 p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <p className="text-xs uppercase tracking-wider font-medium text-amber-700">
          SunPowerPeek catalog snapshot
        </p>
        <p className="text-xs text-slate-500">
          {m.pilotStates} pilot states (TN/WA/UT/AL) carry full per-row source links
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-lg bg-white border border-amber-200 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-amber-700">{it.label}</p>
            <p className="text-sm font-bold text-amber-900 mt-0.5">{it.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
