import { type SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface IllustrationProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * Notion-style Workspace Illustrations
 * Calm, precise 1px ink strokes (#0D0D0D) with soft neutral fills (#F1F1F3, #FAF9F6)
 */
export function WorkspaceIllustration({
  name = "",
  size = 24,
  className,
  ...props
}: {
  name?: string;
  size?: number;
} & SVGProps<SVGSVGElement>) {
  const lower = name.toLowerCase();

  // Northstar Labs -> Star / Compass
  if (lower.includes("northstar") || lower.includes("star") || lower.includes("compass")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <circle cx="12" cy="12" r="9.5" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <path
          d="M12 4.5L13.8 10.2L19.5 12L13.8 13.8L12 19.5L10.2 13.8L4.5 12L10.2 10.2L12 4.5Z"
          fill="#0D0D0D"
        />
        <circle cx="12" cy="12" r="1.5" fill="#FAF9F6" />
      </svg>
    );
  }

  // Pixel Forge -> Isometric Voxel Cube / Workshop
  if (lower.includes("pixel") || lower.includes("forge") || lower.includes("game")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <path
          d="M12 3.5L19 7.5V16.5L12 20.5L5 16.5V7.5L12 3.5Z"
          fill="#FAF9F6"
          stroke="#0D0D0D"
          strokeWidth="1"
        />
        <path d="M12 3.5V12M12 12L19 7.5M12 12L5 7.5" stroke="#0D0D0D" strokeWidth="1" />
        <path d="M12 12V20.5" stroke="#0D0D0D" strokeWidth="1" />
        <path d="M10 8L12 9.2L14 8" stroke="#0D0D0D" strokeWidth="1" />
      </svg>
    );
  }

  // Quiet Harbor -> Lighthouse / Harbor Anchor
  if (lower.includes("quiet") || lower.includes("harbor") || lower.includes("port") || lower.includes("ocean")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <circle cx="12" cy="12" r="9.5" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <path d="M9.5 18.5L11 8H13L14.5 18.5H9.5Z" fill="#F1F1F3" stroke="#0D0D0D" strokeWidth="1" />
        <rect x="10.5" y="6" width="3" height="2" rx="0.5" fill="#0D0D0D" />
        <line x1="6.5" y1="18.5" x2="17.5" y2="18.5" stroke="#0D0D0D" strokeWidth="1" />
        <circle cx="12" cy="10" r="1" fill="#0D0D0D" />
      </svg>
    );
  }

  // Default Workspace -> Notion-style Architecture / Notebook
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="4" y="3.5" width="16" height="17" rx="3" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
      <line x1="7.5" y1="3.5" x2="7.5" y2="20.5" stroke="#0D0D0D" strokeWidth="1" />
      <line x1="11" y1="8" x2="16.5" y2="8" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="12" x2="15" y2="12" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
      <line x1="11" y1="16" x2="13.5" y2="16" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Notion-style Project Illustrations
 * Dedicated, recognizable monochrome icons for each project domain
 */
export function ProjectIllustration({
  projectKey = "",
  name = "",
  size = 18,
  className,
  ...props
}: {
  projectKey?: string;
  name?: string;
  size?: number;
} & SVGProps<SVGSVGElement>) {
  const key = projectKey.toUpperCase();
  const lowerName = name.toLowerCase();

  // Mobile Client
  if (key === "MOB" || lowerName.includes("mobile") || lowerName.includes("ios") || lowerName.includes("android")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <rect x="5.5" y="2.5" width="9" height="15" rx="2" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <line x1="8.5" y1="4.5" x2="11.5" y2="4.5" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
        <circle cx="10" cy="14.5" r="0.75" fill="#0D0D0D" />
      </svg>
    );
  }

  // Billing & Payments
  if (key === "BIL" || lowerName.includes("bill") || lowerName.includes("pay") || lowerName.includes("stripe")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <rect x="2.5" y="4.5" width="15" height="11" rx="2" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <line x1="2.5" y1="8" x2="17.5" y2="8" stroke="#0D0D0D" strokeWidth="1" />
        <rect x="5" y="11" width="3" height="2" rx="0.5" fill="#0D0D0D" />
      </svg>
    );
  }

  // Web Application
  if (key === "WEB" || lowerName.includes("web") || lowerName.includes("frontend") || lowerName.includes("app")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <rect x="2.5" y="3.5" width="15" height="13" rx="2" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <line x1="2.5" y1="7" x2="17.5" y2="7" stroke="#0D0D0D" strokeWidth="1" />
        <circle cx="5" cy="5.25" r="0.75" fill="#0D0D0D" />
        <circle cx="7.5" cy="5.25" r="0.75" fill="#0D0D0D" />
        <circle cx="10" cy="5.25" r="0.75" fill="#0D0D0D" />
      </svg>
    );
  }

  // Platform & Infrastructure
  if (key === "PLT" || lowerName.includes("platform") || lowerName.includes("infra") || lowerName.includes("cloud")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <rect x="3.5" y="3.5" width="13" height="4" rx="1" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <rect x="3.5" y="8" width="13" height="4" rx="1" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <rect x="3.5" y="12.5" width="13" height="4" rx="1" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <circle cx="6" cy="5.5" r="0.75" fill="#0D0D0D" />
        <circle cx="6" cy="10" r="0.75" fill="#0D0D0D" />
        <circle cx="6" cy="14.5" r="0.75" fill="#0D0D0D" />
      </svg>
    );
  }

  // Data Pipeline
  if (key === "DAT" || lowerName.includes("data") || lowerName.includes("etl") || lowerName.includes("pipeline")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <ellipse cx="10" cy="5" rx="6.5" ry="2.5" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <path d="M3.5 5V9.5C3.5 10.9 6.4 12 10 12C13.6 12 16.5 10.9 16.5 9.5V5" stroke="#0D0D0D" strokeWidth="1" />
        <path d="M3.5 9.5V14C3.5 15.4 6.4 16.5 10 16.5C13.6 16.5 16.5 15.4 16.5 14V9.5" stroke="#0D0D0D" strokeWidth="1" />
      </svg>
    );
  }

  // Gameplay / Game Studio
  if (key === "GAM" || lowerName.includes("game") || lowerName.includes("play")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <rect x="2.5" y="5.5" width="15" height="9" rx="3" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <line x1="5.5" y1="10" x2="8.5" y2="10" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="8.5" x2="7" y2="11.5" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
        <circle cx="13" cy="9" r="0.8" fill="#0D0D0D" />
        <circle cx="14.5" cy="11" r="0.8" fill="#0D0D0D" />
      </svg>
    );
  }

  // Art & Visual
  if (key === "ART" || lowerName.includes("art") || lowerName.includes("design")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <path
          d="M10 2.5C5.8 2.5 2.5 5.8 2.5 10C2.5 13.8 5.4 17.5 9.5 17.5C10.6 17.5 11.5 16.6 11.5 15.5C11.5 15 11.3 14.5 11 14.2C10.7 13.9 10.5 13.5 10.5 13C10.5 12 11.3 11.2 12.3 11.2H14C16 11.2 17.5 9.7 17.5 7.7C17.5 4.8 14.1 2.5 10 2.5Z"
          fill="#FAF9F6"
          stroke="#0D0D0D"
          strokeWidth="1"
        />
        <circle cx="6.5" cy="8" r="0.8" fill="#0D0D0D" />
        <circle cx="9.5" cy="6" r="0.8" fill="#0D0D0D" />
        <circle cx="13" cy="7.5" r="0.8" fill="#0D0D0D" />
      </svg>
    );
  }

  // Network / Multiplayer
  if (key === "NET" || lowerName.includes("net") || lowerName.includes("sync")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <circle cx="10" cy="5" r="2.5" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <circle cx="5" cy="15" r="2.5" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <circle cx="15" cy="15" r="2.5" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
        <line x1="8.5" y1="7" x2="6.5" y2="13" stroke="#0D0D0D" strokeWidth="1" />
        <line x1="11.5" y1="7" x2="13.5" y2="13" stroke="#0D0D0D" strokeWidth="1" />
      </svg>
    );
  }

  // QA & Testing
  if (key === "QAT" || lowerName.includes("qa") || lowerName.includes("test")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        {...props}
      >
        <path
          d="M10 2.5L3.5 5.5V10.5C3.5 14.5 6.3 17.5 10 18.5C13.7 17.5 16.5 14.5 16.5 10.5V5.5L10 2.5Z"
          fill="#FAF9F6"
          stroke="#0D0D0D"
          strokeWidth="1"
        />
        <path d="M7.5 10.5L9 12L12.5 8.5" stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Generic Project -> Notion-style Notebook / Folder
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect x="3.5" y="2.5" width="13" height="15" rx="2" fill="#FAF9F6" stroke="#0D0D0D" strokeWidth="1" />
      <line x1="6.5" y1="2.5" x2="6.5" y2="17.5" stroke="#0D0D0D" strokeWidth="1" />
      <line x1="9" y1="6.5" x2="13.5" y2="6.5" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="10" x2="12.5" y2="10" stroke="#0D0D0D" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Notion-style Minimalist Line Portrait Avatars
 * 6 calm, distinctive line portraits that replace generic initial letters
 */
export function NotionAvatarIllustration({
  name = "User",
  size = 28,
  className,
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % 6;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-[#FBFBFC]",
        className
      )}
      style={{ width: size, height: size }}
      aria-label={name}
      title={name}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full"
      >
        {/* Soft background base */}
        <circle cx="16" cy="16" r="15" fill="#FAF9F6" />

        {index === 0 && (
          // Portrait 0: Glasses & side part
          <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 12C10 8 13 6 16 6C19 6 22 8 22 12V14C22 17.5 19.3 20 16 20C12.7 20 10 17.5 10 14V12Z" fill="#F1F1F3" />
            <path d="M10 11C11.5 8.5 14 8 16 8C19 8 21.5 9 22 11" fill="none" />
            {/* Glasses */}
            <circle cx="13.5" cy="14" r="2.2" fill="#FAF9F6" />
            <circle cx="18.5" cy="14" r="2.2" fill="#FAF9F6" />
            <line x1="15.7" y1="14" x2="16.3" y2="14" />
            {/* Shoulders */}
            <path d="M7 29C7.5 24 11 23 16 23C21 23 24.5 24 25 29" fill="#F1F1F3" />
          </g>
        )}

        {index === 1 && (
          // Portrait 1: Minimalist beanie & calm smile
          <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Beanie */}
            <path d="M9.5 12C9.5 8 12 5.5 16 5.5C20 5.5 22.5 8 22.5 12H9.5Z" fill="#EAEAEF" />
            <rect x="9" y="11" width="14" height="2.5" rx="1" fill="#0D0D0D" />
            {/* Face */}
            <path d="M10.5 13.5V15C10.5 18 13 20.5 16 20.5C19 20.5 21.5 18 21.5 15V13.5" fill="#FAF9F6" />
            {/* Eyes & smile */}
            <circle cx="13.5" cy="16" r="0.8" fill="#0D0D0D" />
            <circle cx="18.5" cy="16" r="0.8" fill="#0D0D0D" />
            <path d="M14.5 18.2C15 18.7 17 18.7 17.5 18.2" fill="none" />
            {/* Collar */}
            <path d="M8 29C8.5 24.5 12 23.5 16 23.5C20 23.5 23.5 24.5 24 29" fill="#F1F1F3" />
          </g>
        )}

        {index === 2 && (
          // Portrait 2: Wavy hair & calm look
          <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Wavy hair */}
            <path d="M9 13C8 10 10 6 16 6C22 6 24 10 23 13C23.5 16 23 18 22.5 19H9.5C9 18 8.5 16 9 13Z" fill="#F1F1F3" />
            {/* Face */}
            <path d="M11 13V15C11 18 13.2 20 16 20C18.8 20 21 18 21 15V13H11Z" fill="#FAF9F6" />
            <path d="M10 11C13 11 14 13 16 13C18 13 19 11 22 11" fill="none" />
            {/* Eyes */}
            <line x1="13" y1="15.5" x2="14.5" y2="15.5" />
            <line x1="17.5" y1="15.5" x2="19" y2="15.5" />
            {/* Neck / shoulders */}
            <path d="M7.5 29C8 24 11.5 23 16 23C20.5 23 24 24 24.5 29" fill="#FAF9F6" />
          </g>
        )}

        {index === 3 && (
          // Portrait 3: Round curls & warm expression
          <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="16" cy="11" r="6.5" fill="#EAEAEF" />
            <circle cx="10.5" cy="12" r="3" fill="#EAEAEF" />
            <circle cx="21.5" cy="12" r="3" fill="#EAEAEF" />
            {/* Face */}
            <path d="M11.5 12V15C11.5 18 13.5 20.5 16 20.5C18.5 20.5 20.5 18 20.5 15V12" fill="#FAF9F6" />
            <circle cx="14" cy="15.5" r="0.8" fill="#0D0D0D" />
            <circle cx="18" cy="15.5" r="0.8" fill="#0D0D0D" />
            <path d="M15 18C15.5 18.5 16.5 18.5 17 18" fill="none" />
            {/* Shoulders */}
            <path d="M8 29C8.5 24.5 11.5 23.5 16 23.5C20.5 23.5 23.5 24.5 24 29" fill="#F1F1F3" />
          </g>
        )}

        {index === 4 && (
          // Portrait 4: Clean topknot / bun
          <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="16" cy="5.5" r="2.5" fill="#0D0D0D" />
            <path d="M10 11C10 8 12.5 7 16 7C19.5 7 22 8 22 11V14C22 17.5 19.3 20 16 20C12.7 20 10 17.5 10 14V11Z" fill="#FAF9F6" />
            <path d="M10 10.5C13 11 15 12 16 12C17 12 19 11 22 10.5" fill="none" />
            <circle cx="13.5" cy="15" r="0.8" fill="#0D0D0D" />
            <circle cx="18.5" cy="15" r="0.8" fill="#0D0D0D" />
            <path d="M14.5 17.5C15.2 18 16.8 18 17.5 17.5" fill="none" />
            <path d="M8 29C8.5 24.5 11.5 23 16 23C20.5 23 23.5 24.5 24 29" fill="#F1F1F3" />
          </g>
        )}

        {index === 5 && (
          // Portrait 5: Minimalist headphones / tech worker
          <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            {/* Headphones band */}
            <path d="M8.5 14C8.5 9 11.5 6 16 6C20.5 6 23.5 9 23.5 14" fill="none" strokeWidth="1.5" />
            <rect x="7.5" y="12" width="2" height="4.5" rx="1" fill="#0D0D0D" />
            <rect x="22.5" y="12" width="2" height="4.5" rx="1" fill="#0D0D0D" />
            {/* Face */}
            <path d="M11 11C11 8.5 13 8 16 8C19 8 21 8.5 21 11V14.5C21 17.5 18.8 20 16 20C13.2 20 11 17.5 11 14.5V11Z" fill="#FAF9F6" />
            <line x1="13.5" y1="15" x2="14.5" y2="15" />
            <line x1="17.5" y1="15" x2="18.5" y2="15" />
            <path d="M14.5 17.5C15.2 18 16.8 18 17.5 17.5" fill="none" />
            <path d="M8 29C8.5 24 11.5 23 16 23C20.5 23 23.5 24 24 29" fill="#F1F1F3" />
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * Notion-style Status Illustration
 * Clean vector status icon replacing harsh colored dots
 */
export function StatusIllustration({
  category = "backlog",
  name = "",
  size = 14,
  className,
}: {
  category?: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const norm = (category || name).toLowerCase();

  // Completed / Done
  if (norm.includes("done") || norm.includes("complete")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" fill="#0D0D0D" />
        <path d="M5 8.2L7 10.2L11 5.8" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // In Progress
  if (norm.includes("progress") || norm.includes("active")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" stroke="#0D0D0D" strokeWidth="1" fill="#FAF9F6" />
        <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8L8 8Z" fill="#0D0D0D" />
      </svg>
    );
  }

  // Review
  if (norm.includes("review")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" stroke="#0D0D0D" strokeWidth="1" fill="#FAF9F6" />
        <circle cx="8" cy="8" r="3" fill="#0D0D0D" />
      </svg>
    );
  }

  // Changes Requested / Cancelled
  if (norm.includes("changes") || norm.includes("cancel")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" stroke="#0D0D0D" strokeWidth="1" fill="#FAF9F6" />
        <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  // Todo
  if (norm.includes("todo")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.5" stroke="#0D0D0D" strokeWidth="1" fill="#FAF9F6" />
      </svg>
    );
  }

  // Backlog (Dotted ring)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.5" stroke="#575657" strokeWidth="1" strokeDasharray="2 2" fill="none" />
    </svg>
  );
}

/**
 * Notion-style Priority Illustration
 * Crisp minimalist glyphs replacing colored dots
 */
export function PriorityIllustration({
  priority = "medium",
  size = 14,
  className,
}: {
  priority?: string;
  size?: number;
  className?: string;
}) {
  const p = priority.toLowerCase();

  // Urgent (Three bars / exclamation)
  if (p === "urgent") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-[#0D0D0D]", className)}
        aria-label="Urgent priority"
      >
        <path d="M8 2.5L14 13.5H2L8 2.5Z" stroke="currentColor" strokeWidth="1" fill="#F1F1F3" />
        <line x1="8" y1="6.5" x2="8" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.6" fill="currentColor" />
      </svg>
    );
  }

  // High (Three bars)
  if (p === "high") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-[#0D0D0D]", className)}
        aria-label="High priority"
      >
        <rect x="3" y="11" width="2" height="3" rx="0.5" fill="currentColor" />
        <rect x="7" y="7" width="2" height="7" rx="0.5" fill="currentColor" />
        <rect x="11" y="3" width="2" height="11" rx="0.5" fill="currentColor" />
      </svg>
    );
  }

  // Medium (Two bars)
  if (p === "medium") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-[#575657]", className)}
        aria-label="Medium priority"
      >
        <rect x="3" y="11" width="2" height="3" rx="0.5" fill="currentColor" />
        <rect x="7" y="7" width="2" height="7" rx="0.5" fill="currentColor" />
        <rect x="11" y="3" width="2" height="11" rx="0.5" fill="#D1D1D4" />
      </svg>
    );
  }

  // Low (One bar)
  if (p === "low") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0 text-[#575657]", className)}
        aria-label="Low priority"
      >
        <rect x="3" y="11" width="2" height="3" rx="0.5" fill="currentColor" />
        <rect x="7" y="7" width="2" height="7" rx="0.5" fill="#D1D1D4" />
        <rect x="11" y="3" width="2" height="11" rx="0.5" fill="#D1D1D4" />
      </svg>
    );
  }

  // None
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-[#575657]", className)}
      aria-label="No priority"
    >
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" fill="none" />
    </svg>
  );
}
