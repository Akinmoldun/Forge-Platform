import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export type WidgetSize = "sm" | "wide" | "tall" | "lg";

export interface WidgetItem {
  id: string;
  size: WidgetSize;
  title?: string;
  [key: string]: unknown;
}

export interface DraggableWidgetGridProps {
  items: WidgetItem[];
  onChange?: (items: WidgetItem[]) => void;
  renderItem: (item: WidgetItem, isDragging: boolean, editable: boolean) => React.ReactNode;
  editable?: boolean;
  maxColumns?: number;
  gap?: number;
  radius?: number;
  rowRatio?: number;
  className?: string;
}

interface PlacedWidget {
  item: WidgetItem;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

/**
 * 2D packing algorithm:
 * - 4 columns (desktop): wide=2x1, lg=2x2. Perfectly packs 16 slots.
 * - 3 columns (tablet): adapts spans so rows pack 3 columns gap-free.
 * - 2 columns (mobile): all widgets take 2 columns (full width). Gap-free.
 */
export function packGrid(
  items: WidgetItem[],
  cols: number,
): { placed: PlacedWidget[]; totalRows: number } {
  const occupancy: boolean[][] = [];

  function isOccupied(r: number, c: number): boolean {
    if (!occupancy[r]) return false;
    return !!occupancy[r][c];
  }

  function setOccupied(r: number, c: number, val: boolean) {
    if (!occupancy[r]) occupancy[r] = [];
    occupancy[r][c] = val;
  }

  const placed: PlacedWidget[] = [];

  for (const item of items) {
    let colSpan = 1;
    let rowSpan = 1;

    if (cols === 2) {
      // Mobile 2 cols: all widgets full-width (2 cols)
      colSpan = 2;
      rowSpan = item.size === "lg" || item.size === "tall" ? 2 : 1;
    } else if (cols === 3) {
      // Tablet 3 cols:
      if (item.id === "quick_actions" || item.id === "priority_breakdown") {
        colSpan = 1;
        rowSpan = 1;
      } else if (item.id === "status_distribution" || item.id === "project_health") {
        colSpan = 2;
        rowSpan = 1;
      } else if (item.size === "lg" || item.size === "tall") {
        colSpan = 3; // Full-width 2-row block
        rowSpan = 2;
      } else {
        colSpan = 3;
        rowSpan = 1;
      }
    } else {
      // Desktop 4 cols:
      if (item.size === "wide") {
        colSpan = 2;
        rowSpan = 1;
      } else if (item.size === "tall") {
        colSpan = 1;
        rowSpan = 2;
      } else if (item.size === "lg") {
        colSpan = 2;
        rowSpan = 2;
      } else {
        colSpan = 1;
        rowSpan = 1;
      }
    }

    // Find first available slot (foundRow, foundCol)
    let foundRow = 0;
    let foundCol = 0;
    let placedSuccess = false;

    for (let r = 0; r < 200 && !placedSuccess; r++) {
      for (let c = 0; c <= cols - colSpan; c++) {
        let canFit = true;
        for (let dr = 0; dr < rowSpan; dr++) {
          for (let dc = 0; dc < colSpan; dc++) {
            if (isOccupied(r + dr, c + dc)) {
              canFit = false;
              break;
            }
          }
          if (!canFit) break;
        }

        if (canFit) {
          foundRow = r;
          foundCol = c;
          placedSuccess = true;
          break;
        }
      }
    }

    for (let dr = 0; dr < rowSpan; dr++) {
      for (let dc = 0; dc < colSpan; dc++) {
        setOccupied(foundRow + dr, foundCol + dc, true);
      }
    }

    placed.push({
      item,
      col: foundCol,
      row: foundRow,
      colSpan,
      rowSpan,
    });
  }

  let totalRows = 0;
  for (const p of placed) {
    totalRows = Math.max(totalRows, p.row + p.rowSpan);
  }

  return { placed, totalRows };
}

export function DraggableWidgetGrid({
  items,
  onChange,
  renderItem,
  editable = false,
  maxColumns = 4,
  gap = 16,
  radius = 20,
  rowRatio = 0.62,
  className,
}: DraggableWidgetGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const longPressTimerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  // Responsive column count: 2 on mobile (<640px), 3 on tablet (<1024px), 4 on desktop
  const columns = useMemo(() => {
    if (containerWidth < 640) return Math.min(2, maxColumns);
    if (containerWidth < 1024) return Math.min(3, maxColumns);
    return maxColumns;
  }, [containerWidth, maxColumns]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const colWidth = useMemo(() => {
    return (containerWidth - (columns - 1) * gap) / columns;
  }, [containerWidth, columns, gap]);

  const rowHeight = useMemo(() => {
    return colWidth * rowRatio;
  }, [colWidth, rowRatio]);

  const colStep = useMemo(() => colWidth + gap, [colWidth, gap]);
  const rowStep = useMemo(() => rowHeight + gap, [rowHeight, gap]);

  const { placed, totalRows } = useMemo(() => {
    return packGrid(items, columns);
  }, [items, columns]);

  const toSlot = useCallback(
    (x: number, y: number) => {
      const col = Math.max(0, Math.min(columns - 1, Math.floor((x + colWidth * 0.5) / colStep)));
      const row = Math.max(0, Math.floor((y + rowHeight * 0.5) / rowStep));
      return { col, row };
    },
    [columns, colWidth, rowHeight, colStep, rowStep],
  );

  const moveItem = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId || !onChange) return;
      const sourceIndex = items.findIndex((it) => it.id === sourceId);
      const targetIndex = items.findIndex((it) => it.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return;

      const next = [...items];
      const [removed] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, removed);
      onChange(next);
    },
    [items, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (!editable || !e.altKey) return;
    const index = items.findIndex((it) => it.id === itemId);
    if (index === -1) return;

    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      if (index > 0) {
        moveItem(itemId, items[index - 1].id);
      }
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      if (index < items.length - 1) {
        moveItem(itemId, items[index + 1].id);
      }
    }
  };

  const handlePointerDown = (e: React.PointerEvent, item: WidgetItem) => {
    if (!editable) return;
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("[role='button']")
    ) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;

    const startDrag = () => {
      setDraggingId(item.id);
      setDragStartPos({ x: startX, y: startY });
      setDragOffset({ x: 0, y: 0 });
    };

    if (e.pointerType === "touch") {
      longPressTimerRef.current = window.setTimeout(startDrag, 250);
    } else {
      startDrag();
    }
  };

  useEffect(() => {
    if (!draggingId) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      setDragOffset({ x: dx, y: dy });

      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const relativeY = e.clientY - containerRect.top;

      const { col, row } = toSlot(relativeX, relativeY);
      const hoveredWidget = placed.find((p) => {
        return (
          col >= p.col &&
          col < p.col + p.colSpan &&
          row >= p.row &&
          row < p.row + p.rowSpan
        );
      });

      if (hoveredWidget && hoveredWidget.item.id !== draggingId) {
        moveItem(draggingId, hoveredWidget.item.id);
      }
    };

    const handlePointerUp = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setDraggingId(null);
      setDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [draggingId, dragStartPos, toSlot, placed, moveItem]);

  const totalHeight = totalRows * rowHeight + Math.max(0, totalRows - 1) * gap;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full select-none", className)}
      style={{
        height: totalHeight > 0 ? totalHeight : "auto",
        minHeight: rowHeight * 2,
      }}
    >
      {placed.map(({ item, col, row, colSpan, rowSpan }) => {
        const isDragging = draggingId === item.id;
        const left = col * colStep;
        const top = row * rowStep;
        const width = colSpan * colWidth + (colSpan - 1) * gap;
        const height = rowSpan * rowHeight + (rowSpan - 1) * gap;

        return (
          <motion.div
            key={item.id}
            layout={!reduceMotion}
            tabIndex={editable ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            onPointerDown={(e) => handlePointerDown(e, item)}
            aria-grabbed={isDragging}
            className={cn(
              "absolute bg-white overflow-hidden transition-[border-color,box-shadow]",
              editable && "cursor-grab active:cursor-grabbing hover:border-[rgba(13,13,13,0.3)] focus-visible:outline-2 focus-visible:outline-[rgba(13,13,13,0.3)] focus-visible:outline-offset-2",
              isDragging
                ? "z-30 border border-[#0D0D0D] shadow-[0_12px_24px_rgba(0,0,0,0.08)] scale-[1.02]"
                : "border border-border shadow-none hover:border-[rgba(13,13,13,0.2)]",
            )}
            style={{
              left,
              top,
              width,
              height,
              borderRadius: radius,
              padding: 20,
              transform: isDragging
                ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.02)`
                : undefined,
              transition: isDragging ? "none" : undefined,
            }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 38,
            }}
          >
            {/* Drag handle icon shown when editing is on */}
            {editable && (
              <div
                className="absolute top-3.5 right-3.5 z-20 flex size-6 items-center justify-center rounded-full bg-[#F1F1F3] text-[#575657] pointer-events-none"
                aria-hidden="true"
              >
                <GripVertical className="size-3.5" />
              </div>
            )}
            {renderItem(item, isDragging, editable)}
          </motion.div>
        );
      })}
    </div>
  );
}
