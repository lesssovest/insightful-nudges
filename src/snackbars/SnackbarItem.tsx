import { useEffect, useRef, useState } from "react";
import { ExternalLink, Info, Sparkles, X, AlertTriangle } from "lucide-react";
import { Snackbar } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  snackbar: Snackbar;
  onClose: () => void;
  index?: number;
}

const toneIcon = {
  info: Info,
  success: Sparkles,
  warning: AlertTriangle,
} as const;

const toneStyles: Record<Snackbar["tone"], string> = {
  info: "border-info/20 [--tone:hsl(var(--info))]",
  success: "border-primary/25 [--tone:hsl(var(--primary))]",
  warning: "border-warning/30 [--tone:hsl(var(--warning))]",
};

export function SnackbarItem({ snackbar, onClose, index = 0 }: Props) {
  const [closing, setClosing] = useState(false);
  const timer = useRef<number | null>(null);
  const Icon = toneIcon[snackbar.tone];

  useEffect(() => {
    if (snackbar.autoHideMs && snackbar.autoHideMs > 0) {
      timer.current = window.setTimeout(() => handleClose(), snackbar.autoHideMs);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbar.id]);

  function handleClose() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 180);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        animationDelay: `${index * 80}ms`,
        opacity: closing ? 0 : undefined,
        transform: closing ? "translateY(8px) scale(0.98)" : undefined,
        transition: closing ? "all 180ms ease-out" : undefined,
      }}
      className={cn(
        "pointer-events-auto w-[380px] max-w-[calc(100vw-2rem)] surface-card border bg-card",
        "shadow-snackbar relative overflow-hidden animate-snackbar-in",
        toneStyles[snackbar.tone],
      )}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: "var(--tone)" }}
      />
      <div className="flex gap-3 p-4 pl-5">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "color-mix(in oklab, var(--tone) 12%, transparent)" }}
        >
          <Icon className="h-5 w-5" style={{ color: "var(--tone)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-display text-sm font-semibold leading-snug text-foreground">
              {snackbar.title}
            </h4>
            <button
              onClick={handleClose}
              aria-label="Закрыть уведомление"
              className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {snackbar.message}
          </p>
          {snackbar.hasMore && snackbar.moreUrl && (
            <a
              href={snackbar.moreUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary-hover"
            >
              Подробнее
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
