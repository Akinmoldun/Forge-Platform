import { useState } from 'react';

interface BrowserFrameProps {
  className?: string;
}

const TABS = [
  { id: 'board', label: 'Board', file: 'app-board.png' },
  { id: 'issue', label: 'Issue', file: 'app-issue.png' },
  { id: 'risk', label: 'Risk', file: 'app-risk.png' },
  { id: 'analytics', label: 'Analytics', file: 'app-analytics.png' },
];

export function BrowserFrame({ className = '' }: BrowserFrameProps) {
  const [activeTabId, setActiveTabId] = useState('board');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const currentTab = TABS.find((t) => t.id === activeTabId) || TABS[0];
  const isImageMissing = !!failedImages[currentTab.file];

  return (
    <div
      className={`w-full max-w-[1050px] mx-auto border border-[#E8D8CA] bg-white shadow-lg overflow-hidden text-left rounded-t-[12px] ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
      }}
    >
      {/* Top bar with 3 gray dots and tab strip */}
      <div className="bg-[#FFFBF5] border-b border-[#E8D8CA] px-4 py-2.5 flex items-center justify-between gap-4">
        {/* 3 small gray dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
        </div>

        {/* Tab strip of 4 plain text tabs; active tab underlined in orange */}
        <div className="flex items-center gap-4 text-xs">
          {TABS.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`py-1.5 transition-colors cursor-pointer relative select-none ${
                  isActive
                    ? 'text-[#3B1500] font-semibold'
                    : 'text-[#7A5A4A] hover:text-[#3B1500]'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-2.5 left-0 right-0 h-[2px] bg-[#F36421]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Balance spacer */}
        <div className="w-12 shrink-0 hidden sm:block" />
      </div>

      {/* Frame content: tab image (width 100%, height auto, display block, object-position top) */}
      <div className="bg-[#FFFBF5] min-h-[300px] flex items-center justify-center">
        {!isImageMissing ? (
          <img
            key={currentTab.file}
            src={`/screens/${currentTab.file}`}
            alt={`Forge ${currentTab.label} interface`}
            className="w-full h-auto block object-top"
            onError={() => {
              setFailedImages((prev) => ({ ...prev, [currentTab.file]: true }));
            }}
          />
        ) : (
          <div className="py-24 px-6 text-center">
            <p className="font-['JetBrains_Mono',monospace] text-xs sm:text-sm text-[#F36421] bg-[#FFE5D6] py-3 px-6 rounded-lg inline-block border border-[#F36421]/30">
              add /public/screens/{currentTab.file}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
