import { Metadata } from "next";
import { getAllStates } from "@/lib/db";
import { SolarCalculator } from "@/components/SolarCalculator";

export const metadata: Metadata = {
  title: "Solar Savings Calculator - Embeddable Widget",
  robots: "noindex, nofollow",
};

export default function EmbedSolarCalcPage() {
  const states = getAllStates();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <SolarCalculator
        states={states.map(s => ({
          abbr: s.abbr,
          state: s.state,
          avg_sun_hours: s.avg_sun_hours,
          avg_system_cost_per_watt: s.avg_system_cost_per_watt,
          federal_tax_credit_pct: s.federal_tax_credit_pct,
          state_tax_credit: s.state_tax_credit,
          state_rebate: s.state_rebate,
          avg_electricity_rate: s.avg_electricity_rate,
          net_metering: s.net_metering,
        }))}
      />
      <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>
        Powered by{" "}
        <a href="https://sunpowerpeek.com" target="_blank" rel="noopener" style={{ color: "#ea580c", textDecoration: "underline" }}>
          SunPowerPeek
        </a>
      </p>
    </div>
  );
}
