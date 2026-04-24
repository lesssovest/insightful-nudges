import { Snackbar } from "./types";
import { uid } from "./storage";

const now = Date.now();
const iso = (offsetDays: number) =>
  new Date(now + offsetDays * 24 * 60 * 60 * 1000).toISOString();

export const seedSnackbars: Snackbar[] = [
  {
    id: uid(),
    title: "Новый фильтр по статусам",
    message:
      "На странице событий добавлены вкладки «На утверждение» и «На удаление» — следите за SLA в один клик.",
    urls: ["/events", "/events/*"],
    hasMore: true,
    moreUrl: "https://docs.example.com/changelog/events-filters",
    audience: ["risk_manager", "incident_officer", "analyst"],
    startAt: iso(-3),
    autoHideMs: 8000,
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
    urls: ["/agents", "/agents/*", "/events"],
    hasMore: true,
    moreUrl: "https://docs.example.com/agents/incident-creator",
    audience: ["incident_officer", "risk_manager"],
    startAt: iso(-1),
    autoHideMs: 10000,
    status: "published",
    tone: "success",
    createdAt: iso(-1),
    authorName: "AI-команда",
  },
  {
    id: uid(),
    title: "Реестр рисков: bulk-импорт",
    message:
      "Загрузите xlsx — агент сам разберёт строки в карточки рисков и предложит меры.",
    urls: ["/risks"],
    hasMore: false,
    audience: ["risk_manager", "analyst"],
    startAt: iso(-2),
    autoHideMs: 0,
    status: "published",
    tone: "warning",
    createdAt: iso(-2),
    authorName: "Команда продукта",
  },
];
