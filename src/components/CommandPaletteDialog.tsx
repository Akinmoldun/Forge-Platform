import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Command as CommandPrimitive } from "cmdk";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  FolderKanban,
  GitBranch,
  BarChart3,
  Users,
  History,
  Settings,
  Plus,
  PanelLeft,
  UserPlus,
  Search,
  Sparkles,
  Zap,
  Clock,
  X,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { EmblemIllustration } from "@/components/Illustrations";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  projects?: Array<{
    _id: Id<"projects">;
    name: string;
    key: string;
    color?: string;
    iconKey?: string;
    openIssueCount?: number;
  }>;
  onNewIssue?: () => void;
  onNewProject?: () => void;
  onInviteMember?: () => void;
  onToggleSidebar?: () => void;
}

const IDEA_SUGGESTIONS = [
  { label: "Stripe webhook signature", query: "stripe", icon: "💳", category: "Billing" },
  { label: "Biometric auth fallback", query: "biometric", icon: "🔐", category: "Security" },
  { label: "WebSocket auto-reconnect", query: "websocket", icon: "⚡", category: "Network" },
  { label: "Virtualize 10k backlog table", query: "virtualize", icon: "📊", category: "Frontend" },
];

const FILTER_TABS = [
  { id: "all", label: "All Suggestions", icon: Sparkles, color: "#7957EC" },
  { id: "urgent", label: "Urgent", icon: Zap, color: "#D78FC6" },
  { id: "review", label: "In Review", icon: Clock, color: "#6E94CB" },
  { id: "progress", label: "In Progress", icon: GitBranch, color: "#7957EC" },
  { id: "projects", label: "Projects", icon: FolderKanban, color: "#83DD79" },
  { id: "pages", label: "Pages", icon: LayoutDashboard, color: "#9A9A9F" },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#D78FC6",
  high: "#D6C6A1",
  medium: "#6E94CB",
  low: "#9A9A9F",
  none: "#9A9A9F",
};

const FALLBACK_ISSUES = [
  {
    _id: "demo_iss_1",
    projectKey: "MOB",
    number: 30,
    title: "Fix keychain token loss on app reinstall backup restore",
    priority: "urgent",
    status: { name: "In Progress", category: "active" },
  },
  {
    _id: "demo_iss_2",
    projectKey: "BIL",
    number: 78,
    title: "Audit Stripe webhook idempotency keys against replay attacks",
    priority: "urgent",
    status: { name: "Review", category: "review" },
  },
  {
    _id: "demo_iss_3",
    projectKey: "WEB",
    number: 42,
    title: "Prevent layout shift during dynamic image thumbnail fetch",
    priority: "high",
    status: { name: "In Progress", category: "active" },
  },
  {
    _id: "demo_iss_4",
    projectKey: "PLT",
    number: 15,
    title: "Enable certificate pinning for secure WebSocket gateway",
    priority: "high",
    status: { name: "Review", category: "review" },
  },
  {
    _id: "demo_iss_5",
    projectKey: "DAT",
    number: 22,
    title: "Implement token bucket rate limiter for public API telemetry",
    priority: "medium",
    status: { name: "Todo", category: "unstarted" },
  },
];

export function CommandPaletteDialog({
  open,
  onOpenChange,
  workspaceId,
  projects = [],
  onNewIssue,
  onNewProject,
  onInviteMember,
  onToggleSidebar,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (open) {
      setSearch("");
      setActiveTab("all");
    }
  }, [open]);

  // Query workspace issues for command palette search
  const workspaceIssues = useQuery(
    api.issues.listWorkspaceIssues,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip",
  );

  const handleSelect = (run: () => void) => {
    onOpenChange(false);
    run();
  };

  const handleApplyTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleApplyIdea = (query: string) => {
    setSearch(query);
    setActiveTab("all");
  };

  // 7 standard navigation pages
  const pages = useMemo(() => {
    return workspaceId
      ? [
          { label: "Overview", icon: LayoutDashboard, path: `/app/workspaces/${workspaceId}`, desc: "Dashboard & widgets" },
          { label: "Projects", icon: FolderKanban, path: `/app/workspaces/${workspaceId}/projects`, desc: "Workspace project boards" },
          { label: "Workflow", icon: GitBranch, path: `/app/workspaces/${workspaceId}/workflow`, desc: "Visual pipeline & rules" },
          { label: "Analytics", icon: BarChart3, path: `/app/workspaces/${workspaceId}/analytics`, desc: "Throughput & cycle time" },
          { label: "Teams", icon: Users, path: `/app/workspaces/${workspaceId}/teams`, desc: "Members & roles" },
          { label: "Activity", icon: History, path: `/app/workspaces/${workspaceId}/activity`, desc: "Audit log of events" },
          { label: "Settings", icon: Settings, path: `/app/workspaces/${workspaceId}/settings`, desc: "Workspace configurations" },
        ]
      : [{ label: "Workspaces", icon: LayoutDashboard, path: "/app", desc: "Select workspace" }];
  }, [workspaceId]);

  const trimmedSearch = search.trim().toLowerCase();
  const isQueryEmpty = trimmedSearch.length === 0;

  // Filter issues when typing or using tabs
  const rawIssues = (workspaceIssues?.issues && workspaceIssues.issues.length > 0)
    ? workspaceIssues.issues
    : FALLBACK_ISSUES;

  const matchedIssues = useMemo(() => {
    if (activeTab === "projects" || activeTab === "pages") return [];

    let list = rawIssues;
    if (activeTab === "urgent") {
      list = list.filter((i) => (i.priority || "").toLowerCase() === "urgent");
    } else if (activeTab === "review") {
      list = list.filter((i) => (i.status?.name || "").toLowerCase().includes("review") || i.status?.category === "review");
    } else if (activeTab === "progress") {
      list = list.filter((i) => (i.status?.name || "").toLowerCase().includes("progress") || i.status?.category === "active");
    }

    if (!isQueryEmpty) {
      list = list.filter((iss) => {
        const fullKey = iss.projectKey ? `${iss.projectKey}-${iss.number}`.toLowerCase() : `#${iss.number}`;
        const titleMatch = iss.title.toLowerCase().includes(trimmedSearch);
        const keyMatch = fullKey.includes(trimmedSearch);
        const priorityMatch = (iss.priority || "").toLowerCase().includes(trimmedSearch);
        const statusMatch = (iss.status?.name || "").toLowerCase().includes(trimmedSearch);
        return titleMatch || keyMatch || priorityMatch || statusMatch;
      });
    }

    return list.slice(0, 8);
  }, [rawIssues, trimmedSearch, isQueryEmpty, activeTab]);

  const matchedProjects = useMemo(() => {
    if (activeTab === "pages") return [];
    if (isQueryEmpty) return projects.slice(0, 6);
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(trimmedSearch) ||
        p.key.toLowerCase().includes(trimmedSearch),
    ).slice(0, 6);
  }, [projects, trimmedSearch, isQueryEmpty, activeTab]);

  const matchedPages = useMemo(() => {
    if (activeTab === "projects") return [];
    if (isQueryEmpty) return pages;
    return pages.filter((p) => p.label.toLowerCase().includes(trimmedSearch));
  }, [pages, trimmedSearch, isQueryEmpty, activeTab]);

  const actionsList = useMemo(() => [
    { id: "new-issue", label: "New issue", keywords: "new issue create task ticket", icon: Plus, handler: onNewIssue },
    { id: "new-project", label: "New project", keywords: "new project create folder", icon: FolderKanban, handler: onNewProject },
    { id: "invite-member", label: "Invite member", keywords: "invite member teammate user", icon: UserPlus, handler: onInviteMember },
    { id: "toggle-sidebar", label: "Toggle sidebar", keywords: "toggle sidebar collapse expand menu", icon: PanelLeft, handler: onToggleSidebar },
  ].filter((a): a is { id: string; label: string; keywords: string; icon: typeof Plus; handler: () => void } => Boolean(a.handler)), [onNewIssue, onNewProject, onInviteMember, onToggleSidebar]);

  const matchedActions = useMemo(() => {
    if (activeTab === "projects" || activeTab === "pages") return [];
    if (isQueryEmpty) return actionsList;
    return actionsList.filter((a) =>
      a.label.toLowerCase().includes(trimmedSearch) ||
      a.keywords.toLowerCase().includes(trimmedSearch)
    );
  }, [actionsList, trimmedSearch, isQueryEmpty, activeTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Search Forge workspace</DialogTitle>
        <DialogDescription>Quickly search issues, projects, pages, and actions</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className="max-w-[560px] sm:max-w-[560px] w-full rounded-[16px] border border-border bg-white p-0 gap-0 shadow-none overflow-hidden block"
      >
        <CommandPrimitive
          shouldFilter={false}
          className="flex h-full w-full flex-col overflow-hidden bg-white text-[#0D0D0D]"
        >
          {/* Header Search Input */}
          <div className="flex h-14 items-center gap-3 border-b border-border/80 px-4 bg-white">
            <Search className="size-4 shrink-0 text-[#575657]" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search issues, projects, pages, or pick a suggestion below..."
              className="flex-1 bg-transparent text-[14px] text-[#0D0D0D] placeholder:text-[#575657]/70 outline-none"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveTab("all");
                }}
                className="size-5 flex items-center justify-center rounded-full hover:bg-[#F1F1F3] text-[#575657] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
            <kbd className="rounded-[4px] border border-border bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
              esc
            </kbd>
          </div>

          {/* Quick Filter Tabs Row */}
          <div className="flex items-center gap-1.5 border-b border-border/60 bg-[#FBFBFC] px-4 py-2.5 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleApplyTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-all shrink-0 cursor-pointer select-none",
                    isSelected
                      ? "bg-[#0D0D0D] text-white shadow-xs"
                      : "bg-white border border-border text-[#575657] hover:text-[#0D0D0D] hover:border-[#0D0D0D]/40 hover:bg-[#F6F6F7]",
                  )}
                >
                  <Icon className="size-3" style={{ color: isSelected ? "#FFFFFF" : tab.color }} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body list with ample space */}
          <CommandPrimitive.List className="max-h-[480px] overflow-y-auto no-scrollbar p-4 space-y-4">
            {/* 1. Instant Idea / Task Suggestion Cards (persistent suggestions) */}
            {activeTab === "all" && (
              <div className="pb-1">
                <div className="flex items-center justify-between px-1 pb-2 text-[11px] font-semibold text-[#0D0D0D]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-[#7957EC]" /> Suggested tasks & topics
                  </span>
                  <span className="text-[10px] text-[#575657] font-normal">Click to search</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {IDEA_SUGGESTIONS.map((idea) => (
                    <button
                      key={idea.query}
                      type="button"
                      onClick={() => handleApplyIdea(idea.query)}
                      className="flex flex-col justify-between rounded-[10px] border border-border bg-[#FBFBFC] p-2.5 text-left transition-all hover:border-[#0D0D0D]/40 hover:bg-white cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-[13px]">
                        <span>{idea.icon}</span>
                        <span className="text-[9px] text-[#575657] font-mono group-hover:text-[#0D0D0D]">{idea.category}</span>
                      </div>
                      <p className="mt-1.5 text-[11px] font-medium text-[#0D0D0D] line-clamp-2 leading-tight">
                        {idea.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Projects section */}
            {matchedProjects.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 pb-2 text-[11px] font-semibold text-[#0D0D0D]">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="size-3 text-[#6E94CB]" /> Projects ({matchedProjects.length})
                  </span>
                  <span className="text-[10px] text-[#575657] font-normal">Jump to board</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {matchedProjects.map((proj) => (
                    <button
                      key={proj._id}
                      type="button"
                      onClick={() => handleSelect(() => navigate(`/app/projects/${proj._id}`))}
                      className="flex items-center gap-2.5 rounded-[12px] border border-border/80 bg-white p-2.5 text-left transition-all hover:border-[#0D0D0D]/40 hover:bg-[#FBFBFC] hover:shadow-xs group cursor-pointer"
                    >
                      <EmblemIllustration
                        emblemKey={proj.iconKey || "compass"}
                        name={proj.name}
                        id={proj._id}
                        size={22}
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-[4px] bg-[#F1F1F3] px-1 font-mono text-[9px] font-semibold text-[#0D0D0D]">
                            {proj.key}
                          </span>
                          <span className="truncate text-[12px] font-medium text-[#0D0D0D]">
                            {proj.name}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="size-3 text-[#575657]/40 shrink-0 group-hover:text-[#0D0D0D]" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Issues group */}
            {matchedIssues.length > 0 && (
              <CommandPrimitive.Group
                heading={isQueryEmpty ? "Active work items" : `Matched issues (${matchedIssues.length})`}
                className="px-1 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#0D0D0D]"
              >
                <div className="space-y-1.5">
                  {matchedIssues.map((iss) => {
                    const keyStr = iss.projectKey ? `${iss.projectKey}-${iss.number}` : `#${iss.number}`;
                    const pColor = PRIORITY_COLORS[(iss.priority || "").toLowerCase()] || "#9A9A9F";

                    return (
                      <CommandPrimitive.Item
                        key={iss._id}
                        value={`issue ${keyStr} ${iss.title} ${iss.priority} ${iss.status?.name || ""}`}
                        onSelect={() => handleSelect(() => navigate(`/app/issues/${iss._id}`))}
                        className="flex h-11 items-center justify-between gap-3 rounded-[10px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer bg-white border border-border/70 hover:border-[#0D0D0D]/30 hover:bg-[#F6F6F7] aria-selected:bg-[#F1F1F3] transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: pColor }}
                            title={`Priority: ${iss.priority || "none"}`}
                          />
                          <span className="shrink-0 font-mono text-[10px] font-semibold text-[#575657] bg-[#F1F1F3] px-1.5 py-0.5 rounded">
                            {keyStr}
                          </span>
                          <span className="font-medium truncate text-[12px] text-[#0D0D0D]">{iss.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {iss.status?.name && (
                            <span className="rounded-full bg-[#F1F1F3] px-2 py-0.5 text-[10px] font-medium text-[#575657] capitalize">
                              {iss.status.name}
                            </span>
                          )}
                          <ArrowRight className="size-3 text-[#575657]/40" />
                        </div>
                      </CommandPrimitive.Item>
                    );
                  })}
                </div>
              </CommandPrimitive.Group>
            )}

            {/* Empty state when no issues match */}
            {matchedIssues.length === 0 && !isQueryEmpty && activeTab !== "projects" && activeTab !== "pages" && (
              <div className="py-6 text-center text-[12px] text-[#575657]">
                No issues match "{search}". Try searching another keyword or pick from the suggestion chips.
              </div>
            )}

            {/* 4. Navigation Pages */}
            {(activeTab === "all" || activeTab === "pages") && matchedPages.length > 0 && (
              <CommandPrimitive.Group
                heading="Go to page"
                className="px-1 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#0D0D0D]"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {matchedPages.map((p) => {
                    const Icon = p.icon;
                    return (
                      <CommandPrimitive.Item
                        key={p.path}
                        value={`page ${p.label}`}
                        onSelect={() => handleSelect(() => navigate(p.path))}
                        className="flex h-10 items-center justify-between gap-2 rounded-[10px] px-2.5 text-[12px] text-[#0D0D0D] cursor-pointer bg-[#FBFBFC] border border-border/60 hover:bg-white hover:border-[#0D0D0D]/30 aria-selected:bg-[#ECECEE] transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-[#F1F1F3] text-[#0D0D0D]">
                            <Icon className="size-3" />
                          </div>
                          <span className="font-medium truncate">{p.label}</span>
                        </div>
                      </CommandPrimitive.Item>
                    );
                  })}
                </div>
              </CommandPrimitive.Group>
            )}

            {/* 5. Quick Actions (live searchable) */}
            {matchedActions.length > 0 && (
              <CommandPrimitive.Group
                heading="Actions"
                className="px-1 pb-1 [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#0D0D0D]"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {matchedActions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <CommandPrimitive.Item
                        key={act.id}
                        value={`action ${act.label} ${act.keywords}`}
                        onSelect={() => handleSelect(act.handler)}
                        className="flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[12px] text-[#0D0D0D] cursor-pointer bg-white border border-border/70 hover:bg-[#F6F6F7] aria-selected:bg-[#ECECEE] transition-colors"
                      >
                        <Icon className="size-3.5 text-[#0D0D0D]" />
                        <span className="font-medium truncate">{act.label}</span>
                      </CommandPrimitive.Item>
                    );
                  })}
                </div>
              </CommandPrimitive.Group>
            )}
          </CommandPrimitive.List>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border/80 bg-[#FBFBFC] px-4 py-2.5 text-[11px] text-[#575657]">
            <div className="flex items-center gap-3">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
            <span>Forge Quick Search</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
