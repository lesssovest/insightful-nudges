import { Snackbar } from "./types";
import { uid } from "./storage";

const now = Date.now();
const iso = (offsetDays: number) =>
  new Date(now + offsetDays * 24 * 60 * 60 * 1000).toISOString();

export const seedSnackbars: Snackbar[] = [
  {
    id: uid(),
    title: "Новая вкладка «На утверждение»",
    message:
      "Следите за SLA быстрее: события на утверждении вынесены в отдельную вкладку.",
    urls: ["/events", "/events/*"],
    targetSelector: '[data-spot="events-tab-approval"]',
    targetLabel: "Вкладка «На утверждение»",
    hasMore: true,
    moreUrl: "https://docs.example.com/changelog/events-filters",
    audience: ["risk_manager", "incident_officer", "analyst"],
    startAt: iso(-3),
    autoHideMs: 10000,
    status: "published",
    tone: "info",
    createdAt: iso(-3),
    authorName: "Команда продукта",
  },
  {
    id: uid(),
    title: "AI-агент «Создатель инцидентов» обновлён",
    message:
      "Теперь агент сам подставляет категорию ущерба и связанный риск из вашего описания.",
    urls: ["/agents", "/agents/*"],
    targetSelector: '[data-spot="agent-incident-creator"]',
    targetLabel: "Карточка агента «Создатель инцидентов»",
    hasMore: true,
    moreUrl: "https://docs.example.com/agents/incident-creator",
    audience: ["incident_officer", "risk_manager", "content_manager", "analyst"],
    startAt: iso(-1),
    autoHideMs: 12000,
    status: "published",
    tone: "success",
    createdAt: iso(-1),
    authorName: "AI-команда",
  },
  {
    id: uid(),
    title: "Bulk-импорт рисков из xlsx",
    message:
      "Загрузите файл — агент сам разберёт строки в карточки рисков и предложит меры.",
    urls: ["/risks"],
    targetSelector: '[data-spot="risks-import"]',
    targetLabel: "Кнопка «Импорт xlsx»",
    hasMore: false,
    audience: ["risk_manager", "analyst", "content_manager"],
    startAt: iso(-2),
    autoHideMs: 8000,
    status: "published",
    tone: "warning",
    createdAt: iso(-2),
    authorName: "Команда продукта",
  },
];
