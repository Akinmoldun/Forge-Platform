import React, { useEffect, useState, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface UseLoadingTimeoutOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
}

export function useLoadingTimeout(
  isLoading: boolean,
  options: UseLoadingTimeoutOptions | number = 8000
) {
  const timeoutMs = typeof options === "number" ? options : options.timeoutMs ?? 8000;
  const onTimeout = typeof options === "object" ? options.onTimeout : undefined;
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setTimedOut(true);
      onTimeout?.();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutMs, onTimeout]);

  const retry = useCallback(() => {
    setTimedOut(false);
    window.location.reload();
  }, []);

  return { timedOut, resetTimeout: () => setTimedOut(false), retry };
}

export interface LoadingTimeoutStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function LoadingTimeoutState({
  title = "This page took too long to load",
  description = "We couldn't load the requested data within 8 seconds. Please check your connection and retry.",
  onRetry,
  className = "",
}: LoadingTimeoutStateProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`mx-auto flex max-w-md flex-col items-center justify-center rounded-[16px] border border-destructive/30 bg-white p-8 text-center shadow-xs ${className}`}
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-5" />
      </div>
      <h3 className="text-[15px] font-[500] text-[#0D0D0D]">{title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-[#575657] max-w-sm">
        {description}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 rounded-full border-border hover:bg-[#F6F6F7]"
        onClick={handleRetry}
      >
        <RefreshCw className="mr-1.5 size-3.5 text-[#575657]" /> Retry
      </Button>
    </div>
  );
}
