// Notifications: unread highlighting, mark-one/mark-all-read, deep links.
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ListSkeleton, timeAgo } from "@/components/forge";
import { Bell, BellRing, CheckCheck, Inbox } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function NotificationsPage() {
  const notifications = useQuery(api.analytics.listNotifications);
  const markRead = useMutation(api.analytics.markNotificationRead);
  const markAllRead = useMutation(api.analytics.markAllNotificationsRead);
  const navigate = useNavigate();

  const rows = notifications?.notifications ?? [];
  const unread = notifications?.unreadCount ?? 0;

  const openNotification = async (id: string, resourceType?: string, resourceId?: string) => {
    try {
      if (!rows.find((n) => n._id === id)?.readAt) {
        await markRead({ notificationId: id as never });
      }
    } catch {
      // non-fatal
    }
    if (resourceType === "issue" && resourceId) {
      navigate(`/app/issues/${resourceId}`);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-[-0.02em]">Notifications</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {unread > 0 ? `${unread} unread` : "You're all caught up"}
            </p>
          </div>
          {unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                markAllRead()
                  .then(() => toast.success("All marked as read"))
                  .catch((e) => toast.error(e.message))
              }
            >
              <CheckCheck /> Mark all read
            </Button>
          )}
        </div>

        <div className="mt-8">
          {notifications === undefined ? (
            <ListSkeleton rows={5} />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-5" />}
              title="No notifications"
              description="Assignments, comments, and status changes that involve you will appear here."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <ul className="divide-y divide-border">
                {rows.map((n) => (
                  <li key={n._id}>
                    <button
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/60"
                      onClick={() => openNotification(n._id, n.resourceType, n.resourceId)}
                    >
                      <span
                        className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-md border ${
                          n.readAt
                            ? "border-border bg-secondary text-muted-foreground"
                            : "border-white/20 bg-secondary text-foreground"
                        }`}
                      >
                        {n.readAt ? <Bell className="size-4" /> : <BellRing className="size-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`truncate text-sm ${n.readAt ? "" : "font-medium"}`}>
                            {n.title}
                          </p>
                          {!n.readAt && (
                            <span className="size-1.5 shrink-0 rounded-full bg-foreground" />
                          )}
                        </div>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] uppercase">
                            {n.type.replace(/\./g, " ")}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {timeAgo(n.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
