import React, { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GripVertical, ArrowLeft, ArrowRight } from "lucide-react";
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

export function DraggableWidgetGrid({
  items,
  onChange,
  renderItem,
  editable = false,
  className,
}: DraggableWidgetGridProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

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

  const moveDirection = useCallback(
    (id: string, direction: -1 | 1) => {
      const idx = items.findIndex((it) => it.id === id);
      if (idx === -1) return;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= items.length) return;
      moveItem(id, items[targetIdx].id);
    },
    [items, moveItem],
  );

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (!editable || !e.altKey) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      moveDirection(itemId, -1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      moveDirection(itemId, 1);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!editable) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!editable) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!editable) return;
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain") || draggedId;
    if (sourceId && sourceId !== targetId) {
      moveItem(sourceId, targetId);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full items-start",
        className,
      )}
    >
      {items.map((item, index) => {
        const isDragging = draggedId === item.id;
        const isDragOver = dragOverId === item.id && draggedId !== item.id;

        // 60/40 calm 2-column layout on desktop:
        // wide widgets span 3 cols (60%), tall/sm span 2 cols (40%)
        // on tablet (md), span 1 col each (50/50); on mobile, span 1 col (100%)
        const colSpanClass =
          item.size === "wide" || item.size === "lg"
            ? "col-span-1 md:col-span-1 lg:col-span-3"
            : "col-span-1 md:col-span-1 lg:col-span-2";

        return (
          <motion.div
            key={item.id}
            layout={!reduceMotion}
            tabIndex={editable ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, item.id)}
            className={cn(
              colSpanClass,
              "h-auto outline-none",
            )}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
          >
            <div
              draggable={editable}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "relative rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-white p-5 transition-all flex flex-col justify-start h-auto overflow-hidden",
                editable
                  ? "cursor-grab active:cursor-grabbing hover:border-[rgba(13,13,13,0.3)] focus-visible:outline-2 focus-visible:outline-[#0D0D0D]"
                  : "hover:border-[rgba(13,13,13,0.18)]",
                isDragging && "opacity-40 border-dashed border-[#0D0D0D] scale-[0.98]",
                isDragOver && "ring-2 ring-[#0D0D0D] border-[#0D0D0D] bg-[#FBFBFC]",
              )}
            >
              {/* Editing toolbar for accessible reordering */}
              {editable && (
                <div className="mb-3 flex items-center justify-between border-b border-border/80 pb-2.5 bg-[#FBFBFC] -mx-5 -mt-5 px-4 pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#575657]">
                    <GripVertical className="size-3.5 text-[#0D0D0D]" />
                    <span>Widget {index + 1} of {items.length}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveDirection(item.id, -1);
                      }}
                      disabled={index === 0}
                      className="flex size-6 items-center justify-center rounded-[6px] border border-border bg-white text-[#0D0D0D] hover:bg-[#F1F1F3] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move earlier"
                      aria-label={`Move ${item.title || "widget"} earlier`}
                    >
                      <ArrowLeft className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveDirection(item.id, 1);
                      }}
                      disabled={index === items.length - 1}
                      className="flex size-6 items-center justify-center rounded-[6px] border border-border bg-white text-[#0D0D0D] hover:bg-[#F1F1F3] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Move later"
                      aria-label={`Move ${item.title || "widget"} later`}
                    >
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Widget content - dynamic height with zero clipping */}
              <div className="flex-1 w-full min-h-0">
                {renderItem(item, isDragging, editable)}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
