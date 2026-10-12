import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DragScrollProps {
  children: React.ReactNode;
  className?: string;
  fadeColor?: string; // e.g. "from-[#FBFBFC]" or "from-white"
  fadeWidth?: number; // width in pixels of the fade mask/overlay
}

export function DragScroll({
  children,
  className,
  fadeColor = "from-[#FBFBFC]",
  fadeWidth = 32,
}: DragScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const isDraggingOverThreshold = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 3);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });

    const ro = new ResizeObserver(() => checkScroll());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;

    // Only drag on empty space / non-interactive areas
    const target = e.target as HTMLElement;
    if (
      target.closest(
        'button, a, input, textarea, select, [draggable="true"], [data-no-drag], [role="button"]'
      )
    ) {
      return;
    }

    isDown.current = true;
    startX.current = e.clientX;
    scrollLeftStart.current = el.scrollLeft;
    isDraggingOverThreshold.current = false;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    const el = containerRef.current;
    if (!el) return;

    const dx = e.clientX - startX.current;
    if (!isDraggingOverThreshold.current && Math.abs(dx) > 5) {
      isDraggingOverThreshold.current = true;
      setIsDragging(true);
    }

    if (isDraggingOverThreshold.current) {
      e.preventDefault();
      el.scrollLeft = scrollLeftStart.current - dx;
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    // Allow native horizontal swipe (trackpad)
    if (Math.abs(e.deltaX) > 0) return;
    // If shiftKey is pressed or vertical wheel used, pan horizontally
    if (e.shiftKey || Math.abs(e.deltaY) > 0) {
      el.scrollLeft += e.deltaY;
    }
  };

  const handleGlobalMouseUp = () => {
    if (isDown.current) {
      isDown.current = false;
      if (isDraggingOverThreshold.current) {
        setIsDragging(false);
        setTimeout(() => {
          isDraggingOverThreshold.current = false;
        }, 50);
      }
    }
  };

  const onMouseUp = () => {
    handleGlobalMouseUp();
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div className="relative w-full">
      {/* Left edge fade */}
      <div
        className={cn(
          "pointer-events-none absolute left-0 top-0 bottom-0 z-10 bg-gradient-to-r to-transparent transition-opacity duration-200",
          fadeColor,
          canScrollLeft ? "opacity-90" : "opacity-0"
        )}
        style={{ width: `${fadeWidth}px` }}
        aria-hidden="true"
      />

      {/* Right edge fade */}
      <div
        className={cn(
          "pointer-events-none absolute right-0 top-0 bottom-0 z-10 bg-gradient-to-l to-transparent transition-opacity duration-200",
          fadeColor,
          canScrollRight ? "opacity-90" : "opacity-0"
        )}
        style={{ width: `${fadeWidth}px` }}
        aria-hidden="true"
      />

      {/* Horizontally scrolling container */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onWheel={onWheel}
        className={cn(
          "w-full overflow-x-auto no-scrollbar select-none touch-pan-x",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
