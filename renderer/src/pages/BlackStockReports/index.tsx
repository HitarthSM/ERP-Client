import React from 'react';
import { FileText } from 'lucide-react';

export default function BlackStockReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Black Stock Reports</h1>
        <p className="text-muted-foreground">
          View and generate reports related to black (unpublished) stock movements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Coming Soon</h3>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              Report generation for black stock is under development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
