import { useState } from 'react';

interface CodePanelProps {
  filename?: string;
  code?: string;
  className?: string;
}

const defaultCode = ` 1  export const reviewRule = {
 2    from: "In Progress",
 3    to: "Review",
 4    requiresAssignee: true,
 5    requiresComment: true,
 6  };`;

export function CodePanel({
  filename = 'workflow.ts',
  code = defaultCode,
  className = '',
}: CodePanelProps) {
  const [copied, setCopied] = useState(false);

  const rawCode = `export const reviewRule = {
  from: "In Progress",
  to: "Review",
  requiresAssignee: true,
  requiresComment: true,
};`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`border border-[#E8D8CA] rounded-[16px] bg-[#FFFBF5] bg-dotted-grid overflow-hidden flex flex-col ${className}`}
    >
      {/* File Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E8D8CA] bg-white/70">
        <span className="font-mono text-xs text-[#7A5A4A] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF4801]" />
          {filename}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#E8D8CA] bg-white text-[#7A5A4A] hover:text-[#3B1500] hover:bg-[#FFE5D6] transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? 'copied' : 'copy'}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 sm:p-5 font-mono text-[13px] leading-relaxed text-[#3B1500] overflow-x-auto">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
