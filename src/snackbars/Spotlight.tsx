import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExternalLink, X, Info, Sparkles, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { Snackbar } from "./types";
import { cn } from "@/lib/utils";

type Side = "right" | "bottom" | "top" | "left";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;       // px around target inside the highlight ring
const GAP = 14;          // px between target and the card
const CARD_W = 360;
const CARD_H_EST = 170;

const toneIcon = {
  info: Info,
  success: Sparkles,
  warning: AlertTriangle,
} as const;

const toneVar: Record<Snackbar["tone"], string> = {
  info: "hsl(var(--info))",
  success: "hsl(var(--primary))",
  warning: "hsl(var(--warning))",
};

function getRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function pickSide(target: Rect, vw: number, vh: number): { side: Side; pos: { top: number; left: number } } {
  const tryRight = vw - (target.left + target.width) - GAP;
  const tryBottom = vh - (target.top + target.height) - GAP;
  const tryTop = target.top - GAP;
  const tryLeft = target.left - GAP;

  // priority: right -> bottom -> top -> left
  if (tryRight >= CARD_W) {
    const top = clamp(target.top + target.height / 2 - CARD_H_EST / 2, 12, vh - CARD_H_EST - 12);
    return { side: "right", pos: { top, left: target.left + target.width + GAP } };
  }
  if (tryBottom >= CARD_H_EST) {
    const left = clamp(target.left + target.width / 2 - CARD_W / 2, 12, vw - CARD_W - 12);
    return { side: "bottom", pos: { top: target.top + target.height + GAP, left } };
  }
  if (tryTop >= CARD_H_EST) {
    const left = clamp(target.left + target.width / 2 - CARD_W / 2, 12, vw - CARD_W - 12);
    return { side: "top", pos: { top: target.top - GAP - CARD_H_EST, left } };
  }
  if (tryLeft >= CARD_W) {
    const top = clamp(target.top + target.height / 2 - CARD_H_EST / 2, 12, vh - CARD_H_EST - 12);
    return { side: "left", pos: { top, left: target.left - GAP - CARD_W } };
  }
  // fallback: center bottom
  return {
    side: "bottom",
    pos: {
      top: clamp(target.top + target.height + GAP, 12, vh - CARD_H_EST - 12),
      left: clamp(target.left, 12, vw - CARD_W - 12),
    },
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

interface Props {
  snackbar: Snackbar;
  onClose: () => void;
  /** Override target (used in КМ preview before save) */
  targetOverride?: Element | null;
}

export function Spotlight({ snackbar, onClose, targetOverride }: Props) {
  const [target, setTarget] = useState<Element | null>(targetOverride ?? null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [card, setCard] = useState<{ side: Side; pos: { top: number; left: number } } | null>(null);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const Icon = toneIcon[snackbar.tone];

  // Locate target element
  useEffect(() => {
    if (targetOverride) {
      setTarget(targetOverride);
      return;
    }
    if (!snackbar.targetSelector) {
      setTarget(null);
      return;
    }
    let cancelled = false;
    let attempts = 0;
    const tick = () => {
      if (cancelled) return;
      const el = document.querySelector(snackbar.targetSelector!);
      if (el) {
        setTarget(el);
        return;
      }
      attempts++;
      if (attempts < 20) window.setTimeout(tick, 100);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }, [snackbar.targetSelector, targetOverride]);

  // Track target rect with ResizeObserver + scroll/resize
  useLayoutEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const update = () => {
      const r = getRect(target);
      setRect(r);
      const { innerWidth: vw, innerHeight: vh } = window;
      setCard(pickSide(r, vw, vh));
    };
    update();
    target.scrollIntoView({ block: "center", behavior: "smooth" });

    const ro = new ResizeObserver(update);
    ro.observe(target);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const interval = window.setInterval(update, 250); // catch layout jitter
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      window.clearInterval(interval);
    };
  }, [target]);

  // Auto-hide
  useEffect(() => {
    if (snackbar.autoHideMs && snackbar.autoHideMs > 0) {
      closeTimer.current = window.setTimeout(handleClose, snackbar.autoHideMs);
    }
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbar.id]);

  function handleClose() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 180);
  }

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No target — render as floating bottom card (graceful fallback)
  if (!rect || !card) {
    return createPortal(
      <FallbackCard snackbar={snackbar} onClose={handleClose} closing={closing} />,
      document.body,
    );
  }

  const ringTop = rect.top - PADDING;
  const ringLeft = rect.left - PADDING;
  const ringW = rect.width + PADDING * 2;
  const ringH = rect.height + PADDING * 2;
  const tone = toneVar[snackbar.tone];

  return createPortal(
    <div
      className="fixed inset-0 z-[60]"
      style={{
        opacity: closing ? 0 : 1,
        transition: "opacity 180ms ease-out",
      }}
    >
      {/* Dim mask via 4 strips around the ring (lets target stay clickable) */}
      <div
        className="fixed left-0 right-0 top-0 bg-black/60 transition-all"
        style={{ height: Math.max(0, ringTop) }}
        onClick={handleClose}
      />
      <div
        className="fixed left-0 bg-black/60 transition-all"
        style={{ top: ringTop, height: ringH, width: Math.max(0, ringLeft) }}
        onClick={handleClose}
      />
      <div
        className="fixed right-0 bg-black/60 transition-all"
        style={{
          top: ringTop,
          height: ringH,
          width: Math.max(0, window.innerWidth - (ringLeft + ringW)),
        }}
        onClick={handleClose}
      />
      <div
        className="fixed left-0 right-0 bottom-0 bg-black/60 transition-all"
        style={{ top: ringTop + ringH, height: Math.max(0, window.innerHeight - (ringTop + ringH)) }}
        onClick={handleClose}
      />

      {/* Highlight ring — system blue */}
      <div
        aria-hidden
        className="pointer-events-none fixed animate-pulse-ring"
        style={{
          top: ringTop,
          left: ringLeft,
          width: ringW,
          height: ringH,
          borderRadius: 4,
          border: "2px solid hsl(var(--info))",
          boxShadow:
            "0 0 0 2px hsl(var(--info) / 0.25), 0 0 24px hsl(var(--info) / 0.45)",
        }}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-live="polite"
        className={cn(
          "fixed surface-card animate-snackbar-in overflow-hidden",
          "border-2",
        )}
        style={{
          top: card.pos.top,
          left: card.pos.left,
          width: CARD_W,
          borderColor: tone,
          boxShadow: "var(--shadow-snackbar)",
        }}
      >
        <span aria-hidden className="absolute left-0 top-0 h-full w-1" style={{ background: tone }} />
        <div className="flex gap-3 p-4 pl-5">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in oklab, ${tone} 12%, transparent)` }}
          >
            <Icon className="h-5 w-5" style={{ color: tone }} />
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
                target={snackbar.moreUrl.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:text-primary-hover"
              >
                Подробнее
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FallbackCard({
  snackbar,
  onClose,
  closing,
}: {
  snackbar: Snackbar;
  onClose: () => void;
  closing: boolean;
}) {
  const tone = toneVar[snackbar.tone];
  const Icon = toneIcon[snackbar.tone];
  return (
    <div className="fixed inset-0 z-[60] bg-black/60" style={{ opacity: closing ? 0 : 1, transition: "opacity 180ms" }}>
      <div
        className="surface-card fixed bottom-6 right-6 w-[360px] animate-snackbar-in border-2 overflow-hidden"
        style={{ borderColor: tone }}
      >
        <span className="absolute left-0 top-0 h-full w-1" style={{ background: tone }} />
        <div className="flex gap-3 p-4 pl-5">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in oklab, ${tone} 12%, transparent)` }}
          >
            <Icon className="h-5 w-5" style={{ color: tone }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-display text-sm font-semibold">{snackbar.title}</h4>
              <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{snackbar.message}</p>
            {snackbar.hasMore && snackbar.moreUrl && (
              <a
                href={snackbar.moreUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                Подробнее <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
