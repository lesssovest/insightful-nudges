import { Link } from "react-router-dom";
import { ArrowRight, Bot, ShieldAlert, AlertOctagon, Sparkles, BarChart3, BookOpen } from "lucide-react";
import { PageSnackbarManager } from "@/snackbars/SnackbarManager";

const features = [
  {
    to: "/events",
    icon: AlertOctagon,
    title: "События и инциденты",
    text: "188 событий в работе. Автоматическая регистрация AI-агентом.",
    accent: "from-info/15 to-info/0",
  },
  {
    to: "/risks",
    icon: ShieldAlert,
    title: "Реестр рисков",
    text: "Bulk-импорт xlsx и автоматическая разметка от агента-аналитика.",
    accent: "from-primary/20 to-primary/0",
  },
  {
    to: "/agents",
    icon: Bot,
    title: "AI агенты",
    text: "Методолог, Аналитик, Создатель инцидентов и Оценка агентов.",
    accent: "from-warning/20 to-warning/0",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="surface-card relative overflow-hidden p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-gradient opacity-15 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="pill bg-primary-soft text-primary">
            <Sparkles className="h-3 w-3" /> Новое в v3.4
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight">
            Управляйте рисками
            <br />
            <span className="text-primary">в одном пространстве</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            RiskFlow объединяет регистрацию инцидентов, реестр рисков, меры и AI-агентов.
            Снекбары подскажут команде о любых изменениях интерфейса прямо там, где они происходят.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
            >
              Открыть события <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/agents"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/40"
            >
              AI-агенты
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ to, icon: Icon, title, text, accent }) => (
          <Link
            key={to}
            to={to}
            className="surface-card group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-snackbar"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 transition group-hover:opacity-100`} />
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                Перейти <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="surface-card p-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">Аналитика недели</h3>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { v: "188", l: "Событий" },
              { v: "38", l: "На расследовании" },
              { v: "8", l: "На утверждении" },
            ].map((s) => (
              <div key={s.l} className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="font-display text-2xl font-bold">{s.v}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="surface-card p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">База знаний агентов</h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            4 активных AI-агента используют 1 248 документов из общей базы знаний.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Методолог · 412 ответов за неделю</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-info" /> Анализатор рисков · 78 импортов</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> Аналитик · 34 сводки</li>
            <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /> Создатель инцидентов · 56 регистраций</li>
          </ul>
        </div>
      </section>

      <PageSnackbarManager />
    </div>
  );
}
