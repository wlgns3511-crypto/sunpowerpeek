export function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatCurrencyDecimal(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function formatPercent(n: number): string {
  return n.toFixed(1) + '%';
}

export function formatSunHours(n: number): string {
  return n.toFixed(1) + ' hrs';
}

export function getSunColor(hours: number): string {
  if (hours >= 6) return 'bg-orange-500';
  if (hours >= 5.5) return 'bg-orange-400';
  if (hours >= 5) return 'bg-yellow-400';
  if (hours >= 4.5) return 'bg-yellow-300';
  if (hours >= 4) return 'bg-amber-300';
  return 'bg-amber-200';
}

export function getSunTextColor(hours: number): string {
  if (hours >= 6) return 'text-orange-700';
  if (hours >= 5) return 'text-yellow-700';
  if (hours >= 4) return 'text-amber-700';
  return 'text-amber-600';
}

export function getPaybackColor(years: number): string {
  if (years <= 7) return 'text-green-700';
  if (years <= 9) return 'text-green-600';
  if (years <= 11) return 'text-yellow-700';
  if (years <= 13) return 'text-orange-600';
  return 'text-red-600';
}

export function getNetMeteringLabel(nm: string): string {
  const labels: Record<string, string> = {
    yes: 'Full Net Metering',
    partial: 'Partial Net Metering',
    no: 'No Net Metering',
  };
  return labels[nm] || nm;
}

export function getNetMeteringColor(nm: string): string {
  if (nm === 'yes') return 'text-green-700 bg-green-50 border-green-200';
  if (nm === 'partial') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function calcSystemCost(sizeKw: number, costPerWatt: number): number {
  return sizeKw * 1000 * costPerWatt;
}

export function calcFederalCredit(systemCost: number, pct: number): number {
  return systemCost * (pct / 100);
}

export function calcAnnualProduction(sizeKw: number, sunHours: number): number {
  return sizeKw * sunHours * 365;
}

export function calcAnnualSavings(annualKwh: number, ratePerKwh: number): number {
  return (annualKwh * ratePerKwh) / 100;
}

export function calcPaybackYears(netCost: number, annualSavings: number): number {
  if (annualSavings <= 0) return 99;
  return netCost / annualSavings;
}

export function calcCO2Offset(annualKwh: number): number {
  // EPA: 0.0004 metric tons CO2 per kWh (US avg)
  return annualKwh * 0.0004;
}
