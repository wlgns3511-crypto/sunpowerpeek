"use client";

import { useState, useMemo } from "react";

interface Props {
  stateName: string;
  avgSunHours: number;
  avgSystemCostPerWatt: number;
  federalTaxCreditPct: number;
  stateTaxCredit: number; // percentage
  stateRebate: number; // dollar amount
  avgElectricityRate: number; // cents per kWh
  netMetering: string; // "yes" | "partial" | "no"
}

type RoofSize = "small" | "medium" | "large";

const ROOF_CAPACITY: Record<RoofSize, { label: string; maxKw: number }> = {
  small: { label: "Small (4 kW)", maxKw: 4 },
  medium: { label: "Medium (6 kW)", maxKw: 6 },
  large: { label: "Large (10 kW)", maxKw: 10 },
};

// Panel degradation: ~0.5% per year average over 25 years
const ANNUAL_DEGRADATION = 0.005;
// Electricity rate escalation: ~2.5% per year
const ANNUAL_RATE_INCREASE = 0.025;
// Loan APR assumption for financed
const LOAN_INTEREST_FACTOR = 1.15;

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString();
}

function fmtDecimal(n: number): string {
  return "$" + n.toFixed(2);
}

export function SolarSavingsCalc({
  stateName,
  avgSunHours,
  avgSystemCostPerWatt,
  federalTaxCreditPct,
  stateTaxCredit,
  stateRebate,
  avgElectricityRate,
  netMetering,
}: Props) {
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [roofSize, setRoofSize] = useState<RoofSize>("medium");

  const calc = useMemo(() => {
    const rateDollars = avgElectricityRate / 100;

    // Estimate current annual usage from bill
    const monthlyKwh = rateDollars > 0 ? monthlyBill / rateDollars : 0;
    const annualKwh = monthlyKwh * 12;

    // System size needed to offset usage
    const annualProductionPerKw = avgSunHours * 365;
    const idealSystemKw = annualProductionPerKw > 0 ? annualKwh / annualProductionPerKw : 0;

    // Cap by roof size
    const maxKw = ROOF_CAPACITY[roofSize].maxKw;
    const systemKw = Math.min(idealSystemKw, maxKw);
    const systemSizeRounded = Math.round(systemKw * 10) / 10;

    // System cost
    const grossCost = systemKw * 1000 * avgSystemCostPerWatt;
    const federalCredit = grossCost * (federalTaxCreditPct / 100);
    const stateCredit = stateTaxCredit > 0 ? grossCost * (stateTaxCredit / 100) : 0;
    const netCost = Math.max(0, grossCost - federalCredit - stateCredit - stateRebate);

    // Annual production
    const annualProduction = systemKw * annualProductionPerKw;
    const coveragePct = annualKwh > 0 ? Math.min(100, (annualProduction / annualKwh) * 100) : 0;

    // Net metering adjustment
    const netMeteringFactor = netMetering === "yes" ? 1.0 : netMetering === "partial" ? 0.85 : 0.7;

    // Monthly savings (simplified: production value minus residual bill)
    const monthlyProduction = annualProduction / 12;
    const productionValue = monthlyProduction * rateDollars * netMeteringFactor;
    const monthlySavings = Math.min(productionValue, monthlyBill);
    const newMonthlyBill = monthlyBill - monthlySavings;

    // Payback period
    const annualSavings = monthlySavings * 12;
    const paybackYears = annualSavings > 0 ? netCost / annualSavings : 99;

    // 25-year total savings with degradation and rate escalation
    let totalSavings25 = 0;
    for (let year = 1; year <= 25; year++) {
      const degradation = Math.pow(1 - ANNUAL_DEGRADATION, year);
      const rateEscalation = Math.pow(1 + ANNUAL_RATE_INCREASE, year);
      const yearSavings = annualSavings * degradation * rateEscalation;
      totalSavings25 += yearSavings;
    }
    const netProfit25 = totalSavings25 - netCost;

    return {
      monthlyKwh: Math.round(monthlyKwh),
      systemSizeRounded,
      idealSystemKw: Math.round(idealSystemKw * 10) / 10,
      isCapped: idealSystemKw > maxKw,
      grossCost,
      federalCredit,
      stateCredit,
      netCost,
      annualProduction: Math.round(annualProduction),
      coveragePct: Math.round(coveragePct),
      monthlySavings,
      newMonthlyBill,
      annualSavings,
      paybackYears: Math.round(paybackYears * 10) / 10,
      totalSavings25: Math.round(totalSavings25),
      netProfit25: Math.round(netProfit25),
    };
  }, [monthlyBill, roofSize, avgSunHours, avgSystemCostPerWatt, federalTaxCreditPct, stateTaxCredit, stateRebate, avgElectricityRate, netMetering]);

  return (
    <section className="mb-8 rounded-xl border border-orange-200 bg-orange-50/50 p-5">
      <h2 className="text-xl font-bold text-slate-800 mb-1">
        Solar Savings Calculator
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        Estimate your solar savings in {stateName} based on your current electric bill.
      </p>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        {/* Monthly bill slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="bill-slider" className="text-sm font-medium text-slate-700">
              Current Monthly Bill
            </label>
            <span className="text-lg font-bold text-orange-700">
              ${monthlyBill}
            </span>
          </div>
          <input
            id="bill-slider"
            type="range"
            min={50}
            max={500}
            step={10}
            value={monthlyBill}
            onChange={(e) => setMonthlyBill(Number(e.target.value))}
            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>$50</span>
            <span>$500</span>
          </div>
        </div>

        {/* Roof size toggle */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Roof Size</p>
          <div className="flex gap-2">
            {(Object.keys(ROOF_CAPACITY) as RoofSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setRoofSize(size)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  roofSize === size
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                }`}
              >
                {ROOF_CAPACITY[size].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System sizing */}
      <div className="bg-white rounded-lg p-4 border border-orange-100 mb-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-700">Recommended System Size</p>
          <p className="text-xl font-bold text-orange-700">{calc.systemSizeRounded} kW</p>
        </div>
        <p className="text-xs text-slate-500">
          Based on ~{calc.monthlyKwh.toLocaleString()} kWh/mo usage and {avgSunHours} peak sun hours/day.
          {calc.isCapped && (
            <span className="text-amber-600 font-medium">
              {" "}Ideal size would be {calc.idealSystemKw} kW but capped by {ROOF_CAPACITY[roofSize].label.toLowerCase()} roof.
            </span>
          )}
        </p>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">System Cost</p>
          <p className="text-sm text-slate-400 line-through">{fmt(calc.grossCost)}</p>
          <p className="text-xl font-bold text-orange-700">{fmt(calc.netCost)}</p>
          <p className="text-xs text-green-600">after incentives</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Monthly Savings</p>
          <p className="text-xl font-bold text-green-600 mt-2">{fmtDecimal(calc.monthlySavings)}</p>
          <p className="text-xs text-slate-400">new bill: {fmtDecimal(calc.newMonthlyBill)}/mo</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Payback Period</p>
          <p className={`text-xl font-bold mt-2 ${calc.paybackYears <= 8 ? "text-green-600" : calc.paybackYears <= 12 ? "text-amber-600" : "text-red-600"}`}>
            {calc.paybackYears} yrs
          </p>
          <p className="text-xs text-slate-400">break-even point</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">25-Year Savings</p>
          <p className="text-xl font-bold text-emerald-700 mt-2">{fmt(calc.netProfit25)}</p>
          <p className="text-xs text-slate-400">net profit</p>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="font-medium text-slate-700">Energy Coverage</span>
          <span className="font-bold text-orange-700">{calc.coveragePct}%</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, calc.coveragePct)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {calc.annualProduction.toLocaleString()} kWh/year produced
          {calc.coveragePct < 100 && " (roof limits full offset)"}
        </p>
      </div>

      {/* Incentive breakdown */}
      <div className="bg-white rounded-lg p-4 border border-green-100 mb-5">
        <p className="text-sm font-medium text-slate-700 mb-2">Incentive Breakdown</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Gross system cost</span>
            <span className="font-medium">{fmt(calc.grossCost)}</span>
          </div>
          <div className="flex justify-between text-green-700">
            <span>Federal ITC ({federalTaxCreditPct}%)</span>
            <span>-{fmt(calc.federalCredit)}</span>
          </div>
          {stateTaxCredit > 0 && (
            <div className="flex justify-between text-green-700">
              <span>State tax credit ({stateTaxCredit}%)</span>
              <span>-{fmt(calc.stateCredit)}</span>
            </div>
          )}
          {stateRebate > 0 && (
            <div className="flex justify-between text-green-700">
              <span>State rebate</span>
              <span>-{fmt(stateRebate)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1">
            <span>Net cost</span>
            <span className="text-orange-700">{fmt(calc.netCost)}</span>
          </div>
        </div>
      </div>

      {/* Summary sentence */}
      <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 mb-4">
        <p className="text-sm text-emerald-800 leading-relaxed">
          A {calc.systemSizeRounded} kW solar system in {stateName} pays for itself in approximately{" "}
          <strong>{calc.paybackYears} years</strong> and saves an estimated{" "}
          <strong>{fmt(calc.netProfit25)}</strong> over 25 years (after system cost). Your new monthly bill
          would drop from ${monthlyBill} to approximately {fmtDecimal(calc.newMonthlyBill)}.
        </p>
      </div>

      <p className="text-xs text-slate-400">
        Estimates based on {stateName}&apos;s {avgSunHours} peak sun hours/day,{" "}
        {avgElectricityRate.toFixed(1)}&cent;/kWh electricity rate, and ${avgSystemCostPerWatt}/W system cost.
        Includes 0.5%/yr panel degradation and 2.5%/yr rate escalation over 25 years.
        Net metering: {netMetering === "yes" ? "full retail" : netMetering === "partial" ? "partial credit" : "not available"}.
        Get actual quotes from local installers for precise numbers.
      </p>
    </section>
  );
}
