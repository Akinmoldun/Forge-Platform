import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { useSafeQuery } from "@/hooks/use-safe-query";
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
  UserPlus,
  Search,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { EmblemIllustration } from "@/components/Illustrations";
import { isOpenIssue } from "@/lib/issueStatus";

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

interface RecentItem {
  id: string;
  type: "issue" | "project" | "page";
  title: string;
  key?: string;
  path: string;
  status?: string;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const trimmed = query.trim();
  if (!trimmed) return <>{text}</>;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <strong key={i} className="font-semibold text-[#0D0D0D]">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function CommandPaletteDialog({
  open,
  onOpenChange,
  workspaceId,
  projects = [],
  onNewIssue,
  onNewProject,
  onInviteMember,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recents, setRecents] = useState<RecentItem[]>([]);

  // Load recent items from localStorage on open
  useEffect(() => {
    if (open) {
      setSearch("");
      if (workspaceId) {
        try {
          const raw = localStorage.getItem(`forge_recent_${workspaceId}`);
          if (raw) {
            setRecents(JSON.parse(raw));
          } else {
            setRecents([]);
          }
        } catch {
          setRecents([]);
        }
      }
    }
  }, [open, workspaceId]);

  const saveRecent = useCallback(
    (item: RecentItem) => {
      if (!workspaceId) return;
      try {
        const storageKey = `forge_recent_${workspaceId}`;
        const raw = localStorage.getItem(storageKey);
        const existing: RecentItem[] = raw ? JSON.parse(raw) : [];
        const filtered = existing.filter((x) => x.id !== item.id && x.path !== item.path);
        const updated = [item, ...filtered].slice(0, 5);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setRecents(updated);
      } catch {
        // ignore storage errors
      }
    },
    [workspaceId],
  );

  const handleSelect = (run: () => void, recent?: RecentItem) => {
    if (recent) saveRecent(recent);
    onOpenChange(false);
    run();
  };

  const isValidWs = Boolean(workspaceId && workspaceId !== "undefined" && workspaceId !== "null");
  const workspaceIssues = useSafeQuery(
    api.issues.listWorkspaceIssues,
    isValidWs ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip",
  );

  const allIssues = useMemo(() => {
    return workspaceIssues?.issues ?? [];
  }, [workspaceIssues]);

  // Pages definition (7 standard pages)
  const pages = useMemo(() => {
    if (!workspaceId) {
      return [{ id: "workspaces", label: "Workspaces", icon: LayoutDashboard, path: "/app" }];
    }
    return [
      { id: "overview", label: "Overview", icon: LayoutDashboard, path: `/app/workspaces/${workspaceId}` },
      { id: "projects", label: "Projects", icon: FolderKanban, path: `/app/workspaces/${workspaceId}/projects` },
      { id: "workflow", label: "Workflow", icon: GitBranch, path: `/app/workspaces/${workspaceId}/workflow` },
      { id: "analytics", label: "Analytics", icon: BarChart3, path: `/app/workspaces/${workspaceId}/analytics` },
      { id: "teams", label: "Teams", icon: Users, path: `/app/workspaces/${workspaceId}/teams` },
      { id: "activity", label: "Activity", icon: History, path: `/app/workspaces/${workspaceId}/activity` },
      { id: "settings", label: "Settings", icon: Settings, path: `/app/workspaces/${workspaceId}/settings` },
    ];
  }, [workspaceId]);

  const trimmedSearch = search.trim().toLowerCase();
  const isQueryEmpty = trimmedSearch.length === 0;

  // Filtered pages
  const matchedPages = useMemo(() => {
    if (isQueryEmpty) return pages;
    return pages.filter((p) => p.label.toLowerCase().includes(trimmedSearch));
  }, [pages, trimmedSearch, isQueryEmpty]);

  // Filtered projects (up to 5)
  const matchedProjects = useMemo(() => {
    if (isQueryEmpty) return projects.slice(0, 5);
    return projects
      .filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedSearch) ||
          p.key.toLowerCase().includes(trimmedSearch),
      )
      .slice(0, 5);
  }, [projects, trimmedSearch, isQueryEmpty]);

  // Issues: open first (max 8), then closed issues only if query matches them
  const { matchedOpenIssues, matchedClosedIssues } = useMemo(() => {
    if (isQueryEmpty) return { matchedOpenIssues: [], matchedClosedIssues: [] };

    const openList: typeof allIssues = [];
    const closedList: typeof allIssues = [];

    for (const iss of allIssues) {
      const fullKey = iss.projectKey ? `${iss.projectKey}-${iss.number}`.toLowerCase() : `#${iss.number}`;
      const titleLower = iss.title.toLowerCase();
      const match = titleLower.includes(trimmedSearch) || fullKey.includes(trimmedSearch);
      if (!match) continue;

      if (isOpenIssue(iss, iss.status?.category)) {
        if (openList.length < 8) openList.push(iss);
      } else {
        if (closedList.length < 4) closedList.push(iss);
      }
    }

    return { matchedOpenIssues: openList, matchedClosedIssues: closedList };
  }, [allIssues, trimmedSearch, isQueryEmpty]);

  // Quick actions
  const actions = useMemo(() => {
    const list = [
      { id: "new-issue", label: "New issue", icon: Plus, handler: onNewIssue },
      { id: "new-project", label: "New project", icon: FolderKanban, handler: onNewProject },
      { id: "invite-member", label: "Invite member", icon: UserPlus, handler: onInviteMember },
    ].filter((a): a is { id: string; label: string; icon: typeof Plus; handler: () => void } =>
      Boolean(a.handler),
    );

    if (isQueryEmpty) return [];
    return list.filter((a) => a.label.toLowerCase().includes(trimmedSearch));
  }, [onNewIssue, onNewProject, onInviteMember, isQueryEmpty, trimmedSearch]);

  const hasAnyResults =
    isQueryEmpty ||
    matchedPages.length > 0 ||
    matchedProjects.length > 0 ||
    matchedOpenIssues.length > 0 ||
    matchedClosedIssues.length > 0 ||
    actions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Search</DialogTitle>
        <DialogDescription>Search pages, projects, and issues</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-[rgba(13,13,13,0.25)] backdrop-blur-none"
        className="max-w-[600px] w-full rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-0 gap-0 shadow-none overflow-hidden block"
      >
        <CommandPrimitive
          shouldFilter={false}
          className="flex h-full w-full flex-col overflow-hidden bg-white text-[#0D0D0D]"
        >
          {/* Input row */}
          <div className="flex h-12 items-center gap-3 px-4 bg-white">
            <Search className="size-4 shrink-0 text-[#575657]" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search"
              className="flex-1 bg-transparent text-[14px] text-[#0D0D0D] placeholder:text-[#575657]/70 outline-none"
              autoFocus
            />
            <kbd className="rounded-[4px] border border-[rgba(0,0,0,0.08)] bg-[#F1F1F3] px-1.5 py-0.5 font-mono text-[10px] text-[#575657]">
              esc
            </kbd>
          </div>

          <div className="h-px w-full bg-[rgba(0,0,0,0.08)]" />

          {/* Vertical List */}
          <CommandPrimitive.List className="max-h-[400px] overflow-y-auto no-scrollbar p-2">
            {!hasAnyResults && (
              <CommandPrimitive.Empty className="py-8 text-center text-[13px] text-[#575657]">
                No results for &ldquo;{search}&rdquo;
              </CommandPrimitive.Empty>
            )}

            {/* EMPTY INPUT: 1. Recent (if any) */}
            {isQueryEmpty && recents.length > 0 && (
              <CommandPrimitive.Group
                heading="Recent"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
              >
                {recents.map((item) => (
                  <CommandPrimitive.Item
                    key={`recent-${item.id}`}
                    value={`recent ${item.title}`}
                    onSelect={() => handleSelect(() => navigate(item.path))}
                    className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center justify-between gap-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {item.type === "issue" && (
                        <CircleDot className="size-4 text-[#575657] shrink-0" />
                      )}
                      {item.type === "project" && (
                        <FolderKanban className="size-4 text-[#575657] shrink-0" />
                      )}
                      {item.type === "page" && (
                        <LayoutDashboard className="size-4 text-[#575657] shrink-0" />
                      )}
                      {item.key && (
                        <span className="font-mono text-[11px] text-[#575657] shrink-0">
                          {item.key}
                        </span>
                      )}
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.status && (
                      <span className="text-[11px] text-[#575657] shrink-0">
                        {item.status}
                      </span>
                    )}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {/* EMPTY INPUT: 2. Pages */}
            {isQueryEmpty && (
              <CommandPrimitive.Group
                heading="Pages"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
              >
                {pages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <CommandPrimitive.Item
                      key={p.path}
                      value={`page ${p.label}`}
                      onSelect={() =>
                        handleSelect(() => navigate(p.path), {
                          id: p.id,
                          type: "page",
                          title: p.label,
                          path: p.path,
                        })
                      }
                      className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center gap-2.5 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                    >
                      <Icon className="size-4 text-[#575657] shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </CommandPrimitive.Item>
                  );
                })}
              </CommandPrimitive.Group>
            )}

            {/* EMPTY INPUT: 3. Projects (up to 5) */}
            {isQueryEmpty && projects.length > 0 && (
              <CommandPrimitive.Group
                heading="Projects"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
              >
                {projects.slice(0, 5).map((proj) => (
                  <CommandPrimitive.Item
                    key={proj._id}
                    value={`project ${proj.name} ${proj.key}`}
                    onSelect={() =>
                      handleSelect(() => navigate(`/app/projects/${proj._id}`), {
                        id: proj._id,
                        type: "project",
                        title: proj.name,
                        key: proj.key,
                        path: `/app/projects/${proj._id}`,
                      })
                    }
                    className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center justify-between gap-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <EmblemIllustration
                        emblemKey={proj.iconKey || "compass"}
                        name={proj.name}
                        id={proj._id}
                        size={16}
                        className="shrink-0"
                      />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-[#575657] shrink-0">
                      {proj.key}
                    </span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {/* TYPING RESULTS */}
            {!isQueryEmpty && (
              <>
                {/* Matched Projects */}
                {matchedProjects.length > 0 && (
                  <CommandPrimitive.Group
                    heading="Projects"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
                  >
                    {matchedProjects.map((proj) => (
                      <CommandPrimitive.Item
                        key={proj._id}
                        value={`project ${proj.name} ${proj.key}`}
                        onSelect={() =>
                          handleSelect(() => navigate(`/app/projects/${proj._id}`), {
                            id: proj._id,
                            type: "project",
                            title: proj.name,
                            key: proj.key,
                            path: `/app/projects/${proj._id}`,
                          })
                        }
                        className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center justify-between gap-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <EmblemIllustration
                            emblemKey={proj.iconKey || "compass"}
                            name={proj.name}
                            id={proj._id}
                            size={16}
                            className="shrink-0"
                          />
                          <span className="truncate">
                            <HighlightMatch text={proj.name} query={search} />
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[#575657] shrink-0">
                          <HighlightMatch text={proj.key} query={search} />
                        </span>
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                )}

                {/* Matched Pages */}
                {matchedPages.length > 0 && (
                  <CommandPrimitive.Group
                    heading="Pages"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
                  >
                    {matchedPages.map((p) => {
                      const Icon = p.icon;
                      return (
                        <CommandPrimitive.Item
                          key={p.path}
                          value={`page ${p.label}`}
                          onSelect={() =>
                            handleSelect(() => navigate(p.path), {
                              id: p.id,
                              type: "page",
                              title: p.label,
                              path: p.path,
                            })
                          }
                          className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center gap-2.5 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                        >
                          <Icon className="size-4 text-[#575657] shrink-0" />
                          <span className="truncate">
                            <HighlightMatch text={p.label} query={search} />
                          </span>
                        </CommandPrimitive.Item>
                      );
                    })}
                  </CommandPrimitive.Group>
                )}

                {/* Matched Open Issues */}
                {matchedOpenIssues.length > 0 && (
                  <CommandPrimitive.Group
                    heading="Issues"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
                  >
                    {matchedOpenIssues.map((iss) => {
                      const keyStr = iss.projectKey ? `${iss.projectKey}-${iss.number}` : `#${iss.number}`;
                      const statusName = iss.status?.name || "Open";
                      return (
                        <CommandPrimitive.Item
                          key={iss._id}
                          value={`issue ${keyStr} ${iss.title}`}
                          onSelect={() =>
                            handleSelect(() => navigate(`/app/issues/${iss._id}`), {
                              id: iss._id,
                              type: "issue",
                              title: iss.title,
                              key: keyStr,
                              path: `/app/issues/${iss._id}`,
                              status: statusName,
                            })
                          }
                          className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center justify-between gap-3 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-mono text-[11px] text-[#575657] shrink-0">
                              <HighlightMatch text={keyStr} query={search} />
                            </span>
                            <span className="truncate">
                              <HighlightMatch text={iss.title} query={search} />
                            </span>
                          </div>
                          <span className="text-[11px] text-[#575657] shrink-0">
                            {statusName}
                          </span>
                        </CommandPrimitive.Item>
                      );
                    })}
                  </CommandPrimitive.Group>
                )}

                {/* Matched Closed Issues (Done & Cancelled in muted color) */}
                {matchedClosedIssues.length > 0 && (
                  <CommandPrimitive.Group
                    heading="Completed & Cancelled"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
                  >
                    {matchedClosedIssues.map((iss) => {
                      const keyStr = iss.projectKey ? `${iss.projectKey}-${iss.number}` : `#${iss.number}`;
                      const statusName = iss.status?.name || "Done";
                      return (
                        <CommandPrimitive.Item
                          key={iss._id}
                          value={`issue ${keyStr} ${iss.title}`}
                          onSelect={() =>
                            handleSelect(() => navigate(`/app/issues/${iss._id}`), {
                              id: iss._id,
                              type: "issue",
                              title: iss.title,
                              key: keyStr,
                              path: `/app/issues/${iss._id}`,
                              status: statusName,
                            })
                          }
                          className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center justify-between gap-3 text-[13px] text-[#575657] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <CheckCircle2 className="size-3.5 text-[#575657]/70 shrink-0" />
                            <span className="font-mono text-[11px] text-[#575657] shrink-0">
                              <HighlightMatch text={keyStr} query={search} />
                            </span>
                            <span className="truncate line-through opacity-80">
                              <HighlightMatch text={iss.title} query={search} />
                            </span>
                          </div>
                          <span className="text-[11px] text-[#575657] shrink-0">
                            {statusName}
                          </span>
                        </CommandPrimitive.Item>
                      );
                    })}
                  </CommandPrimitive.Group>
                )}

                {/* Actions */}
                {actions.length > 0 && (
                  <CommandPrimitive.Group
                    heading="Actions"
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[#575657]"
                  >
                    {actions.map((act) => {
                      const Icon = act.icon;
                      return (
                        <CommandPrimitive.Item
                          key={act.id}
                          value={`action ${act.label}`}
                          onSelect={() => handleSelect(act.handler)}
                          className="h-9 min-h-[36px] max-h-[36px] px-2.5 rounded-[8px] flex items-center gap-2.5 text-[13px] text-[#0D0D0D] cursor-pointer aria-selected:bg-[#F1F1F3] hover:bg-[#F1F1F3] transition-colors select-none"
                        >
                          <Icon className="size-4 text-[#575657] shrink-0" />
                          <span className="truncate">
                            <HighlightMatch text={act.label} query={search} />
                          </span>
                        </CommandPrimitive.Item>
                      );
                    })}
                  </CommandPrimitive.Group>
                )}
              </>
            )}
          </CommandPrimitive.List>

          {/* Clean minimal footer */}
          <div className="border-t border-[rgba(0,0,0,0.08)] px-4 py-2 text-[11px] text-[#575657] bg-white">
            ↑↓ to move, Enter to open
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
