import { Upload, Plus, ShieldAlert, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSnackbarManager } from "@/snackbars/SnackbarManager";

const RISKS = [
  { id: "RSK-104", title: "Сбой эквайринга на пиковой нагрузке", level: "Высокий", trend: "up", owner: "ИТ-блок", measures: 4 },
  { id: "RSK-097", title: "Утечка PII через сторонних подрядчиков", level: "Средний", trend: "down", owner: "ИБ", measures: 2 },
  { id: "RSK-088", title: "Ошибки в расчётах комиссий", level: "Средний", trend: "up", owner: "Операционный блок", measures: 3 },
  { id: "RSK-072", title: "Регуляторные изменения по KYC", level: "Низкий", trend: "down", owner: "Комплаенс", measures: 1 },
];

const LEVEL_STYLES: Record<string, string> = {
  Высокий: "bg-destructive/12 text-destructive",
  Средний: "bg-warning/15 text-warning-foreground",
  Низкий: "bg-primary-soft text-primary",
};

export default function RisksPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Активных рисков: <span className="font-semibold text-foreground">{RISKS.length}</span> ·
          Связанных мер: 28 · Покрытие: 84%
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Upload className="h-4 w-4" /> Импорт xlsx
          </Button>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Новый риск
          </Button>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">ID</th>
              <th className="px-5 py-3 font-semibold">Риск</th>
              <th className="px-5 py-3 font-semibold">Уровень</th>
              <th className="px-5 py-3 font-semibold">Тренд</th>
              <th className="px-5 py-3 font-semibold">Владелец</th>
              <th className="px-5 py-3 font-semibold text-right">Меры</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RISKS.map((r) => (
              <tr key={r.id} className="text-sm transition hover:bg-secondary/40">
                <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{r.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={"pill " + LEVEL_STYLES[r.level]}>{r.level}</span>
                </td>
                <td className="px-5 py-3.5">
                  {r.trend === "up" ? (
                    <span className="inline-flex items-center gap-1 text-destructive">
                      <TrendingUp className="h-4 w-4" /> Растёт
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <TrendingDown className="h-4 w-4" /> Снижается
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{r.owner}</td>
                <td className="px-5 py-3.5 text-right font-semibold">{r.measures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PageSnackbarManager />
    </div>
  );
}
