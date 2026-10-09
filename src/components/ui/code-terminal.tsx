"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

type TokenType = "comment" | "string" | "keyword" | "builtin" | "number" | "fn" | "plain";
interface Token { type: TokenType; value: string }

const KEYWORDS = new Set([
  "export", "async", "function", "const", "let", "await", "if", "else",
  "for", "of", "return", "throw", "new",
]);
const BUILTINS = new Set(["Set", "Error", "Date", "Map"]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(\b\d+\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    const [full, comment, str, num, word] = m;
    if (comment) tokens.push({ type: "comment", value: full });
    else if (str) tokens.push({ type: "string", value: full });
    else if (num) tokens.push({ type: "number", value: full });
    else if (word) {
      const next = code[m.index + full.length];
      if (KEYWORDS.has(word)) tokens.push({ type: "keyword", value: full });
      else if (BUILTINS.has(word)) tokens.push({ type: "builtin", value: full });
      else if (next === "(") tokens.push({ type: "fn", value: full });
      else tokens.push({ type: "plain", value: full });
    } else tokens.push({ type: "plain", value: full });
  }
  return tokens;
}

const TOKEN_STYLES: Record<TokenType, React.CSSProperties> = {
  comment: { color: "#6E7781", fontStyle: "italic" },
  string: { color: "#1D6FE8" },
  keyword: { color: "#7957EC", fontWeight: 500 },
  builtin: { color: "#7957EC" },
  number: { color: "#1F2328" },
  fn: { color: "#BF3989" },
  plain: { color: "#1F2328" },
};

function renderTypedTokens(tokens: Token[], count: number) {
  let shown = 0;
  return tokens.map((tk, i) => {
    const room = count - shown;
    shown += tk.value.length;
    if (room <= 0) return null;
    return (
      <span key={i} style={TOKEN_STYLES[tk.type]}>
        {tk.value.slice(0, room)}
      </span>
    );
  });
}

export interface CodeTab {
  name: string;
  code: string;
}

export interface CodeTerminalProps {
  code: string;
  title?: string;
  fileName?: string;
  tabs?: CodeTab[];
  charsPerTick?: number; // default 2
  tickMs?: number;       // default 16
  initialDelay?: number; // default 300
  className?: string;
}

export function CodeTerminal({
  code: defaultCode,
  title,
  fileName,
  tabs,
  charsPerTick = 2,
  tickMs = 16,
  initialDelay = 300,
  className,
}: CodeTerminalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [crossfade, setCrossfade] = useState(false);

  const activeCode = tabs && tabs.length > 0 ? tabs[activeTabIdx].code : defaultCode;
  const activeFileName = tabs && tabs.length > 0 ? tabs[activeTabIdx].name : (fileName || title || "invariant.ts");

  const tokens = useMemo(() => tokenize(activeCode), [activeCode]);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) { setCount(activeCode.length); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [activeCode.length, reduced]);

  useEffect(() => {
    if (!started || reduced) return;
    setCount(0);
    let interval: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          const n = Math.min(c + charsPerTick, activeCode.length);
          if (n >= activeCode.length) clearInterval(interval);
          return n;
        });
      }, tickMs);
    }, activeTabIdx === 0 ? initialDelay : 50);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [started, reduced, activeCode, charsPerTick, tickMs, initialDelay, activeTabIdx]);

  const handleTabClick = (idx: number) => {
    if (idx === activeTabIdx) return;
    setCrossfade(true);
    setTimeout(() => {
      setActiveTabIdx(idx);
      setCrossfade(false);
    }, 100);
  };

  const done = count >= activeCode.length;
  const typed = renderTypedTokens(tokens, count);

  return (
    <div ref={ref} className={"w-full font-mono " + (className ?? "")}>
      {/* Light panel container: #F7F8FA background, 1px solid rgba(0,0,0,.08), radius 12px, no shadow */}
      <div
        style={{
          backgroundColor: "#F7F8FA",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "none",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            height: "38px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
            backgroundColor: "#F0F1F4",
          }}
          className="flex items-center justify-between px-3 md:px-4"
        >
          <div className="flex items-center gap-[6px] shrink-0">
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#FF5F57",
              }}
              className="rounded-full shrink-0"
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#FEBC2E",
              }}
              className="rounded-full shrink-0"
            />
            <div
              style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#28C840",
              }}
              className="rounded-full shrink-0"
            />
          </div>

          {tabs && tabs.length > 1 ? (
            <div className="flex items-center gap-1 ml-3 overflow-x-auto">
              {tabs.map((tab, idx) => {
                const isActive = activeTabIdx === idx;
                return (
                  <button
                    key={tab.name}
                    type="button"
                    onClick={() => handleTabClick(idx)}
                    style={{
                      transition: "opacity 200ms ease, background-color 200ms ease",
                    }}
                    className={`px-2.5 py-1 text-[11.5px] rounded cursor-pointer transition-colors ${
                      isActive
                        ? "bg-white text-[#0D0D0D] font-medium border border-black/[0.08]"
                        : "text-[#575657] hover:text-[#0D0D0D] hover:bg-black/5"
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <span
              style={{
                color: "#575657",
                fontSize: "12px",
                marginLeft: "12px",
              }}
              className="font-mono font-normal truncate"
            >
              {activeFileName}
            </span>
          )}
        </div>

        {/* Code Content Area with 200ms Crossfade */}
        <div
          style={{
            opacity: crossfade ? 0 : 1,
            transition: "opacity 200ms ease",
          }}
          className="grid p-4 text-[11.5px] leading-relaxed sm:text-[12.5px] text-[#1F2328]"
        >
          {/* invisible full copy reserves the final height, so nothing jumps */}
          <pre aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre-wrap break-words">{activeCode}</pre>
          <pre className="col-start-1 row-start-1 whitespace-pre-wrap break-words" aria-label={activeCode}>
            {typed}
            {!done && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-[#1F2328] align-middle" />}
          </pre>
        </div>
      </div>
    </div>
  );
}
