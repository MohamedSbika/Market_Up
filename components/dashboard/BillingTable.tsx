'use client';

/**
 * BillingTable — Tabular list of billing records with PDF download button.
 */
import { useState } from 'react';
import { formatDateFR } from '@/lib/utils';
import type { IBillingRecord } from '@/types';

interface BillingTableProps {
  records:   IBillingRecord[];
  isLoading?: boolean;
}

const statusConfig = {
  paid:     { label: 'Payé',     bg: '#F0FDF4', color: '#107C10', border: '#B7EBC0' },
  failed:   { label: 'Échoué',   bg: '#FFF5F5', color: '#D13438', border: '#FCA5A5' },
  refunded: { label: 'Remboursé', bg: '#F5F5F5', color: '#616161', border: '#E0E0E0' },
};

export function BillingTable({ records, isLoading = false }: BillingTableProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadPDF = async (id: string, invoiceNumber: string) => {
    setDownloading(id);
    try {
      const res = await fetch(`/api/dashboard/billing/${id}/pdf`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[BillingTable] PDF download error:', err);
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="divide-y divide-[#E0E0E0] animate-pulse">
        {[1,2,3].map((i) => (
          <div key={i} className="px-4 py-3 flex gap-4">
            <div className="h-4 bg-[#E0E0E0] rounded w-24" />
            <div className="h-4 bg-[#E0E0E0] rounded flex-1" />
            <div className="h-4 bg-[#E0E0E0] rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D1D1" strokeWidth="1.5" className="mx-auto mb-3">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <p className="text-sm text-[#616161]">Aucune facture pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr style={{ background: '#F5F5F5', borderBottom: '1px solid #E0E0E0' }}>
            {['N° Facture', 'Description', 'Montant HT', 'TVA', 'Total TTC', 'Statut', 'Date', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#616161]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => {
            const sCfg = statusConfig[record.status] ?? statusConfig.paid;
            return (
              <tr
                key={record._id}
                style={{
                  borderBottom: '1px solid #E0E0E0',
                  background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                }}
              >
                <td className="px-4 py-3 text-xs font-mono text-[#616161]">{record.invoiceNumber}</td>
                <td className="px-4 py-3 text-sm text-[#242424]">{record.label}</td>
                <td className="px-4 py-3 text-sm text-[#242424]">{record.amount.toFixed(2)} DT</td>
                <td className="px-4 py-3 text-sm text-[#616161]">{record.tva.toFixed(2)} DT</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#242424]">{record.amountTTC.toFixed(2)} DT</td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.border}` }}
                  >
                    {sCfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#616161]">
                  {formatDateFR(record.paidAt ?? record.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => downloadPDF(record._id, record.invoiceNumber)}
                    disabled={downloading === record._id}
                    className="flex items-center gap-1 text-xs text-[#0078D4] hover:text-[#106EBE] disabled:opacity-50"
                  >
                    {downloading === record._id ? (
                      <span className="w-3 h-3 border border-[#0078D4] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    )}
                    PDF
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
