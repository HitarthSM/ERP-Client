import { useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  LogIn,
  LogOut,
  Package,
  Plus,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Store,
  User,
  Wrench,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type Column } from '../../components/DataTable';
import { FormDrawer, Field, FormSection } from '../../components/FormDrawer';
import { FilterDropdown, type FilterOption } from '../../components/FilterDropdown';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import { ActivityLogs, useListActivityLogs } from '../../api';
import { loadErrorMessage } from '../../lib/api-error';
import { ACTIVITY_LOG_ACTIONS, type ActivityLog } from '../../types';

// ── Human-Friendly Activity Visual Configuration ─────────────────────────────

interface ActivityConfig {
  label: string;
  category: string;
  className: string;
  icon: React.ReactNode;
}

const ACTIVITY_MAP: Record<string, ActivityConfig> = {
  login: {
    label: 'User Signed In',
    category: 'Security',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: <LogIn size={12} />,
  },
  logout: {
    label: 'User Signed Out',
    category: 'Security',
    className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    icon: <LogOut size={12} />,
  },
  add_stock: {
    label: 'Stock Added',
    category: 'Inventory',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: <Plus size={12} />,
  },
  remove_stock: {
    label: 'Stock Deducted',
    category: 'Inventory',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: <Package size={12} />,
  },
  adjust_stock: {
    label: 'Stock Adjusted',
    category: 'Inventory',
    className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    icon: <Wrench size={12} />,
  },
  transfer_stock: {
    label: 'Stock Transferred',
    category: 'Inventory',
    className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    icon: <Package size={12} />,
  },
  create_product: {
    label: 'Product Created',
    category: 'Catalog',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: <Plus size={12} />,
  },
  update_product: {
    label: 'Product Updated',
    category: 'Catalog',
    className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: <Package size={12} />,
  },
  delete_product: {
    label: 'Product Removed',
    category: 'Catalog',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: <ShieldAlert size={12} />,
  },
  create_purchase_order: {
    label: 'Purchase Order Placed',
    category: 'Purchasing',
    className: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    icon: <ShoppingCart size={12} />,
  },
  receive_purchase_order: {
    label: 'PO Items Received',
    category: 'Purchasing',
    className: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    icon: <CheckCircle2 size={12} />,
  },
  cancel_purchase_order: {
    label: 'PO Cancelled',
    category: 'Purchasing',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: <ShieldAlert size={12} />,
  },
  create_store: {
    label: 'Store Created',
    category: 'Locations',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: <Store size={12} />,
  },
  update_store: {
    label: 'Store Updated',
    category: 'Locations',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    icon: <Store size={12} />,
  },
  create_user: {
    label: 'Staff Account Created',
    category: 'Team',
    className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    icon: <User size={12} />,
  },
  update_user: {
    label: 'Staff Account Updated',
    category: 'Team',
    className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    icon: <User size={12} />,
  },
  deactivate_user: {
    label: 'Staff Deactivated',
    category: 'Team',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    icon: <ShieldAlert size={12} />,
  },
};

function humanizeAction(action?: string): string {
  if (!action) return 'System Event';
  return ACTIVITY_MAP[action]?.label ?? action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderActivityBadge(action?: string) {
  if (!action) {
    return <span className="text-muted-foreground">—</span>;
  }
  const config = ACTIVITY_MAP[action];
  if (config) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground">
      <Activity size={12} />
      {humanizeAction(action)}
    </span>
  );
}

const ACTIVITY_FILTER_OPTIONS: FilterOption[] = [
  { value: '', label: 'All Activities' },
  ...ACTIVITY_LOG_ACTIONS.map((a) => ({
    value: a,
    label: ACTIVITY_MAP[a]?.label ?? humanizeAction(a),
  })),
];

// ── Friendly Reference & Time Helpers ────────────────────────────────────────

/** Converts a raw UUID into a clean short reference code (e.g. #LOG-78C91F) */
function friendlyRef(rawId?: string, prefix = 'REF'): string {
  if (!rawId) return '—';
  const clean = rawId.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return `#${prefix}-${clean}`;
}

/** Formats dates into human-first relative and absolute times */
function formatFriendlyTime(dateStr?: string | Date): { relative: string; full: string } {
  if (!dateStr) return { relative: '—', full: '—' };
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return { relative: '—', full: '—' };

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  let relative = '';
  if (diffSec < 45) {
    relative = 'Just now';
  } else if (diffMin < 60) {
    relative = `${diffMin}m ago`;
  } else if (diffHour < 24 && d.getDate() === now.getDate()) {
    relative = `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDay === 1) {
    relative = `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDay < 7) {
    relative = `${d.toLocaleDateString([], { weekday: 'short' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    relative = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return {
    relative,
    full: d.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };
}

// ── New Log Form State ───────────────────────────────────────────────────────

interface FormState {
  action: string;
  entityName: string;
  itemReference: string;
  note: string;
}

const EMPTY_FORM: FormState = {
  action: 'add_stock',
  entityName: 'Product',
  itemReference: '',
  note: '',
};

export default function ActivityLogsPage(): React.JSX.Element {
  const { user } = useAuth();
  const orgId = user?.organization?.id;
  const orgName = user?.organization?.name ?? 'My Business';
  const currentUserName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email || 'You';

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<string | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // TanStack Query for remote backend
  const { data: logs = [], isLoading, error, refetch } = useListActivityLogs();
  const createMutation = ActivityLogs.useCreate();

  const copyToClipboard = (text: string, label = 'Copied') => {
    void navigator.clipboard.writeText(text).then(
      () => toast.success(label),
      () => toast.error('Failed to copy'),
    );
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setCreateDrawerOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entityName = form.entityName.trim() || 'General';
    const itemReference = form.itemReference.trim();
    const note = form.note.trim();

    // Generate a valid backend UUID silently behind the scenes so the user is never asked for one
    const generatedEntityUuid = crypto.randomUUID();

    const detailsPayload: Record<string, any> = {};
    if (itemReference) detailsPayload.itemReference = itemReference;
    if (note) detailsPayload.note = note;
    detailsPayload.loggedBy = currentUserName;

    createMutation.mutate(
      {
        organizationId: orgId,
        userId: user?.id || undefined,
        action: form.action,
        entityName: itemReference ? `${entityName}: ${itemReference}` : entityName,
        entityId: generatedEntityUuid,
        details: Object.keys(detailsPayload).length > 0 ? detailsPayload : undefined,
      },
      {
        onSuccess: () => {
          void refetch();
          setCreateDrawerOpen(false);
          setForm(EMPTY_FORM);
          toast.success('Activity recorded successfully');
        },
      },
    );
  };

  // Filter and search
  const filteredLogs = useMemo(() => {
    let result = logs;

    if (activityFilter) {
      result = result.filter((l) => l.action === activityFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((l) => {
        const actionMatch = l.action?.toLowerCase().includes(q) || humanizeAction(l.action).toLowerCase().includes(q);
        const entityNameMatch = (l.entityName || l.entityType)?.toLowerCase().includes(q);
        const entityIdMatch = l.entityId?.toLowerCase().includes(q);
        const refMatch = friendlyRef(l.id, 'LOG').toLowerCase().includes(q) || friendlyRef(l.entityId, 'ITEM').toLowerCase().includes(q);
        const noteMatch = (l.details?.note || l.metadata?.note)?.toString().toLowerCase().includes(q);
        const userMatch = (l.userId?.toLowerCase().includes(q)) || (l.userId === user?.id && 'you'.includes(q));
        return actionMatch || entityNameMatch || entityIdMatch || refMatch || noteMatch || userMatch;
      });
    }

    return result;
  }, [logs, activityFilter, searchTerm, user?.id]);

  // Client-side pagination
  const limit = 15;
  const pagedRows = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredLogs.slice(start, start + limit);
  }, [filteredLogs, page, limit]);

  // ── Columns Designed for Human Users ───────────────────────────────────────
  const columns: Column<ActivityLog>[] = [
    {
      key: 'createdAt',
      label: 'When',
      width: '150px',
      render: (r) => {
        const time = formatFriendlyTime(r.createdAt);
        return (
          <div className="flex items-center gap-1.5" title={time.full}>
            <Clock size={12} className="text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground text-xs">{time.relative}</span>
          </div>
        );
      },
    },
    {
      key: 'action',
      label: 'Activity',
      render: (r) => renderActivityBadge(r.action),
    },
    {
      key: 'entityName',
      label: 'Affected Record',
      render: (r) => {
        const name = r.entityName || r.entityType || 'System';
        const refNumber = friendlyRef(r.entityId, 'ITEM');
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground text-xs">{name}</span>
            {r.entityId && (
              <button
                type="button"
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(r.entityId!, 'Record ID copied');
                }}
                title={`Click to copy ID: ${r.entityId}`}
              >
                <span>{refNumber}</span>
                <Copy size={10} />
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: 'userId',
      label: 'Performed By',
      render: (r) => {
        if (!r.userId) {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Bot size={13} className="text-muted-foreground/80" />
              <span>System</span>
            </span>
          );
        }

        const isMe = r.userId === user?.id || r.userId === user?.clerkUserId;
        if (isMe) {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <User size={13} />
              <span>You</span>
            </span>
          );
        }

        const staffRef = friendlyRef(r.userId, 'USER');
        return (
          <span
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(r.userId!, 'User ID copied');
            }}
            title={`Copy user ID: ${r.userId}`}
          >
            <User size={13} />
            <span>Staff {staffRef}</span>
          </span>
        );
      },
    },
    {
      key: 'details',
      label: 'Summary / Note',
      render: (r) => {
        const note = r.details?.note || r.metadata?.note;
        if (note) {
          return (
            <span className="text-xs text-muted-foreground truncate max-w-[220px] block" title={String(note)}>
              {String(note)}
            </span>
          );
        }
        return <span className="text-xs text-muted-foreground/60 italic">Automated event</span>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable<ActivityLog>
        title="Activity Logs"
        description="A clear timeline of operational actions and system events across your business."
        columns={columns}
        rows={pagedRows}
        total={filteredLogs.length}
        page={page}
        loading={isLoading}
        error={error ? loadErrorMessage(error, 'activity logs') : null}
        onPageChange={setPage}
        onSearchChange={(q) => {
          setSearchTerm(q);
          setPage(1);
        }}
        searchPlaceholder="Search by activity, product, staff, reference…"
        toolbar={
          <FilterDropdown
            label="Activity Type"
            value={activityFilter}
            onChange={(val) => {
              setActivityFilter(val);
              setPage(1);
            }}
            options={ACTIVITY_FILTER_OPTIONS}
          />
        }
        onRefetch={() => void refetch()}
        onAdd={handleOpenCreate}
        addLabel="Log Activity"
        isAdmin={true}
        onView={(row) => {
          setSelectedLog(row);
          setShowTechnicalDetails(false);
        }}
        emptyState={
          <div className="py-12 text-center">
            <Activity className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold text-foreground">No activities recorded yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Team actions like stock changes, sales, and catalog edits will appear here in plain English as they happen.
            </p>
            <Button onClick={handleOpenCreate} size="sm" variant="outline">
              <Plus size={14} className="mr-1.5" /> Log a Test Activity
            </Button>
          </div>
        }
      />

      {/* ── Human-Centric Audit Record View Drawer ──────────────────────────── */}
      <FormDrawer
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Activity Details"
        footer={
          <Button type="button" variant="outline" onClick={() => setSelectedLog(null)}>
            Close
          </Button>
        }
      >
        {selectedLog && (
          <div className="space-y-5 text-sm">
            <FormSection title="Activity Summary">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">What Happened:</span>
                  <div>{renderActivityBadge(selectedLog.action)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">When:</span>
                  <span className="font-medium text-foreground">
                    {formatFriendlyTime(selectedLog.createdAt).full}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reference Code:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                      {friendlyRef(selectedLog.id, 'LOG')}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(selectedLog.id, 'Log reference copied')}
                      title="Copy full reference ID"
                    >
                      <Copy size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Target Item">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Affected Record:</span>
                  <span className="font-medium text-foreground">
                    {selectedLog.entityName || selectedLog.entityType || 'General System'}
                  </span>
                </div>

                {selectedLog.entityId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Item Reference:</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-muted">
                        {friendlyRef(selectedLog.entityId, 'ITEM')}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(selectedLog.entityId!, 'Item reference copied')}
                        title="Copy full item ID"
                      >
                        <Copy size={12} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection title="Who Performed It">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Performed By:</span>
                  <span className="font-medium text-foreground">
                    {!selectedLog.userId
                      ? 'System Automation'
                      : selectedLog.userId === user?.id || selectedLog.userId === user?.clerkUserId
                        ? `You (${currentUserName})`
                        : `Staff Member (${friendlyRef(selectedLog.userId, 'USER')})`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Organisation:</span>
                  <span className="text-muted-foreground text-xs">{orgName}</span>
                </div>
              </div>
            </FormSection>

            {/* Note or Details (Plain Text First) */}
            {(selectedLog.details?.note || selectedLog.metadata?.note) && (
              <FormSection title="Notes / Remarks">
                <p className="p-3 bg-muted/60 rounded-md text-xs text-foreground border border-border">
                  {String(selectedLog.details?.note || selectedLog.metadata?.note)}
                </p>
              </FormSection>
            )}

            {/* Collapsible Technical / Audit Details for IT/Compliance */}
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 py-1"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              >
                <span>{showTechnicalDetails ? '▾ Hide Technical System Details' : '▸ Show Technical System Details (for IT & Auditors)'}</span>
              </button>

              {showTechnicalDetails && (
                <div className="mt-3 space-y-3 p-3 rounded-lg bg-muted/40 border border-border text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Exact Log UUID:</span>
                    <span className="break-all">{selectedLog.id}</span>
                  </div>
                  {selectedLog.entityId && (
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Entity UUID:</span>
                      <span className="break-all">{selectedLog.entityId}</span>
                    </div>
                  )}
                  {selectedLog.userId && (
                    <div>
                      <span className="text-muted-foreground block text-[11px]">User UUID:</span>
                      <span className="break-all">{selectedLog.userId}</span>
                    </div>
                  )}
                  {(selectedLog.details || selectedLog.metadata) && (
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Raw JSON Payload:</span>
                      <pre className="mt-1 p-2 bg-background rounded text-[11px] overflow-auto max-h-40 border border-border">
                        {JSON.stringify(selectedLog.details || selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </FormDrawer>

      {/* ── Human-Centric "Log Activity" Drawer (Zero UUID Inputs) ──────────── */}
      <FormDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        title="Log Business Activity"
        footer={
          <>
            <Button type="submit" form="log-activity-form" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Record Activity'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDrawerOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
          </>
        }
      >
        <form id="log-activity-form" onSubmit={handleCreateSubmit} className="space-y-4">
          <Field label="Organisation">
            <Input value={orgName} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
          </Field>

          <Field label="Activity Type" required>
            <Select
              value={form.action}
              onValueChange={(val) => setForm((prev) => ({ ...prev, action: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add_stock">Stock Added</SelectItem>
                <SelectItem value="adjust_stock">Stock Adjusted (Count Discrepancy)</SelectItem>
                <SelectItem value="remove_stock">Stock Deducted / Damaged</SelectItem>
                <SelectItem value="transfer_stock">Stock Transferred</SelectItem>
                <SelectItem value="create_product">Product Created</SelectItem>
                <SelectItem value="update_product">Product Updated</SelectItem>
                <SelectItem value="create_purchase_order">Purchase Order Placed</SelectItem>
                <SelectItem value="receive_purchase_order">PO Items Received</SelectItem>
                <SelectItem value="create_store">Store / Location Created</SelectItem>
                <SelectItem value="create_user">Staff Account Created</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="What Record Was Affected?" required>
            <Select
              value={form.entityName}
              onValueChange={(val) => setForm((prev) => ({ ...prev, entityName: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select item type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Product">Product / Item</SelectItem>
                <SelectItem value="Inventory">Inventory Stock</SelectItem>
                <SelectItem value="PurchaseOrder">Purchase Order</SelectItem>
                <SelectItem value="Store">Store / Branch</SelectItem>
                <SelectItem value="Customer">Customer Account</SelectItem>
                <SelectItem value="General">General Business Operation</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Item Name or Reference Number"
            hint="Enter a name or code your team recognizes (e.g. iPhone 15 Pro, PO-2026-042, Warehouse Central)"
          >
            <Input
              placeholder="e.g. iPhone 15 Pro, PO-2026-042"
              value={form.itemReference}
              onChange={(e) => setForm((prev) => ({ ...prev, itemReference: e.target.value }))}
            />
          </Field>

          <Field
            label="Notes / Reason (Optional)"
            hint="Provide a brief explanation for why this activity was performed"
          >
            <textarea
              className="w-full h-24 p-2.5 text-xs rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              placeholder="e.g. Physical inventory reconciliation after weekly audit."
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            />
          </Field>

          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground flex items-center gap-2 border border-border">
            <User size={14} className="text-primary shrink-0" />
            <span>
              This activity will be stamped under your account: <strong>{currentUserName}</strong>
            </span>
          </div>
        </form>
      </FormDrawer>
    </div>
  );
}
