import { useEffect, useMemo, useState } from "react";
import { Plus, X, Trash2, Pencil, Sparkles, Save, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Props {
  /** When set, the dialog opens in edit mode for this id. */
  editId?: string;
  trigger?: React.ReactNode;
}

const TONES = [
  { value: "info", label: "Информация" },
  { value: "success", label: "Новая возможность" },
  { value: "warning", label: "Важное" },
] as const;

const AUTO_HIDE_OPTIONS = [
  { value: 0, label: "Не скрывать (только крестик)" },
  { value: 5000, label: "5 секунд" },
  { value: 8000, label: "8 секунд" },
  { value: 12000, label: "12 секунд" },
  { value: 20000, label: "20 секунд" },
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

export function SnackbarFormDialog({ editId, trigger }: Props) {
  const { snackbars, upsert } = useSnackbars();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const editing: Snackbar | undefined = useMemo(
    () => snackbars.find((s) => s.id === editId),
    [snackbars, editId],
  );

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [urls, setUrls] = useState<string[]>([location.pathname]);
  const [urlDraft, setUrlDraft] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [moreUrl, setMoreUrl] = useState("");
  const [audience, setAudience] = useState<RoleId[]>(["risk_manager"]);
  const [startAt, setStartAt] = useState<string>(toLocalInput(new Date().toISOString()));
  const [endAt, setEndAt] = useState<string>("");
  const [autoHideMs, setAutoHideMs] = useState(8000);
  const [tone, setTone] = useState<Snackbar["tone"]>("info");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setMessage(editing.message);
      setUrls(editing.urls);
      setHasMore(editing.hasMore);
      setMoreUrl(editing.moreUrl ?? "");
      setAudience(editing.audience);
      setStartAt(toLocalInput(editing.startAt));
      setEndAt(toLocalInput(editing.endAt));
      setAutoHideMs(editing.autoHideMs);
      setTone(editing.tone);
    } else {
      setTitle("");
      setMessage("");
      setUrls([location.pathname]);
      setHasMore(false);
      setMoreUrl("");
      setAudience(["risk_manager"]);
      setStartAt(toLocalInput(new Date().toISOString()));
      setEndAt("");
      setAutoHideMs(8000);
      setTone("info");
    }
    setUrlDraft("");
  }, [open, editing, location.pathname]);

  function addUrl(value: string) {
    const v = value.trim();
    if (!v) return;
    if (urls.includes(v)) return;
    setUrls((p) => [...p, v]);
    setUrlDraft("");
  }

  function save(status: "draft" | "published") {
    if (!title.trim()) return toast.error("Заголовок обязателен");
    if (!message.trim()) return toast.error("Сообщение обязательно");
    if (urls.length === 0) return toast.error("Добавьте хотя бы один URL");
    if (audience.length === 0) return toast.error("Выберите аудиторию");
    if (!startAt) return toast.error("Укажите дату начала");
    if (hasMore && !moreUrl.trim()) return toast.error("Заполните ссылку «Подробнее»");

    upsert({
      id: editing?.id,
      title: title.trim().slice(0, 50),
      message: message.trim().slice(0, 120),
      urls,
      hasMore,
      moreUrl: hasMore ? moreUrl.trim() : undefined,
      audience,
      startAt: fromLocalInput(startAt),
      endAt: endAt ? fromLocalInput(endAt) : undefined,
      autoHideMs,
      status,
      tone,
    });
    toast.success(editing ? "Снекбар обновлён" : status === "published" ? "Снекбар опубликован" : "Сохранён в черновики");
    setOpen(false);
  }

  const matchingPreview = urls.filter((u) => matchUrl(u, location.pathname)).length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Снекбар
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? "Редактирование снекбара" : "Новый снекбар"}
          </DialogTitle>
          <DialogDescription>
            Уведомление будет показано пользователям с подходящей ролью при первом
            посещении указанных страниц.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label>Заголовок <span className="text-destructive">*</span></Label>
            <Input
              maxLength={50}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Новый AI-агент по инцидентам"
            />
            <p className="text-xs text-muted-foreground">{title.length}/50</p>
          </div>

          <div className="grid gap-2">
            <Label>Сообщение <span className="text-destructive">*</span></Label>
            <Textarea
              maxLength={120}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Краткое описание изменения, до 120 символов"
            />
            <p className="text-xs text-muted-foreground">{message.length}/120</p>
          </div>

          <div className="grid gap-2">
            <Label>
              URL страницы <span className="text-destructive">*</span>
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                поддерживается маска: <code className="rounded bg-muted px-1">/risks/*</code>
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addUrl(urlDraft);
                  }
                }}
                placeholder="/events или /risks/*"
              />
              <Button type="button" variant="secondary" onClick={() => addUrl(urlDraft)}>
                Добавить
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addUrl(location.pathname)}
                title="Добавить текущий путь"
              >
                Текущий
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {urls.map((u) => (
                <Badge key={u} variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
                  <code className="text-xs">{u}</code>
                  <button
                    onClick={() => setUrls((p) => p.filter((x) => x !== u))}
                    className="rounded-sm p-0.5 hover:bg-background"
                    aria-label="Удалить URL"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {matchingPreview && (
              <p className="text-xs text-primary">
                ✓ Сработает на текущей странице ({location.pathname})
              </p>
            )}
          </div>

          <div className="grid gap-3 rounded-lg border border-border bg-secondary/40 p-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox
                checked={hasMore}
                onCheckedChange={(v) => setHasMore(Boolean(v))}
              />
              <span className="text-sm font-medium">Кнопка «Подробнее»</span>
            </label>
            {hasMore && (
              <Input
                value={moreUrl}
                onChange={(e) => setMoreUrl(e.target.value)}
                placeholder="https://docs.example.com/changelog/..."
              />
            )}
          </div>

          <div className="grid gap-2">
            <Label>Кому показывать <span className="text-destructive">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => {
                const active = audience.includes(r.id);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() =>
                      setAudience((p) =>
                        active ? p.filter((x) => x !== r.id) : [...p, r.id],
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
              <Input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Дата окончания</Label>
              <Input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Автоскрытие</Label>
              <Select
                value={String(autoHideMs)}
                onValueChange={(v) => setAutoHideMs(Number(v))}
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
              <Select value={tone} onValueChange={(v: Snackbar["tone"]) => setTone(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
  );
}

/** Compact list of snackbars matching current route — for content managers. */
export function PageSnackbarManager() {
  const { snackbars, archive, remove, user } = useSnackbars();
  const location = useLocation();
  const isCM = user.roles.includes("content_manager");

  const onPage = snackbars.filter((s) =>
    s.urls.some((u) => matchUrl(u, location.pathname)),
  );

  if (!isCM) return null;

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold">
            Снекбары на этой странице
          </h3>
          <span className="pill bg-secondary text-muted-foreground">{onPage.length}</span>
        </div>
        <SnackbarFormDialog />
      </div>

      {onPage.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Пока нет снекбаров для пути <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{location.pathname}</code>.
          Создайте первый — он подсветится у пользователей, заходящих сюда впервые.
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
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.urls.map((u) => (
                    <code
                      key={u}
                      className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {u}
                    </code>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <SnackbarFormDialog
                  editId={s.id}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Редактировать">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  }
                />
                {s.status !== "archived" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => archive(s.id)}
                  >
                    В архив
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Удалить"
                  onClick={() => remove(s.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
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
