/**
 * SolarInterpretation strip — renders the composite verdict from
 * lib/solar-interpretation.ts above the ItcPaybackBand card on each
 * state page. Four-paragraph deterministic prose plus a drivers /
 * caveats details panel for full transparency.
 *
 * Color tones are dynamic — every tone class must be in
 * lib/color-safelist.ts (emerald / green / amber / orange / rose / slate).
 */

import type { SolarInterpretationResult } from "@/lib/solar-interpretation";

interface SolarInterpretationProps {
  result: SolarInterpretationResult;
}

export function SolarInterpretation({ result }: SolarInterpretationProps) {
  const tone = result.toneColor;

  return (
    <section
      className={`my-8 rounded-lg border border-${tone}-200 bg-${tone}-50 p-6`}
      aria-labelledby="solar-interpretation-title"
    >
      <header className="mb-4">
        <span
          className={`inline-block text-xs font-semibold uppercase tracking-wide text-${tone}-700`}
        >
          Composite reading — NREL × DSIRE × EIA × IRS Form 5695
        </span>
        <h2
          id="solar-interpretation-title"
          className={`mt-2 text-xl font-bold text-${tone}-900`}
        >
          {result.verdictTitle}
        </h2>
      </header>

      <div className="space-y-3 text-sm leading-6 text-slate-800">
        {result.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <details className="mt-4 text-xs text-slate-700">
        <summary className={`cursor-pointer font-semibold text-${tone}-800`}>
          How this verdict was composed
        </summary>
        <div className="mt-2 space-y-2">
          <div>
            <div className="font-semibold">Drivers</div>
            <ul className="list-disc pl-5">
              {result.drivers.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold">Decision framing</div>
            <div className="font-mono text-[11px] text-slate-600">{result.decisionFraming}</div>
          </div>
          <div>
            <div className="font-semibold">Caveats</div>
            <ul className="list-disc pl-5">
              {result.caveats.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>
    </section>
  );
}
