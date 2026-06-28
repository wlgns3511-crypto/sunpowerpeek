/**
 * SolarInterpretation — composite editorial reading layer atop
 * the three deterministic levers on every state page:
 *
 *   1) ItcPaybackBand (0차)      — payback economics tier (A / B / C / D / E)
 *   2) NetMeteringTier (1차 NEW) — export-credit policy tier (T1–T5)
 *   3) SolarIrradianceTier (1차 NEW) — peak-sun-hours band (A / B / C / D / E)
 *
 * The composite reads the tuple (paybackTier, netMeteringTier, irradianceTier)
 * and emits one of eight decisionFraming branches, each with a four-paragraph
 * deterministic prose verdict. Honest-null contract: if two or more inputs
 * are null, the verdict is data-incomplete (no guessing).
 *
 * Source authority: synthesizes NREL PVWatts / DSIRE / EIA / IRS Form 5695
 * already cited inline on every state page. See /editorial-policy/ for the
 * full attribution chain.
 */

import type { ItcPaybackTier } from './itc-payback-band';
import type { NetMeteringTier } from './net-metering-tier';
import type { IrradianceTier } from './solar-irradiance-tier';

export type DecisionFraming =
  | 'excellent-payback-strong-policy'
  | 'strong-payback-policy-stack'
  | 'moderate-payback-policy-headwind'
  | 'high-irradiance-weak-policy'
  | 'low-irradiance-strong-policy-rescue'
  | 'long-payback-policy-fragile'
  | 'low-irradiance-low-policy-avoid'
  | 'data-incomplete';

export interface SolarInterpretationInput {
  paybackTier: ItcPaybackTier | null;
  netMeteringTier: NetMeteringTier | null;
  irradianceTier: IrradianceTier | null;
  paybackYears?: number | null;
  avgSunHours?: number | null;
  retailRateCentsPerKwh?: number | null;
  stateAbbr?: string | null;
  stateName?: string | null;
}

export interface SolarInterpretationResult {
  decisionFraming: DecisionFraming;
  verdictTitle: string;
  toneColor: 'emerald' | 'green' | 'amber' | 'orange' | 'rose' | 'slate';
  paragraphs: string[];
  drivers: string[];
  caveats: string[];
}

const COMPOSITE_CAVEATS = [
  'This verdict synthesizes three deterministic levers and is an editorial reading layer over public NREL PVWatts, DSIRE, EIA, and IRS Form 5695 data — it is not a binding quote, a tax-credit opinion, or a guarantee of utility tariff outcomes.',
  'Live system economics require three confirmations the verdict cannot substitute for: a NABCEP-certified installer quote on actual roof orientation, a tax professional\'s read on IRS Form 5695 eligibility for the household, and the serving utility\'s active interconnection tariff in force.',
  'The composite framing reflects state-aggregate conditions; ZIP-code irradiance and within-state utility-tariff variation can shift any household\'s economics one tier in either direction.',
];

function countNulls(input: SolarInterpretationInput): number {
  let n = 0;
  if (input.paybackTier == null) n++;
  if (input.netMeteringTier == null) n++;
  if (input.irradianceTier == null) n++;
  return n;
}

function paybackIsExcellent(t: ItcPaybackTier | null): boolean { return t === 'A'; }
function paybackIsStrong(t: ItcPaybackTier | null): boolean { return t === 'A' || t === 'B'; }
function paybackIsModerate(t: ItcPaybackTier | null): boolean { return t === 'C'; }
function paybackIsSlow(t: ItcPaybackTier | null): boolean { return t === 'D' || t === 'E'; }

function policyIsStrong(t: NetMeteringTier | null): boolean { return t === 'T1'; }
function policyIsMixed(t: NetMeteringTier | null): boolean { return t === 'T2' || t === 'T3'; }
function policyIsWeak(t: NetMeteringTier | null): boolean { return t === 'T4' || t === 'T5'; }

function irradianceIsHigh(t: IrradianceTier | null): boolean { return t === 'A' || t === 'B'; }
function irradianceIsLow(t: IrradianceTier | null): boolean { return t === 'D' || t === 'E'; }

export function interpretSolar(input: SolarInterpretationInput): SolarInterpretationResult {
  const stateName = input.stateName || input.stateAbbr || 'this state';
  const paybackYrs = input.paybackYears != null ? Number(input.paybackYears).toFixed(1) : null;
  const sunHrs = input.avgSunHours != null ? Number(input.avgSunHours).toFixed(1) : null;
  const rate = input.retailRateCentsPerKwh != null ? Number(input.retailRateCentsPerKwh).toFixed(1) : null;

  const drivers: string[] = [];
  if (input.paybackTier) drivers.push(`Payback tier ${input.paybackTier}${paybackYrs ? ` (${paybackYrs} years)` : ''}`);
  if (input.netMeteringTier) drivers.push(`Net-metering tier ${input.netMeteringTier}`);
  if (input.irradianceTier) drivers.push(`Irradiance band ${input.irradianceTier}${sunHrs ? ` (${sunHrs} sun hours/day)` : ''}`);
  if (rate) drivers.push(`EIA retail rate ${rate}¢/kWh`);

  // ---- Data-incomplete: 2+ nulls → no guessing ----
  if (countNulls(input) >= 2) {
    return {
      decisionFraming: 'data-incomplete',
      verdictTitle: 'Verdict not available — public data inputs incomplete',
      toneColor: 'slate',
      paragraphs: [
        `The composite verdict for ${stateName} cannot be issued because two or more of the three deterministic inputs (payback economics, net-metering policy, irradiance band) are missing or unverified in the current NREL PVWatts / DSIRE / EIA / IRS Form 5695 snapshot. We do not fall back to a guess.`,
        'Where one of the three inputs is missing, the verdict is held until the next DSIRE / EIA / NREL refresh cycle. The deterministic levers each still render above with their individual outputs and honest no-data labels.',
        'Readers needing an immediate read should: (a) confirm the state-level peak-sun-hours value on pvwatts.nrel.gov directly, (b) consult the DSIRE state page for the active net-metering framework, and (c) request a NABCEP-certified installer quote that returns site-specific payback math.',
        'This page is reviewed on each DSIRE refresh; the verdict is reissued automatically when the missing input lands in the snapshot.',
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // ---- Decision branches ----
  // 1. excellent-payback-strong-policy: A/B payback + T1 NEM + A/B irradiance
  if (paybackIsStrong(input.paybackTier) && policyIsStrong(input.netMeteringTier) && irradianceIsHigh(input.irradianceTier)) {
    return {
      decisionFraming: 'excellent-payback-strong-policy',
      verdictTitle: 'Strong payback, strong net-metering policy, strong irradiance — economically clear',
      toneColor: 'emerald',
      paragraphs: [
        `${stateName} aligns three of the three deterministic levers in the favorable direction: payback lands in tier ${input.paybackTier}${paybackYrs ? ` (${paybackYrs} years after the 30% federal ITC and state-level offsets)` : ''}, the net-metering framework is full retail-rate (DSIRE Tier T1), and NREL PVWatts records ${sunHrs ?? ''} peak-sun hours per day, placing the state in irradiance band ${input.irradianceTier}.`,
        `On payback economics, the EIA-published retail rate${rate ? ` (${rate}¢/kWh)` : ''} combined with the federal ITC under IRS Form 5695 and any state rebate documented by DSIRE produces an economically clear case at the state-aggregate level. The state-aggregate framing does not substitute for a per-roof quote, but it sets a strong prior.`,
        `On policy, a Tier 1 retail-rate net-metering framework means kilowatt-hours exported to the grid credit at the same rate that imported kilowatt-hours are billed — the 1:1 banking that anchored solar economics across the 2010s. The DSIRE state summary documents this framework in force.`,
        `On irradiance, an A or B band on the NREL PVWatts NSRDB aggregate places ${stateName} above the national typical for annual production per installed kilowatt. The combination of strong production, strong policy, and the federal ITC backstop is the configuration that most clearly justifies a NABCEP-certified installer quote on actual roof orientation.`,
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // 2. strong-payback-policy-stack: A/B payback + (T1 or T2 or T3) + any irradiance
  if (paybackIsStrong(input.paybackTier) && (policyIsStrong(input.netMeteringTier) || policyIsMixed(input.netMeteringTier))) {
    return {
      decisionFraming: 'strong-payback-policy-stack',
      verdictTitle: 'Strong payback held up by federal ITC + state policy stack',
      toneColor: 'green',
      paragraphs: [
        `${stateName} sits in payback tier ${input.paybackTier}${paybackYrs ? ` (${paybackYrs} years)` : ''} under a Tier ${input.netMeteringTier} net-metering framework. The payback math holds even where peak-sun hours${sunHrs ? ` (${sunHrs}/day)` : ''} are not in the Desert Southwest band, because the federal ITC (30%, IRS Form 5695, IRA through 2032) plus the state-level credit / rebate documented by DSIRE plus the export-credit mechanism do the load-bearing work together.`,
        input.netMeteringTier === 'T1'
          ? `The Tier T1 framework banks excess generation at the retail rate — the configuration that most directly captures EIA-published rate growth as a tailwind for solar payback over the 25-year array life.`
          : input.netMeteringTier === 'T2'
            ? `Under the Tier T2 avoided-cost / TOU export framework, exports during low-load hours credit at avoided-cost while imports during peak hours are billed at TOU peak — the dominant economic strategy is pairing storage to shift exports into peak windows. The payback math here assumes default unshifted exports; storage pairing can materially shorten the band.`
            : `Under the Tier T3 net-billing framework, exports credit at an approved export rate distinct from the retail rate. The payback math reflects this gap and still lands in tier ${input.paybackTier}.`,
        `Annual production at NREL PVWatts band ${input.irradianceTier ?? '?'} ${sunHrs ? `(${sunHrs} sun hours/day) ` : ''}delivers the kWh denominator that, divided into net system cost after incentives, gives the payback years quoted. The ITC reduces net cost by 30%; state-level credits documented by DSIRE further reduce it.`,
        `This is the configuration where the federal-ITC backstop and the state policy stack carry the math even without exceptional irradiance. Confirm the active interconnection tariff with the serving utility before signing — within-state utility variation can shift any household's economics one tier in either direction.`,
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // 3. high-irradiance-weak-policy: A/B irradiance + T4/T5 NEM
  if (irradianceIsHigh(input.irradianceTier) && policyIsWeak(input.netMeteringTier)) {
    return {
      decisionFraming: 'high-irradiance-weak-policy',
      verdictTitle: 'High irradiance carries the math despite weak state net-metering policy',
      toneColor: 'amber',
      paragraphs: [
        `${stateName} delivers strong NREL PVWatts irradiance (band ${input.irradianceTier}${sunHrs ? `, ${sunHrs} sun hours/day` : ''}) but the DSIRE summary classifies the state net-metering framework as Tier ${input.netMeteringTier} — partial / utility-discretion or no statutory state policy. The production tailwind partially offsets the policy headwind.`,
        `On payback economics, payback tier ${input.paybackTier} ${paybackYrs ? `(${paybackYrs} years) ` : ''}reflects the strong production stream divided into net system cost after the 30% federal ITC and any state-level rebate captured by DSIRE. The state rebate column carries less weight here because the export-credit mechanism is weak.`,
        `On policy, a Tier T4 partial framework means coverage is utility-specific, sunsetted, or limited to certain customer classes — the serving utility's tariff is the binding document, not the state summary. A Tier T5 no-statutory-policy state means excess generation rolls forward at a utility-set credit rather than a retail-rate equivalent.`,
        `On irradiance, the A or B band on the NREL PVWatts NSRDB aggregate is the load-bearing input. The strategy here is typically self-consumption-first: size the array to home consumption, pair with storage to shift load into the daylight production window, and treat exports as a low-value bonus. A NABCEP-certified installer can size the array to that strategy on actual roof orientation.`,
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // 4. low-irradiance-strong-policy-rescue: D/E irradiance + T1 NEM
  if (irradianceIsLow(input.irradianceTier) && policyIsStrong(input.netMeteringTier)) {
    return {
      decisionFraming: 'low-irradiance-strong-policy-rescue',
      verdictTitle: 'Lower irradiance rescued by strong net-metering and high retail rates',
      toneColor: 'amber',
      paragraphs: [
        `${stateName} records lower NREL PVWatts irradiance (band ${input.irradianceTier}${sunHrs ? `, ${sunHrs} sun hours/day` : ''}) but the DSIRE summary holds a Tier T1 full retail-rate net-metering framework in force, and the EIA retail rate${rate ? ` (${rate}¢/kWh)` : ''} is high enough to deliver payback tier ${input.paybackTier}.`,
        `On payback economics, the math turns on the high retail-rate dollar value of each kWh produced rather than on raw kWh production. The 30% federal ITC under IRS Form 5695 reduces net system cost by the same percentage everywhere; the differentiator here is the cents-per-kWh denominator.`,
        `On policy, the Tier T1 retail-rate banking framework means each kWh exported credits at the full retail rate — and at this state's retail rate, that credit is substantially more valuable per kWh than the same kWh exported under the avoided-cost / TOU hybrid Tier T2 framework that high-irradiance high-rate states have begun migrating to.`,
        `On irradiance, the D or E band is the headwind. Real annual production per installed kilowatt will trail the Desert Southwest baseline by 25–40%, but the high-retail-rate × retail-rate-banking combination still produces a tier-${input.paybackTier} payback at the state aggregate. Confirm site-specific irradiance on pvwatts.nrel.gov before signing — within-state variation is wider in this band.`,
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // 5. low-irradiance-low-policy-avoid: D/E irradiance + T4/T5 + D/E payback
  if (irradianceIsLow(input.irradianceTier) && policyIsWeak(input.netMeteringTier) && paybackIsSlow(input.paybackTier)) {
    return {
      decisionFraming: 'low-irradiance-low-policy-avoid',
      verdictTitle: 'Compounding headwinds — irradiance, policy, and rate all soft',
      toneColor: 'rose',
      paragraphs: [
        `${stateName} stacks three soft inputs: NREL PVWatts irradiance band ${input.irradianceTier}${sunHrs ? ` (${sunHrs} sun hours/day)` : ''}, DSIRE net-metering Tier ${input.netMeteringTier}, and payback tier ${input.paybackTier}${paybackYrs ? ` (${paybackYrs} years)` : ''}. There is no single lever in the favorable direction at the state aggregate.`,
        `On payback economics, tier ${input.paybackTier} reflects the low retail-rate × low production × weak export-credit interaction. The 30% federal ITC under IRS Form 5695 still applies, but it cannot rescue the math by itself when the kWh denominator and the cents-per-kWh denominator both work against the investment.`,
        `On policy, a Tier ${input.netMeteringTier} framework means the state has no statutory retail-rate banking — excess generation rolls forward at a utility-set credit. Combined with low retail rates, the dollar value of each exported kWh is small, and the strategy of "size large and export the surplus" does not apply.`,
        `On irradiance, the D or E band is structural and does not change with policy. Self-consumption-first sizing with storage is still possible, but the payback math at the state aggregate does not endorse it. Households with specific economic motivation (resilience, off-grid use cases, environmental priority over payback) may still proceed; the deterministic math, however, returns tier ${input.paybackTier}.`,
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // 6. long-payback-policy-fragile: D/E payback + T4/T5
  if (paybackIsSlow(input.paybackTier) && policyIsWeak(input.netMeteringTier)) {
    return {
      decisionFraming: 'long-payback-policy-fragile',
      verdictTitle: 'Long payback compounded by fragile net-metering policy',
      toneColor: 'orange',
      paragraphs: [
        `${stateName} sits in payback tier ${input.paybackTier}${paybackYrs ? ` (${paybackYrs} years)` : ''} under a Tier ${input.netMeteringTier} net-metering framework. The combination is fragile: payback timelines past 12 years carry meaningful policy-drift risk over the 25-year array life, and the export-credit mechanism is already weak at the state aggregate.`,
        `On payback economics, the 30% federal ITC under IRS Form 5695 plus any state credit captured by DSIRE plus the EIA retail rate${rate ? ` (${rate}¢/kWh)` : ''} combine into a math that lands past the moderate band. Compounding cost growth (panels, inverters, labor) and a stable-to-flat retail rate would each shorten the payback; the opposite would each extend it.`,
        `On policy, a Tier T4 partial framework or Tier T5 no-statutory-policy state means the export-credit mechanism is at utility discretion. Policy drift over a 25-year horizon is unilateral — the household cannot pre-lock the export tariff that was in force at interconnection.`,
        `On irradiance, NREL PVWatts band ${input.irradianceTier ?? '?'} ${sunHrs ? `(${sunHrs} sun hours/day) ` : ''}is the third input. Where irradiance is high, the production tailwind partially offsets the long-payback fragility; where it is low, all three inputs sit on the soft side. A NABCEP-certified installer quote on actual roof orientation plus a tax professional's read on first-year ITC capture are the next steps.`,
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // 7. moderate-payback-policy-headwind: C payback + T2/T3/T4 NEM
  if (paybackIsModerate(input.paybackTier) && (policyIsMixed(input.netMeteringTier) || policyIsWeak(input.netMeteringTier))) {
    return {
      decisionFraming: 'moderate-payback-policy-headwind',
      verdictTitle: 'Moderate payback with policy headwind — verify before signing',
      toneColor: 'amber',
      paragraphs: [
        `${stateName} lands in payback tier ${input.paybackTier}${paybackYrs ? ` (${paybackYrs} years)` : ''} under a Tier ${input.netMeteringTier} net-metering framework. The payback sits in the national-typical band; the policy framework sits below the retail-rate-banking benchmark.`,
        `On payback economics, the 30% federal ITC under IRS Form 5695 is the load-bearing dollar-amount lever. State-level rebates documented by DSIRE add the next-largest dollar amounts. The retail-rate × annual production product fills in the savings stream, and the export-credit mechanism trims that stream by the gap between retail rate and the approved export rate or capacity cap.`,
        `On policy, a Tier ${input.netMeteringTier} framework introduces utility-tariff variance: the active interconnection tariff with the serving utility is the binding document, not the DSIRE state summary, and within-state variation can shift any household's economics one tier in either direction.`,
        `On irradiance, NREL PVWatts band ${input.irradianceTier ?? '?'} ${sunHrs ? `(${sunHrs} sun hours/day) ` : ''}sets the production denominator. The strategy here is to verify three things before signing: the serving utility's active export-credit tariff, the household's first-year ITC capture (IRS Form 5695 nonrefundable, household tax liability constrains capture), and a NABCEP-certified installer quote on actual roof orientation.`,
      ],
      drivers,
      caveats: COMPOSITE_CAVEATS,
    };
  }

  // 8. Fallback: any other configuration → moderate-payback-policy-headwind-style read
  return {
    decisionFraming: 'moderate-payback-policy-headwind',
    verdictTitle: 'Mixed signal across the three levers — verify each input separately',
    toneColor: 'amber',
    paragraphs: [
      `${stateName} produces a mixed signal across the three deterministic levers: payback tier ${input.paybackTier ?? '?'}${paybackYrs ? ` (${paybackYrs} years)` : ''}, net-metering tier ${input.netMeteringTier ?? '?'}, and irradiance band ${input.irradianceTier ?? '?'}${sunHrs ? ` (${sunHrs} sun hours/day)` : ''}. The composite does not align cleanly with any of the standard configurations.`,
      `On payback economics, the 30% federal ITC under IRS Form 5695 reduces net system cost by the same percentage everywhere; the differentiator is the cents-per-kWh × kWh-produced product. The EIA retail rate${rate ? ` (${rate}¢/kWh)` : ''} combined with NREL PVWatts production puts the annual savings stream where it is. State-level rebates documented by DSIRE adjust the numerator.`,
      `On policy, a Tier ${input.netMeteringTier ?? '?'} framework shapes how exported kilowatt-hours are credited. The active interconnection tariff with the serving utility is the binding document, and within-state utility variance can shift any household's economics one tier in either direction.`,
      `On irradiance, NREL PVWatts band ${input.irradianceTier ?? '?'} is structural. Strategy: confirm site-specific irradiance on pvwatts.nrel.gov directly, consult the DSIRE state page for the active net-metering framework, and request a NABCEP-certified installer quote that returns site-specific payback math.`,
    ],
    drivers,
    caveats: COMPOSITE_CAVEATS,
  };
}
