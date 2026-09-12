import { Printer, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { type BlackReportLog, BLACK_REPORT_TYPE_LABEL } from './constants';

interface Props {
  report: BlackReportLog | null;
  onClose: () => void;
}

export function ReportDetailModal({ report, onClose }: Props): React.ReactElement | null {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-[800px] flex-col overflow-hidden rounded-xl bg-background shadow-2xl border border-border print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Modal Toolbar (hidden in print) */}
        <div className="flex items-center justify-between border-b px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{report.reportName}</span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              {report.reportPeriod}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer size={14} />
              Print / Export PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-foreground">{report.reportName}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Type: {BLACK_REPORT_TYPE_LABEL[report.reportType] || report.reportType}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Location: <strong className="text-foreground">{report.locationName || 'All Locations'}</strong></p>
                <p>Generated: {new Date(report.createdAt).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {report.summaryCards && report.summaryCards.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {report.summaryCards.map((card, i) => (
                <div key={i} className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-[11px] font-medium text-muted-foreground">{card.label}</p>
                  <p className="text-lg font-bold text-foreground mt-0.5">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  {report.tableHeaders.map((head, idx) => (
                    <th key={idx} className="px-4 py-3 border-b">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={report.tableHeaders.length} className="px-4 py-8 text-center text-muted-foreground">
                      No records found for this period.
                    </td>
                  </tr>
                ) : (
                  report.tableRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-muted/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap text-foreground font-medium">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
