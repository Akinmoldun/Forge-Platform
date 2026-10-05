import { useState } from 'react';

interface BrowserFrameProps {
  className?: string;
}

export function BrowserFrame({ className = '' }: BrowserFrameProps) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Board', 'Issue', 'Risk', 'Analytics'];
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`w-full max-w-[1050px] mx-auto border border-[#E8D8CA] bg-white shadow-lg overflow-hidden text-left rounded-t-[12px] ${className}`}
      style={{
        maskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 70%, transparent)',
      }}
    >
      {/* Top bar with 3 small gray dots and a tab strip of 4 plain text tabs */}
      <div className="bg-[#FFFBF5] border-b border-[#E8D8CA] px-4 py-3 flex items-center justify-between gap-4">
        {/* 3 small gray dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
        </div>

        {/* Tab strip with 4 plain text tabs (Board, Issue, Risk, Analytics; no icons) */}
        <div className="flex items-center gap-1 bg-[#FFF4EA] p-0.5 rounded-lg border border-[#E8D8CA]/60 text-xs font-medium">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                activeTab === idx
                  ? 'bg-white text-[#FF4801] shadow-2xs font-semibold'
                  : 'text-[#7A5A4A] hover:text-[#3B1500]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="w-12 shrink-0 hidden sm:block" />
      </div>

      {/* Frame content: real screenshot or visible error if missing */}
      <div className="bg-[#FFFBF5]">
        {!imgError ? (
          <img
            src="/screens/app-board.png"
            alt="Forge app board interface"
            className="w-full h-auto block object-top"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="py-24 px-6 text-center">
            <p className="font-['JetBrains_Mono',monospace] text-sm text-[#FF4801] bg-[#FFE5D6] py-3 px-6 rounded-lg inline-block border border-[#FF4801]/30">
              add /public/screens/app-board.png
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
