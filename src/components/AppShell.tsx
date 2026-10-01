import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router";
import {
  Activity as ActivityIcon,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronsUpDown,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  Users,
  Workflow as WorkflowIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ForgeLogo } from "./ForgeLogo";
import { FadeIn } from "./motion";
import { PAGE_MAX, SHELL_MAX } from "./app-ui";

/** Primary workspace navigation, shared by the desktop bar and the mobile sheet. */
const WORKSPACE_NAV = [
  { label: "Overview", segment: "", icon: LayoutDashboard },
  { label: "Projects", segment: "projects", icon: FolderKanban },
  { label: "Workflow", segment: "workflow", icon: WorkflowIcon },
  { label: "Analytics", segment: "analytics", icon: BarChart3 },
  { label: "Teams", segment: "teams", icon: Users },
  { label: "Activity", segment: "activity", icon: ActivityIcon },
  { label: "Settings", segment: "settings", icon: Settings },
] as const;

export function workspacePath(workspaceId: string, segment: string): string {
  return segment
    ? `/app/workspaces/${workspaceId}/${segment}`
    : `/app/workspaces/${workspaceId}`;
}

function isNavActive(pathname: string, target: string): boolean {
  if (pathname === target) return true;
  return pathname.startsWith(`${target}/`);
}

/**
 * Scroll behaviour: a new page always starts at the top. On a browser
 * back/forward navigation (POP) the browser restores the previous offset, so we
 * leave it alone.
 */
function ScrollManager() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === "POP") return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduce ? "auto" : "smooth" });
  }, [pathname, navigationType]);
  return null;
}

function navItemClass(active: boolean): string {
  return cn(
    "rounded-md px-2.5 py-1 text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "bg-secondary font-medium text-foreground"
      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
  );
}

function DesktopNav({ workspaceId }: { workspaceId: string }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Workspace" className="hidden flex-1 justify-center lg:flex">
      <div className="flex items-center gap-0.5">
        {WORKSPACE_NAV.map(({ label, segment }) => {
          const to = workspacePath(workspaceId, segment);
          const active = isNavActive(pathname, to);
          return (
            <Link
              key={label}
              to={to}
              aria-current={active ? "page" : undefined}
              className={navItemClass(active)}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileNav({
  workspaceId,
  onNavigate,
}: {
  workspaceId: string;
  onNavigate: () => void;
}) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Workspace" className="flex flex-col gap-0.5">
      {WORKSPACE_NAV.map(({ label, segment, icon: Icon }) => {
        const to = workspacePath(workspaceId, segment);
        const active = isNavActive(pathname, to);
        return (
          <Link
            key={label}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function WorkspaceSwitcher({ workspaceId }: { workspaceId: string }) {
  const navigate = useNavigate();
  const workspaces = useQuery(api.workspaces.listMyWorkspaces) ?? [];
  const active = workspaceId ? workspaces.find((w) => w._id === workspaceId) : undefined;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Switch workspace"
          className="h-8 max-w-[14rem] justify-start gap-2 px-2 text-[13px] font-medium"
        >
          <Building2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{active ? active.name : "Workspaces"}</span>
          <ChevronsUpDown className="ml-auto size-3 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w._id} onClick={() => navigate(workspacePath(w._id, ""))}>
            <span className="min-w-0 flex-1 truncate">{w.name}</span>
            <span className="text-[11px] text-muted-foreground">{w.projectCount} proj</span>
            {active?._id === w._id && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
        {workspaces.length === 0 && (
          <p className="px-2 py-3 text-xs text-muted-foreground">No workspaces yet.</p>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/app")}>
          <Plus /> New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountMenu({ workspaceId }: { workspaceId?: string }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar className="size-7">
            <AvatarFallback className="border border-border bg-secondary text-[10px] font-medium text-foreground">
              {(user?.name ?? user?.email ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal">
          {user?.name ?? user?.email ?? "Account"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/app")}>
          <Building2 /> All workspaces
        </DropdownMenuItem>
        {workspaceId && (
          <DropdownMenuItem onClick={() => navigate(`/app/workspaces/${workspaceId}/settings`)}>
            <Settings /> Workspace settings
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate("/app/notifications")}>
          <Bell /> Notifications
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationBell() {
  const navigate = useNavigate();
  const notifications = useQuery(api.analytics.listNotifications);
  const unread = notifications?.unreadCount ?? 0;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-8 text-muted-foreground hover:text-foreground"
      onClick={() => navigate("/app/notifications")}
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <Bell className="size-4" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold leading-none text-background">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Button>
  );
}

export function AppShell({
  children,
  workspaceId,
}: {
  children: React.ReactNode;
  workspaceId?: string;
}) {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const workspace = useQuery(
    api.workspaces.getWorkspace,
    workspaceId ? { workspaceId: workspaceId as never } : "skip",
  );
  const workspaceName = workspace?.workspace.name ?? "Workspace";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollManager />

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className={SHELL_MAX}>
          <Link
            to="/app"
            className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Forge workspaces"
          >
            <ForgeLogo className="size-5" />
            <span className="hidden text-[14px] font-semibold tracking-tight sm:inline">
              Forge
            </span>
          </Link>

          <span className="h-4 w-px shrink-0 bg-border" aria-hidden />

          {workspaceId && (
            <div className="flex min-w-0 items-center">
              <WorkspaceSwitcher workspaceId={workspaceId} />
            </div>
          )}

          {workspaceId && <DesktopNav workspaceId={workspaceId} />}

          <div className="ml-auto flex items-center gap-1">
            {workspaceId && (
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 lg:hidden"
                    aria-label="Open navigation"
                    aria-expanded={mobileOpen}
                  >
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 border-border bg-card p-0">
                  <SheetHeader className="border-b border-border px-4 py-3">
                    <SheetTitle className="flex items-center gap-2 text-sm">
                      <ForgeLogo className="size-4" />
                      <span className="truncate">{workspaceName}</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-2 py-3">
                    <MobileNav
                      workspaceId={workspaceId}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <NotificationBell />
            <span className="mx-0.5 hidden h-4 w-px bg-border sm:block" aria-hidden />
            <AccountMenu workspaceId={workspaceId} />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <FadeIn key={pathname} className={PAGE_MAX}>
          {children}
        </FadeIn>
      </main>
    </div>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const tone =
    role === "owner"
      ? "border-white/25 bg-white/10 text-foreground"
      : role === "admin"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
        : role === "member"
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          : "border-border bg-secondary text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", tone)}>
      {role}
    </Badge>
  );
}
