import { useEffect, useState } from "react";
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

/**
 * Auto-shows unseen snackbars one by one (sequential queue) on the current page.
 * Each snackbar highlights its target element with a spotlight + dim overlay.
 */
export function SnackbarStack() {
  const { unseenForRoute, markSeen } = useSnackbars();
  const [current, setCurrent] = useState<Snackbar | null>(null);
  const [shownIds, setShownIds] = useState<string[]>([]);

  // Pick the next unseen snackbar that wasn't yet shown in this session render
  useEffect(() => {
    if (current) return;
    const next = unseenForRoute.find((s) => !shownIds.includes(s.id));
    if (next) {
      // small delay to let the page mount targets
      const t = window.setTimeout(() => setCurrent(next), 250);
      return () => window.clearTimeout(t);
    }
  }, [unseenForRoute, current, shownIds]);

  if (!current) return null;

  return (
    <Spotlight
      snackbar={current}
      onClose={() => {
        markSeen(current.id);
        setShownIds((p) => [...p, current.id]);
        setCurrent(null);
      }}
    />
  );
}

/**
 * Header button: "Список изменений" — lets users re-open any active snackbar
 * matching the current page (with full spotlight highlight).
 */
export function SnackbarRouteBell() {
  const { matchingForRoute } = useSnackbars();
  const [replay, setReplay] = useState<Snackbar | null>(null);
  const count = matchingForRoute.length;

  if (count === 0 && !replay) return null;

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
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Изменения на этой странице</p>
            <p className="text-xs text-muted-foreground">
              Нажмите на любой пункт, чтобы снова увидеть подсветку элемента
            </p>
          </div>
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin p-2">
            {matchingForRoute.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Здесь пока нет активных изменений
              </p>
            ) : (
              <ul className="space-y-1">
                {matchingForRoute.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setReplay(s)}
                      className="w-full rounded-lg border border-transparent p-3 text-left transition hover:border-border hover:bg-secondary/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{s.title}</p>
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

      {replay && (
        <Spotlight snackbar={replay} onClose={() => setReplay(null)} />
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
  return (
    <span className={"pill text-[10px] uppercase " + cls}>{label}</span>
  );
}
