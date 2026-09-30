import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Link, useLocation } from "react-router";
import { Check, ChevronsUpDown, LogOut, Plus, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ForgeLogo } from "./ForgeLogo";

export function AppShell({
  children,
  workspaceId,
}: {
  children: React.ReactNode;
  workspaceId?: string;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const workspaces = useQuery(api.workspaces.listMyWorkspaces) ?? [];
  const notifications = useQuery(api.analytics.listNotifications);
  const unread = notifications?.unreadCount ?? 0;

  const active = workspaceId ? workspaces.find((w) => w._id === workspaceId) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
          <Link to="/app" className="flex items-center gap-2 pr-1">
            <ForgeLogo className="size-5" />
            <span className="text-[14px] font-semibold tracking-tight">Forge</span>
          </Link>

          <span className="h-4 w-px bg-border" aria-hidden />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[13px] font-medium text-foreground">
                <span className="max-w-32 truncate sm:max-w-44">{active ? active.name : "Workspaces"}</span>
                <ChevronsUpDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((w) => (
                <DropdownMenuItem
                  key={w._id}
                  onClick={() => navigate(`/app/workspaces/${w._id}`)}
                >
                  <span className="flex-1 truncate">{w.name}</span>
                  {active?._id === w._id && <Check className="size-3.5" />}
                </DropdownMenuItem>
              ))}
              {workspaces.length === 0 && (
                <div className="px-2 py-3 text-xs text-muted-foreground">
                  No workspaces yet.
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/app")}>
                <Plus /> New workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <nav className="ml-1 hidden items-center gap-0.5 md:flex">
            {workspaceId && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "h-7 px-2.5 text-[13px] text-muted-foreground",
                    location.pathname === `/app/workspaces/${workspaceId}` && "bg-secondary text-foreground",
                  )}
                >
                  <Link to={`/app/workspaces/${workspaceId}`}>Overview</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "h-7 px-2.5 text-[13px] text-muted-foreground",
                    location.pathname === `/app/workspaces/${workspaceId}/activity` && "bg-secondary text-foreground",
                  )}
                >
                  <Link to={`/app/workspaces/${workspaceId}/activity`}>Activity</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "h-7 px-2.5 text-[13px] text-muted-foreground",
                    location.pathname === `/app/workspaces/${workspaceId}/members` && "bg-secondary text-foreground",
                  )}
                >
                  <Link to={`/app/workspaces/${workspaceId}/members`}>Members</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "h-7 px-2.5 text-[13px] text-muted-foreground",
                    location.pathname === `/app/workspaces/${workspaceId}/settings` && "bg-secondary text-foreground",
                  )}
                >
                  <Link to={`/app/workspaces/${workspaceId}/settings`}>Settings</Link>
                </Button>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative size-8 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/app/notifications")}
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
            <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Account menu"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="border border-border bg-secondary text-[10px] font-medium text-foreground">
                      {(user?.name ?? user?.email ?? "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate font-normal">
                  {user?.name ?? user?.email ?? "Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app")}>
                  <Plus /> New workspace
                </DropdownMenuItem>
                {active && (
                  <DropdownMenuItem onClick={() => navigate(`/app/workspaces/${workspaceId}/settings`)}>
                    <Settings /> Workspace settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  <LogOut /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
      </main>
    </div>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const tone =
    role === "owner"
      ? "border-white/25 bg-white/10 text-foreground"
      : role === "admin"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-400"
        : role === "member"
          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          : "border-border bg-secondary text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", tone)}>
      {role}
    </Badge>
  );
}
