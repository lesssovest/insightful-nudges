import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExternalLink, X, Info, Sparkles, AlertTriangle, ChevronLeft, ChevronRight, Move } from "lucide-react";
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

const PADDING = 8;
const GAP = 14;
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

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function positionForSide(side: Side, target: Rect, vw: number, vh: number) {
  if (side === "right") {
    const top = clamp(target.top + target.height / 2 - CARD_H_EST / 2, 12, vh - CARD_H_EST - 12);
    return { top, left: target.left + target.width + GAP };
  }
  if (side === "left") {
    const top = clamp(target.top + target.height / 2 - CARD_H_EST / 2, 12, vh - CARD_H_EST - 12);
    return { top, left: target.left - GAP - CARD_W };
  }
  if (side === "bottom") {
    const left = clamp(target.left + target.width / 2 - CARD_W / 2, 12, vw - CARD_W - 12);
    return { top: target.top + target.height + GAP, left };
  }
  // top
  const left = clamp(target.left + target.width / 2 - CARD_W / 2, 12, vw - CARD_W - 12);
  return { top: target.top - GAP - CARD_H_EST, left };
}

function fitsOnSide(side: Side, target: Rect, vw: number, vh: number): boolean {
  if (side === "right") return vw - (target.left + target.width) - GAP >= CARD_W;
  if (side === "left") return target.left - GAP >= CARD_W;
  if (side === "bottom") return vh - (target.top + target.height) - GAP >= CARD_H_EST;
  return target.top - GAP >= CARD_H_EST;
}

function pickSide(
  target: Rect,
  vw: number,
  vh: number,
  preferred?: Snackbar["preferredSide"],
): { side: Side; pos: { top: number; left: number } } {
  // Honor explicit preference if it fits
  if (preferred && preferred !== "auto" && fitsOnSide(preferred, target, vw, vh)) {
    return { side: preferred, pos: positionForSide(preferred, target, vw, vh) };
  }
  const order: Side[] = ["right", "bottom", "top", "left"];
  for (const s of order) {
    if (fitsOnSide(s, target, vw, vh)) return { side: s, pos: positionForSide(s, target, vw, vh) };
  }
  return {
    side: "bottom",
    pos: {
      top: clamp(target.top + target.height + GAP, 12, vh - CARD_H_EST - 12),
      left: clamp(target.left, 12, vw - CARD_W - 12),
    },
  };
}

interface NavInfo {
  index: number; // 0-based
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
}

interface Props {
  snackbar: Snackbar;
  onClose: () => void;
  /** Override target (used in КМ preview before save) */
  targetOverride?: Element | null;
  /** Show prev/next controls when total > 1. */
  nav?: NavInfo;
  /** Allow dragging the card (КМ режим). Calls back with new offset. */
  draggable?: boolean;
  onOffsetChange?: (offset: { x: number; y: number }) => void;
  onSideChange?: (side: Side) => void;
}

export function Spotlight({
  snackbar,
  onClose,
  targetOverride,
  nav,
  draggable,
  onOffsetChange,
  onSideChange,
}: Props) {
  const [target, setTarget] = useState<Element | null>(targetOverride ?? null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [card, setCard] = useState<{ side: Side; pos: { top: number; left: number } } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>(snackbar.offset ?? { x: 0, y: 0 });
  const [closing, setClosing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startOffset: { x: number; y: number } } | null>(null);
  const closeTimer = useRef<number | null>(null);
  const Icon = toneIcon[snackbar.tone];

  // Reset offset when snackbar changes
  useEffect(() => {
    setOffset(snackbar.offset ?? { x: 0, y: 0 });
  }, [snackbar.id, snackbar.offset]);

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

  useLayoutEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const update = () => {
      const r = getRect(target);
      setRect(r);
      const { innerWidth: vw, innerHeight: vh } = window;
      setCard(pickSide(r, vw, vh, snackbar.preferredSide));
    };
    update();
    target.scrollIntoView({ block: "center", behavior: "smooth" });

    const ro = new ResizeObserver(update);
    ro.observe(target);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    const interval = window.setInterval(update, 250);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      window.clearInterval(interval);
    };
  }, [target, snackbar.preferredSide]);

  // Auto-hide (disabled while dragging or in КМ-режиме)
  useEffect(() => {
    if (draggable) return;
    if (snackbar.autoHideMs && snackbar.autoHideMs > 0) {
      closeTimer.current = window.setTimeout(handleClose, snackbar.autoHideMs);
    }
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snackbar.id, draggable]);

  function handleClose() {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, 180);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (nav && nav.total > 1) {
        if (e.key === "ArrowRight" && nav.onNext) nav.onNext();
        if (e.key === "ArrowLeft" && nav.onPrev) nav.onPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav]);

  // Drag handlers
  function onDragStart(e: React.PointerEvent) {
    if (!draggable) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startOffset: { ...offset },
    };
  }
  function onDragMove(e: React.PointerEvent) {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({
      x: dragRef.current.startOffset.x + dx,
      y: dragRef.current.startOffset.y + dy,
    });
  }
  function onDragEnd() {
    if (!dragging) return;
    setDragging(false);
    dragRef.current = null;
    onOffsetChange?.(offset);
  }

  // Quick side switcher (КМ)
  function setSide(side: Side) {
    onSideChange?.(side);
    setOffset({ x: 0, y: 0 });
    onOffsetChange?.({ x: 0, y: 0 });
  }

  if (!rect || !card) {
    return createPortal(
      <FallbackCard snackbar={snackbar} onClose={handleClose} closing={closing} nav={nav} />,
      document.body,
    );
  }

  const ringTop = rect.top - PADDING;
  const ringLeft = rect.left - PADDING;
  const ringW = rect.width + PADDING * 2;
  const ringH = rect.height + PADDING * 2;
  const tone = toneVar[snackbar.tone];

  const cardTop = card.pos.top + offset.y;
  const cardLeft = card.pos.left + offset.x;

  return createPortal(
    <div
      className="fixed inset-0 z-[60]"
      style={{ opacity: closing ? 0 : 1, transition: "opacity 180ms ease-out" }}
    >
      {/* Dim mask via 4 strips */}
      <div className="fixed left-0 right-0 top-0 bg-black/60" style={{ height: Math.max(0, ringTop) }} onClick={handleClose} />
      <div className="fixed left-0 bg-black/60" style={{ top: ringTop, height: ringH, width: Math.max(0, ringLeft) }} onClick={handleClose} />
      <div
        className="fixed right-0 bg-black/60"
        style={{ top: ringTop, height: ringH, width: Math.max(0, window.innerWidth - (ringLeft + ringW)) }}
        onClick={handleClose}
      />
      <div
        className="fixed left-0 right-0 bottom-0 bg-black/60"
        style={{ top: ringTop + ringH, height: Math.max(0, window.innerHeight - (ringTop + ringH)) }}
        onClick={handleClose}
      />

      {/* Highlight ring */}
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
          boxShadow: "0 0 0 2px hsl(var(--info) / 0.25), 0 0 24px hsl(var(--info) / 0.45)",
        }}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-live="polite"
        className={cn(
          "fixed surface-card overflow-hidden border-2",
          !dragging && "animate-snackbar-in",
        )}
        style={{
          top: cardTop,
          left: cardLeft,
          width: CARD_W,
          borderColor: tone,
          boxShadow: "var(--shadow-snackbar)",
          cursor: draggable ? (dragging ? "grabbing" : "grab") : "default",
          userSelect: dragging ? "none" : "auto",
        }}
        onPointerDown={draggable ? onDragStart : undefined}
        onPointerMove={draggable ? onDragMove : undefined}
        onPointerUp={draggable ? onDragEnd : undefined}
        onPointerCancel={draggable ? onDragEnd : undefined}
      >
        <span aria-hidden className="absolute left-0 top-0 h-full w-1" style={{ background: tone }} />

        {draggable && (
          <div
            data-cm-ui
            className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-foreground/90 px-1.5 py-1 text-[10px] font-medium text-background"
            title="Перетаскивайте карточку, чтобы поправить положение"
          >
            <Move className="h-3 w-3" /> drag
          </div>
        )}

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
              {!draggable && (
                <button
                  onClick={handleClose}
                  aria-label="Закрыть уведомление"
                  className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
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

            {/* Sequential nav */}
            {nav && nav.total > 1 && (
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {nav.index + 1} из {nav.total}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nav.onPrev?.(); }}
                    disabled={!nav.onPrev || nav.index === 0}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Назад
                  </button>
                  {nav.index < nav.total - 1 ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); nav.onNext?.(); }}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                      Далее <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleClose(); }}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                      Готово
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* КМ side picker */}
        {draggable && onSideChange && (
          <div data-cm-ui className="border-t border-border bg-secondary/40 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Положение</span>
              <div className="flex items-center gap-1">
                {(["top", "right", "bottom", "left", "auto"] as const).map((s) => {
                  const active = (snackbar.preferredSide ?? "auto") === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSide(s as Side)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[10px] font-medium uppercase transition",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      {s === "top" ? "сверху" : s === "right" ? "справа" : s === "bottom" ? "снизу" : s === "left" ? "слева" : "авто"}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

function FallbackCard({
  snackbar,
  onClose,
  closing,
  nav,
}: {
  snackbar: Snackbar;
  onClose: () => void;
  closing: boolean;
  nav?: NavInfo;
}) {
  const tone = toneVar[snackbar.tone];
  const Icon = toneIcon[snackbar.tone];
  return (
    <div className="fixed inset-0 z-[60] bg-black/60" style={{ opacity: closing ? 0 : 1, transition: "opacity 180ms" }}>
      <div className="surface-card fixed bottom-6 right-6 w-[360px] animate-snackbar-in border-2 overflow-hidden" style={{ borderColor: tone }}>
        <span className="absolute left-0 top-0 h-full w-1" style={{ background: tone }} />
        <div className="flex gap-3 p-4 pl-5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${tone} 12%, transparent)` }}>
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
              <a href={snackbar.moreUrl} target="_blank" rel="noreferrer" className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Подробнее <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {nav && nav.total > 1 && (
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <span className="text-[11px] font-medium text-muted-foreground">{nav.index + 1} из {nav.total}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={nav.onPrev} disabled={!nav.onPrev || nav.index === 0} className="rounded-md border border-border px-2.5 py-1.5 text-xs disabled:opacity-40">Назад</button>
                  {nav.index < nav.total - 1
                    ? <button onClick={nav.onNext} className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">Далее</button>
                    : <button onClick={onClose} className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">Готово</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
