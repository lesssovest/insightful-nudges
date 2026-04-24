import { useState } from "react";
import { Search, Filter, Plus, Calendar, User2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageSnackbarManager } from "@/snackbars/SnackbarManager";

const TABS = [
  { key: "all", label: "Все события", count: 188 },
  { key: "mine", label: "Мои в работе", count: 12 },
  { key: "investigation", label: "На расследование РМ", count: 38, accent: true },
  { key: "approval", label: "На утверждение", count: 8 },
  { key: "delete", label: "На удаление", count: 1 },
];

const EVENTS = [
  {
    id: "EVE-249",
    type: "Расследование РМ",
    date: "17.02.2026",
    daysInWork: 37,
    title: "Возврат средств и компенсации клиентам по продуктам.",
    direct: "—",
    indirect: "—",
    author: "Ирина Лазарева",
    description: "Описание события",
    company: "РегионТраст · Тюмень",
    confidential: false,
  },
  {
    id: "EVE-248",
    type: "Расследование РМ",
    date: "16.02.2026",
    daysInWork: 38,
    title: "Внутреннее мошенничество с целью получения выгоды.",
    direct: "—",
    indirect: "—",
    author: "Дмитрий Орлов",
    description: "Подробности недоступны",
    company: "РегионТраст · Тюмень",
    confidential: true,
  },
  {
    id: "EVE-242",
    type: "Расследование",
    date: "22.01.2026",
    daysInWork: 63,
    title:
      "Внутреннее мошенничество с целью получения выгоды. Не полные, не точные, не актуальные данные.",
    direct: "2 ₽",
    indirect: "—",
    author: "Илья Беккер",
    description: "er55t",
    company: "РегионТраст · Тюмень",
    confidential: false,
  },
  {
    id: "EVE-238",
    type: "Расследование",
    date: "22.01.2026",
    daysInWork: 63,
    title: "Внутреннее мошенничество с целью получения выгоды.",
    direct: "—",
    indirect: "—",
    author: "Илья Беккер",
    description: "—",
    company: "РегионТраст · Тюмень",
    confidential: false,
  },
];

export default function EventsPage() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={
                  "group inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition " +
                  (active
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-secondary")
                }
              >
                {t.label}
                <span
                  className={
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold " +
                    (active
                      ? "bg-background/15 text-background"
                      : t.accent
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground group-hover:bg-card")
                  }
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="h-4 w-4" /> Фильтр
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Зарегистрировать событие
          </Button>
        </div>
      </div>

      <div className="surface-card flex items-center gap-3 px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Введите текст или ID события"
          className="border-0 px-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Найдено: <span className="font-semibold text-foreground">{EVENTS.length}</span>
      </p>

      <div className="space-y-3">
        {EVENTS.filter((e) =>
          q ? (e.title + " " + e.id).toLowerCase().includes(q.toLowerCase()) : true,
        ).map((e) => (
          <article
            key={e.id}
            className="surface-card grid gap-4 p-5 md:grid-cols-[1fr_280px]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="pill bg-primary-soft text-primary">{e.type}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {e.date}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-destructive font-medium">
                  {e.daysInWork} дн. в работе
                </span>
                {e.confidential && (
                  <span className="pill bg-warning/15 text-warning-foreground">
                    <Lock className="h-3 w-3" /> Конфиденциально
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-display text-base font-semibold leading-snug">
                {e.title}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 max-w-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Прямые
                  </p>
                  <p className="mt-0.5 font-medium">{e.direct}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Косвенные
                  </p>
                  <p className="mt-0.5 font-medium">{e.indirect}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0 text-sm">
              <p>
                <span className="text-muted-foreground">ID: </span>
                <span className="font-mono font-medium">{e.id}</span>
              </p>
              <p className="mt-1.5">
                <span className="text-muted-foreground">Автор: </span>
                <span className="font-medium">{e.author}</span>
              </p>
              <p className="mt-1.5">
                <span className="text-muted-foreground">Описание: </span>
                <span>{e.description}</span>
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <User2 className="h-3.5 w-3.5" /> {e.company}
              </p>
            </div>
          </article>
        ))}
      </div>

      <PageSnackbarManager />
    </div>
  );
}
