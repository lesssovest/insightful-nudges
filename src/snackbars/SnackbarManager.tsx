import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X, Trash2, Pencil, Sparkles, Save, Send, MousePointer2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSnackbars } from "./SnackbarsContext";
import { ROLES, RoleId, Snackbar } from "./types";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { matchUrl } from "./storage";
import { buildSelector, labelForElement } from "./selector";
import { Spotlight } from "./Spotlight";

const TONES = [
  { value: "info", label: "Информация" },
  { value: "success", label: "Новая возможность" },
  { value: "warning", label: "Важное" },
] as const;

// Per spec: 3–15 sec range
const AUTO_HIDE_OPTIONS = [
  { value: 3000, label: "3 секунды" },
  { value: 5000, label: "5 секунд" },
  { value: 8000, label: "8 секунд" },
  { value: 12000, label: "12 секунд" },
  { value: 15000, label: "15 секунд" },
  { value: 0, label: "Не скрывать (только крестик)" },
];

function toLocalInput(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string) {
  return v ? new Date(v).toISOString() : "";
}

interface FormState {
  title: string;
  message: string;
  urls: string[];
  targetSelector: string;
  targetLabel: string;
  hasMore: boolean;
  moreUrl: string;
  audience: RoleId[];
  startAt: string;
  endAt: string;
  autoHideMs: number;
  tone: Snackbar["tone"];
  preferredSide: NonNullable<Snackbar["preferredSide"]>;
  offset: { x: number; y: number };
  order: number;
}

function emptyForm(pathname: string, nextOrder = 1): FormState {
  return {
    title: "",
    message: "",
    urls: [pathname],
    targetSelector: "",
    targetLabel: "",
    hasMore: false,
    moreUrl: "",
    audience: ["risk_manager"],
    startAt: toLocalInput(new Date().toISOString()),
    endAt: "",
    autoHideMs: 8000,
    tone: "info",
    preferredSide: "auto",
    offset: { x: 0, y: 0 },
    order: nextOrder,
  };
}

interface FormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: FormState;
  editId?: string;
}

function SnackbarFormDialog({ open, onOpenChange, initial, editId }: FormDialogProps) {
  const { upsert, snackbars } = useSnackbars();
  const location = useLocation();
  const [form, setForm] = useState<FormState>(initial);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const editing = useMemo(
    () => snackbars.find((s) => s.id === editId),
    [snackbars, editId],
  );

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function addUrl(value: string) {
    const v = value.trim();
    if (!v || form.urls.includes(v)) return;
    set("urls", [...form.urls, v]);
  }

  function save(status: "draft" | "published") {
    if (!form.title.trim()) return toast.error("Заголовок обязателен");
    if (!form.message.trim()) return toast.error("Сообщение обязательно");
    if (form.urls.length === 0) return toast.error("Добавьте хотя бы один URL");
    if (form.audience.length === 0) return toast.error("Выберите аудиторию");
    if (!form.startAt) return toast.error("Укажите дату начала");
    if (form.hasMore && !form.moreUrl.trim()) return toast.error("Заполните ссылку «Подробнее»");

    upsert({
      id: editId,
      title: form.title.trim().slice(0, 50),
      message: form.message.trim().slice(0, 120),
      urls: form.urls,
      targetSelector: form.targetSelector || undefined,
      targetLabel: form.targetLabel || undefined,
      hasMore: form.hasMore,
      moreUrl: form.hasMore ? form.moreUrl.trim() : undefined,
      audience: form.audience,
      startAt: fromLocalInput(form.startAt),
      endAt: form.endAt ? fromLocalInput(form.endAt) : undefined,
      autoHideMs: form.autoHideMs,
      status,
      tone: form.tone,
      preferredSide: form.preferredSide,
      offset: form.offset.x === 0 && form.offset.y === 0 ? undefined : form.offset,
      order: form.order,
    });
    toast.success(
      editing ? "Снекбар обновлён" : status === "published" ? "Снекбар опубликован" : "Сохранён в черновики",
    );
    onOpenChange(false);
  }

  const previewSnackbar: Snackbar = {
    id: "preview",
    title: form.title || "Заголовок снекбара",
    message: form.message || "Так будет выглядеть сообщение для пользователя.",
    urls: form.urls,
    targetSelector: form.targetSelector,
    targetLabel: form.targetLabel,
    hasMore: form.hasMore,
    moreUrl: form.moreUrl,
    audience: form.audience,
    startAt: new Date().toISOString(),
    autoHideMs: 0,
    status: "draft",
    tone: form.tone,
    createdAt: new Date().toISOString(),
    authorName: "Контент-менеджер",
    preferredSide: form.preferredSide,
    offset: form.offset,
    order: form.order,
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Редактирование снекбара" : "Новый снекбар"}
            </DialogTitle>
            <DialogDescription>
              Снекбар подсветит элемент рамкой и затемнит остальной интерфейс. Покажется один раз каждому пользователю с подходящей ролью.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-2">
            {/* Target preview */}
            <div className="rounded-lg border border-info/30 bg-info/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MousePointer2 className="h-4 w-4 text-info shrink-0" />
                  <p className="text-sm font-medium truncate">
                    {form.targetLabel || "Без привязки к элементу"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewing(true)}
                  className="gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" /> Предпросмотр
                </Button>
              </div>
              {form.targetSelector && (
                <code className="mt-1.5 block break-all text-[11px] text-muted-foreground">
                  {form.targetSelector}
                </code>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Заголовок <span className="text-destructive">*</span></Label>
              <Input
                maxLength={50}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Например: Новая вкладка «На утверждение»"
              />
              <p className="text-xs text-muted-foreground">{form.title.length}/50</p>
            </div>

            <div className="grid gap-2">
              <Label>Сообщение <span className="text-destructive">*</span></Label>
              <Textarea
                maxLength={120}
                rows={3}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Краткое описание изменения, до 120 символов"
              />
              <p className="text-xs text-muted-foreground">{form.message.length}/120</p>
            </div>

            <UrlsField urls={form.urls} addUrl={addUrl} removeUrl={(u) => set("urls", form.urls.filter((x) => x !== u))} pathname={location.pathname} />

            <div className="grid gap-3 rounded-lg border border-border bg-secondary/40 p-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={form.hasMore}
                  onCheckedChange={(v) => set("hasMore", Boolean(v))}
                />
                <span className="text-sm font-medium">Кнопка «Подробнее»</span>
              </label>
              {form.hasMore && (
                <Input
                  value={form.moreUrl}
                  onChange={(e) => set("moreUrl", e.target.value)}
                  placeholder="https://docs.example.com/changelog/..."
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label>Кому показывать <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => {
                  const active = form.audience.includes(r.id);
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() =>
                        set(
                          "audience",
                          active
                            ? form.audience.filter((x) => x !== r.id)
                            : [...form.audience, r.id],
                        )
                      }
                      className={
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition " +
                        (active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:border-primary/50")
                      }
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Дата начала <span className="text-destructive">*</span></Label>
                <Input type="datetime-local" value={form.startAt} onChange={(e) => set("startAt", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Дата окончания</Label>
                <Input type="datetime-local" value={form.endAt} onChange={(e) => set("endAt", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Автоскрытие (3–15 сек)</Label>
                <Select
                  value={String(form.autoHideMs)}
                  onValueChange={(v) => set("autoHideMs", Number(v))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUTO_HIDE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Тип</Label>
                <Select value={form.tone} onValueChange={(v: Snackbar["tone"]) => set("tone", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Position + order */}
            <div className="grid gap-3 rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Положение карточки</Label>
                <span className="text-[11px] text-muted-foreground">или перетащите в режиме предпросмотра</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["auto", "top", "right", "bottom", "left"] as const).map((side) => {
                  const active = form.preferredSide === side;
                  const labels = { auto: "Авто", top: "Сверху", right: "Справа", bottom: "Снизу", left: "Слева" } as const;
                  return (
                    <button
                      key={side}
                      type="button"
                      onClick={() => {
                        set("preferredSide", side);
                        set("offset", { x: 0, y: 0 });
                      }}
                      className={
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition " +
                        (active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/50")
                      }
                    >
                      {labels[side]}
                    </button>
                  );
                })}
              </div>
              {(form.offset.x !== 0 || form.offset.y !== 0) && (
                <div className="flex items-center justify-between gap-2 rounded-md bg-info/5 px-2 py-1.5 text-[11px] text-info">
                  <span>Смещение от перетаскивания: x {form.offset.x}px, y {form.offset.y}px</span>
                  <button
                    type="button"
                    onClick={() => set("offset", { x: 0, y: 0 })}
                    className="rounded px-1.5 py-0.5 text-info underline hover:bg-info/10"
                  >
                    сбросить
                  </button>
                </div>
              )}
              <div className="grid grid-cols-[auto,1fr] items-center gap-3">
                <Label className="text-xs">Очерёдность</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) => set("order", Math.max(1, Number(e.target.value) || 1))}
                  className="h-9 w-24"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Если на странице несколько снекбаров — пользователь увидит их по возрастанию очерёдности с кнопкой «Далее».
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => save("draft")} className="gap-1.5">
              <Save className="h-4 w-4" /> В черновик
            </Button>
            <Button onClick={() => save("published")} className="gap-1.5">
              <Send className="h-4 w-4" /> Опубликовать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewing && (
        <Spotlight
          snackbar={previewSnackbar}
          onClose={() => setPreviewing(false)}
          draggable
          onOffsetChange={(o) => set("offset", o)}
          onSideChange={(s) => set("preferredSide", s)}
        />
      )}
    </>
  );
}

function UrlsField({
  urls,
  addUrl,
  removeUrl,
  pathname,
}: {
  urls: string[];
  addUrl: (v: string) => void;
  removeUrl: (v: string) => void;
  pathname: string;
}) {
  const [draft, setDraft] = useState("");
  return (
    <div className="grid gap-2">
      <Label>
        URL страницы <span className="text-destructive">*</span>
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          поддерживается маска: <code className="rounded bg-muted px-1">/risks/*</code>
        </span>
      </Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl(draft);
              setDraft("");
            }
          }}
          placeholder="/events или /risks/*"
        />
        <Button type="button" variant="secondary" onClick={() => { addUrl(draft); setDraft(""); }}>
          Добавить
        </Button>
        <Button type="button" variant="outline" onClick={() => addUrl(pathname)} title="Добавить текущий путь">
          Текущий
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {urls.map((u) => (
          <Badge key={u} variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
            <code className="text-xs">{u}</code>
            <button onClick={() => removeUrl(u)} className="rounded-sm p-0.5 hover:bg-background" aria-label="Удалить URL">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * КМ control bar:
 * - "Добавить снекбар" кнопка → pick mode → клик по элементу → форма
 * - Список существующих снекбаров для текущей страницы (CRUD)
 */
export function PageSnackbarManager() {
  const { snackbars, archive, remove, user } = useSnackbars();
  const location = useLocation();
  const isCM = user.roles.includes("content_manager");

  const [picking, setPicking] = useState(false);
  const [hoverEl, setHoverEl] = useState<Element | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm(location.pathname));
  const [editId, setEditId] = useState<string | undefined>(undefined);
  const lastEl = useRef<Element | null>(null);

  const onPage = snackbars.filter((s) =>
    s.urls.some((u) => matchUrl(u, location.pathname)),
  );

  // Pick mode: highlight hovered element + capture click
  useEffect(() => {
    if (!picking) {
      document.body.removeAttribute("data-cm-pick");
      return;
    }
    document.body.setAttribute("data-cm-pick", "on");

    const onMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      // ignore our own picker UI
      if (el.closest("[data-cm-ui]")) {
        setHoverEl(null);
        return;
      }
      setHoverEl(el);
      lastEl.current = el;
    };
    const onClick = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el.closest("[data-cm-ui]")) return;
      e.preventDefault();
      e.stopPropagation();
      const selector = buildSelector(el);
      const label = labelForElement(el);
      setFormInitial({
        ...emptyForm(location.pathname),
        targetSelector: selector,
        targetLabel: label,
      });
      setEditId(undefined);
      setPicking(false);
      setHoverEl(null);
      setFormOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPicking(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey);
      document.body.removeAttribute("data-cm-pick");
    };
  }, [picking, location.pathname]);

  if (!isCM) return null;

  const hoverRect = hoverEl?.getBoundingClientRect();

  return (
    <>
      {/* Floating "Add snackbar" button — visible only to КМ */}
      <div
        data-cm-ui
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
      >
        {picking ? (
          <button
            onClick={() => setPicking(false)}
            className="surface-card flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-info text-info hover:bg-info/10"
          >
            <X className="h-4 w-4" /> Отменить выбор
          </button>
        ) : (
          <button
            onClick={() => setPicking(true)}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-snackbar transition hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Добавить снекбар
          </button>
        )}
      </div>

      {/* Picker hover ring */}
      {picking && hoverRect && (
        <div
          data-cm-ui
          className="pointer-events-none fixed z-[55] rounded animate-pulse-ring"
          style={{
            top: hoverRect.top - 4,
            left: hoverRect.left - 4,
            width: hoverRect.width + 8,
            height: hoverRect.height + 8,
            border: "2px solid hsl(var(--info))",
          }}
        />
      )}
      {picking && (
        <div
          data-cm-ui
          className="fixed left-1/2 top-6 z-[55] -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-snackbar"
        >
          Кликните по любому элементу страницы (Esc — отмена)
        </div>
      )}

      {/* Existing snackbars list */}
      <div className="surface-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold">
              Снекбары на этой странице
            </h3>
            <span className="pill bg-secondary text-muted-foreground">{onPage.length}</span>
          </div>
        </div>

        {onPage.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Пока нет снекбаров для пути <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{location.pathname}</code>.
            Нажмите «Добавить снекбар» в правом нижнем углу и выберите элемент, который нужно подсветить.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {onPage.map((s) => (
              <li key={s.id} className="flex items-start justify-between gap-3 py-3 first:pt-1 last:pb-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {s.message}
                  </p>
                  {s.targetLabel && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-info">
                      <MousePointer2 className="h-3 w-3" /> {s.targetLabel}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Редактировать"
                    onClick={() => {
                      setFormInitial({
                        title: s.title,
                        message: s.message,
                        urls: s.urls,
                        targetSelector: s.targetSelector ?? "",
                        targetLabel: s.targetLabel ?? "",
                        hasMore: s.hasMore,
                        moreUrl: s.moreUrl ?? "",
                        audience: s.audience,
                        startAt: toLocalInput(s.startAt),
                        endAt: toLocalInput(s.endAt),
                        autoHideMs: s.autoHideMs,
                        tone: s.tone,
                      });
                      setEditId(s.id);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {s.status !== "archived" && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => archive(s.id)}>
                      В архив
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" aria-label="Удалить" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SnackbarFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={formInitial}
        editId={editId}
      />
    </>
  );
}

function StatusBadge({ status }: { status: Snackbar["status"] }) {
  const map = {
    draft: { label: "Черновик", cls: "bg-muted text-muted-foreground" },
    published: { label: "Опубликован", cls: "bg-primary-soft text-primary" },
    archived: { label: "Архив", cls: "bg-secondary text-muted-foreground" },
  } as const;
  const { label, cls } = map[status];
  return <span className={"pill text-[10px] uppercase " + cls}>{label}</span>;
}
