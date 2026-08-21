import { useState } from 'react';
import { Activity } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { useListActivityLogs } from '../../api';
import { loadErrorMessage } from '../../lib/api-error';
import type { ActivityLog } from '../../types';

/**
 * Org-wide activity list (GET /api/v1/activity-logs/list).
 * Replaces the old create/recent-browser-only stub that advertised an API gap.
 */
export default function ActivityLogsPage(): React.JSX.Element {
  const [page, setPage] = useState(1);
  const { data: logs = [], isLoading, error, refetch } = useListActivityLogs();

  return (
    <div className="space-y-4">
      <DataTable<ActivityLog>
        title="Activity Logs"
        description="Organisation activity across sales, inventory, users, and settings."
        columns={[
          {
            key: 'action',
            label: 'Action',
            render: (r) => (
              <span className="inline-flex items-center gap-1.5">
                <Activity size={13} className="text-muted-foreground shrink-0" />
                <span className="font-medium">{r.action ?? '—'}</span>
              </span>
            ),
          },
          {
            key: 'entityName',
            label: 'Entity',
            render: (r) => r.entityName ?? '—',
          },
          {
            key: 'entityId',
            label: 'Entity ID',
            render: (r) =>
              r.entityId ? (
                <span className="font-mono text-xs text-muted-foreground">{r.entityId}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: 'userId',
            label: 'User',
            render: (r) =>
              r.userId ? (
                <span className="font-mono text-xs">{r.userId}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: 'createdAt',
            label: 'When',
            render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'),
          },
        ]}
        rows={logs}
        total={logs.length}
        page={page}
        loading={isLoading}
        error={error ? loadErrorMessage(error, 'activity logs') : null}
        onPageChange={setPage}
        hideSearch
        onRefetch={() => void refetch()}
      />
    </div>
  );
}
