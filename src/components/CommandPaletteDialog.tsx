import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
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

  const handleSelect = (run: () => void) => {
    onOpenChange(false);
    run();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search or jump to..."
      description="Quickly navigate pages, projects, or trigger actions"
      className="max-w-xl rounded-[20px] border border-border bg-white p-0 shadow-none overflow-hidden"
    >
      <CommandInput placeholder="Search pages, projects, actions... (ESC to close)" />
      <CommandList className="max-h-[360px] p-2">
        <CommandEmpty className="py-6 text-center text-[13px] text-[#575657]">
          No matching results found.
        </CommandEmpty>

        {/* Go to group */}
        <CommandGroup heading="Go to">
          {pages.map((p) => {
            const Icon = p.icon;
            return (
              <CommandItem
                key={p.path}
                value={`goto ${p.label}`}
                onSelect={() => handleSelect(() => navigate(p.path))}
                className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE]"
              >
                <Icon className="size-4 text-[#575657]" />
                <span className="font-medium">{p.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Projects group */}
        {projects && projects.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.slice(0, 8).map((proj) => (
              <CommandItem
                key={proj._id}
                value={`project ${proj.name} ${proj.key}`}
                onSelect={() => handleSelect(() => navigate(`/app/projects/${proj._id}`))}
                className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE]"
              >
                <span
                  className="size-2 rounded-[2px] shrink-0"
                  style={{ backgroundColor: proj.color || "#6E94CB" }}
                />
                <span className="font-medium truncate flex-1">{proj.name}</span>
                <span className="font-mono text-[11px] text-[#575657] uppercase">{proj.key}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Actions group */}
        <CommandGroup heading="Actions">
          {onNewIssue && (
            <CommandItem
              value="action new issue create task"
              onSelect={() => handleSelect(onNewIssue)}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE]"
            >
              <Plus className="size-4 text-[#575657]" />
              <span className="font-medium flex-1">New issue</span>
              <CommandShortcut className="font-mono text-[11px] text-[#575657]">C</CommandShortcut>
            </CommandItem>
          )}

          {onNewProject && (
            <CommandItem
              value="action new project create folder"
              onSelect={() => handleSelect(onNewProject)}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE]"
            >
              <FolderKanban className="size-4 text-[#575657]" />
              <span className="font-medium">New project</span>
            </CommandItem>
          )}

          {onInviteMember && (
            <CommandItem
              value="action invite member team"
              onSelect={() => handleSelect(onInviteMember)}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE]"
            >
              <UserPlus className="size-4 text-[#575657]" />
              <span className="font-medium">Invite member</span>
            </CommandItem>
          )}

          {onToggleSidebar && (
            <CommandItem
              value="action toggle sidebar collapse expand"
              onSelect={() => handleSelect(onToggleSidebar)}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#ECECEE]"
            >
              <PanelLeft className="size-4 text-[#575657]" />
              <span className="font-medium flex-1">Toggle sidebar</span>
              <CommandShortcut className="font-mono text-[11px] text-[#575657]">[</CommandShortcut>
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
