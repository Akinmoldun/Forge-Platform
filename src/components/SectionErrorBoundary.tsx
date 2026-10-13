import React from "react";
import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  name?: string;
  title?: string;
  description?: string;
  variant?: "widget" | "card" | "section" | "page" | "compact";
  className?: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  dismissed: boolean;
  retryCount: number;
}

/**
 * Resilient Error Boundary for page sections and dashboard widgets.
 * Keeps crashes isolated to the affected component so the rest of the application
 * and page continue functioning normally.
 * 
 * Features:
 * - Technical details and stack traces logged to console only.
 * - Clean, user-friendly copy.
 * - Functional "Try again" button that resets state and remounts children.
 * - Functional "Dismiss" button that gracefully hides the error view.
 */
export class SectionErrorBoundary extends React.Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = {
    hasError: false,
    dismissed: false,
    retryCount: 0,
  };

  static getDerivedStateFromError(): Partial<SectionErrorBoundaryState> {
    return { hasError: true, dismissed: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Keep stack traces and technical payloads in the developer console only
    console.error(
      `[SectionErrorBoundary${this.props.name ? ` - ${this.props.name}` : ""}] Caught error:`,
      error,
      errorInfo
    );
  }

  handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      dismissed: false,
      retryCount: prev.retryCount + 1,
    }));
    this.props.onRetry?.();
  };

  handleDismiss = (): void => {
    this.setState({ dismissed: true });
    this.props.onDismiss?.();
  };

  render(): React.ReactNode {
    if (this.state.dismissed) {
      return null;
    }

    if (this.state.hasError) {
      const {
        name,
        title,
        description,
        variant = "section",
        className = "",
      } = this.props;

      const displayTitle =
        title ||
        (variant === "widget"
          ? `Unable to load ${name || "widget"}`
          : `Unable to load ${name || "this section"}`);

      const displayDescription =
        description ||
        "Something unexpected occurred while rendering this component. You can try reloading it or dismiss this notice.";

      if (variant === "compact") {
        return (
          <div
            className={`flex items-center justify-between gap-3 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground ${className}`}
          >
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="size-3.5 shrink-0 text-amber-500" />
              <span className="truncate">{displayTitle}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={this.handleRetry}
                className="h-6 px-2 text-[11px]"
              >
                <RefreshCw className="mr-1 size-3" />
                Try again
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={this.handleDismiss}
                className="size-6 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss error"
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        );
      }

      const isWidget = variant === "widget";

      return (
        <div
          className={`relative flex flex-col justify-between rounded-[16px] border border-border bg-white p-5 shadow-xs transition-colors ${
            isWidget ? "h-full min-h-[180px]" : "w-full min-h-[140px]"
          } ${className}`}
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                  <AlertCircle className="size-4" />
                </div>
                <h4 className="text-[14px] font-medium text-[#0D0D0D]">
                  {displayTitle}
                </h4>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={this.handleDismiss}
                className="size-6 rounded-full text-[#575657] hover:bg-[#F1F1F3] hover:text-[#0D0D0D]"
                aria-label="Dismiss error notice"
              >
                <X className="size-3.5" />
              </Button>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#575657]">
              {displayDescription}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="h-8 rounded-full border-border bg-white px-3 text-[12px] font-medium text-[#0D0D0D] hover:bg-[#F6F6F7]"
            >
              <RefreshCw className="mr-1.5 size-3 text-[#575657]" />
              Try again
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={this.handleDismiss}
              className="h-8 rounded-full px-3 text-[12px] text-[#575657] hover:bg-[#F1F1F3] hover:text-[#0D0D0D]"
            >
              Dismiss
            </Button>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.retryCount}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

/**
 * Convenience error boundary wrapper for dashboard widgets.
 */
export function WidgetErrorBoundary(
  props: Omit<SectionErrorBoundaryProps, "variant">
) {
  return <SectionErrorBoundary variant="widget" {...props} />;
}
