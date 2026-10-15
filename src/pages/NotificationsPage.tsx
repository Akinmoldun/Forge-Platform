import { useMutation, useSafeQuery, isConvexId } from "@/hooks/use-safe-query";
import { demoStore } from "@/data/in-memory-demo-store";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ListSkeleton, timeAgo } from "@/components/forge";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { Bell, BellRing, CheckCheck, Inbox } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { FadeIn } from "@/components/motion";

export default function NotificationsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const isDemo = Boolean(!isConvexId(workspaceId) || demoStore.isDemoWorkspace(workspaceId));
  const id = workspaceId as Id<"workspaces"> | undefined;

  const rawWorkspace = useSafeQuery(
    api.workspaces.getWorkspace,
    !isDemo && isConvexId(id) ? { workspaceId: id! } : "skip",
  );
  const rawNotifications = useSafeQuery(
    api.analytics.listNotifications,
    !isDemo && isConvexId(id) ? { workspaceId: id! } : "skip",
  );

  const workspace = isDemo ? demoStore.getWorkspace(workspaceId) : rawWorkspace;
  const notifications = isDemo ? { notifications: [], unreadCount: 0 } : rawNotifications;
  const markRead = useMutation(api.analytics.markNotificationRead);
  const markAllRead = useMutation(api.analytics.markAllNotificationsRead);
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // If a user types a notifications URL while not inside a workspace, redirect them to /app
  if (!workspaceId || workspace === null) {
    return <Navigate to="/app" replace />;
  }

  if (workspace === undefined) {
    return (
      <AppShell workspaceId={workspaceId}>
        <div className="mx-auto max-w-3xl">
          <ListSkeleton rows={5} />
        </div>
      </AppShell>
    );
  }

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
    <AppShell workspaceId={workspaceId}>
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="flex items-center justify-between pb-2">
            <div>
              <h1 className="text-[32px] font-[600] leading-tight tracking-tight text-[#0D0D0D]">Inbox</h1>
              <p className="mt-1 text-[13px] leading-5 text-[#575657]">
                {unread > 0 ? `${unread} unread` : "You're all caught up"}
              </p>
            </div>
            {unread > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 px-4 text-[13px]"
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
        </FadeIn>

        <div className="mt-6">
          <SectionErrorBoundary name="Notifications">
            {notifications === undefined ? (
              <ListSkeleton rows={5} />
            ) : rows.length === 0 ? (
              <EmptyState
                icon={<Inbox className="size-5" />}
                title="No notifications"
                description="Assignments, comments, and status changes that involve you will appear here."
              />
            ) : (
              <div className="overflow-hidden rounded-[16px] border border-border bg-white shadow-none">
                <motion.ul layout={reduce ? false : true} className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {rows.map((n) => (
                      <motion.li
                        key={n._id}
                        layout={reduce ? false : true}
                        initial={reduce ? false : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
                      >
                        <button
                          className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#F6F6F7]"
                          onClick={() => openNotification(n._id, n.resourceType, n.resourceId)}
                        >
                          <span
                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                              n.readAt
                                ? "border-border bg-[#F1F1F3] text-[#575657]"
                                : "border-[#D78FC6]/30 bg-[#D78FC6]/15 text-[#D78FC6]"
                            }`}
                          >
                            {n.readAt ? <Bell className="size-4" /> : <BellRing className="size-4" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className={`truncate text-[13px] ${n.readAt ? "text-[#575657]" : "font-medium text-[#0D0D0D]"}`}>
                                {n.title}
                              </p>
                              {!n.readAt && (
                                <span className="size-2 shrink-0 rounded-full bg-[#D78FC6]" />
                              )}
                            </div>
                            {n.body && (
                              <p className="mt-0.5 line-clamp-1 text-[12px] text-[#575657]">{n.body}</p>
                            )}
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] uppercase font-medium">
                                {n.type.replace(/\./g, " ")}
                              </Badge>
                              <span className="text-[11px] text-[#575657]">
                                {timeAgo(n.createdAt)}
                              </span>
                            </div>
                          </div>
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </div>
            )}
          </SectionErrorBoundary>
        </div>
      </div>
    </AppShell>
  );
}
