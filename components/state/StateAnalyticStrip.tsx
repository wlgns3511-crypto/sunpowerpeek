// HCU 5-청크 Layer 1+2 — depth-injection card surfaced above the fold on
// /state/[slug]/. Renders the source-anchored payback math + sun-resource
// rank + ZIP irradiance summary, plus Layer 2 commentary sentences.

import {
  getSolarPayback,
  getIncentiveBundle,
  getSunResource,
  getZipIrradianceCoverage,
  getPeerStates,
  formatUSD,
  formatHours,
} from '@/lib/state-facts';
import { buildStateCommentary } from '@/lib/state-commentary';

interface Props {
  slug: string;
  stateName: string;
}

export function StateAnalyticStrip({ slug, stateName }: Props) {
  const sun = getSunResource(slug);
  const payback = getSolarPayback(slug);
  const bundle = getIncentiveBundle(slug);
  const zip = getZipIrradianceCoverage(slug);
  const peers = getPeerStates(slug, 4);
  const commentary = buildStateCommentary(stateName, slug, sun, payback, bundle, zip);

  if (!sun && !payback && !bundle && !zip) return null;

  return (
    <section
      className="mb-8 rounded-xl border border-amber-200 bg-amber-50/40 p-5"
      data-upgrade="analytic-strip"
    >
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-amber-900">
          {stateName} solar economics &mdash; the numbers
        </h2>
        <span className="text-xs uppercase tracking-wider text-amber-700">
          NREL · DSIRE · IRS &sect;25D
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {sun && (
          <div className="rounded-lg bg-white border border-amber-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-amber-700">
              Sun resource
            </p>
            <p className="text-xl font-bold text-amber-900 mt-0.5">
              {formatHours(sun.avgSunHours)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Rank #{sun.rankNational} of {sun.totalStates}{' '}
              ({sun.diffPctVsNational >= 0 ? '+' : ''}
              {sun.diffPctVsNational.toFixed(1)}% vs US avg)
            </p>
          </div>
        )}

        {payback && (
          <div className="rounded-lg bg-white border border-amber-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-amber-700">
              Net cost (6 kW)
            </p>
            <p className="text-xl font-bold text-amber-900 mt-0.5">
              {formatUSD(payback.netCostUsd)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Gross {formatUSD(payback.systemCost6kw)} &minus;{' '}
              {formatUSD(
                payback.federalItcUsd +
                  payback.stateRebateUsd +
                  payback.stateTaxCreditUsd,
              )}{' '}
              incentives
            </p>
          </div>
        )}

        {payback && (
          <div className="rounded-lg bg-white border border-amber-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-amber-700">
              Payback &amp; 20-yr
            </p>
            <p className="text-xl font-bold text-amber-900 mt-0.5">
              {payback.paybackYears.toFixed(1)} yr
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {formatUSD(payback.annualSavingsUsd)}/yr ·{' '}
              {formatUSD(payback.twentyYearSavingsUsd)} cumulative
            </p>
          </div>
        )}

        {bundle && (
          <div className="rounded-lg bg-white border border-amber-200 p-3">
            <p className="text-[11px] uppercase tracking-wider text-amber-700">
              Incentives
            </p>
            <p className="text-xl font-bold text-amber-900 mt-0.5">
              {bundle.totalCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {bundle.withSourceCount} with .gov source link
              {bundle.isPilotState && (
                <span className="ml-1 inline-block rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-medium">
                  pilot
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {(commentary.sunSentence ||
        commentary.paybackSentence ||
        commentary.incentiveSentence ||
        commentary.zipSentence) && (
        <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
          {commentary.sunSentence && <p>{commentary.sunSentence}</p>}
          {commentary.paybackSentence && <p>{commentary.paybackSentence}</p>}
          {commentary.incentiveSentence && <p>{commentary.incentiveSentence}</p>}
          {commentary.zipSentence && <p>{commentary.zipSentence}</p>}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500 italic border-t border-amber-200 pt-3">
        {commentary.disclaimerSentence}
      </p>

      {peers.length > 0 && (
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-wider text-amber-700 mb-2">
            Peer states (similar sun + payback)
          </p>
          <div className="flex flex-wrap gap-2">
            {peers.map((p) => (
              <a
                key={p.abbr}
                href={`/state/${p.slug}/`}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs hover:bg-amber-100 transition-colors"
              >
                <span className="font-semibold text-amber-900">{p.state}</span>
                <span className="text-slate-500">
                  {p.avgSunHours.toFixed(2)} h · {p.paybackYears.toFixed(1)} yr
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {sun && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <a
            href={`/calculator/?state=${sun.abbr}`}
            className="inline-flex items-center gap-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 font-medium transition-colors"
          >
            Run {stateName} in the savings calculator &rarr;
          </a>
          <a
            href={`/incentives/${slug}/`}
            className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-white text-amber-700 hover:bg-amber-50 px-3 py-1.5 font-medium transition-colors"
          >
            Full {stateName} incentive page
          </a>
          <a
            href={`/solar-cities/${slug}/`}
            className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-white text-amber-700 hover:bg-amber-50 px-3 py-1.5 font-medium transition-colors"
          >
            Best ZIP codes in {stateName}
          </a>
        </div>
      )}
    </section>
  );
}
