import { useEffect, useMemo, useState } from "react";
import { Sparkles, ListChecks } from "lucide-react";
import { useSnackbars } from "./SnackbarsContext";
import { Spotlight } from "./Spotlight";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Snackbar } from "./types";

function sortByOrder(list: Snackbar[]) {
  return [...list].sort((a, b) => {
    const oa = a.order ?? 999;
    const ob = b.order ?? 999;
    if (oa !== ob) return oa - ob;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

/**
 * Auto-shows unseen snackbars on the current page as a queue.
 * If multiple unseen snackbars exist, user navigates with Назад/Далее.
 * Single snackbar — no navigation buttons.
 */
export function SnackbarStack() {
  const { unseenForRoute, markSeen } = useSnackbars();
  const [queue, setQueue] = useState<Snackbar[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);

  // Initialize queue once unseen snackbars are available (with delay for mount)
  useEffect(() => {
    if (active) return;
    if (unseenForRoute.length === 0) return;
    const ordered = sortByOrder(unseenForRoute);
    const t = window.setTimeout(() => {
      setQueue(ordered);
      setIndex(0);
      setActive(true);
    }, 250);
    return () => window.clearTimeout(t);
  }, [unseenForRoute, active]);

  if (!active || queue.length === 0) return null;
  const current = queue[index];
  if (!current) return null;

  const total = queue.length;

  const handleClose = () => {
    // mark all in queue as seen, finish session
    queue.forEach((s) => markSeen(s.id));
    setActive(false);
    setQueue([]);
    setIndex(0);
  };

  return (
    <Spotlight
      key={current.id}
      snackbar={current}
      onClose={handleClose}
      nav={
        total > 1
          ? {
              index,
              total,
              onPrev: index > 0 ? () => setIndex((i) => Math.max(0, i - 1)) : undefined,
              onNext: index < total - 1 ? () => setIndex((i) => Math.min(total - 1, i + 1)) : undefined,
            }
          : undefined
      }
    />
  );
}

/**
 * Header button: "Список изменений" — let users replay any active snackbar
 * matching the current page (with full spotlight highlight + sequential nav).
 */
export function SnackbarRouteBell() {
  const { matchingForRoute } = useSnackbars();
  const [replayQueue, setReplayQueue] = useState<Snackbar[] | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);
  const ordered = useMemo(() => sortByOrder(matchingForRoute), [matchingForRoute]);
  const count = matchingForRoute.length;

  if (count === 0 && !replayQueue) return null;

  const current = replayQueue?.[replayIndex];
  const total = replayQueue?.length ?? 0;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative gap-2">
            <ListChecks className="h-4 w-4" />
            Список изменений
            {count > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[420px] p-0">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Изменения на этой странице</p>
              <p className="text-xs text-muted-foreground">
                Нажмите на пункт или «Показать всё»
              </p>
            </div>
            {ordered.length > 1 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplayQueue(ordered);
                  setReplayIndex(0);
                }}
              >
                Показать всё
              </Button>
            )}
          </div>
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin p-2">
            {ordered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Здесь пока нет активных изменений
              </p>
            ) : (
              <ul className="space-y-1">
                {ordered.map((s, i) => (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        setReplayQueue(ordered);
                        setReplayIndex(i);
                      }}
                      className="w-full rounded-lg border border-transparent p-3 text-left transition hover:border-border hover:bg-secondary/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground">
                            {i + 1}
                          </span>
                          {s.title}
                        </p>
                        <ToneBadge tone={s.tone} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {s.message}
                      </p>
                      {s.targetLabel && (
                        <p className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-info">
                          <Sparkles className="h-3 w-3" /> {s.targetLabel}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {current && (
        <Spotlight
          key={current.id + ":" + replayIndex}
          snackbar={current}
          onClose={() => {
            setReplayQueue(null);
            setReplayIndex(0);
          }}
          nav={
            total > 1
              ? {
                  index: replayIndex,
                  total,
                  onPrev: replayIndex > 0 ? () => setReplayIndex((i) => Math.max(0, i - 1)) : undefined,
                  onNext:
                    replayIndex < total - 1
                      ? () => setReplayIndex((i) => Math.min(total - 1, i + 1))
                      : undefined,
                }
              : undefined
          }
        />
      )}
    </>
  );
}

function ToneBadge({ tone }: { tone: Snackbar["tone"] }) {
  const map = {
    info: { label: "инфо", cls: "bg-info/10 text-info" },
    success: { label: "новое", cls: "bg-primary-soft text-primary" },
    warning: { label: "важно", cls: "bg-warning/15 text-warning-foreground" },
  } as const;
  const { label, cls } = map[tone];
  return <span className={"pill text-[10px] uppercase " + cls}>{label}</span>;
}
