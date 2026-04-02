import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllStates, getStateBySlug, getIncentivesByState, getNationalAvgSunHours, getNationalAvgPayback } from "@/lib/db";
import { formatCurrency, formatSunHours, formatPercent, getPaybackColor, getNetMeteringLabel, getSunTextColor } from "@/lib/format";

export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return getAllStates().slice(0, 300).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  return {
    title: `Costo de Paneles Solares en ${state.state} - Ahorro y Per&iacute;odo de Recuperaci&oacute;n`,
    description: `Paneles solares en ${state.state}: ${state.avg_sun_hours} horas de sol, recuperaci&oacute;n en ${state.avg_payback_years} a&ntilde;os, ${formatCurrency(state.avg_20yr_savings)} de ahorro en 20 a&ntilde;os.`,
    alternates: {
      canonical: `/es/state/${slug}/`,
      languages: { en: `/state/${slug}/`, es: `/es/state/${slug}/`, "x-default": `/state/${slug}/` },
    },
    openGraph: { url: `/es/state/${slug}/` },
  };
}

export default async function StatePageEs({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const incentives = getIncentivesByState(state.abbr);
  const nationalSun = getNationalAvgSunHours();
  const nationalPayback = getNationalAvgPayback();

  const systemCost6kw = Math.round(state.avg_system_cost_per_watt * 6000);
  const federalCredit = Math.round(systemCost6kw * 0.3);
  const netCost = systemCost6kw - federalCredit - (state.state_tax_credit > 0 ? Math.round(systemCost6kw * state.state_tax_credit / 100) : 0) - state.state_rebate;

  const sunDiff = state.avg_sun_hours - nationalSun;
  const isAboveAvgSun = sunDiff > 0;

  return (
    <>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:text-orange-600">Inicio</a>
        {" > "}
        <span>{state.state}</span>
      </nav>

      <h1 className="text-3xl font-bold text-orange-800 mb-2">
        Costos y Ahorro de Energ&iacute;a Solar en {state.state}
      </h1>
      <p className="text-lg text-slate-600 mb-2">
        {state.state} tiene <strong className={getSunTextColor(state.avg_sun_hours)}>{formatSunHours(state.avg_sun_hours)}</strong> horas de sol al d&iacute;a
        con un per&iacute;odo de recuperaci&oacute;n de <strong className={getPaybackColor(state.avg_payback_years)}>{state.avg_payback_years} a&ntilde;os</strong>.
        Ahorro estimado de <strong className="text-green-700">{formatCurrency(state.avg_20yr_savings)}</strong> en 20 a&ntilde;os.
      </p>
      <p className="text-xs text-slate-400 mb-6">
        <a href={`/state/${slug}/`} className="text-blue-500 hover:underline">English version</a>
      </p>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Horas de Sol</p>
          <p className="text-2xl font-bold text-orange-700">{formatSunHours(state.avg_sun_hours)}</p>
          <p className="text-xs text-slate-500">por d&iacute;a</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Costo Sistema 6kW</p>
          <p className="text-2xl font-bold text-blue-700">${systemCost6kw.toLocaleString()}</p>
          <p className="text-xs text-slate-500">antes de incentivos</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Per&iacute;odo de Recuperaci&oacute;n</p>
          <p className="text-2xl font-bold text-green-700">{state.avg_payback_years} a&ntilde;os</p>
          <p className="text-xs text-slate-500">promedio</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Ahorro 20 A&ntilde;os</p>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(state.avg_20yr_savings)}</p>
          <p className="text-xs text-slate-500">estimado</p>
        </div>
      </div>

      {/* Desglose de costos */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">Desglose de Costos Solares en {state.state}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-slate-600">Concepto</th>
                <th className="text-right px-4 py-2 font-medium text-slate-600">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2">Costo del Sistema 6kW (${state.avg_system_cost_per_watt}/W)</td>
                <td className="px-4 py-2 text-right font-medium">${systemCost6kw.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="px-4 py-2 text-green-700">Cr&eacute;dito Fiscal Federal (30%)</td>
                <td className="px-4 py-2 text-right font-medium text-green-700">-${federalCredit.toLocaleString()}</td>
              </tr>
              {state.state_tax_credit > 0 && (
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-green-700">Cr&eacute;dito Fiscal Estatal ({state.state_tax_credit}%)</td>
                  <td className="px-4 py-2 text-right font-medium text-green-700">-${Math.round(systemCost6kw * state.state_tax_credit / 100).toLocaleString()}</td>
                </tr>
              )}
              {state.state_rebate > 0 && (
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-2 text-green-700">Reembolso Estatal</td>
                  <td className="px-4 py-2 text-right font-medium text-green-700">-${state.state_rebate.toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-t-2 border-slate-300 bg-orange-50">
                <td className="px-4 py-2 font-bold">Costo Neto</td>
                <td className="px-4 py-2 text-right font-bold text-orange-700">${netCost.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Datos clave */}
      <section className="mb-8 grid md:grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
          <p className="text-xs uppercase tracking-wider font-medium">Medici&oacute;n Neta</p>
          <p className="text-lg font-bold mt-1">{getNetMeteringLabel(state.net_metering)}</p>
        </div>
        <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Tarifa El&eacute;ctrica</p>
          <p className="text-lg font-bold text-slate-800 mt-1">{state.avg_electricity_rate.toFixed(2)}&cent;/kWh</p>
        </div>
        <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Factura Mensual</p>
          <p className="text-lg font-bold text-slate-800 mt-1">${state.avg_monthly_bill}/mes</p>
        </div>
      </section>

      {/* Incentivos */}
      {incentives.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-3">Incentivos Solares en {state.state}</h2>
          <div className="space-y-3">
            {incentives.map((inc, i) => (
              <div key={i} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{inc.incentive_name}</p>
                    <p className="text-sm text-slate-600 mt-1">{inc.description}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">{inc.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Recursos Relacionados</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://powerbillpeek.com" className="text-orange-600 hover:underline">Tarifas de Electricidad</a>
          <a href="https://propertytaxpeek.com" className="text-orange-600 hover:underline">Impuestos a la Propiedad</a>
        </div>
      </section>
    </>
  );
}
