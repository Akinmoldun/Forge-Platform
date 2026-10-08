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

const COLORS: Record<TokenType, string> = {
  comment: "text-neutral-500 italic",
  string: "text-emerald-300",
  keyword: "text-violet-400",
  builtin: "text-sky-400",
  number: "text-pink-400",
  fn: "text-sky-300",
  plain: "text-neutral-200",
};

function renderTypedTokens(tokens: Token[], count: number) {
  let shown = 0;
  return tokens.map((tk, i) => {
    const room = count - shown;
    shown += tk.value.length;
    if (room <= 0) return null;
    return <span key={i} className={COLORS[tk.type]}>{tk.value.slice(0, room)}</span>;
  });
}

export interface CodeTerminalProps {
  code: string;
  title: string;
  charsPerTick?: number; // default 2
  tickMs?: number;       // default 16
  initialDelay?: number; // default 300
  className?: string;
}

export function CodeTerminal({
  code, title, charsPerTick = 2, tickMs = 16, initialDelay = 300, className,
}: CodeTerminalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => tokenize(code), [code]);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) { setCount(code.length); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [code.length, reduced]);

  useEffect(() => {
    if (!started || reduced) return;
    let interval: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          const n = Math.min(c + charsPerTick, code.length);
          if (n >= code.length) clearInterval(interval);
          return n;
        });
      }, tickMs);
    }, initialDelay);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [started, reduced, code.length, charsPerTick, tickMs, initialDelay]);

  const done = count >= code.length;
  const typed = renderTypedTokens(tokens, count);

  return (
    <div ref={ref} className={"w-full font-mono " + (className ?? "")}>
      <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
        <div className="flex items-center gap-2 bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 truncate text-center text-xs text-neutral-400">{title}</div>
          <div className="w-[52px]" />
        </div>
        <div className="grid p-4 text-[11.5px] leading-relaxed sm:text-[12.5px]">
          {/* invisible full copy reserves the final height, so nothing jumps */}
          <pre aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre-wrap break-words">{code}</pre>
          <pre className="col-start-1 row-start-1 whitespace-pre-wrap break-words" aria-label={code}>
            {typed}
            {!done && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-neutral-300 align-middle" />}
          </pre>
        </div>
      </div>
    </div>
  );
}
