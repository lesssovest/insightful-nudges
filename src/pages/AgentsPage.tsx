import { Bot, Shield, Brain, FileSearch, ClipboardList, ArrowUpRight } from "lucide-react";
import { PageSnackbarManager } from "@/snackbars/SnackbarManager";

const AGENTS = [
  {
    icon: Brain,
    name: "Методолог",
    role: "Отвечает на вопросы по теории рисков и внутренним методикам.",
    stats: "412 ответов · точность 96%",
    tone: "from-primary/15 to-primary/0",
    iconCls: "text-primary",
  },
  {
    icon: FileSearch,
    name: "Анализатор рисков",
    role: "Из xlsx с рисками автоматически создаёт карточки и предлагает меры.",
    stats: "78 импортов · 1 240 рисков",
    tone: "from-info/15 to-info/0",
    iconCls: "text-info",
  },
  {
    icon: ClipboardList,
    name: "Аналитик",
    role: "Готовит сводки и графики по событиям, рискам и мерам в один клик.",
    stats: "34 отчёта · 12 дашбордов",
    tone: "from-warning/15 to-warning/0",
    iconCls: "text-warning",
  },
  {
    icon: Bot,
    name: "Создатель инцидентов",
    role: "Регистрирует инциденты по описанию пользователя — без ручного заполнения формы.",
    stats: "56 регистраций · 8 мин сэкономлено",
    tone: "from-primary/15 to-primary/0",
    iconCls: "text-primary",
  },
  {
    icon: Shield,
    name: "Оценка агентов",
    role: "Анализирует риски подключения сторонних AI-агентов к системе.",
    stats: "9 проверок · 3 предупреждения",
    tone: "from-destructive/12 to-destructive/0",
    iconCls: "text-destructive",
  },
];

export default function AgentsPage() {
  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Подключайте собственных AI-агентов или используйте встроенных. Каждый агент работает с
        общей базой знаний и поддерживает права доступа на уровне ролей.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.name}
              className="surface-card group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-snackbar"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.tone} opacity-50`} />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-card ${a.iconCls}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <button
                    type="button"
                    className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-secondary group-hover:opacity-100"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold">{a.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.role}</p>
                <p className="mt-3 text-xs font-medium text-foreground/80">{a.stats}</p>
              </div>
            </div>
          );
        })}
      </div>

      <PageSnackbarManager />
    </div>
  );
}
