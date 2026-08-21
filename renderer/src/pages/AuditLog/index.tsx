import { ActivityLogTable } from '../../components/ActivityLogTable';

// Same data/columns as Activity Logs — see ActivityLogTable — different title framing.
export default function AuditLog(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <ActivityLogTable
        title="Audit Log"
        description="System activity and change history across the organisation."
      />
    </div>
  );
}
