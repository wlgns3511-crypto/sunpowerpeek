import type { Metadata } from "next";
import { getAllStates, getBestSolarStates, getFastestPaybackStates, getNationalAvgSunHours, getNationalAvgPayback, getNationalAvg20yrSavings } from "@/lib/db";
import { formatCurrency, formatSunHours } from "@/lib/format";

export const metadata: Metadata = {
  title: "SunPowerPeek - Costos y Ahorro de Energ&iacute;a Solar por Estado en EE.UU.",
  description: "Compare costos de paneles solares, ahorro e incentivos en los 50 estados de EE.UU. Calculadora solar gratuita.",
  alternates: {
    canonical: "/es/",
    languages: { en: "/", es: "/es/", "x-default": "/" },
  },
  openGraph: { url: "/es/" },
};

export default function HomeEs() {
  const states = getAllStates();
  const bestSolar = getBestSolarStates(5);
  const fastestPayback = getFastestPaybackStates(5);
  const avgSunHours = getNationalAvgSunHours();
  const avgPayback = getNationalAvgPayback();
  const avg20yrSavings = getNationalAvg20yrSavings();

  return (
    <>
      <h1 className="text-3xl font-bold text-orange-800 mb-4">
        Costos y Ahorro de Energ&iacute;a Solar por Estado
      </h1>
      <p className="text-slate-600 mb-2">
        Compare costos de paneles solares, ahorro e incentivos en los 50 estados.
        Promedio nacional: {formatSunHours(avgSunHours)} horas de sol, per&iacute;odo de recuperaci&oacute;n de {avgPayback} a&ntilde;os,
        {formatCurrency(avg20yrSavings)} de ahorro en 20 a&ntilde;os.
      </p>
      <p className="text-xs text-slate-400 mb-8">
        <a href="/" className="text-blue-500 hover:underline">English version</a>
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <section>
          <h2 className="text-xl font-bold mb-4 text-orange-700">Mejores Estados para Solar</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {bestSolar.map((s, i) => (
              <a
                key={s.abbr}
                href={`/es/state/${s.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100"
              >
                <span className="text-sm">
                  <span className="text-slate-400 mr-2">{i + 1}.</span>
                  {s.state}
                </span>
                <span className="text-sm font-medium text-orange-600">{formatSunHours(s.avg_sun_hours)} hrs</span>
              </a>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4 text-green-700">Recuperaci&oacute;n M&aacute;s R&aacute;pida</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {fastestPayback.map((s, i) => (
              <a
                key={s.abbr}
                href={`/es/state/${s.slug}/`}
                className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100"
              >
                <span className="text-sm">
                  <span className="text-slate-400 mr-2">{i + 1}.</span>
                  {s.state}
                </span>
                <span className="text-sm font-medium text-green-600">{s.avg_payback_years} a&ntilde;os</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Todos los estados */}
      <section>
        <h2 className="text-xl font-bold mb-4">Todos los Estados</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {states.map((s) => (
            <a
              key={s.abbr}
              href={`/es/state/${s.slug}/`}
              className="p-3 border border-slate-200 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all text-center"
            >
              <div className="font-semibold text-sm">{s.abbr}</div>
              <div className="text-xs text-slate-500">{formatSunHours(s.avg_sun_hours)} hrs</div>
              <div className="text-xs text-slate-400">{s.avg_payback_years} a&ntilde;os</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
