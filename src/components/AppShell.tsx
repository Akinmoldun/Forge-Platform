import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  UserPlus,
  X,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resetGuestDemo } from "@/lib/guestDemo";
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
  const updateDisplayName = useMutation(api.users.updateDisplayName);
  const ensureWelcomeEmail = useMutation(api.users.ensureWelcomeEmail);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !user.isAnonymous && user.email) {
      ensureWelcomeEmail().catch(() => {});
    }
  }, [user, ensureWelcomeEmail]);

  const isGuest = user?.isAnonymous || !user || !user.email;
  const displayName = user?.name?.trim() || user?.email?.trim() || (isGuest ? "Guest" : "User");
  const initial = isGuest
    ? "G"
    : (user?.name?.trim() || user?.email?.trim() || "G").charAt(0).toUpperCase();

  const handleSaveName = async () => {
    if (!nameValue.trim() || saving) return;
    setSaving(true);
    try {
      await updateDisplayName({ name: nameValue.trim() });
      toast.success("Display name updated");
      setEditingName(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update display name");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="size-8 min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] inline-flex items-center justify-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            {user?.image ? (
              <AvatarImage src={user.image} alt="" className="object-cover" />
            ) : null}
            <AvatarFallback className="border border-border bg-[#F1F1F3] text-[12px] font-semibold text-[#0D0D0D]">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-[16px] border border-border bg-white p-2 shadow-none">
        <div className="px-2.5 py-1.5">
          {editingName ? (
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-medium text-[#575657]">Display name</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Your name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  className="h-8 flex-1 rounded-[8px] border border-border bg-white px-2 text-[12px] text-[#0D0D0D] outline-none focus:border-[#0D0D0D]"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={saving || !nameValue.trim()}
                  className="inline-flex size-8 items-center justify-center rounded-[8px] bg-[#0D0D0D] text-white hover:bg-[#262626] disabled:opacity-50"
                  aria-label="Save display name"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="inline-flex size-8 items-center justify-center rounded-[8px] border border-border text-[#575657] hover:bg-[#F1F1F3]"
                  aria-label="Cancel"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="truncate text-[13px] font-medium text-[#0D0D0D]">
                  {displayName}
                </p>
                {user?.email && user?.email !== displayName && (
                  <p className="truncate text-[11px] text-[#575657]">{user.email}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setNameValue(user?.name ?? "");
                  setEditingName(true);
                }}
                className="inline-flex size-6 items-center justify-center rounded-full text-[#575657] hover:bg-[#F1F1F3] hover:text-[#0D0D0D]"
                title="Edit display name"
                aria-label="Edit display name"
              >
                <Pencil className="size-3" />
              </button>
            </div>
          )}
        </div>
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
          onClick={() => navigate("/app/settings/profile")}
          className="rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
        >
          <User className="size-3.5 mr-2 text-[#575657]" /> Profile & settings
        </DropdownMenuItem>
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

function GuestDemoBanner({ workspaceId }: { workspaceId?: string }) {
  const { user } = useAuth();
  const convex = useConvex();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);

  if (!user?.isAnonymous) return null;

  const handleResetDemo = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const res = await resetGuestDemo(convex, workspaceId || "");
      toast.success("Demo reset fresh");
      navigate(`/app/workspaces/${res.workspaceId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset demo");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="bg-[#0D0D0D] text-white px-4 py-2 text-[12px] flex items-center justify-between gap-3 border-b border-[#262626]">
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-block size-2 rounded-full bg-[#83DD79] shrink-0" />
        <span className="truncate text-white/90 font-normal">
          You're exploring a demo. Create an account to keep your own work.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleResetDemo}
          disabled={resetting}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          {resetting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
          Reset demo
        </button>
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#0D0D0D] hover:bg-[#F1F1F3] transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
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

      {/* Guest demo banner - visible only to anonymous users */}
      <GuestDemoBanner workspaceId={workspaceId} />

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

