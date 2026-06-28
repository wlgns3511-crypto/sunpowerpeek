export interface SolarProprietaryMetrics {
  sunScore: number;
  paybackScore: number;
  meteringScore: number;
  overallGrade: string;
  commentary: string;
}

/**
 * Returns a deterministic commentary paragraph based on state details and slug-based hash
 * to rotate content variation and prevent duplicate content.
 */
function getDeterministicCommentary(
  stateName: string,
  overallScore: number,
  slug: string
): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;

  let key = 'MODERATE_VIABILITY';
  if (overallScore >= 75) {
    key = 'EXCELLENT_VIABILITY';
  } else if (overallScore < 50) {
    key = 'LOW_VIABILITY';
  }

  const variations: Record<string, string[]> = {
    EXCELLENT_VIABILITY: [
      `The state of ${stateName} offers premium solar installation conditions. Generous net metering regulations, high solar irradiance, and short payback durations maximize investment yields.`,
      `A stellar environment for solar transition in ${stateName}. Quick return-on-investment parameters and supportive local utilities yield exceptionally positive savings forecasts.`,
      `Highly recommended solar parameters in ${stateName}. Strong irradiance coupled with robust policy support ensures top-tier performance for residential installations.`
    ],
    MODERATE_VIABILITY: [
      `The solar profile for ${stateName} shows a balanced state for solar adoption. While sun exposure is standard, policy caps or system costs result in standard return rates.`,
      `A standard solar feasibility profile for ${stateName}. Payback periods align with national baselines, keeping net savings in the typical range.`,
      `Provides stable long-term yields in ${stateName}. Standard net metering credit guidelines and typical sun exposure keep capital recovery stable.`
    ],
    LOW_VIABILITY: [
      `Adopting solar in ${stateName} requires careful planning. Limited sun hours or restrictive utility metering policies lead to extended payback periods.`,
      `Slow capital recovery timelines are typical in ${stateName}. Homeowners should look for local municipal rebates to optimize installation cost margins.`,
      `Extended payback terms in ${stateName} require careful budgeting. Homeowners should leverage the 30% federal credit to mitigate high initial costs.`
    ]
  };

  const list = variations[key] || variations['MODERATE_VIABILITY'];
  return list[index];
}

/**
 * Calculates proprietary solar viability, payback speed, and net metering metrics for SunPowerPeek.
 */
export function calculateProprietaryMetrics(
  stateName: string,
  slug: string,
  avgSunHours: number,
  avgPaybackYears: number,
  netMetering: string,
  savingsRk: number
): SolarProprietaryMetrics {
  // 1. Solar Irradiance Index (12-99) — derived from avg peak sun hours
  let sunScore = Math.round(avgSunHours * 15);
  sunScore = Math.max(12, Math.min(99, sunScore));

  // 2. Payback Speed Rank (12-99) — derived from payback years
  let paybackScore = Math.round(100 - avgPaybackYears * 6);
  paybackScore = Math.max(12, Math.min(99, paybackScore));

  // 3. Net Metering Policy Strength (15-99) — derived from net metering type & ranking
  let meteringBase = 20;
  if (netMetering === 'yes') {
    meteringBase = 90;
  } else if (netMetering === 'partial') {
    meteringBase = 55;
  }
  let meteringScore = Math.round(meteringBase + (savingsRk % 10));
  meteringScore = Math.max(15, Math.min(99, meteringScore));

  // 4. Overall Grade
  const composite = sunScore * 0.35 + paybackScore * 0.4 + meteringScore * 0.25;

  let overallGrade = 'C';
  if (composite >= 90) overallGrade = 'A+';
  else if (composite >= 85) overallGrade = 'A';
  else if (composite >= 80) overallGrade = 'A-';
  else if (composite >= 75) overallGrade = 'B+';
  else if (composite >= 70) overallGrade = 'B';
  else if (composite >= 65) overallGrade = 'B-';
  else if (composite >= 60) overallGrade = 'C+';
  else if (composite >= 55) overallGrade = 'C';
  else if (composite >= 50) overallGrade = 'C-';
  else if (composite >= 40) overallGrade = 'D';
  else overallGrade = 'F';

  // 5. Commentary
  const commentary = getDeterministicCommentary(stateName, composite, slug);

  return {
    sunScore,
    paybackScore,
    meteringScore,
    overallGrade,
    commentary,
  };
}
