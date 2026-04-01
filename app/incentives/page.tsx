import type { Metadata } from "next";
import { getAllIncentives, getAllStates } from "@/lib/db";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AdSlot } from "@/components/AdSlot";
import { FreshnessTag } from "@/components/FreshnessTag";

export const metadata: Metadata = {
  title: "Solar Incentives by State 2026 - Tax Credits, Rebates & SRECs",
  description: "Complete guide to solar incentives in all 50 US states. Federal 30% tax credit, state tax credits, rebates, SRECs, and net metering policies for 2026.",
  alternates: { canonical: "https://sunpowerpeek.com/incentives/" },
  openGraph: { url: "/incentives/" },
};

export default function IncentivesPage() {
  const incentives = getAllIncentives();
  const states = getAllStates();

  // Group incentives by state
  const byState: Record<string, typeof incentives> = {};
  for (const inc of incentives) {
    if (!byState[inc.state]) byState[inc.state] = [];
    byState[inc.state].push(inc);
  }

  const stateMap = Object.fromEntries(states.map(s => [s.abbr, s]));

  const typeColors: Record<string, string> = {
    tax_credit: "bg-blue-100 text-blue-800",
    rebate: "bg-green-100 text-green-800",
    srec: "bg-purple-100 text-purple-800",
    net_metering: "bg-yellow-100 text-yellow-800",
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Solar Incentives" }]} />

      <h1 className="text-3xl font-bold text-orange-800 mb-4">
        Solar Incentives by State (2026)
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Every US homeowner qualifies for the <strong>30% Federal Solar Investment Tax Credit</strong> through 2032.
        Many states offer additional tax credits, rebates, and Solar Renewable Energy Credits (SRECs).
      </p>

      <AdSlot id="8901234567" />

      {/* Federal incentive */}
      {byState["ALL"] && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Federal Incentive</h2>
          {byState["ALL"].map((inc, i) => (
            <div key={i} className="p-5 rounded-xl border-2 border-orange-300 bg-orange-50 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold text-orange-800">{inc.incentive_name}</p>
                  <p className="text-sm text-slate-600 mt-2">{inc.description}</p>
                </div>
                <span className="shrink-0 px-4 py-2 text-lg font-bold rounded-xl bg-orange-200 text-orange-800">{inc.value}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* State incentives */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">State Incentives</h2>
        <div className="space-y-6">
          {Object.entries(byState)
            .filter(([key]) => key !== "ALL")
            .sort(([a], [b]) => {
              const sa = stateMap[a];
              const sb = stateMap[b];
              return (sa?.state || a).localeCompare(sb?.state || b);
            })
            .map(([stateAbbr, incs]) => {
              const st = stateMap[stateAbbr];
              return (
                <div key={stateAbbr} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">
                      {st ? <a href={`/state/${st.slug}/`} className="hover:text-orange-600">{st.state}</a> : stateAbbr}
                    </h3>
                    <span className="text-sm text-slate-500">{incs.length} incentive{incs.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {incs.map((inc, i) => (
                      <div key={i} className="px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{inc.incentive_name}</p>
                            <p className="text-xs text-slate-500 mt-1">{inc.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-medium text-green-700">{inc.value}</span>
                            <div className="mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${typeColors[inc.type] || "bg-slate-100 text-slate-600"}`}>
                                {inc.type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {inc.expiration && (
                          <p className="text-xs text-slate-400 mt-1">Expires: {inc.expiration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <AdSlot id="9012345678" />

      {/* States without specific incentives */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-3">All States Qualify for Federal 30% Tax Credit</h2>
        <p className="text-sm text-slate-600 mb-4">
          Even states without additional state-level incentives benefit from the federal 30% solar investment tax credit.
          Click any state to see full solar cost and savings data.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {states.map(s => (
            <a key={s.abbr} href={`/state/${s.slug}/`} className="p-2 text-center rounded border border-slate-200 hover:border-orange-300 text-sm">
              {s.abbr}
            </a>
          ))}
        </div>
      </section>

      <FreshnessTag source="DSIRE, IRS, State Energy Offices" />
    </>
  );
}
