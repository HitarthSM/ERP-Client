import { ActivityLogTable } from '../../components/ActivityLogTable';

/**
 * Org-wide activity list (GET /api/v1/activity-logs/list).
 * Replaces the old create/recent-browser-only stub that advertised an API gap.
 * Same data/columns as Audit Log — see ActivityLogTable — different title framing.
 */
export default function ActivityLogsPage(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <ActivityLogTable
        title="Activity Logs"
        description="Organisation activity across sales, inventory, users, and settings."
      />
    </div>
  );
}
