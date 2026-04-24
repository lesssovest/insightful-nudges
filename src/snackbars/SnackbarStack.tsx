import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useSnackbars } from "./SnackbarsContext";
import { SnackbarItem } from "./SnackbarItem";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Renders auto-popping snackbars in the bottom-right corner of the page. */
export function SnackbarStack() {
  const { unseenForRoute, markSeen } = useSnackbars();
  const [active, setActive] = useState<string[]>([]);

  // Push new unseen snackbars onto the stack
  useEffect(() => {
    setActive((prev) => {
      const set = new Set(prev);
      unseenForRoute.forEach((s) => set.add(s.id));
      return Array.from(set);
    });
  }, [unseenForRoute]);

  const visible = unseenForRoute.filter((s) => active.includes(s.id));

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {visible.map((s, i) => (
        <SnackbarItem
          key={s.id}
          snackbar={s}
          index={i}
          onClose={() => {
            markSeen(s.id);
            setActive((prev) => prev.filter((id) => id !== s.id));
          }}
        />
      ))}
    </div>
  );
}

/** Bell button to re-open active snackbars for current route. */
export function SnackbarRouteBell() {
  const { matchingForRoute, resetSeen } = useSnackbars();
  const count = matchingForRoute.length;

  if (count === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <Bell className="h-4 w-4" />
          Обновления
          <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
            {count}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Уведомления страницы</p>
            <p className="text-xs text-muted-foreground">
              Активные изменения, относящиеся к этому экрану
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSeen}
            className="text-xs"
          >
            Показать снова
          </Button>
        </div>
        <div className="max-h-[420px] space-y-2 overflow-y-auto scrollbar-thin p-3">
          {matchingForRoute.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-border bg-secondary/40 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{s.title}</p>
                <span className="pill bg-card text-[10px] uppercase text-muted-foreground">
                  {s.tone === "success" ? "новое" : s.tone === "warning" ? "важно" : "инфо"}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {s.message}
              </p>
              {s.hasMore && s.moreUrl && (
                <a
                  href={s.moreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-medium text-primary hover:text-primary-hover"
                >
                  Подробнее →
                </a>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
