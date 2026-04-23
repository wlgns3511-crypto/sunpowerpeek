export interface FaqItem {
  question: string;
  answer: string;
}

interface SolarStateData {
  state: string;
  abbr: string;
  avg_sun_hours: number;
  avg_system_cost_per_watt: number;
  avg_payback_years: number;
  avg_20yr_savings: number;
  federal_tax_credit_pct: number;
  state_tax_credit: number;
  state_rebate: number;
  net_metering: string;
  avg_electricity_rate: number;
  avg_monthly_bill: number;
  sunRank: number;
  totalStates: number;
  nationalAvgSun: number;
  nationalAvgPayback: number;
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function generateAutoFaqs(data: SolarStateData): FaqItem[] {
  return [];
}
