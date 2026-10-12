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
  CheckCircle2,
  Search,
  Sparkles,
  Zap,
  Clock,
  AlertCircle,
  X,
  ArrowRight,
} from "lucide-react";
import { EmblemIllustration } from "@/components/Illustrations";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  projects?: Array<{ _id: Id<"projects">; name: string; key: string; color?: string; iconKey?: string; openIssueCount?: number }>;
  onNewIssue?: () => void;
  onNewProject?: () => void;
  onInviteMember?: () => void;
  onToggleSidebar?: () => void;
}

const IDEA_SUGGESTIONS = [
  { label: "Biometric auth", query: "biometric", icon: "🔐", category: "Security" },
  { label: "WebSocket reconnect", query: "websocket", icon: "⚡", category: "Network" },
  { label: "Stripe billing webhook", query: "stripe", icon: "💳", category: "Billing" },
  { label: "Database query latency", query: "database", icon: "🗄️", category: "Backend" },
  { label: "Volumetric fog & shader", query: "shader", icon: "🎨", category: "Graphics" },
  { label: "Offline mutations queue", query: "offline", icon: "📱", category: "Mobile" },
  { label: "Client portal milestones", query: "portal", icon: "🧭", category: "Product" },
  { label: "Soak tests & QA bot", query: "test", icon: "🧪", category: "QA" },
];

const FAST_FILTER_CHIPS = [
  { id: "urgent", label: "Urgent", icon: Zap, query: "urgent", color: "#D78FC6" },
  { id: "review", label: "In Review", icon: Clock, query: "review", color: "#6E94CB" },
  { id: "progress", label: "In Progress", icon: GitBranch, query: "progress", color: "#7957EC" },
  { id: "overdue", label: "Overdue", icon: AlertCircle, query: "overdue", color: "#D6C6A1" },
  { id: "all_issues", label: "All issues", icon: CheckCircle2, query: " ", color: "#83DD79" },
];

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#D78FC6",
  high: "#D6C6A1",
  medium: "#6E94CB",
  low: "#9A9A9F",
  none: "#9A9A9F",
};

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
  const [activeChip, setActiveChip] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setActiveChip(null);
    }
  }, [open]);

  // Query workspace issues for command palette search
  const workspaceIssues = useQuery(
    api.issues.listWorkspaceIssues,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );

  const handleSelect = (run: () => void) => {
    onOpenChange(false);
    run();
  };

  const handleApplyChip = (chipId: string, query: string) => {
    if (activeChip === chipId) {
      setActiveChip(null);
      setSearch("");
    } else {
      setActiveChip(chipId);
      setSearch(query.trim());
    }
  };

  const handleApplyIdea = (query: string) => {
    setSearch(query);
    setActiveChip(null);
  };

  // 7 standard navigation pages
  const pages = workspaceId
    ? [
        { label: "Overview", icon: LayoutDashboard, path: `/app/workspaces/${workspaceId}` },
        { label: "Projects", icon: FolderKanban, path: `/app/workspaces/${workspaceId}/projects` },
        { label: "Workflow", icon: GitBranch, path: `/app/workspaces/${workspaceId}/workflow` },
        { label: "Analytics", icon: BarChart3, path: `/app/workspaces/${workspaceId}/analytics` },
        { label: "Teams", icon: Users, path: `/app/workspaces/${workspaceId}/teams` },
        { label: "Activity", icon: History, path: `/app/workspaces/${workspaceId}/activity` },
        { label: "Settings", icon: Settings, path: `/app/workspaces/${workspaceId}/settings` },
      ]
    : [{ label: "Workspaces", icon: LayoutDashboard, path: "/app" }];

  const trimmedSearch = search.trim();
  const isQueryEmpty = trimmedSearch.length === 0;

  // Filter issues when typing or using chips
  const matchedIssues = useMemo(() => {
    if (!workspaceIssues?.issues) return [];
    if (isQueryEmpty) {
      // When empty, show top 6 recent/urgent issues
      return workspaceIssues.issues.slice(0, 6);
    }
    const q = trimmedSearch.toLowerCase();
    return workspaceIssues.issues
      .filter((iss) => {
        const fullKey = iss.projectKey ? `${iss.projectKey}-${iss.number}`.toLowerCase() : `#${iss.number}`;
        const titleMatch = iss.title.toLowerCase().includes(q);
        const keyMatch = fullKey.includes(q);
        const priorityMatch = (iss.priority || "").toLowerCase().includes(q);
        const statusMatch = (iss.status?.name || "").toLowerCase().includes(q);
        return titleMatch || keyMatch || priorityMatch || statusMatch;
      })
      .slice(0, 10);
  }, [workspaceIssues, trimmedSearch, isQueryEmpty]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Search pages, projects, issues, ideas, actions</DialogTitle>
        <DialogDescription>Quickly search and jump to projects, issues, ideas, and actions without manual typing</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className="max-w-[620px] w-full rounded-[20px] border border-border bg-white p-0 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden"
      >
        <CommandPrimitive
          shouldFilter={false}
          className="flex h-full w-full flex-col overflow-hidden bg-white text-[#0D0D0D]"
        >
          {/* Input row */}
          <div className="flex h-14 items-center gap-3 border-b border-border/80 px-4 bg-white">
            <Search className="size-4 shrink-0 text-[#575657]" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={(val) => {
                setSearch(val);
                if (activeChip) setActiveChip(null);
              }}
              placeholder="Search issues, projects, pages, or pick a suggestion..."
              className="flex-1 bg-transparent text-[14px] text-[#0D0D0D] placeholder:text-[#575657]/70 outline-none"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setActiveChip(null);
                }}
                className="size-5 flex items-center justify-center rounded-full hover:bg-[#F1F1F3] text-[#575657]"
                aria-label="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
            <kbd className="rounded-[4px] border border-border bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
              esc
            </kbd>
          </div>

          {/* Quick Filter Idea Chips Row */}
          <div className="flex items-center gap-1.5 border-b border-border/60 bg-[#FBFBFC] px-3.5 py-2.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-[#0D0D0D] shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="size-3 text-[#7957EC]" /> Suggestions:
            </span>
            {FAST_FILTER_CHIPS.map((chip) => {
              const Icon = chip.icon;
              const isSelected = activeChip === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleApplyChip(chip.id, chip.query)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 cursor-pointer",
                    isSelected
                      ? "bg-[#0D0D0D] text-white shadow-xs"
                      : "bg-white border border-border text-[#575657] hover:text-[#0D0D0D] hover:border-[#0D0D0D]/40 hover:bg-[#F6F6F7]"
                  )}
                >
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: chip.color }}
                  />
                  <Icon className="size-3" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body list */}
          <CommandPrimitive.List className="max-h-[460px] overflow-y-auto no-scrollbar p-3 space-y-3.5">
            {/* 1. Interactive Projects section */}
            {projects && projects.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 pb-1.5 text-[11px] font-semibold text-[#0D0D0D]">
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="size-3 text-[#6E94CB]" /> Projects ({projects.length})
                  </span>
                  <span className="text-[10px] text-[#575657] font-normal">Click to open board</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {projects.slice(0, 6).map((proj) => (
                    <button
                      key={proj._id}
                      type="button"
                      onClick={() => handleSelect(() => navigate(`/app/projects/${proj._id}`))}
                      className="flex items-start gap-2.5 rounded-[12px] border border-border/80 bg-[#FBFBFC] p-2.5 text-left transition-all hover:bg-white hover:border-[#0D0D0D]/30 hover:shadow-xs group cursor-pointer"
                    >
                      <EmblemIllustration
                        emblemKey={proj.iconKey || "compass"}
                        name={proj.name}
                        id={proj._id}
                        size={22}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-[4px] bg-[#F1F1F3] px-1 font-mono text-[9px] font-semibold text-[#0D0D0D]">
                            {proj.key}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[12px] font-medium text-[#0D0D0D] group-hover:text-[#0D0D0D]">
                          {proj.name}
                        </p>
                        {proj.openIssueCount !== undefined && (
                          <p className="text-[10px] text-[#575657] mt-0.5">
                            {proj.openIssueCount} open work items
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Topic Suggestions Cards (instant search queries) */}
            {isQueryEmpty && (
              <div>
                <div className="flex items-center justify-between px-1 pb-1.5 text-[11px] font-semibold text-[#0D0D0D]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-[#7957EC]" /> Suggested tasks & topics
                  </span>
                  <span className="text-[10px] text-[#575657] font-normal">1-click search</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {IDEA_SUGGESTIONS.map((idea) => (
                    <button
                      key={idea.query}
                      type="button"
                      onClick={() => handleApplyIdea(idea.query)}
                      className="flex flex-col justify-between rounded-[12px] border border-border bg-white p-2.5 text-left transition-all hover:border-[#0D0D0D]/40 hover:bg-[#F6F6F7] cursor-pointer group"
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

            {/* 3. Issues group (matching search or top active issues) */}
            {matchedIssues.length > 0 ? (
              <CommandPrimitive.Group
                heading={isQueryEmpty ? "Active & recent work items" : `Matched issues (${matchedIssues.length})`}
                className="px-1 pb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-[#0D0D0D]"
              >
                {matchedIssues.map((iss) => {
                  const keyStr = iss.projectKey ? `${iss.projectKey}-${iss.number}` : `#${iss.number}`;
                  const pColor = PRIORITY_COLORS[(iss.priority || "").toLowerCase()] || "#9A9A9F";

                  return (
                    <CommandPrimitive.Item
                      key={iss._id}
                      value={`issue ${keyStr} ${iss.title} ${iss.priority} ${iss.status?.name || ""}`}
                      onSelect={() => handleSelect(() => navigate(`/app/issues/${iss._id}`))}
                      className="flex h-11 items-center justify-between gap-3 rounded-[10px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors border border-transparent hover:border-border/60 hover:bg-[#F6F6F7]"
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
                        <span className="font-medium truncate text-[12px]">{iss.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {iss.status?.name && (
                          <span className="rounded-full bg-[#F1F1F3] px-2 py-0.5 text-[10px] font-medium text-[#575657] capitalize">
                            {iss.status.name}
                          </span>
                        )}
                        <ArrowRight className="size-3 text-[#575657]/50" />
                      </div>
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.Group>
            ) : !isQueryEmpty ? (
              <div className="py-6 text-center text-[12px] text-[#575657]">
                No issues match "{search}". Try picking a suggestion above.
              </div>
            ) : null}

            {/* Navigation Pages */}
            <CommandPrimitive.Group
              heading="Go to page"
              className="px-1 pb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {pages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <CommandPrimitive.Item
                      key={p.path}
                      value={`page ${p.label}`}
                      onSelect={() => handleSelect(() => navigate(p.path))}
                      className="flex h-9 items-center justify-between gap-2 rounded-[8px] px-2.5 text-[12px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
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

            {/* Quick Actions */}
            <CommandPrimitive.Group
              heading="Actions"
              className="px-1 pb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {onNewIssue && (
                  <CommandPrimitive.Item
                    value="action new issue create task"
                    onSelect={() => handleSelect(onNewIssue)}
                    className="flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[12px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <Plus className="size-3.5 text-[#0D0D0D]" />
                    <span className="font-medium truncate">New issue</span>
                  </CommandPrimitive.Item>
                )}

                {onNewProject && (
                  <CommandPrimitive.Item
                    value="action new project create folder"
                    onSelect={() => handleSelect(onNewProject)}
                    className="flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[12px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <FolderKanban className="size-3.5 text-[#0D0D0D]" />
                    <span className="font-medium truncate">New project</span>
                  </CommandPrimitive.Item>
                )}

                {onInviteMember && (
                  <CommandPrimitive.Item
                    value="action invite member team"
                    onSelect={() => handleSelect(onInviteMember)}
                    className="flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[12px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <UserPlus className="size-3.5 text-[#0D0D0D]" />
                    <span className="font-medium truncate">Invite member</span>
                  </CommandPrimitive.Item>
                )}

                {onToggleSidebar && (
                  <CommandPrimitive.Item
                    value="action toggle sidebar collapse expand"
                    onSelect={() => handleSelect(onToggleSidebar)}
                    className="flex h-9 items-center gap-2 rounded-[8px] px-2.5 text-[12px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <PanelLeft className="size-3.5 text-[#0D0D0D]" />
                    <span className="font-medium truncate">Toggle sidebar</span>
                  </CommandPrimitive.Item>
                )}
              </div>
            </CommandPrimitive.Group>
          </CommandPrimitive.List>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border/80 bg-[#FBFBFC] px-4 py-2 text-[11px] text-[#575657]">
            <div className="flex items-center gap-3">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
            <span>Forge quick search & jump</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
