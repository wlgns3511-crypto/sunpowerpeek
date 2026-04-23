export interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface SolarData {
  zipCode: string;
  city: string;
  state: string;
  peakSunHours: number;
  systemCost6kw: number;
  annualSavings: number;
  annualProductionKwh: number;
  paybackYears: number;
  co2OffsetTons: number;
  nationalAvgSunHours: number;
  nationalAvgPayback: number;
  nationalAvgAnnualSavings: number;
  stateRank: number;
  totalStates: number;
}

const FEDERAL_ITC_PCT = 0.30;

export function getInsights(d: SolarData): Insight[] {
  const insights: Insight[] = [];
  const fmt = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  const netCost = Math.round(d.systemCost6kw * (1 - FEDERAL_ITC_PCT));

  // 1. Solar potential vs national average
  const sunDiffPct = ((d.peakSunHours - d.nationalAvgSunHours) / d.nationalAvgSunHours) * 100;
  if (sunDiffPct > 10) {
    insights.push({
      text: `${d.city} gets ${d.peakSunHours} peak sun hours/day — ${Math.round(sunDiffPct)}% above the national average. Excellent solar potential.`,
      sentiment: "positive",
    });
  } else if (sunDiffPct < -10) {
    insights.push({
      text: `${d.city} gets ${d.peakSunHours} peak sun hours/day — ${Math.abs(Math.round(sunDiffPct))}% below the national average. Solar still works but ROI is slower.`,
      sentiment: "negative",
    });
  } else {
    insights.push({
      text: `${d.city} gets ${d.peakSunHours} peak sun hours/day, close to the national average of ${d.nationalAvgSunHours} hours.`,
      sentiment: "neutral",
    });
  }

  // 2. Payback period
  if (d.paybackYears <= 7) {
    insights.push({
      text: `Payback in just ${d.paybackYears} years — faster than the national average of ${d.nationalAvgPayback} years. Strong investment case.`,
      sentiment: "positive",
    });
  } else if (d.paybackYears > 12) {
    insights.push({
      text: `${d.paybackYears}-year payback is slower than the ${d.nationalAvgPayback}-year national average. Consider waiting for lower panel prices or better local incentives.`,
      sentiment: "negative",
    });
  } else {
    insights.push({
      text: `${d.paybackYears}-year payback period is close to the national average of ${d.nationalAvgPayback} years — typical for the region.`,
      sentiment: "neutral",
    });
  }

  // 3. Annual savings
  const savDiffPct = ((d.annualSavings - d.nationalAvgAnnualSavings) / d.nationalAvgAnnualSavings) * 100;
  insights.push({
    text: `Annual savings of ${fmt(d.annualSavings)} is ${Math.abs(Math.round(savDiffPct))}% ${savDiffPct > 0 ? "above" : "below"} the national average of ${fmt(d.nationalAvgAnnualSavings)}.`,
    sentiment: savDiffPct > 10 ? "positive" : savDiffPct < -10 ? "negative" : "neutral",
  });

  // 4. Federal ITC + net cost
  const creditAmount = Math.round(d.systemCost6kw * FEDERAL_ITC_PCT);
  insights.push({
    text: `After the 30% federal tax credit (${fmt(creditAmount)} off), net cost is ${fmt(netCost)} for a 6kW system. Over 20 years, net savings are ${fmt(d.annualSavings * 20 - netCost)}.`,
    sentiment: d.annualSavings * 20 - netCost > 0 ? "positive" : "negative",
  });

  // 5. State ranking + environmental impact
  insights.push({
    text: `${d.state} ranks #${d.stateRank} of ${d.totalStates} states for solar potential. A 6kW system here offsets ${d.co2OffsetTons} tons of CO2 per year.`,
    sentiment: d.stateRank <= 15 ? "positive" : d.stateRank > 35 ? "negative" : "neutral",
  });

  return insights;
}
