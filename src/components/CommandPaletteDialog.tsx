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
  Bell,
  Plus,
  PanelLeft,
  UserPlus,
  CheckCircle2,
  Search,
  Clock,
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

  // Navigation pages in current workspace
  const pages = workspaceId
    ? [
        { label: "Overview", icon: LayoutDashboard, path: `/app/workspaces/${workspaceId}` },
        { label: "Projects", icon: FolderKanban, path: `/app/workspaces/${workspaceId}/projects` },
        { label: "Workflow", icon: GitBranch, path: `/app/workspaces/${workspaceId}/workflow` },
        { label: "Analytics", icon: BarChart3, path: `/app/workspaces/${workspaceId}/analytics` },
        { label: "Teams", icon: Users, path: `/app/workspaces/${workspaceId}/teams` },
        { label: "Activity", icon: History, path: `/app/workspaces/${workspaceId}/activity` },
        { label: "Settings", icon: Settings, path: `/app/workspaces/${workspaceId}/settings` },
        { label: "Inbox", icon: Bell, path: `/app/workspaces/${workspaceId}/notifications` },
      ]
    : [{ label: "Workspaces", icon: LayoutDashboard, path: "/app" }];

  // Recent items from localStorage
  const storageRecentKey = `forge_recent_${workspaceId || "global"}`;
  const [recentItems, setRecentItems] = useState<Array<{ id: string; name: string; type: "project" | "issue"; path: string }>>([]);

  useEffect(() => {
    if (open) {
      setSearch("");
      try {
        const saved = localStorage.getItem(storageRecentKey);
        setRecentItems(saved ? JSON.parse(saved) : []);
      } catch {
        setRecentItems([]);
      }
    }
  }, [open, storageRecentKey]);

  // Query workspace issues for command palette search
  const workspaceIssues = useQuery(
    api.issues.listWorkspaceIssues,
    workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
  );

  const handleSelect = (run: () => void) => {
    onOpenChange(false);
    run();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Search or jump to...</DialogTitle>
        <DialogDescription>Quickly navigate pages, projects, or trigger actions</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className="max-w-[560px] w-full rounded-[20px] border border-border bg-white p-0 shadow-none overflow-hidden"
      >
        <CommandPrimitive
          value={search}
          onValueChange={setSearch}
          className="flex h-full w-full flex-col overflow-hidden bg-white text-[#0D0D0D]"
        >
          {/* Input row without "(ESC to close)" and with esc hint on right */}
          <div className="flex h-12 items-center gap-3 border-b border-border/80 px-4">
            <Search className="size-4 shrink-0 text-[#575657]" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, projects, actions..."
              className="flex-1 bg-transparent text-[14px] text-[#0D0D0D] placeholder:text-[#575657]/50 outline-none"
              autoFocus
            />
            <kbd className="rounded-[4px] border border-border/70 bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
              esc
            </kbd>
          </div>

          <CommandPrimitive.List className="max-h-[420px] overflow-y-auto no-scrollbar p-2">
            <CommandPrimitive.Empty className="py-8 text-center text-[13px] text-[#575657]">
              No results
            </CommandPrimitive.Empty>

            {/* Recent group shown first when input is empty */}
            {search.trim() === "" && recentItems.length > 0 && (
              <CommandPrimitive.Group heading="Recent" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]">
                {recentItems.map((item) => (
                  <CommandPrimitive.Item
                    key={item.id}
                    value={`recent ${item.name}`}
                    onSelect={() => handleSelect(() => navigate(item.path))}
                    className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#575657]">
                        <Clock className="size-3.5" />
                      </div>
                      <span className="font-medium truncate">{item.name}</span>
                    </div>
                    <span className="text-[11px] text-[#575657] capitalize shrink-0">{item.type}</span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {/* Navigation pages */}
            <CommandPrimitive.Group heading="Navigation" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]">
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

            {/* Projects group */}
            {projects && projects.length > 0 && (
              <CommandPrimitive.Group heading="Projects" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]">
                {projects.slice(0, 8).map((proj) => (
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

            {/* Issues group */}
            {workspaceIssues?.issues && workspaceIssues.issues.length > 0 && (
              <CommandPrimitive.Group heading="Issues" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]">
                {workspaceIssues.issues.slice(0, 8).map((iss) => (
                  <CommandPrimitive.Item
                    key={iss._id}
                    value={`issue ${iss.number} ${iss.title}`}
                    onSelect={() => handleSelect(() => navigate(`/app/issues/${iss._id}`))}
                    className="flex h-10 items-center justify-between gap-3 rounded-[8px] px-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#F1F1F3] text-[#575657]">
                        <CheckCircle2 className="size-3.5" />
                      </div>
                      <span className="font-medium truncate">{iss.title}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#575657] shrink-0">#{iss.number}</span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {/* Actions group */}
            <CommandPrimitive.Group heading="Actions" className="px-1 pb-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]">
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
                  <kbd className="rounded-[4px] border border-border/70 bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
                    C
                  </kbd>
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
                  <kbd className="rounded-[4px] border border-border/70 bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
                    [
                  </kbd>
                </CommandPrimitive.Item>
              )}
            </CommandPrimitive.Group>
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
