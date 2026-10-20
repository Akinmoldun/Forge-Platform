import { Link, useLocation } from "react-router";
import { ChevronRight } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { EmblemIllustration } from "@/components/Illustrations";

export function AppBreadcrumbs({
  workspace,
  project,
  issue,
}: {
  workspace?: { _id: Id<"workspaces">; name: string; iconKey?: string } | null;
  project?: { _id: Id<"projects">; name: string; key: string; iconKey?: string } | null;
  issue?: { _id: Id<"issues">; title: string; number: number; key?: string } | null;
}) {
  const { pathname } = useLocation();

  // If outside workspace or no workspace loaded yet
  if (!workspace) return null;

  // Determine section name if on a workspace subpage
  let subpageName: string | null = null;
  if (pathname.includes("/overview")) subpageName = "Overview";
  else if (pathname.includes("/projects") && !project) subpageName = "Projects";
  else if (pathname.includes("/workflow")) subpageName = "Workflow";
  else if (pathname.includes("/analytics") && !project) subpageName = "Analytics";
  else if (pathname.includes("/teams") || pathname.includes("/members")) subpageName = "Teams";
  else if (pathname.includes("/activity") && !project) subpageName = "Activity";
  else if (pathname.includes("/settings") && !project) subpageName = "Settings";
  else if (pathname.includes("/notifications")) subpageName = "Inbox";

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] min-w-0">
      <Link
        to={`/app/workspaces/${workspace._id}`}
        className="flex items-center gap-1.5 font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[200px]"
      >
        <EmblemIllustration
          emblemKey={workspace.iconKey}
          name={workspace.name}
          id={workspace._id}
          size={16}
        />
        <span className="truncate">{workspace.name}</span>
      </Link>

      {project && (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-[#575657]/50" aria-hidden="true" />
          <Link
            to={`/app/projects/${project._id}`}
            className="flex items-center gap-1.5 font-medium text-[#575657] hover:text-[#0D0D0D] transition-colors truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[200px]"
          >
            <EmblemIllustration
              emblemKey={project.iconKey}
              name={project.name}
              id={project._id}
              size={16}
            />
            <span className="truncate">{project.name}</span>
          </Link>
        </>
      )}

      {issue && (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-[#575657]/50" aria-hidden="true" />
          <Link
            to={`/app/issues/${issue._id}`}
            className="font-medium text-[#0D0D0D] truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[260px] hover:underline"
          >
            {project?.key ? `${project.key}-${issue.number}` : `#${issue.number}`}: {issue.title}
          </Link>
        </>
      )}

      {!project && !issue && subpageName && (
        <>
          <ChevronRight className="size-3.5 shrink-0 text-[#575657]/50" aria-hidden="true" />
          <span className="font-medium text-[#0D0D0D]">{subpageName}</span>
        </>
      )}
    </nav>
  );
}
