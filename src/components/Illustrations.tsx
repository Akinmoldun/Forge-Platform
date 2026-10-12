import { type SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface IllustrationProps extends SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

// ---------------------------------------------------------------------------
// 12 Illustrated Emblems (Mountain, Rocket, Leaf, Compass, Anchor, Lighthouse,
// Planet, Kite, Cube, Wave, Spark, Tent)
// ---------------------------------------------------------------------------
export const EMBLEM_KEYS = [
  "mountain",
  "rocket",
  "leaf",
  "compass",
  "anchor",
  "lighthouse",
  "planet",
  "kite",
  "cube",
  "wave",
  "spark",
  "tent",
] as const;

export type EmblemKey = (typeof EMBLEM_KEYS)[number];

const EMBLEM_COLORS: Record<EmblemKey, { bg: string; fill: string }> = {
  mountain: { bg: "#F1F5EB", fill: "#9FDA85" },
  rocket: { bg: "#F8EDF5", fill: "#D78FC6" },
  leaf: { bg: "#EFF8EE", fill: "#83DD79" },
  compass: { bg: "#EEF3F9", fill: "#6E94CB" },
  anchor: { bg: "#F3F1FA", fill: "#7957EC" },
  lighthouse: { bg: "#F9F6EE", fill: "#D6C6A1" },
  planet: { bg: "#EEF3F9", fill: "#6E94CB" },
  kite: { bg: "#F8EDF5", fill: "#D78FC6" },
  cube: { bg: "#F3F1FA", fill: "#7957EC" },
  wave: { bg: "#EEF3F9", fill: "#6E94CB" },
  spark: { bg: "#F9F6EE", fill: "#D6C6A1" },
  tent: { bg: "#EFF8EE", fill: "#83DD79" },
};

export function resolveEmblemKey(
  emblemKey?: string,
  id: string = "",
  name: string = "",
): EmblemKey {
  if (emblemKey && EMBLEM_KEYS.includes(emblemKey as EmblemKey)) {
    return emblemKey as EmblemKey;
  }
  const seed = id || name || "default";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % EMBLEM_KEYS.length;
  return EMBLEM_KEYS[idx];
}

export function EmblemIllustration({
  emblemKey,
  name = "",
  id = "",
  size = 24,
  className,
  ...props
}: {
  emblemKey?: string;
  name?: string;
  id?: string;
  size?: number;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  const key = resolveEmblemKey(emblemKey, id, name);
  const { bg, fill } = EMBLEM_COLORS[key] || { bg: "#F1F1F3", fill: "#D6C6A1" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-label={`${key} emblem`}
      {...props}
    >
      <rect x="1" y="1" width="22" height="22" rx="6" fill={bg} />

      {key === "mountain" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18L10 8L14 14L16 11L20 18H4Z" fill={fill} fillOpacity="0.4" />
          <path d="M4 18L10 8L14 14L16 11L20 18" />
          <path d="M8.5 10.5L10 13L11.5 10.5" fill="none" />
        </g>
      )}

      {key === "rocket" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4C14.5 4 16.5 6.5 16.5 10.5C16.5 14 14.5 17 12 17C9.5 17 7.5 14 7.5 10.5C7.5 6.5 9.5 4 12 4Z" fill={fill} fillOpacity="0.4" />
          <circle cx="12" cy="10" r="1.5" fill="#0D0D0D" />
          <path d="M7.5 13L5 15.5V17L7.5 17" />
          <path d="M16.5 13L19 15.5V17L16.5 17" />
          <path d="M10.5 17L12 19.5L13.5 17" />
        </g>
      )}

      {key === "leaf" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18C6 18 7 10 14 6C14 6 18 13 11 17C8 18.5 6 18 6 18Z" fill={fill} fillOpacity="0.5" />
          <path d="M6 18C10 14 13 11 16 8" />
          <path d="M11 13L13 15" />
          <path d="M9 15L10 16.5" />
        </g>
      )}

      {key === "compass" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="7.5" fill={fill} fillOpacity="0.3" />
          <path d="M12 7L13.5 11L17 12L13.5 13L12 17L10.5 13L7 12L10.5 11L12 7Z" fill="#0D0D0D" />
          <circle cx="12" cy="12" r="1" fill="#FFFFFF" />
        </g>
      )}

      {key === "anchor" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="2" fill={fill} fillOpacity="0.4" />
          <line x1="12" y1="9" x2="12" y2="18" />
          <line x1="8" y1="11" x2="16" y2="11" />
          <path d="M6 14C6 17.5 8.7 19 12 19C15.3 19 18 17.5 18 14" fill="none" />
          <line x1="5" y1="14" x2="7" y2="14" />
          <line x1="17" y1="14" x2="19" y2="14" />
        </g>
      )}

      {key === "lighthouse" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 18L11 8H13L14.5 18H9.5Z" fill={fill} fillOpacity="0.5" />
          <rect x="10.5" y="6" width="3" height="2" rx="0.5" fill="#0D0D0D" />
          <line x1="6" y1="18" x2="18" y2="18" />
          <circle cx="12" cy="10" r="0.8" fill="#0D0D0D" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </g>
      )}

      {key === "planet" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" fill={fill} fillOpacity="0.5" />
          <ellipse cx="12" cy="12" rx="8.5" ry="3" transform="rotate(-20 12 12)" fill="none" />
          <circle cx="10" cy="10" r="0.8" fill="#0D0D0D" />
        </g>
      )}

      {key === "kite" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4.5L17 11L12 17.5L7 11L12 4.5Z" fill={fill} fillOpacity="0.5" />
          <line x1="12" y1="4.5" x2="12" y2="17.5" />
          <line x1="7" y1="11" x2="17" y2="11" />
          <path d="M12 17.5C13 19 14 19.5 13.5 21" fill="none" />
        </g>
      )}

      {key === "cube" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5L18 8.5V15.5L12 19L6 15.5V8.5L12 5Z" fill={fill} fillOpacity="0.3" />
          <path d="M12 5V12M12 12L18 8.5M12 12L6 8.5" />
          <path d="M12 12V19" />
        </g>
      )}

      {key === "wave" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 11C6.5 9 8.5 9 10 11C11.5 13 13.5 13 15 11C16.5 9 18 9.5 19 11" fill="none" />
          <path d="M5 15C6.5 13 8.5 13 10 15C11.5 17 13.5 17 15 15C16.5 13 18 13.5 19 15" fill="none" stroke={fill} strokeWidth="1.8" />
        </g>
      )}

      {key === "spark" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4C12 7.5 9.5 10 6 10C9.5 10 12 12.5 12 16C12 12.5 14.5 10 18 10C14.5 10 12 7.5 12 4Z" fill={fill} fillOpacity="0.5" />
          <circle cx="17" cy="15" r="1.5" fill="#0D0D0D" />
        </g>
      )}

      {key === "tent" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6L4 18H20L12 6Z" fill={fill} fillOpacity="0.4" />
          <path d="M12 6V18" />
          <path d="M12 12L16 18H8L12 12Z" fill="#FAF9F6" />
        </g>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 12 Illustrated Avatar Characters
// Friendly abstract faces, animals, objects with soft colored circles
// ---------------------------------------------------------------------------
export const AVATAR_KEYS = [
  "fox",
  "bear",
  "owl",
  "cat",
  "rabbit",
  "koala",
  "sprout",
  "star",
  "bot",
  "sun",
  "cloud",
  "moon",
] as const;

export type AvatarKey = (typeof AVATAR_KEYS)[number];

const AVATAR_CONFIGS: Record<AvatarKey, { bg: string; fill: string; label: string }> = {
  fox: { bg: "#FDF5E6", fill: "#D6C6A1", label: "Fox" },
  bear: { bg: "#F1F5EB", fill: "#BED390", label: "Bear" },
  owl: { bg: "#EEF3F9", fill: "#6E94CB", label: "Owl" },
  cat: { bg: "#F8EDF5", fill: "#D78FC6", label: "Cat" },
  rabbit: { bg: "#EFF8EE", fill: "#83DD79", label: "Rabbit" },
  koala: { bg: "#F1F1F3", fill: "#9FDA85", label: "Koala" },
  sprout: { bg: "#EFF8EE", fill: "#83DD79", label: "Sprout" },
  star: { bg: "#FDF5E6", fill: "#D6C6A1", label: "Star" },
  bot: { bg: "#F3F1FA", fill: "#7957EC", label: "Bot" },
  sun: { bg: "#FDF5E6", fill: "#D6C6A1", label: "Sun" },
  cloud: { bg: "#EEF3F9", fill: "#6E94CB", label: "Cloud" },
  moon: { bg: "#F3F1FA", fill: "#7957EC", label: "Moon" },
};

export function AvatarIllustration({
  avatarKey,
  name = "User",
  id = "",
  size = 32,
  className,
  ...props
}: {
  avatarKey?: string;
  name?: string;
  id?: string;
  size?: number;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  let key: AvatarKey = "fox";
  if (avatarKey && AVATAR_KEYS.includes(avatarKey as AvatarKey)) {
    key = avatarKey as AvatarKey;
  } else {
    const seed = id || name || "seed";
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % AVATAR_KEYS.length;
    key = AVATAR_KEYS[idx];
  }

  const { bg, fill, label } = AVATAR_CONFIGS[key] || { bg: "#F1F1F3", fill: "#6E94CB", label: "User" };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none overflow-hidden rounded-full border border-black/[0.08]", className)}
      aria-label={`${label} avatar`}
      {...props}
    >
      <circle cx="16" cy="16" r="16" fill={bg} />

      {key === "fox" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 9L11 16L7 20L16 26L25 20L21 16L24 9L17 13L15 13L8 9Z" fill={fill} fillOpacity="0.4" />
          <path d="M16 26L11 16L16 20L21 16L16 26Z" fill="#FAF9F6" />
          <circle cx="12" cy="18" r="0.9" fill="#0D0D0D" />
          <circle cx="20" cy="18" r="0.9" fill="#0D0D0D" />
          <circle cx="16" cy="24" r="1.1" fill="#0D0D0D" />
        </g>
      )}

      {key === "bear" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="10" r="3" fill={fill} fillOpacity="0.4" />
          <circle cx="23" cy="10" r="3" fill={fill} fillOpacity="0.4" />
          <circle cx="16" cy="17" r="8" fill="#FAF9F6" />
          <ellipse cx="16" cy="19" rx="3.5" ry="2.5" fill={fill} fillOpacity="0.3" />
          <circle cx="13" cy="15" r="0.9" fill="#0D0D0D" />
          <circle cx="19" cy="15" r="0.9" fill="#0D0D0D" />
          <ellipse cx="16" cy="18" rx="1.2" ry="0.8" fill="#0D0D0D" />
        </g>
      )}

      {key === "owl" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 8L11 12H21L22 8C22 8 20 6 16 6C12 6 10 8 10 8Z" fill={fill} fillOpacity="0.4" />
          <circle cx="16" cy="18" r="8" fill="#FAF9F6" />
          <circle cx="12.5" cy="16" r="2.8" fill={fill} fillOpacity="0.3" stroke="#0D0D0D" strokeWidth="1" />
          <circle cx="19.5" cy="16" r="2.8" fill={fill} fillOpacity="0.3" stroke="#0D0D0D" strokeWidth="1" />
          <circle cx="13" cy="16" r="1" fill="#0D0D0D" />
          <circle cx="19" cy="16" r="1" fill="#0D0D0D" />
          <path d="M15 19L16 21L17 19" fill="#0D0D0D" />
        </g>
      )}

      {key === "cat" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 14L8 8L14 11C15 10.8 17 10.8 18 11L24 8L23 14C24 17 23 23 16 24C9 23 8 17 9 14Z" fill={fill} fillOpacity="0.35" />
          <circle cx="12.5" cy="16" r="0.9" fill="#0D0D0D" />
          <circle cx="19.5" cy="16" r="0.9" fill="#0D0D0D" />
          <path d="M15.5 19L16 19.5L16.5 19" />
          <line x1="8" y1="18" x2="11" y2="18.5" />
          <line x1="24" y1="18" x2="21" y2="18.5" />
        </g>
      )}

      {key === "rabbit" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="10" rx="2.5" ry="5.5" fill={fill} fillOpacity="0.4" />
          <ellipse cx="20" cy="10" rx="2.5" ry="5.5" fill={fill} fillOpacity="0.4" />
          <circle cx="16" cy="19" r="7.5" fill="#FAF9F6" />
          <circle cx="13" cy="18" r="0.9" fill="#0D0D0D" />
          <circle cx="19" cy="18" r="0.9" fill="#0D0D0D" />
          <path d="M15.5 21L16 21.5L16.5 21" />
        </g>
      )}

      {key === "koala" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="12" r="3.5" fill={fill} fillOpacity="0.4" />
          <circle cx="24" cy="12" r="3.5" fill={fill} fillOpacity="0.4" />
          <circle cx="16" cy="18" r="7.5" fill="#FAF9F6" />
          <ellipse cx="16" cy="19" rx="2" ry="3" fill="#0D0D0D" />
          <circle cx="12.5" cy="16" r="0.9" fill="#0D0D0D" />
          <circle cx="19.5" cy="16" r="0.9" fill="#0D0D0D" />
        </g>
      )}

      {key === "sprout" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="19" r="7.5" fill="#FAF9F6" />
          <path d="M16 12V8C16 8 13 8 12 10C12 11.5 13.5 12 16 12Z" fill={fill} fillOpacity="0.5" />
          <path d="M16 10C16 10 18.5 9 19.5 11C20 12.5 18 13.5 16 12" fill={fill} fillOpacity="0.5" />
          <circle cx="13" cy="18" r="0.9" fill="#0D0D0D" />
          <circle cx="19" cy="18" r="0.9" fill="#0D0D0D" />
          <path d="M14.5 21C15.5 22 16.5 22 17.5 21" fill="none" />
        </g>
      )}

      {key === "star" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 6L18.5 12L25 13L20 17.5L21.5 24L16 20.5L10.5 24L12 17.5L7 13L13.5 12L16 6Z" fill={fill} fillOpacity="0.45" />
          <circle cx="14" cy="15" r="0.8" fill="#0D0D0D" />
          <circle cx="18" cy="15" r="0.8" fill="#0D0D0D" />
          <path d="M15 17.5C15.5 18 16.5 18 17 17.5" fill="none" />
        </g>
      )}

      {key === "bot" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="11" width="14" height="12" rx="3" fill={fill} fillOpacity="0.4" />
          <line x1="16" y1="7" x2="16" y2="11" />
          <circle cx="16" cy="6" r="1.2" fill="#0D0D0D" />
          <rect x="12" y="14" width="2" height="2" rx="0.5" fill="#0D0D0D" />
          <rect x="18" y="14" width="2" height="2" rx="0.5" fill="#0D0D0D" />
          <line x1="13" y1="19" x2="19" y2="19" strokeWidth="1.5" />
        </g>
      )}

      {key === "sun" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="16" r="6" fill={fill} fillOpacity="0.5" />
          <line x1="16" y1="6" x2="16" y2="8" />
          <line x1="16" y1="24" x2="16" y2="26" />
          <line x1="6" y1="16" x2="8" y2="16" />
          <line x1="24" y1="16" x2="26" y2="16" />
          <circle cx="14" cy="15" r="0.8" fill="#0D0D0D" />
          <circle cx="18" cy="15" r="0.8" fill="#0D0D0D" />
          <path d="M14.5 18C15.5 19 16.5 19 17.5 18" fill="none" />
        </g>
      )}

      {key === "cloud" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 20C7.5 20 6 18 6 15.5C6 13 8 11.5 10 11.5C10.5 9 12.8 7 16 7C19.5 7 22 9.5 22 13C23.5 13 25 14.2 25 16C25 18.2 23.2 20 21 20H10Z" fill={fill} fillOpacity="0.45" />
          <circle cx="13" cy="14" r="0.8" fill="#0D0D0D" />
          <circle cx="19" cy="14" r="0.8" fill="#0D0D0D" />
          <path d="M14.5 16.5C15.5 17.2 16.5 17.2 17.5 16.5" fill="none" />
        </g>
      )}

      {key === "moon" && (
        <g stroke="#0D0D0D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 7C12 7 8 11.5 8 17C8 22.5 12 25 18 25C13.5 23 12 19 12 16C12 13 14 9.5 18 7Z" fill={fill} fillOpacity="0.5" />
          <circle cx="13" cy="15" r="0.8" fill="#0D0D0D" />
          <path d="M13.5 18C14 18.5 14.5 18.5 15 18" fill="none" />
          <circle cx="22" cy="11" r="1.2" fill="#0D0D0D" />
        </g>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 9 Navigation Two-Tone Icons (Overview, Projects, Workflow, Analytics,
// Teams, Activity, Settings, Inbox, Search)
// 1.75px rounded ink strokes with soft pastel fill shape behind
// ---------------------------------------------------------------------------
export type NavIconName =
  | "overview"
  | "projects"
  | "workflow"
  | "analytics"
  | "teams"
  | "activity"
  | "settings"
  | "inbox"
  | "search";

export function NavIcon({
  name,
  size = 18,
  className,
  ...props
}: {
  name: NavIconName;
  size?: number;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
      {...props}
    >
      {name === "overview" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="2.5" width="6" height="6" rx="2" fill="#9FDA85" fillOpacity="0.35" />
          <rect x="11.5" y="2.5" width="6" height="6" rx="2" fill="#6E94CB" fillOpacity="0.25" />
          <rect x="2.5" y="11.5" width="6" height="6" rx="2" fill="#D78FC6" fillOpacity="0.25" />
          <rect x="11.5" y="11.5" width="6" height="6" rx="2" fill="#D6C6A1" fillOpacity="0.35" />
        </g>
      )}

      {name === "projects" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 5.5C2.5 4.4 3.4 3.5 4.5 3.5H8L10 5.5H15.5C16.6 5.5 17.5 6.4 17.5 7.5V14.5C17.5 15.6 16.6 16.5 15.5 16.5H4.5C3.4 16.5 2.5 15.6 2.5 14.5V5.5Z" fill="#6E94CB" fillOpacity="0.3" />
          <line x1="6.5" y1="10" x2="13.5" y2="10" />
        </g>
      )}

      {name === "workflow" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5" cy="10" r="2.5" fill="#83DD79" fillOpacity="0.5" />
          <circle cx="15" cy="5" r="2.5" fill="#7957EC" fillOpacity="0.3" />
          <circle cx="15" cy="15" r="2.5" fill="#D78FC6" fillOpacity="0.3" />
          <path d="M7.5 9L12.5 6" />
          <path d="M7.5 11L12.5 14" />
        </g>
      )}

      {name === "analytics" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="3" height="6" rx="1" fill="#6E94CB" fillOpacity="0.35" />
          <rect x="8.5" y="6" width="3" height="11" rx="1" fill="#9FDA85" fillOpacity="0.5" />
          <rect x="14" y="3" width="3" height="14" rx="1" fill="#D78FC6" fillOpacity="0.35" />
        </g>
      )}

      {name === "teams" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="7" r="3" fill="#D6C6A1" fillOpacity="0.5" />
          <path d="M3 16C3 13.5 5.5 12 8 12C10.5 12 13 13.5 13 16" />
          <circle cx="14" cy="6" r="2.2" fill="#BED390" fillOpacity="0.4" />
          <path d="M14 11C15.8 11.3 17 12.5 17 14.5" />
        </g>
      )}

      {name === "activity" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="7.5" fill="#BED390" fillOpacity="0.25" />
          <path d="M3 10H6.5L8.5 6L11.5 14L13.5 10H17" />
        </g>
      )}

      {name === "settings" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="3" fill="#F1F1F3" />
          <path d="M10 2V4.5M10 15.5V18M2 10H4.5M15.5 10H18M4.3 4.3L6.1 6.1M13.9 13.9L15.7 15.7M4.3 15.7L6.1 13.9M13.9 6.1L15.7 4.3" />
        </g>
      )}

      {name === "inbox" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="4.5" width="15" height="11" rx="2" fill="#6E94CB" fillOpacity="0.25" />
          <path d="M2.5 11H6.5C7.2 11 7.8 11.5 8 12.2L8.2 13C8.5 13.6 9 14 9.6 14H10.4C11 14 11.5 13.6 11.8 13L12 12.2C12.2 11.5 12.8 11 13.5 11H17.5" />
        </g>
      )}

      {name === "search" && (
        <g stroke="#0D0D0D" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8.5" cy="8.5" r="5" fill="#D78FC6" fillOpacity="0.25" />
          <line x1="12.5" y1="12.5" x2="16.5" y2="16.5" />
        </g>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// 6 Empty State Illustrations
// (no projects, no issues, no notifications, no analytics, no activity, no results)
// ---------------------------------------------------------------------------
export type EmptyStateType =
  | "no-projects"
  | "no-issues"
  | "no-notifications"
  | "no-analytics"
  | "no-activity"
  | "no-results";

export function EmptyIllustration({
  type,
  size = 64,
  className,
  ...props
}: {
  type: EmptyStateType;
  size?: number;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
      {...props}
    >
      <circle cx="32" cy="32" r="28" fill="#FAF9F6" />

      {type === "no-projects" && (
        <g stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="18" y="20" width="28" height="24" rx="4" fill="#6E94CB" fillOpacity="0.2" />
          <path d="M24 20V17C24 15.9 24.9 15 26 15H38C39.1 15 40 15.9 40 17V20" />
          <line x1="26" y1="30" x2="38" y2="30" strokeDasharray="2 2" stroke="#575657" />
          <circle cx="32" cy="32" r="3" fill="#FAF9F6" />
          <line x1="32" y1="30" x2="32" y2="34" />
          <line x1="30" y1="32" x2="34" y2="32" />
        </g>
      )}

      {type === "no-issues" && (
        <g stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="16" fill="#83DD79" fillOpacity="0.25" />
          <path d="M25 32L30 37L40 26" stroke="#0D0D0D" strokeWidth="2" />
        </g>
      )}

      {type === "no-notifications" && (
        <g stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 36C22 28 26 22 32 22C38 22 42 28 42 36L44 40H20L22 36Z" fill="#D6C6A1" fillOpacity="0.3" />
          <path d="M29 44C29 45.7 30.3 47 32 47C33.7 47 35 45.7 35 44" />
          <circle cx="32" cy="19" r="1.5" fill="#0D0D0D" />
        </g>
      )}

      {type === "no-analytics" && (
        <g stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="20" y="36" width="6" height="12" rx="2" fill="#6E94CB" fillOpacity="0.3" />
          <rect x="29" y="28" width="6" height="20" rx="2" fill="#9FDA85" fillOpacity="0.4" />
          <rect x="38" y="22" width="6" height="26" rx="2" fill="#D78FC6" fillOpacity="0.3" />
          <line x1="16" y1="48" x2="48" y2="48" />
        </g>
      )}

      {type === "no-activity" && (
        <g stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="32" cy="32" r="14" fill="#BED390" fillOpacity="0.3" />
          <polyline points="32 24 32 32 37 35" />
        </g>
      )}

      {type === "no-results" && (
        <g stroke="#0D0D0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="30" cy="30" r="10" fill="#F1F1F3" />
          <line x1="37" y1="37" x2="45" y2="45" strokeWidth="2" />
          <line x1="26" y1="30" x2="34" y2="30" stroke="#575657" />
        </g>
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Priority Bar-Glyph (three ascending bars, filled by level; urgent in rose)
// ---------------------------------------------------------------------------
export function PriorityGlyph({
  priority = "medium",
  size = 14,
  className,
}: {
  priority?: string;
  size?: number;
  className?: string;
}) {
  const p = priority.toLowerCase();
  const isUrgent = p === "urgent";
  const isHigh = p === "high";
  const isMed = p === "medium";
  const isLow = p === "low";

  // Colors: urgent uses rose (#D78FC6 text / fill), high/med/low use ink / muted
  const activeColor = isUrgent ? "#D78FC6" : "#0D0D0D";
  const inactiveColor = "#D1D1D4";

  return (
    <span
      className={cn(
        "inline-flex items-end gap-[1.5px] select-none shrink-0",
        isUrgent && "text-[#D78FC6] font-medium",
        className
      )}
      style={{ height: size }}
      aria-label={`${priority} priority`}
      title={`${priority.charAt(0).toUpperCase() + priority.slice(1)} priority`}
    >
      {/* Bar 1 (Low) */}
      <span
        className="w-[3px] rounded-[0.5px] transition-colors"
        style={{
          height: Math.round(size * 0.4),
          backgroundColor: isLow || isMed || isHigh || isUrgent ? activeColor : inactiveColor,
        }}
      />
      {/* Bar 2 (Medium) */}
      <span
        className="w-[3px] rounded-[0.5px] transition-colors"
        style={{
          height: Math.round(size * 0.7),
          backgroundColor: isMed || isHigh || isUrgent ? activeColor : inactiveColor,
        }}
      />
      {/* Bar 3 (High / Urgent) */}
      <span
        className="w-[3px] rounded-[0.5px] transition-colors"
        style={{
          height: size,
          backgroundColor: isHigh || isUrgent ? activeColor : inactiveColor,
        }}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// Status Pill (clean soft pill only on board columns and chips, in soft tints)
// ---------------------------------------------------------------------------
export function StatusPill({
  name,
  category = "backlog",
  className,
}: {
  name: string;
  category?: string;
  className?: string;
}) {
  const cat = category.toLowerCase();
  const bgStyles: Record<string, string> = {
    backlog: "bg-[#F1F1F3] text-[#575657]",
    todo: "bg-[#EEF3F9] text-[#2B4C7E]",
    in_progress: "bg-[#F3F1FA] text-[#5B3BC4]",
    active: "bg-[#F3F1FA] text-[#5B3BC4]",
    review: "bg-[#F8EDF5] text-[#9A4287]",
    changes_requested: "bg-[#F9F6EE] text-[#7A6434]",
    completed: "bg-[#EFF8EE] text-[#2E7D32]",
    done: "bg-[#EFF8EE] text-[#2E7D32]",
    cancelled: "bg-[#FDF2F1] text-[#9C3833]",
  };

  const currentStyle = bgStyles[cat] || "bg-[#F1F1F3] text-[#575657]";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-medium select-none border border-black/[0.04]",
        currentStyle,
        className
      )}
    >
      {name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Legacy adapter functions for backward-compatibility with existing files
// ---------------------------------------------------------------------------
export function WorkspaceIllustration({
  name = "",
  iconKey,
  emblemKey,
  id = "",
  size = 24,
  className,
  ...props
}: {
  name?: string;
  iconKey?: string;
  emblemKey?: string;
  id?: string;
  size?: number;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  return (
    <EmblemIllustration
      emblemKey={iconKey || emblemKey}
      name={name}
      id={id}
      size={size}
      className={className}
      {...props}
    />
  );
}

export function ProjectIllustration({
  projectKey = "",
  name = "",
  iconKey,
  emblemKey,
  id = "",
  size = 18,
  className,
  ...props
}: {
  projectKey?: string;
  name?: string;
  iconKey?: string;
  emblemKey?: string;
  id?: string;
  size?: number;
  className?: string;
} & SVGProps<SVGSVGElement>) {
  return (
    <EmblemIllustration
      emblemKey={iconKey || emblemKey}
      name={name}
      id={id || projectKey}
      size={size}
      className={className}
      {...props}
    />
  );
}

export function NotionAvatarIllustration({
  name = "User",
  size = 28,
  className,
}: {
  name?: string;
  size?: number;
  className?: string;
}) {
  return <AvatarIllustration name={name} size={size} className={className} />;
}

export function StatusIllustration({
  category = "backlog",
  name = "",
  size: _size = 14,
  className,
}: {
  category?: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  return <StatusPill name={name || category} category={category} className={className} />;
}

export function PriorityIllustration({
  priority = "medium",
  size = 14,
  className,
}: {
  priority?: string;
  size?: number;
  className?: string;
}) {
  return <PriorityGlyph priority={priority} size={size} className={className} />;
}
