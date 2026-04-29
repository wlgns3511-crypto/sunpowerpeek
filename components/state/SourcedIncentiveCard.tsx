// HCU 5-청크 Layer 1 — incentive card upgraded to surface .gov source URL +
// last-verified date. Used on /state/[slug]/ and /incentives/[state]/.
//
// Pilot states (TN/WA/UT/AL) + federal rows have full source attribution;
// non-pilot rows render without source badge but with the same shape.

import type { IncentiveRow } from '@/lib/state-facts';

interface Props {
  row: IncentiveRow;
  variant?: 'state' | 'federal';
}

const TYPE_LABEL: Record<string, string> = {
  tax_credit: 'Tax Credit',
  rebate: 'Rebate',
  srec: 'SREC / REC Program',
  net_metering: 'Net Metering',
  community_solar: 'Community Solar',
  utility_program: 'Utility Program',
  sales_tax_exemption: 'Sales-Tax Exemption',
  property_tax_exemption: 'Property-Tax Exemption',
  export_credit: 'Export Credit',
  performance_payment: 'Performance Payment',
  consumer_protection: 'Consumer Protection',
  information: 'Information / Resource',
  limitation_note: 'Status Note',
  depreciation: 'Depreciation (commercial)',
};

const TYPE_COLOR: Record<string, string> = {
  tax_credit: 'bg-blue-100 text-blue-800 border-blue-200',
  rebate: 'bg-green-100 text-green-800 border-green-200',
  srec: 'bg-purple-100 text-purple-800 border-purple-200',
  net_metering: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  community_solar: 'bg-teal-100 text-teal-800 border-teal-200',
  utility_program: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  sales_tax_exemption: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  property_tax_exemption: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  export_credit: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  performance_payment: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  consumer_protection: 'bg-amber-100 text-amber-800 border-amber-200',
  information: 'bg-slate-100 text-slate-700 border-slate-200',
  limitation_note: 'bg-rose-100 text-rose-800 border-rose-200',
  depreciation: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function SourcedIncentiveCard({ row, variant = 'state' }: Props) {
  const wrapperBg =
    variant === 'federal'
      ? 'bg-orange-50 border-orange-200'
      : 'bg-slate-50 border-slate-200';

  const titleColor = variant === 'federal' ? 'text-orange-800' : 'text-slate-800';
  const valueColor = variant === 'federal' ? 'text-orange-700' : 'text-slate-700';

  const isLimitation = row.type === 'limitation_note';

  return (
    <div className={`p-4 rounded-lg border ${wrapperBg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className={`font-semibold ${titleColor} ${isLimitation ? 'italic' : ''}`}>
          {row.name}
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap ${
            TYPE_COLOR[row.type] ?? 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {TYPE_LABEL[row.type] ?? row.type.replace(/_/g, ' ')}
        </span>
      </div>
      <p className={`text-sm font-medium ${valueColor} mb-1`}>{row.value}</p>
      <p className="text-sm text-slate-600">{row.description}</p>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
        {row.expiration && <span>Status: {row.expiration}</span>}
        {row.lastVerified && (
          <span className="text-emerald-700">
            Verified {row.lastVerified}
          </span>
        )}
        {row.sourceUrl && (
          <a
            href={row.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-700 hover:underline font-medium"
          >
            {row.source ? `Source: ${row.source}` : 'Source'} &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
