import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  LogOut,
  Plus,
  UserPlus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ForgeLogo } from "./ForgeLogo";
import { FadeIn } from "./motion";
import { PAGE_MAX, SHELL_MAX } from "./app-ui";

/** Primary workspace navigation tabs. */
const WORKSPACE_NAV = [
  { label: "Overview", segment: "" },
  { label: "Projects", segment: "projects" },
  { label: "Workflow", segment: "workflow" },
  { label: "Analytics", segment: "analytics" },
  { label: "Teams", segment: "teams" },
  { label: "Activity", segment: "activity" },
  { label: "Settings", segment: "settings" },
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

/** Nav tabs: active tab is a #F1F1F3 pill with ink text; inactive muted and turns ink on hover. */
function WorkspaceNavTabs({ workspaceId }: { workspaceId: string }) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Workspace"
      className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {WORKSPACE_NAV.map(({ label, segment }) => {
        const to = workspacePath(workspaceId, segment);
        const active = isNavActive(pathname, to);
        return (
          <Link
            key={label}
            to={to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-h-[36px] sm:min-h-[32px] shrink-0 items-center rounded-full px-3.5 py-1 text-[13px] font-medium transition-colors outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2",
              active
                ? "bg-[#F1F1F3] text-[#0D0D0D]"
                : "text-[#575657] hover:bg-[#F1F1F3]/60 hover:text-[#0D0D0D]",
            )}
          >
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
        <button
          type="button"
          aria-label="Switch workspace"
          className="inline-flex h-9 min-h-[44px] sm:min-h-[36px] max-w-[15rem] items-center gap-2 rounded-full border border-border bg-white px-3.5 text-[13px] font-medium text-[#0D0D0D] transition-colors hover:bg-[#F1F1F3] outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
        >
          <Building2 className="size-3.5 shrink-0 text-[#575657]" aria-hidden="true" />
          <span className="truncate">{active ? active.name : "Workspaces"}</span>
          <ChevronDown className="ml-auto size-3.5 shrink-0 text-[#575657]" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-[16px] border border-border bg-white p-1.5 shadow-none">
        <DropdownMenuLabel className="px-2 py-1.5 text-xs text-[#575657] font-medium">Switch workspace</DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem
            key={w._id}
            onClick={() => navigate(workspacePath(w._id, ""))}
            className="rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
          >
            <span className="min-w-0 flex-1 truncate">{w.name}</span>
            <span className="text-[11px] text-[#575657]">{w.projectCount} proj</span>
            {active?._id === w._id && <Check className="size-3.5 ml-2 text-[#0D0D0D]" />}
          </DropdownMenuItem>
        ))}
        {workspaces.length === 0 && (
          <p className="px-2.5 py-3 text-xs text-[#575657]">No workspaces yet.</p>
        )}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={() => navigate("/app")}
          className="rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
        >
          <Plus className="size-3.5 mr-2" /> New workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isGuest = user?.isAnonymous || !user || !user.email;
  const initial = isGuest
    ? "G"
    : (user?.name?.trim() || user?.email?.trim() || "G").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="size-8 min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] inline-flex items-center justify-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="border border-border bg-[#F1F1F3] text-[12px] font-semibold text-[#0D0D0D]">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-[16px] border border-border bg-white p-1.5 shadow-none">
        <DropdownMenuLabel className="truncate px-2.5 py-2 text-[13px] font-medium text-[#0D0D0D]">
          {isGuest ? "Guest" : user?.name || user?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {isGuest && (
          <DropdownMenuItem
            onClick={() => navigate("/signup")}
            className="rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] font-medium hover:bg-[#F1F1F3] cursor-pointer"
          >
            <UserPlus className="size-3.5 mr-2 text-[#575657]" /> Create an account
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => navigate("/app")}
          className="rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
        >
          <Building2 className="size-3.5 mr-2 text-[#575657]" /> All workspaces
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          className="rounded-[10px] px-2.5 py-2 text-[13px] text-[#B3261E] hover:bg-[#B3261E]/10 cursor-pointer"
        >
          <LogOut className="size-3.5 mr-2 text-[#B3261E]" /> Sign out
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
    <button
      type="button"
      className="relative flex size-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] items-center justify-center rounded-full text-[#575657] hover:bg-[#F1F1F3] hover:text-[#0D0D0D] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
      onClick={() => navigate("/app/notifications")}
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
    >
      <Bell className="size-4" />
      {unread > 0 && (
        <span
          className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#D78FC6]"
          aria-hidden="true"
        />
      )}
    </button>
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

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBFC] text-[#0D0D0D]">
      <ScrollManager />

      {/* Top bar: height 56px, white, 1px bottom border, sticky */}
      <header className="sticky top-0 z-40 h-[56px] border-b border-border bg-white flex items-center">
        <div className={SHELL_MAX}>
          {/* Logo & Brand Wordmark from landing page */}
          <Link
            to="/app"
            className="flex shrink-0 items-center gap-2.5 rounded-full py-1 outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
            aria-label="Forge home"
          >
            <ForgeLogo className="size-6 text-[#0D0D0D]" />
            <span className="text-[16px] font-semibold tracking-tight text-[#0D0D0D] select-none">
              Forge
            </span>
          </Link>

          <span className="h-4 w-px shrink-0 bg-border mx-1" aria-hidden="true" />

          {/* Workspace Switcher */}
          {workspaceId && (
            <div className="flex min-w-0 items-center">
              <WorkspaceSwitcher workspaceId={workspaceId} />
            </div>
          )}

          {/* Nav Tabs: horizontal scroll below 768px with no scrollbar */}
          {workspaceId && (
            <div className="min-w-0 flex-1 px-1">
              <WorkspaceNavTabs workspaceId={workspaceId} />
            </div>
          )}

          {/* Actions: Notification bell + Avatar */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <NotificationBell />
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* Content Container */}
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
      ? "border-border bg-[#F1F1F3] text-[#0D0D0D]"
      : role === "admin"
        ? "border-[#D6C6A1] bg-[#D6C6A1]/15 text-[#0D0D0D]"
        : role === "member"
          ? "border-[#83DD79] bg-[#83DD79]/15 text-[#0D0D0D]"
          : "border-border bg-white text-[#575657]";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        tone,
      )}
    >
      {role}
    </span>
  );
}

