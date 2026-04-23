/**
 * Data-driven contextual insight paragraphs for each state's solar page.
 * Computes unique analytical text from actual state data vs national averages.
 */

import { getAllStates, type State } from './db';

export interface StateInsight {
  title: string;
  text: string;
}

export function getStateInsights(state: State): StateInsight[] {
  const allStates = getAllStates();
  const n = allStates.length;

  // National averages
  const natSun = allStates.reduce((s, st) => s + st.avg_sun_hours, 0) / n;
  const natPayback = allStates.reduce((s, st) => s + st.avg_payback_years, 0) / n;
  const natSavings = allStates.reduce((s, st) => s + st.avg_20yr_savings, 0) / n;
  const natCostPerWatt = allStates.reduce((s, st) => s + st.avg_system_cost_per_watt, 0) / n;
  const natElecRate = allStates.reduce((s, st) => s + st.avg_electricity_rate, 0) / n;

  // Rankings
  const sunRank = allStates.filter(s => s.avg_sun_hours > state.avg_sun_hours).length + 1;
  const paybackRank = allStates.filter(s => s.avg_payback_years < state.avg_payback_years).length + 1;
  const savingsRank = allStates.filter(s => s.avg_20yr_savings > state.avg_20yr_savings).length + 1;

  // System cost
  const grossCost6kw = Math.round(state.avg_system_cost_per_watt * 6000);
  const federalCredit = Math.round(grossCost6kw * state.federal_tax_credit_pct / 100);
  const stateCredit = state.state_tax_credit > 0 ? Math.round(grossCost6kw * state.state_tax_credit / 100) : 0;
  const netCost = grossCost6kw - federalCredit - stateCredit - state.state_rebate;

  // Annual production estimate
  const annualKwh = Math.round(6 * state.avg_sun_hours * 365);
  const annualSavings = Math.round(annualKwh * state.avg_electricity_rate / 100);

  // Net metering states count
  const netMeteringYes = allStates.filter(s => s.net_metering === 'yes').length;

  const insights: StateInsight[] = [];

  // 1. Solar resource quality
  const sunDiffPct = ((state.avg_sun_hours - natSun) / natSun * 100).toFixed(1);
  insights.push({
    title: 'Solar Resource',
    text: `${state.state} receives ${state.avg_sun_hours.toFixed(1)} peak sun hours per day, ${state.avg_sun_hours >= natSun ? `${sunDiffPct}% above` : `${Math.abs(Number(sunDiffPct))}% below`} the national average of ${natSun.toFixed(1)} hours, ranking #${sunRank} out of ${n} states. A 6 kW system here would produce approximately ${annualKwh.toLocaleString()} kWh per year, offsetting roughly $${annualSavings.toLocaleString()} in annual electricity costs at the local rate of ${state.avg_electricity_rate.toFixed(1)}\u00A2/kWh.`,
  });

  // 2. Financial return
  const savingsDiffPct = ((state.avg_20yr_savings - natSavings) / natSavings * 100).toFixed(0);
  const paybackDiff = (state.avg_payback_years - natPayback).toFixed(1);
  insights.push({
    title: 'Financial Return',
    text: `Solar in ${state.state} pays for itself in ${state.avg_payback_years} years (rank #${paybackRank} of ${n} states, fastest first), ${Number(paybackDiff) <= 0 ? `${Math.abs(Number(paybackDiff))} years faster` : `${paybackDiff} years slower`} than the national average of ${natPayback.toFixed(1)} years. Over 20 years, homeowners can expect approximately $${state.avg_20yr_savings.toLocaleString()} in total savings, which is ${Number(savingsDiffPct) >= 0 ? `${savingsDiffPct}% above` : `${Math.abs(Number(savingsDiffPct))}% below`} the US average of $${Math.round(natSavings).toLocaleString()}.`,
  });

  // 3. Incentive stack
  const incentiveParts: string[] = [];
  incentiveParts.push(`the ${state.federal_tax_credit_pct}% federal ITC ($${federalCredit.toLocaleString()})`);
  if (state.state_tax_credit > 0) incentiveParts.push(`a ${state.state_tax_credit}% state tax credit ($${stateCredit.toLocaleString()})`);
  if (state.state_rebate > 0) incentiveParts.push(`a $${state.state_rebate.toLocaleString()} state rebate`);
  const totalIncentive = federalCredit + stateCredit + state.state_rebate;

  insights.push({
    title: 'Incentive Analysis',
    text: `A 6 kW system in ${state.state} costs $${grossCost6kw.toLocaleString()} before incentives ($${state.avg_system_cost_per_watt.toFixed(2)}/W vs national avg $${natCostPerWatt.toFixed(2)}/W). Available incentives include ${incentiveParts.join(', ')}, reducing the net cost to approximately $${netCost.toLocaleString()}. Total incentive value of $${totalIncentive.toLocaleString()} covers ${((totalIncentive / grossCost6kw) * 100).toFixed(0)}% of the gross system cost.`,
  });

  // 4. Grid economics & net metering
  const rateDiffPct = ((state.avg_electricity_rate - natElecRate) / natElecRate * 100).toFixed(0);
  const netMeteringLabel = state.net_metering === 'yes' ? 'full retail net metering' : state.net_metering === 'partial' ? 'partial net metering' : 'no statewide net metering';
  insights.push({
    title: 'Grid Economics',
    text: `${state.state}'s electricity rate of ${state.avg_electricity_rate.toFixed(1)}\u00A2/kWh is ${Number(rateDiffPct) >= 0 ? `${rateDiffPct}% above` : `${Math.abs(Number(rateDiffPct))}% below`} the national average of ${natElecRate.toFixed(1)}\u00A2/kWh. ${state.avg_electricity_rate >= natElecRate ? 'Higher rates mean each kWh your panels produce offsets more cost, improving ROI.' : 'Lower rates reduce per-kWh savings but the federal tax credit still anchors strong returns.'} The state has ${netMeteringLabel} — ${state.net_metering === 'yes' ? `one of ${netMeteringYes} states offering full retail credit for excess generation, which maximizes system value` : state.net_metering === 'partial' ? 'credit rates vary by utility, so check with your provider for exact buyback terms' : 'homeowners should size systems closer to actual consumption since excess generation earns reduced value'}.`,
  });

  return insights;
}
