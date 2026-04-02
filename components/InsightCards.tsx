interface Props {
  stateName: string;
  sunHoursRank: number;
  paybackRank: number;
  savingsRank: number;
  totalStates: number;
  sunHours: number;
  nationalAvgSun: number;
  paybackYears: number;
  nationalAvgPayback: number;
  savings20yr: number;
  nationalAvgSavings: number;
  federalCredit: number;
  stateCredit: number;
  stateRebate: number;
}

const COLORS = {
  emerald: "border-emerald-200 bg-emerald-50",
  amber: "border-amber-200 bg-amber-50",
  red: "border-red-200 bg-red-50",
  orange: "border-orange-200 bg-orange-50",
} as const;

const TEXT = {
  emerald: "text-emerald-700",
  amber: "text-amber-700",
  red: "text-red-700",
  orange: "text-orange-700",
} as const;

export function InsightCards({
  stateName, sunHoursRank, paybackRank, savingsRank, totalStates,
  sunHours, nationalAvgSun, paybackYears, nationalAvgPayback,
  savings20yr, nationalAvgSavings, federalCredit, stateCredit, stateRebate,
}: Props) {
  const sunPct = Math.round((1 - sunHoursRank / totalStates) * 100);
  const paybackDiff = Math.round((1 - paybackYears / nationalAvgPayback) * 100);
  const savingsDiff = Math.round((savings20yr / nationalAvgSavings - 1) * 100);

  const incentiveCount = [federalCredit > 0, stateCredit > 0, stateRebate > 0].filter(Boolean).length;
  const totalIncentiveValue = federalCredit + (stateCredit > 0 ? Math.round(6000 * stateCredit / 100) : 0) + stateRebate;

  type Color = "emerald" | "amber" | "red" | "orange";
  const cards: { title: string; value: string; desc: string; color: Color }[] = [
    {
      title: "Solar Potential",
      value: `#${sunHoursRank} of ${totalStates}`,
      desc: `${sunHours} peak sun hrs/day (national avg ${nationalAvgSun}). ${sunPct >= 50 ? `Top ${100 - sunPct}%` : `Bottom ${sunPct}%`} of US states.`,
      color: sunPct >= 60 ? "emerald" : sunPct >= 40 ? "amber" : "red",
    },
    {
      title: "Payback Speed",
      value: `${paybackYears} years`,
      desc: `${Math.abs(paybackDiff)}% ${paybackDiff > 0 ? "faster" : "slower"} than US avg (${nationalAvgPayback}yr). ${paybackYears <= 8 ? "Break-even before most loan terms." : paybackYears <= 12 ? "Moderate payback period." : "Longer payback — consider financing."}`,
      color: paybackDiff > 10 ? "emerald" : paybackDiff > -10 ? "amber" : "red",
    },
    {
      title: "20-Year ROI",
      value: `$${savings20yr.toLocaleString()}`,
      desc: `${savingsDiff > 0 ? "+" : ""}${savingsDiff}% vs national avg ($${nationalAvgSavings.toLocaleString()}). ${savings20yr >= 40000 ? "Excellent long-term value." : savings20yr >= 20000 ? "Good returns." : "Modest savings."}`,
      color: savingsDiff > 10 ? "emerald" : savingsDiff > -10 ? "amber" : "red",
    },
    {
      title: "Incentive Stack",
      value: `${incentiveCount} incentive${incentiveCount !== 1 ? "s" : ""}`,
      desc: `${federalCredit > 0 ? `Federal ${federalCredit}%` : ""}${stateCredit > 0 ? ` + State ${stateCredit}%` : ""}${stateRebate > 0 ? ` + $${stateRebate.toLocaleString()} rebate` : ""}. Est. ~$${totalIncentiveValue.toLocaleString()} off.`,
      color: incentiveCount >= 3 ? "emerald" : incentiveCount >= 2 ? "amber" : "orange",
    },
  ];

  return (
    <section className="my-6">
      <h2 className="text-lg font-bold text-slate-800 mb-3">Solar Insights for {stateName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.title} className={`rounded-xl border p-4 ${COLORS[c.color]}`}>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{c.title}</div>
            <div className={`text-2xl font-bold ${TEXT[c.color]} mb-1`}>{c.value}</div>
            <p className="text-sm text-slate-600 leading-snug">{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
