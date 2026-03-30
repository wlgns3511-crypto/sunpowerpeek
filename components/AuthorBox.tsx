export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-amber-50 border-amber-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
        <span>☀️</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">SunPowerPeek Research Team</span>
          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-medium">Solar Energy & Clean Energy Analysts</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          Our renewable energy researchers track solar panel costs, utility rates, state incentives, and payback periods across all 50 states. Data sourced from EIA, NREL, and DSIRE databases.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">✓ EIA Data Sourced</span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">✓ NREL Verified</span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">✓ 50-State Coverage</span>
        </div>
      </div>
    </div>
  );
}
