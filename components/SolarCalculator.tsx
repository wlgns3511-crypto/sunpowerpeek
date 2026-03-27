"use client";
import { useState, useMemo } from "react";

interface StateData {
  abbr: string;
  state: string;
  avg_sun_hours: number;
  avg_system_cost_per_watt: number;
  federal_tax_credit_pct: number;
  state_tax_credit: number;
  state_rebate: number;
  avg_electricity_rate: number;
  net_metering: string;
}

interface Props {
  states: StateData[];
}

export function SolarCalculator({ states }: Props) {
  const [selectedState, setSelectedState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [roofSize, setRoofSize] = useState(1500);
  const [systemSize, setSystemSize] = useState(6);
  const [financing, setFinancing] = useState<"cash" | "loan" | "lease">("cash");

  const result = useMemo(() => {
    const st = states.find(s => s.abbr === selectedState);
    if (!st) return null;

    const costPerWatt = st.avg_system_cost_per_watt;
    const systemCost = systemSize * 1000 * costPerWatt;
    const federalCredit = systemCost * (st.federal_tax_credit_pct / 100);
    const stateCredit = st.state_tax_credit > 0 ? systemCost * (st.state_tax_credit / 100) : 0;
    const stateRebate = st.state_rebate;

    let netCost = systemCost - federalCredit - stateCredit - stateRebate;
    if (financing === "loan") {
      netCost = netCost * 1.15; // ~15% interest over loan life
    } else if (financing === "lease") {
      netCost = 0; // lease = $0 down, but lower savings
    }

    const annualKwh = systemSize * st.avg_sun_hours * 365;
    const annualSavings = financing === "lease"
      ? (annualKwh * st.avg_electricity_rate / 100) * 0.7 // lease saves ~70%
      : (annualKwh * st.avg_electricity_rate / 100);
    const monthlySavings = annualSavings / 12;
    const paybackYears = netCost > 0 && annualSavings > 0 ? netCost / annualSavings : 0;
    const savings20yr = annualSavings * 20 - (financing === "lease" ? 0 : netCost);
    const co2Offset = annualKwh * 0.0004; // metric tons

    return {
      systemCost,
      federalCredit,
      stateCredit,
      stateRebate,
      netCost: Math.max(0, netCost),
      annualKwh,
      annualSavings,
      monthlySavings,
      paybackYears,
      savings20yr,
      co2Offset,
    };
  }, [selectedState, systemSize, financing, states]);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200 p-6">
      <h2 className="text-2xl font-bold text-orange-800 mb-6 flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-500"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        Solar Savings Calculator
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your State</label>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="">Select a state...</option>
              {states.map(s => (
                <option key={s.abbr} value={s.abbr}>{s.state} ({s.avg_sun_hours} peak sun hrs)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code (optional)</label>
            <input
              type="text"
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              placeholder="e.g. 85001"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              maxLength={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Electric Bill: ${monthlyBill}</label>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={monthlyBill}
              onChange={e => setMonthlyBill(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-slate-400"><span>$50</span><span>$500</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Roof Size: {roofSize.toLocaleString()} sq ft</label>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={roofSize}
              onChange={e => setRoofSize(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-slate-400"><span>500</span><span>5,000</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">System Size: {systemSize} kW</label>
            <input
              type="range"
              min={3}
              max={15}
              step={0.5}
              value={systemSize}
              onChange={e => setSystemSize(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-slate-400"><span>3 kW</span><span>15 kW</span></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Financing</label>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "loan", "lease"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFinancing(f)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${
                    financing === f
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-slate-600 border-slate-300 hover:border-orange-300"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {!result ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select a state to see your solar savings estimate
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-orange-200 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">System Cost</p>
                  <p className="text-xl font-bold text-slate-800">${result.systemCost.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Federal Tax Credit (30%)</p>
                  <p className="text-xl font-bold text-green-700">-${result.federalCredit.toLocaleString()}</p>
                </div>
              </div>

              {result.stateCredit > 0 && (
                <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
                  <p className="text-xs text-slate-500">State Tax Credit</p>
                  <p className="text-lg font-bold text-green-700">-${Math.round(result.stateCredit).toLocaleString()}</p>
                </div>
              )}

              {result.stateRebate > 0 && (
                <div className="bg-white rounded-xl p-3 border border-green-200 text-center">
                  <p className="text-xs text-slate-500">State Rebate</p>
                  <p className="text-lg font-bold text-green-700">-${result.stateRebate.toLocaleString()}</p>
                </div>
              )}

              <div className="bg-orange-100 rounded-xl p-4 border border-orange-300 text-center">
                <p className="text-xs text-orange-600 uppercase tracking-wider font-medium">Net Cost{financing !== "cash" ? ` (${financing})` : ""}</p>
                <p className="text-3xl font-bold text-orange-800">${Math.round(result.netCost).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">Monthly Savings</p>
                  <p className="text-lg font-bold text-green-700">${Math.round(result.monthlySavings).toLocaleString()}/mo</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">Payback Period</p>
                  <p className="text-lg font-bold text-orange-700">{result.paybackYears > 0 ? result.paybackYears.toFixed(1) : "0"} years</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">20-Year Savings</p>
                  <p className="text-lg font-bold text-green-700">${Math.round(result.savings20yr).toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                  <p className="text-xs text-slate-500">CO2 Offset</p>
                  <p className="text-lg font-bold text-emerald-700">{result.co2Offset.toFixed(1)} tons/yr</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                <p className="text-xs text-slate-500">Annual Production</p>
                <p className="text-lg font-bold text-slate-800">{result.annualKwh.toLocaleString()} kWh/year</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* High-CPC footer keywords */}
      <div className="mt-6 pt-4 border-t border-orange-200">
        <p className="text-xs text-orange-400 text-center">
          solar panel installation quotes &middot; solar financing options &middot; solar tax credits 2026 &middot; best solar companies near me &middot; solar panel cost calculator
        </p>
      </div>
    </div>
  );
}
