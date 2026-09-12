export type BlackReportType =
  | 'black_closing_stock'
  | 'black_low_stock'
  | 'black_stock_movements'
  | 'black_total_sales'
  | 'black_markup_profit'
  | 'black_top_products'
  | 'black_all_commissions'
  | 'black_unpaid_commissions';

export type BlackReportPeriod = 'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export type ReportOption = { value: BlackReportType; label: string };
export type ReportGroup = { label: string; options: ReportOption[] };

export const BLACK_REPORT_TYPE_GROUPS: ReportGroup[] = [
  {
    label: 'Stock & Inventory',
    options: [
      { value: 'black_closing_stock', label: 'Black Stock On Hand' },
      { value: 'black_low_stock', label: 'Low Black Stock Items' },
      { value: 'black_stock_movements', label: 'Black Stock Movement Log' },
    ],
  },
  {
    label: 'Sales & Profit',
    options: [
      { value: 'black_total_sales', label: 'Total Black Sales' },
      { value: 'black_markup_profit', label: 'Black Markup & Extra Profit' },
      { value: 'black_top_products', label: 'Top Selling Black Products' },
    ],
  },
  {
    label: 'Commissions',
    options: [
      { value: 'black_all_commissions', label: 'Facilitator Commissions Summary' },
      { value: 'black_unpaid_commissions', label: 'Unpaid / Owed Commissions' },
    ],
  },
];

export const BLACK_REPORT_TYPE_LABEL = Object.fromEntries(
  BLACK_REPORT_TYPE_GROUPS.flatMap((g) => g.options.map((o) => [o.value, o.label])),
) as Record<BlackReportType, string>;

const TYPE_CATEGORY: Partial<Record<BlackReportType, string>> = {};
for (const grp of BLACK_REPORT_TYPE_GROUPS) {
  for (const opt of grp.options) {
    TYPE_CATEGORY[opt.value] = grp.label;
  }
}

const CHIP_STYLES: Record<string, string> = {
  'Stock & Inventory': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Sales & Profit': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Commissions': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export function blackReportChipClass(reportType: BlackReportType | undefined): string {
  const cat = reportType ? (TYPE_CATEGORY[reportType] ?? '') : '';
  return CHIP_STYLES[cat] ?? 'bg-slate-100 text-slate-600';
}

export const PERIOD_LABEL: Record<string, string> = {
  DAILY: 'Daily',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  CUSTOM: 'Custom',
};

export const PERIOD_FILTER_OPTIONS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'CUSTOM', label: 'Custom' },
];

export const BLACK_REPORT_TYPE_FILTER_OPTIONS = BLACK_REPORT_TYPE_GROUPS.flatMap((g) =>
  g.options.map((o) => ({ value: o.value, label: o.label, group: g.label })),
);

export interface BlackReportLog {
  id: string;
  reportName: string;
  reportType: BlackReportType;
  reportPeriod: BlackReportPeriod;
  fromDate: string;
  toDate: string;
  locationId?: string;
  locationName?: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
  createdAt: string;
  summaryCards: Array<{ label: string; value: string }>;
  tableHeaders: string[];
  tableRows: string[][];
}

export interface GenerateBlackReportInput {
  reportType: BlackReportType;
  reportPeriod: BlackReportPeriod;
  fromDate: string;
  toDate: string;
  locationId?: string;
}
