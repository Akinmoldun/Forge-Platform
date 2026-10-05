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
      className={`w-full max-w-[1050px] mx-auto rounded-[16px] border border-[#E8D8CA] bg-white shadow-lg overflow-hidden text-left ${className}`}
      style={{
        maskImage:
          'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
      }}
    >
      {/* Chrome bar */}
      <div className="bg-[#FFFBF5] border-b border-[#E8D8CA] px-4 py-3 flex items-center justify-between gap-4">
        {/* 3 light dots */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8D8CA]" />
        </div>

        {/* Tab strip with four plain text tabs (NO icons) */}
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

        {/* Empty placeholder for balance */}
        <div className="w-12 shrink-0 hidden sm:block" />
      </div>

      {/* Screen area: image if exists, else pale skeleton bars like reference */}
      <div className="p-6 bg-[#FFFBF5] min-h-[360px]">
        {!imgError ? (
          <img
            src="/screens/app-board.png"
            alt="Forge interface screenshot"
            className="w-full h-auto rounded-lg border border-[#E8D8CA]"
            onError={() => setImgError(true)}
          />
        ) : null}

        {imgError && (
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8D8CA]">
              <div className="flex items-center gap-3">
                <div className="h-4 w-36 rounded bg-[#E8D8CA]/60" />
                <div className="h-4 w-16 rounded bg-[#FFE5D6]" />
              </div>
              <div className="h-3 w-40 rounded bg-[#E8D8CA]/40" />
            </div>

            {/* Columns skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((col) => (
                <div
                  key={col}
                  className="rounded-xl bg-[#FFF4EA] border border-[#E8D8CA]/70 p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between pb-1">
                    <div className="h-3 w-16 rounded bg-[#E8D8CA]/80" />
                    <div className="h-3 w-5 rounded bg-white" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E8D8CA]/80 space-y-2">
                    <div className="h-2.5 w-12 rounded bg-[#FFE5D6]" />
                    <div className="h-3 w-full rounded bg-[#E8D8CA]/60" />
                    <div className="h-3 w-3/4 rounded bg-[#E8D8CA]/40" />
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-[#E8D8CA]/80 space-y-2">
                    <div className="h-2.5 w-14 rounded bg-[#FFE5D6]" />
                    <div className="h-3 w-5/6 rounded bg-[#E8D8CA]/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
