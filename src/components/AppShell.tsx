import { useMutation, useConvex } from "convex/react";
import { useSafeQuery } from "@/hooks/use-safe-query";
import { api } from "@/convex/_generated/api";
import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate, useNavigationType } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  UserPlus,
  X,
  Loader2,
  User,
  Search,
  LayoutDashboard,
  FolderKanban,
  GitBranch,
  BarChart3,
  Users,
  History,
  Settings,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Keyboard,
  Star,
  KanbanSquare,
  List,
  SlidersHorizontal,
  MoreHorizontal,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkspaceIllustration, ProjectIllustration, NotionAvatarIllustration } from "@/components/Illustrations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { resetGuestDemo } from "@/lib/guestDemo";
import { isDemoMode } from "@/lib/demoMode";
import { isDemoId } from "@/lib/idValidation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ForgeLogo } from "./ForgeLogo";
import { FadeIn } from "./motion";
import { CreateIssueDialog, CreateProjectDialog } from "./dialogs";
import { CommandPaletteDialog } from "./CommandPaletteDialog";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { InviteMembersDialog } from "./InviteMembersDialog";
import { AppBreadcrumbs } from "./AppBreadcrumbs";

/** Primary workspace navigation rows. */
const WORKSPACE_NAV = [
  { label: "Overview", segment: "", icon: LayoutDashboard },
  { label: "Projects", segment: "projects", icon: FolderKanban },
  { label: "Workflow", segment: "workflow", icon: GitBranch },
  { label: "Analytics", segment: "analytics", icon: BarChart3 },
  { label: "Teams", segment: "teams", icon: Users },
  { label: "Activity", segment: "activity", icon: History },
  { label: "Settings", segment: "settings", icon: Settings },
] as const;

export function workspacePath(workspaceId: string, segment: string): string {
  return segment
    ? `/app/workspaces/${workspaceId}/${segment}`
    : `/app/workspaces/${workspaceId}`;
}

function isNavActive(pathname: string, target: string, isRoot = false): boolean {
  if (pathname === target) return true;
  if (isRoot) return pathname === `${target}/overview`;
  return pathname.startsWith(`${target}/`);
}

/** Returns true if the route belongs to a workspace. */
export function isWorkspaceRoute(pathname: string): boolean {
  if (
    pathname === "/app" ||
    pathname === "/app/" ||
    pathname.startsWith("/app/settings") ||
    pathname === "/invite" ||
    pathname.startsWith("/invite/")
  ) {
    return false;
  }
  return /^\/app\/(workspaces|projects|issues)\/[^/]+/.test(pathname);
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


// ---------------------------------------------------------------------------
// Account menu
// ---------------------------------------------------------------------------
function AccountMenu({
  onOpenShortcuts,
  collapsed = false,
}: {
  onOpenShortcuts?: () => void;
  collapsed?: boolean;
}) {
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

  const isGuest = Boolean(user?.isAnonymous);
  const displayName = user?.name?.trim() || user?.email?.trim() || (isGuest ? "Guest" : "User");

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
          className={cn(
            "group flex items-center rounded-[10px] text-left transition-colors outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2",
            collapsed
              ? "size-10 justify-center hover:bg-[#ECECEE]"
              : "w-full gap-2.5 p-1.5 hover:bg-[#ECECEE]"
          )}
          aria-label="Account menu"
        >
          <Avatar className="size-7 shrink-0">
            {user?.image ? (
              <AvatarImage src={user.image} alt="" className="object-cover" />
            ) : null}
            <AvatarFallback className="border border-border bg-[#FBFBFC]">
              <NotionAvatarIllustration name={displayName} size={26} />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-medium text-[#0D0D0D] leading-tight">
                  {displayName}
                </p>
                {isGuest && (
                  <span className="rounded bg-[#F1F1F3] px-1.5 py-0.2 text-[10px] font-medium text-[#575657] border border-border/60 shrink-0">
                    Demo
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-[#575657]">
                {isGuest ? "Guest demo" : user?.email ?? "Signed in"}
              </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={collapsed ? "start" : "end"}
        side="top"
        className="w-64 rounded-[16px] border border-border bg-white p-2 shadow-none"
      >
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
        {onOpenShortcuts && (
          <DropdownMenuItem
            onClick={onOpenShortcuts}
            className="rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
          >
            <Keyboard className="size-3.5 mr-2 text-[#575657]" /> Keyboard shortcuts
          </DropdownMenuItem>
        )}
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

// ---------------------------------------------------------------------------
// Guest Demo Banner
// ---------------------------------------------------------------------------
function GuestDemoBanner({ workspaceId }: { workspaceId?: string }) {
  const { user } = useAuth();
  const convex = useConvex();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [hidden, setHidden] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("forge_hide_demo_session") === "true";
    } catch {
      return false;
    }
  });

  if (!user?.isAnonymous || hidden) return null;

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

  const handleHideSession = () => {
    try {
      sessionStorage.setItem("forge_hide_demo_session", "true");
    } catch {
      /* ignore */
    }
    setHidden(true);
  };

  return (
    <div className="h-[36px] bg-gradient-to-r from-[#F7F2EC] via-[#F1F4F9] to-[#F3F7ED] text-[#0D0D0D] px-4 text-[12px] flex items-center justify-between border-b border-black/[0.08] shrink-0 select-none">
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate text-[#0D0D0D] font-normal">
          You're exploring a demo workspace. Changes here are temporary.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          to="/signup"
          className="text-[12px] font-medium text-[#0D0D0D] underline hover:text-[#575657] transition-colors"
        >
          Create account
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex size-6 items-center justify-center rounded-[6px] text-[#575657] hover:bg-black/[0.05] hover:text-[#0D0D0D] transition-colors"
              aria-label="Demo options"
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-[12px] border border-border bg-white p-1 shadow-none">
            <DropdownMenuItem
              onClick={handleResetDemo}
              disabled={resetting}
              className="rounded-[8px] text-[12px] text-[#0D0D0D] cursor-pointer"
            >
              {resetting ? <Loader2 className="size-3 animate-spin mr-2" /> : <RefreshCw className="size-3 mr-2 text-[#575657]" />}
              Reset demo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleHideSession}
              className="rounded-[8px] text-[12px] text-[#575657] cursor-pointer"
            >
              <EyeOff className="size-3 mr-2" />
              Hide for this session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AppShell
// ---------------------------------------------------------------------------
export function AppShell({
  children,
  workspaceId: propWorkspaceId,
  pageActions,
}: {
  children: React.ReactNode;
  workspaceId?: string;
  pageActions?: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // If outside workspace
  const isInsideWorkspace = isWorkspaceRoute(pathname);

  // Current active project or issue if on project/issue page
  const activeProjectId = pathname.match(/^\/app\/projects\/([^/]+)/)?.[1];
  const activeIssueId = pathname.match(/^\/app\/issues\/([^/]+)/)?.[1];
  const isValidActiveIssueId = Boolean(
    activeIssueId && activeIssueId !== "undefined" && activeIssueId !== "null"
  );
  const isValidActiveProjectId = Boolean(
    activeProjectId && activeProjectId !== "undefined" && activeProjectId !== "null"
  );

  const issueDetail = useSafeQuery(
    api.issues.getIssue,
    isValidActiveIssueId ? { issueId: activeIssueId as Id<"issues"> } : "skip"
  );
  const activeProjectDetail = useSafeQuery(
    api.projects.getProject,
    !propWorkspaceId && isValidActiveProjectId ? { projectId: activeProjectId as Id<"projects"> } : "skip"
  );

  const rawWsId =
    propWorkspaceId ||
    activeProjectDetail?.project?.workspaceId ||
    issueDetail?.workspaceId;

  const effectiveWorkspaceId =
    rawWsId && rawWsId !== "undefined" && rawWsId !== "null" ? rawWsId : undefined;

  const workspaceId = effectiveWorkspaceId;
  const isValidWsId = Boolean(
    workspaceId && workspaceId !== "undefined" && workspaceId !== "null"
  );

  // Queries (safe for both real Convex IDs and demo IDs)
  // Always load user's workspaces when authenticated or in demo mode so workspace switcher & logo routing work everywhere
  const myWorkspaces = useSafeQuery(
    api.workspaces.listMyWorkspaces,
    user || isDemoMode() ? {} : "skip"
  );
  const currentWorkspace = useSafeQuery(
    api.workspaces.getWorkspace,
    isValidWsId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );
  const projects = useSafeQuery(
    api.projects.listProjects,
    isValidWsId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );
  const notifications = useSafeQuery(
    api.analytics.listNotifications,
    isInsideWorkspace && isValidWsId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );

  const unreadCount = notifications?.unreadCount ?? 0;

  // Persist active workspace in localStorage for instant routing
  useEffect(() => {
    if (workspaceId && !isDemoId(workspaceId) && workspaceId !== "undefined" && workspaceId !== "null") {
      try {
        localStorage.setItem("forge_last_active_workspace", workspaceId);
      } catch {
        // ignore
      }
    }
  }, [workspaceId]);

  // Logo destination: dashboard if logged in, landing page if logged out
  const dashboardHref = useMemo(() => {
    const isDemo = isDemoMode();
    if (!user && !isDemo) return "/";

    if (effectiveWorkspaceId) {
      return `/app/workspaces/${effectiveWorkspaceId}`;
    }
    if (isDemo) {
      return "/app/workspaces/demo-ws-northstar";
    }

    try {
      const lastWs = localStorage.getItem("forge_last_active_workspace");
      if (lastWs && lastWs !== "undefined" && lastWs !== "null" && myWorkspaces?.some((w) => w._id === lastWs)) {
        return `/app/workspaces/${lastWs}`;
      }
    } catch {
      // ignore
    }

    if (myWorkspaces && myWorkspaces.length > 0) {
      return `/app/workspaces/${myWorkspaces[0]._id}`;
    }

    return "/app";
  }, [user, effectiveWorkspaceId, myWorkspaces]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === dashboardHref) {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const activeProject =
    projects?.find((p) => p._id === activeProjectId) ||
    (issueDetail
      ? {
          _id: issueDetail.project._id,
          name: issueDetail.project.name,
          key: issueDetail.project.key,
          color: issueDetail.project.color,
          iconKey: issueDetail.project.iconKey,
        }
      : undefined);

  const activeIssue = issueDetail
    ? {
        _id: issueDetail.issue._id,
        title: issueDetail.issue.title,
        number: issueDetail.issue.number,
        key: issueDetail.project.key,
      }
    : null;

  // Sidebar collapse state (persisted in localStorage)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("forge_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("forge_sidebar_collapsed", String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Mobile drawer open state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Command palette state
  const [commandOpen, setCommandOpen] = useState(false);

  // Keyboard shortcuts dialog state
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // New Issue dialog state
  const [newIssueOpen, setNewIssueOpen] = useState(false);

  // New Project dialog state
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  // Invite member dialog state
  const [inviteOpen, setInviteOpen] = useState(false);

  // Pinned projects in localStorage
  const storagePinKey = `forge_pinned_${workspaceId || "global"}_${user?._id || "anon"}`;
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storagePinKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const togglePinProject = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPinnedIds((prev) => {
      const next = prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId];
      try {
        localStorage.setItem(storagePinKey, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Section collapse states
  const [workspaceSectionCollapsed, setWorkspaceSectionCollapsed] = useState(false);
  const [projectsSectionCollapsed, setProjectsSectionCollapsed] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const toggleProjectExpanded = (pId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedProjects((prev) => ({ ...prev, [pId]: !prev[pId] }));
  };

  // Keyboard shortcut listener
  useEffect(() => {
    let lastKey = "";
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside text inputs/contenteditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox");

      // Global Command palette: Cmd+K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }

      // Close drawer on Escape
      if (e.key === "Escape") {
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
        return;
      }

      if (isInput) return;

      // Single-key shortcuts
      if (e.key === "[") {
        e.preventDefault();
        toggleCollapsed();
        return;
      }

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        setNewIssueOpen(true);
        return;
      }

      // Sequence: G then O / G then P
      const now = Date.now();
      if (e.key.toLowerCase() === "g") {
        lastKey = "g";
        lastKeyTime = now;
        return;
      }

      if (lastKey === "g" && now - lastKeyTime < 1000) {
        if (e.key.toLowerCase() === "o" && workspaceId) {
          e.preventDefault();
          navigate(`/app/workspaces/${workspaceId}`);
          lastKey = "";
          return;
        }
        if (e.key.toLowerCase() === "p" && workspaceId) {
          e.preventDefault();
          navigate(`/app/workspaces/${workspaceId}/projects`);
          lastKey = "";
          return;
        }
      }
      lastKey = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileDrawerOpen, workspaceId, navigate]);

  // If outside workspace (e.g. /app, /app/settings/profile, /invite)
  if (!isInsideWorkspace) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FBFBFC] text-[#0D0D0D]">
        <ScrollManager />
        <GuestDemoBanner workspaceId={workspaceId} />

        {/* 56px Top bar outside workspace */}
        <header className="sticky top-0 z-40 h-[56px] border-b border-border bg-white flex items-center">
          <div className="mx-auto flex h-14 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6">
            <Link
              to={dashboardHref}
              onClick={handleLogoClick}
              className="flex shrink-0 items-center gap-2.5 rounded-full py-1 outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2"
              aria-label="Forge home"
            >
              <ForgeLogo className="size-6 text-[#0D0D0D]" />
              <span className="text-[16px] font-semibold tracking-tight text-[#0D0D0D] select-none">
                Forge
              </span>
            </Link>

            <div className="flex shrink-0 items-center">
              <AccountMenu onOpenShortcuts={() => setShortcutsOpen(true)} />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <FadeIn key={pathname} className="mx-auto w-full max-w-[1100px] px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8">
            {children}
          </FadeIn>
        </main>

        <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
      </div>
    );
  }

  // Active workspace object
  const isWsLoading = workspaceId ? currentWorkspace === undefined && myWorkspaces === undefined : false;
  const activeWs =
    currentWorkspace?.workspace ||
    myWorkspaces?.find((w) => w._id === workspaceId) ||
    (workspaceId && !isWsLoading
      ? {
          _id: workspaceId as Id<"workspaces">,
          name: "Workspace",
          iconKey: undefined as string | undefined,
        }
      : undefined);

  // Projects list: at most 6 projects shown directly
  const visibleProjects = projects?.slice(0, 6) ?? [];
  const hasMoreProjects = (projects?.length ?? 0) > 6;

  // Workspace switcher component for sidebar
  const workspaceSwitcherPill = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch workspace"
          className={cn(
            "group flex w-full items-center rounded-[10px] text-left transition-colors outline-none focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2",
            collapsed
              ? "size-10 justify-center hover:bg-[#ECECEE]"
              : "gap-2 px-2 py-1.5 hover:bg-[#ECECEE]"
          )}
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] border border-border bg-[#FBFBFC] text-[#0D0D0D]">
            <WorkspaceIllustration
              name={activeWs?.name}
              iconKey={activeWs?.iconKey}
              id={activeWs?._id}
              size={18}
            />
          </div>
          {!collapsed && (
            <>
              {isWsLoading ? (
                <div className="h-4 w-28 rounded bg-[#EEEEF0] animate-pulse" />
              ) : (
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#0D0D0D]">
                  {activeWs ? activeWs.name : "Workspace"}
                </span>
              )}
              <ChevronDown className="size-3.5 shrink-0 text-[#575657]" aria-hidden="true" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-64 rounded-[16px] border border-border bg-white p-1.5 shadow-none"
      >
        <DropdownMenuLabel className="px-2 py-1 text-xs text-[#575657] font-medium">
          Switch workspace
        </DropdownMenuLabel>
        {myWorkspaces?.map((w) => (
          <DropdownMenuItem
            key={w._id}
            onClick={() => navigate(workspacePath(w._id, ""))}
            className="rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
          >
            <WorkspaceIllustration
              name={w.name}
              iconKey={w.iconKey}
              id={w._id}
              size={16}
              className="mr-2.5"
            />
            <span className="min-w-0 flex-1 truncate">{w.name}</span>
            <span className="text-[11px] text-[#575657]">{w.projectCount} proj</span>
            {activeWs?._id === w._id && <Check className="size-3.5 ml-2 text-[#0D0D0D]" />}
          </DropdownMenuItem>
        ))}
        {myWorkspaces && myWorkspaces.length === 0 && (
          <p className="px-2.5 py-3 text-xs text-[#575657]">No workspaces yet.</p>
        )}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={() => navigate("/app")}
          className="rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
        >
          <Building2 className="size-3.5 mr-2 text-[#575657]" /> All workspaces
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/app")}
          className="rounded-[10px] px-2.5 py-2 text-[13px] font-medium text-[#0D0D0D] hover:bg-[#F1F1F3] cursor-pointer"
        >
          <Plus className="size-3.5 mr-2" /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Sidebar content (shared by desktop sidebar and mobile drawer)
  const sidebarContent = (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "flex h-full flex-col bg-[#F7F7F8] border-r border-border transition-all duration-200 select-none",
          collapsed ? "w-14" : "w-64"
        )}
      >
        {/* Top: Logo & collapse toggle */}
        <div className="flex h-12 items-center justify-between px-3 border-b border-border/40 shrink-0">
          {!collapsed ? (
            <>
              <Link
                to={dashboardHref}
                onClick={handleLogoClick}
                className="flex items-center gap-2 rounded-[8px] py-1 outline-none transition-opacity hover:opacity-85"
                aria-label="Forge home"
              >
                <ForgeLogo className="size-5 text-[#0D0D0D]" />
                <span className="text-[15px] font-semibold tracking-tight text-[#0D0D0D]">
                  Forge
                </span>
              </Link>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="inline-flex size-7 items-center justify-center rounded-[6px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D] transition-colors"
                    aria-label="Collapse sidebar ([)"
                  >
                    <PanelLeftClose className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Collapse sidebar ([)</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="mx-auto inline-flex size-8 items-center justify-center rounded-[8px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D] transition-colors"
                  aria-label="Expand sidebar ([)"
                >
                  <PanelLeftOpen className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar ([)</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Workspace Switcher */}
        <div className="p-2 border-b border-border/40 shrink-0">
          {workspaceSwitcherPill}
        </div>

        {/* Quick Rows: Search & Inbox */}
        <div className="p-2 space-y-0.5 border-b border-border/40 shrink-0">
          {/* Search row with '+' new issue button */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  className={cn(
                    "flex h-8 items-center rounded-[8px] px-2 text-[13px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D] transition-colors outline-none",
                    collapsed ? "w-full justify-center" : "flex-1 justify-between"
                  )}
                  aria-label="Search (Ctrl+K)"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Search className="size-4 shrink-0" />
                    {!collapsed && <span className="font-medium">Search</span>}
                  </div>
                  {!collapsed && (
                    <kbd className="rounded-[4px] border border-border/70 bg-white px-1.5 py-0.2 text-[10px] font-mono text-[#575657]">
                      ⌘K
                    </kbd>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Search (⌘K)</TooltipContent>}
            </Tooltip>

            {!collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setNewIssueOpen(true)}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D] transition-colors outline-none"
                    aria-label="New issue (C)"
                  >
                    <Plus className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">New issue (C)</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Inbox row (Notifications) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={effectiveWorkspaceId ? `/app/workspaces/${effectiveWorkspaceId}/notifications` : "/app"}
                className={cn(
                  "flex h-8 w-full items-center rounded-[8px] px-2 text-[13px] transition-colors outline-none",
                  collapsed ? "justify-center relative" : "justify-between",
                  pathname.includes("/notifications")
                    ? "bg-[#ECECEE] text-[#0D0D0D] font-medium"
                    : "text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D]"
                )}
                aria-label={`Inbox ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="size-4 shrink-0" />
                  {!collapsed && <span className="font-medium">Inbox</span>}
                </div>
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "rounded-full bg-[#D78FC6] font-medium text-white flex items-center justify-center",
                      collapsed
                        ? "absolute top-1 right-1 size-2"
                        : "px-1.5 py-0.2 text-[10px]"
                    )}
                  >
                    {!collapsed && unreadCount}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                Inbox {unreadCount > 0 ? `(${unreadCount} unread)` : ""}
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Workspace Links - Never scroll */}
        <div className="p-2 border-b border-border/40 shrink-0">
          <div>
            {!collapsed && (
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-[12px] font-medium text-[#575657] lowercase first-letter:capitalize">
                  Workspace
                </span>
                <button
                  type="button"
                  onClick={() => setWorkspaceSectionCollapsed((p) => !p)}
                  className="text-[#575657] hover:text-[#0D0D0D]"
                  aria-label="Toggle workspace section"
                >
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform",
                      workspaceSectionCollapsed && "-rotate-90"
                    )}
                  />
                </button>
              </div>
            )}

            {!workspaceSectionCollapsed && (
              <nav aria-label="Workspace pages" className="space-y-0.5">
                {WORKSPACE_NAV.map(({ label, segment, icon: Icon }) => {
                  const to = effectiveWorkspaceId ? workspacePath(effectiveWorkspaceId, segment) : "/app";
                  const active = isNavActive(pathname, to, segment === "");

                  return (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild>
                        <Link
                          to={to}
                          className={cn(
                            "flex h-8 items-center rounded-[8px] px-2 text-[13px] transition-colors outline-none",
                            collapsed ? "justify-center" : "gap-2.5",
                            active
                              ? "bg-[#ECECEE] text-[#0D0D0D] font-medium"
                              : "text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D]"
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="size-4 shrink-0" />
                          {!collapsed && <span className="truncate">{label}</span>}
                        </Link>
                      </TooltipTrigger>
                      {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
                    </Tooltip>
                  );
                })}
              </nav>
            )}
          </div>
        </div>

        {/* Scrollable Projects Section (takes remaining height, hidden scrollbar) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Section: Pinned Projects (if any) */}
          {!collapsed && pinnedIds.length > 0 && projects && (
            <div>
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-[12px] font-medium text-[#575657] flex items-center gap-1">
                  <Star className="size-3 text-[#D6C6A1]" /> Pinned
                </span>
              </div>
              <div className="space-y-0.5">
                {pinnedIds.map((pId) => {
                  const proj = projects.find((p) => p._id === pId);
                  if (!proj) return null;
                  const active = activeProjectId === pId;

                  return (
                    <Link
                      key={pId}
                      to={`/app/projects/${pId}`}
                      className={cn(
                        "group flex h-8 items-center justify-between rounded-[8px] px-2 text-[13px] transition-colors outline-none",
                        active
                          ? "bg-[#ECECEE] text-[#0D0D0D] font-medium"
                          : "text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D]"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ProjectIllustration
                          projectKey={proj.key}
                          name={proj.name}
                          iconKey={proj.iconKey}
                          id={proj._id}
                          size={15}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => togglePinProject(pId, e)}
                        className="opacity-0 group-hover:opacity-100 text-[#D6C6A1] hover:text-[#0D0D0D]"
                        title="Unpin project"
                      >
                        <Star className="size-3 fill-current" />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Projects */}
          <div>
            {!collapsed && (
              <div className="flex items-center justify-between px-2 pb-1">
                <span className="text-[12px] font-medium text-[#575657]">Projects</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setNewProjectOpen(true)}
                    className="inline-flex size-5 items-center justify-center rounded-[4px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D]"
                    title="Create project"
                    aria-label="Create project"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectsSectionCollapsed((p) => !p)}
                    className="text-[#575657] hover:text-[#0D0D0D]"
                    aria-label="Toggle projects section"
                  >
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform",
                        projectsSectionCollapsed && "-rotate-90"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {!projectsSectionCollapsed && (
              <div className="space-y-0.5">
                {/* Skeleton when projects is undefined */}
                {!projects && (
                  <div className="space-y-1 px-1">
                    <div className="h-6 w-full rounded-[6px] bg-[#EEEEF0] animate-pulse" />
                    <div className="h-6 w-3/4 rounded-[6px] bg-[#EEEEF0] animate-pulse" />
                    <div className="h-6 w-5/6 rounded-[6px] bg-[#EEEEF0] animate-pulse" />
                  </div>
                )}

                {/* Empty state */}
                {projects && projects.length === 0 && !collapsed && (
                  <div className="px-2 py-3 text-center">
                    <p className="text-[12px] text-[#575657]">No projects yet.</p>
                    <button
                      type="button"
                      onClick={() => setNewProjectOpen(true)}
                      className="mt-1 text-[11px] font-medium text-[#0D0D0D] hover:underline"
                    >
                      + Create project
                    </button>
                  </div>
                )}

                {/* Projects list */}
                {visibleProjects.map((proj) => {
                  const active = activeProjectId === proj._id;
                  const isPinned = pinnedIds.includes(proj._id);
                  const isExpanded = !!expandedProjects[proj._id];

                  return (
                    <div key={proj._id} className="space-y-0.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "group flex h-8 items-center rounded-[8px] px-2 text-[13px] transition-colors cursor-pointer",
                              collapsed ? "justify-center" : "justify-between",
                              active
                                ? "bg-[#ECECEE] text-[#0D0D0D] font-medium"
                                : "text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D]"
                            )}
                            onClick={() => navigate(`/app/projects/${proj._id}`)}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {!collapsed && (
                                <button
                                  type="button"
                                  onClick={(e) => toggleProjectExpanded(proj._id, e)}
                                  className="text-[#575657] hover:text-[#0D0D0D]"
                                  aria-label="Expand project views"
                                >
                                  <ChevronRight
                                    className={cn(
                                      "size-3 transition-transform",
                                      isExpanded && "rotate-90"
                                    )}
                                  />
                                </button>
                              )}
                              <ProjectIllustration
                                projectKey={proj.key}
                                name={proj.name}
                                iconKey={proj.iconKey}
                                id={proj._id}
                                size={15}
                              />
                              {!collapsed && (
                                <span className="truncate font-medium">{proj.name}</span>
                              )}
                            </div>

                            {!collapsed && (
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-[#575657] opacity-0 group-hover:opacity-100 uppercase">
                                  {proj.key}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => togglePinProject(proj._id, e)}
                                  className={cn(
                                    "p-0.5 transition-opacity",
                                    isPinned
                                      ? "text-[#D6C6A1] opacity-100"
                                      : "text-[#575657] opacity-0 group-hover:opacity-100 hover:text-[#0D0D0D]"
                                  )}
                                  title={isPinned ? "Unpin" : "Pin project"}
                                >
                                  <Star
                                    className={cn("size-3", isPinned && "fill-current")}
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        {collapsed && (
                          <TooltipContent side="right">
                            {proj.name} ({proj.key})
                          </TooltipContent>
                        )}
                      </Tooltip>

                      {/* Expanded Views: Board, List, Analytics, Settings */}
                      {!collapsed && isExpanded && (
                        <div className="ml-5 pl-2 border-l border-border/60 space-y-0.5 pt-0.5">
                          <Link
                            to={`/app/projects/${proj._id}?view=board`}
                            className={cn(
                              "flex h-7 items-center gap-2 rounded-[6px] px-2 text-[12px] transition-colors",
                              active && pathname.includes("/projects") && !pathname.includes("/analytics") && !pathname.includes("/settings")
                                ? "bg-[#ECECEE] text-[#0D0D0D] font-medium"
                                : "text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D]"
                            )}
                          >
                            <KanbanSquare className="size-3.5 shrink-0" />
                            <span>Board</span>
                          </Link>
                          <Link
                            to={`/app/projects/${proj._id}?view=list`}
                            className="flex h-7 items-center gap-2 rounded-[6px] px-2 text-[12px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D] transition-colors"
                          >
                            <List className="size-3.5 shrink-0" />
                            <span>List</span>
                          </Link>
                          <Link
                            to={`/app/projects/${proj._id}/analytics`}
                            className="flex h-7 items-center gap-2 rounded-[6px] px-2 text-[12px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D] transition-colors"
                          >
                            <BarChart3 className="size-3.5 shrink-0" />
                            <span>Analytics</span>
                          </Link>
                          <Link
                            to={`/app/projects/${proj._id}/settings/workflows`}
                            className="flex h-7 items-center gap-2 rounded-[6px] px-2 text-[12px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D] transition-colors"
                          >
                            <SlidersHorizontal className="size-3.5 shrink-0" />
                            <span>Settings</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* More row */}
                {hasMoreProjects && !collapsed && (
                  <Link
                    to={effectiveWorkspaceId ? `/app/workspaces/${effectiveWorkspaceId}/projects` : "/app"}
                    className="flex h-7 items-center px-2 text-[12px] font-medium text-[#575657] hover:text-[#0D0D0D]"
                  >
                    More projects ({(projects?.length ?? 0) - 6} more)...
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pinned Bottom: user row only */}
        <div className="p-2 border-t border-border/40 shrink-0">
          <AccountMenu
            onOpenShortcuts={() => setShortcutsOpen(true)}
            collapsed={collapsed}
          />
        </div>
      </aside>
    </TooltipProvider>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBFBFC] text-[#0D0D0D]">
      <ScrollManager />

      {/* Desktop Sidebar (>= 1024px) */}
      <div className="hidden lg:flex shrink-0 h-full">{sidebarContent}</div>

      {/* Mobile Drawer (< 1024px) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Dim overlay */}
          <div
            className="fixed inset-0 bg-[#0D0D0D]/35 transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer content */}
          <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-none">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Guest demo banner at top of content area */}
        <GuestDemoBanner workspaceId={workspaceId} />

        {/* Sticky slim top strip (48px) */}
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border bg-white/95 px-4 sm:px-8 backdrop-blur-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger for mobile (< 1024px) */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="inline-flex size-9 lg:hidden items-center justify-center rounded-[8px] text-[#575657] hover:bg-[#ECECEE] hover:text-[#0D0D0D]"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </button>

            {/* Breadcrumbs */}
            <AppBreadcrumbs
              workspace={
                activeWs
                  ? {
                      _id: activeWs._id as Id<"workspaces">,
                      name: activeWs.name,
                      iconKey: activeWs.iconKey,
                    }
                  : null
              }
              project={
                activeProject
                  ? {
                      _id: activeProject._id,
                      name: activeProject.name,
                      key: activeProject.key,
                      iconKey: activeProject.iconKey,
                    }
                  : null
              }
              issue={activeIssue}
            />
          </div>

          {/* Right side page actions */}
          <div className="flex items-center gap-2 shrink-0">
            {pageActions}
          </div>
        </header>

        {/* Page Content Viewport with independent scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">
            <FadeIn key={pathname}>
              {children}
            </FadeIn>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      {projects && workspaceId && (
        <CreateIssueDialog
          trigger={null}
          open={newIssueOpen}
          onOpenChange={setNewIssueOpen}
          projects={projects}
          canCreate={true}
          workspaceId={workspaceId as Id<"workspaces">}
          defaultProjectId={activeProjectId as Id<"projects"> | undefined}
        />
      )}

      {workspaceId && (
        <CreateProjectDialog
          trigger={null}
          open={newProjectOpen}
          onOpenChange={setNewProjectOpen}
          workspaceId={workspaceId as Id<"workspaces">}
          canCreate={true}
        />
      )}

      {workspaceId && currentWorkspace && (
        <InviteMembersDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          workspaceId={workspaceId as Id<"workspaces">}
          workspaceName={currentWorkspace.workspace.name}
          canInvite={true}
        />
      )}

      <CommandPaletteDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        workspaceId={workspaceId}
        projects={projects}
        onNewIssue={() => setNewIssueOpen(true)}
        onNewProject={() => setNewProjectOpen(true)}
        onInviteMember={() => setInviteOpen(true)}
        onToggleSidebar={toggleCollapsed}
      />

      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
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
        tone
      )}
    >
      {role}
    </span>
  );
}
