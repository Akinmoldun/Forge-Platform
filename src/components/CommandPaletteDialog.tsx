import { useState, useEffect } from "react";
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
} from "lucide-react";

export function CommandPaletteDialog({
  open,
  onOpenChange,
  workspaceId,
  projects,
  onNewIssue,
  onNewProject,
  onInviteMember,
  onToggleSidebar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId?: string;
  projects?: Array<{ _id: Id<"projects">; name: string; key: string; color?: string }>;
  onNewIssue?: () => void;
  onNewProject?: () => void;
  onInviteMember?: () => void;
  onToggleSidebar?: () => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSearch("");
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

  const isQueryEmpty = search.trim().length === 0;

  // Filter issues when typing (by key or title, max 8)
  const matchedIssues = (() => {
    if (isQueryEmpty || !workspaceIssues?.issues) return [];
    const q = search.trim().toLowerCase();
    return workspaceIssues.issues
      .filter((iss) => {
        const fullKey = iss.projectKey ? `${iss.projectKey}-${iss.number}`.toLowerCase() : `#${iss.number}`;
        return fullKey.includes(q) || iss.title.toLowerCase().includes(q);
      })
      .slice(0, 8);
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Search pages, projects, issues, actions</DialogTitle>
        <DialogDescription>Quickly search and jump to pages, projects, issues, or trigger actions</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className="max-w-[560px] w-full rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-white p-0 shadow-none overflow-hidden"
      >
        <CommandPrimitive
          className="flex h-full w-full flex-col overflow-hidden bg-white text-[#0D0D0D]"
        >
          {/* Input row */}
          <div className="flex h-12 items-center gap-3 border-b border-[rgba(0,0,0,0.08)] px-4">
            <Search className="size-4 shrink-0 text-[#575657]" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, projects, issues, actions"
              className="flex-1 bg-transparent text-[14px] text-[#0D0D0D] placeholder:text-[#575657]/60 outline-none"
              autoFocus
            />
            <kbd className="rounded-[4px] border border-[rgba(0,0,0,0.08)] bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
              esc
            </kbd>
          </div>

          <CommandPrimitive.List className="max-h-[420px] overflow-y-auto no-scrollbar p-2">
            <CommandPrimitive.Empty className="py-8 text-center text-[13px] text-[#575657]">
              No results
            </CommandPrimitive.Empty>

            {/* Go to group */}
            <CommandPrimitive.Group
              heading="Go to"
              className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
            >
              {pages.map((p) => {
                const Icon = p.icon;
                return (
                  <CommandPrimitive.Item
                    key={p.path}
                    value={`page ${p.label}`}
                    onSelect={() => handleSelect(() => navigate(p.path))}
                    className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#0D0D0D]">
                        <Icon className="size-3.5" />
                      </div>
                      <span className="font-medium truncate">{p.label}</span>
                    </div>
                    <span className="text-[11px] text-[#575657] shrink-0">Page</span>
                  </CommandPrimitive.Item>
                );
              })}
            </CommandPrimitive.Group>

            {/* Projects group (up to 6) */}
            {projects && projects.length > 0 && (
              <CommandPrimitive.Group
                heading="Projects"
                className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
              >
                {projects.slice(0, 6).map((proj) => (
                  <CommandPrimitive.Item
                    key={proj._id}
                    value={`project ${proj.name} ${proj.key}`}
                    onSelect={() => handleSelect(() => navigate(`/app/projects/${proj._id}`))}
                    className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] font-mono text-[10px] font-semibold text-[#0D0D0D]">
                        {proj.key}
                      </div>
                      <span className="font-medium truncate">{proj.name}</span>
                    </div>
                    <span className="text-[11px] text-[#575657] shrink-0">Project</span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {/* Issues group when searching (max 8) */}
            {!isQueryEmpty && matchedIssues.length > 0 && (
              <CommandPrimitive.Group
                heading="Issues"
                className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
              >
                {matchedIssues.map((iss) => {
                  const keyStr = iss.projectKey ? `${iss.projectKey}-${iss.number}` : `#${iss.number}`;
                  return (
                    <CommandPrimitive.Item
                      key={iss._id}
                      value={`issue ${keyStr} ${iss.title}`}
                      onSelect={() => handleSelect(() => navigate(`/app/issues/${iss._id}`))}
                      className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#575657]">
                          <CheckCircle2 className="size-3.5" />
                        </div>
                        <span className="font-medium truncate">{iss.title}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#575657] shrink-0">{keyStr}</span>
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.Group>
            )}

            {/* Actions group */}
            <CommandPrimitive.Group
              heading="Actions"
              className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
            >
              {onNewIssue && (
                <CommandPrimitive.Item
                  value="action new issue create task"
                  onSelect={() => handleSelect(onNewIssue)}
                  className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#0D0D0D]">
                      <Plus className="size-3.5" />
                    </div>
                    <span className="font-medium truncate">New issue</span>
                  </div>
                  <span className="text-[11px] text-[#575657] shrink-0">Action</span>
                </CommandPrimitive.Item>
              )}

              {onNewProject && (
                <CommandPrimitive.Item
                  value="action new project create folder"
                  onSelect={() => handleSelect(onNewProject)}
                  className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#0D0D0D]">
                      <FolderKanban className="size-3.5" />
                    </div>
                    <span className="font-medium truncate">New project</span>
                  </div>
                  <span className="text-[11px] text-[#575657] shrink-0">Action</span>
                </CommandPrimitive.Item>
              )}

              {onInviteMember && (
                <CommandPrimitive.Item
                  value="action invite member team"
                  onSelect={() => handleSelect(onInviteMember)}
                  className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#0D0D0D]">
                      <UserPlus className="size-3.5" />
                    </div>
                    <span className="font-medium truncate">Invite member</span>
                  </div>
                  <span className="text-[11px] text-[#575657] shrink-0">Action</span>
                </CommandPrimitive.Item>
              )}

              {onToggleSidebar && (
                <CommandPrimitive.Item
                  value="action toggle sidebar collapse expand"
                  onSelect={() => handleSelect(onToggleSidebar)}
                  className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#0D0D0D]">
                      <PanelLeft className="size-3.5" />
                    </div>
                    <span className="font-medium truncate">Toggle sidebar</span>
                  </div>
                  <span className="text-[11px] text-[#575657] shrink-0">Action</span>
                </CommandPrimitive.Item>
              )}
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

