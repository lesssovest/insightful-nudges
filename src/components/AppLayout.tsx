import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Home,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  Bot,
  BookOpen,
  BarChart3,
  ChevronsLeft,
  HeadphonesIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSnackbars } from "@/snackbars/SnackbarsContext";
import { ROLES } from "@/snackbars/types";
import { SnackbarRouteBell } from "@/snackbars/SnackbarStack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Главная", icon: Home, end: true },
  { to: "/events", label: "События", icon: AlertOctagon },
  { to: "/risks", label: "Риски", icon: ShieldAlert },
  { to: "/measures", label: "Меры", icon: CheckCircle2 },
  { to: "/analytics", label: "Аналитика", icon: BarChart3 },
  { to: "/agents", label: "AI агенты", icon: Bot },
  { to: "/knowledge", label: "База знаний", icon: BookOpen },
];

const PAGE_TITLES: Record<string, string> = {
  "/": "Главная",
  "/events": "Это все события",
  "/risks": "Реестр рисков",
  "/measures": "Меры реагирования",
  "/analytics": "Аналитика",
  "/agents": "AI агенты",
  "/knowledge": "База знаний",
};

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, setUserRoles } = useSnackbars();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "RiskFlow";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "sticky top-0 flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-[248px]",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-primary-foreground shadow-soft">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M12 3l8 4.5v9L12 21 4 16.5v-9L12 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 8v8M8 10v4M16 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-none tracking-tight">RiskFlow</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Risk · Incidents · AI
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-2">
          <div className={cn(
            "flex items-center gap-2.5 rounded-lg px-2 py-2",
            collapsed && "justify-center",
          )}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground">
              {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            {!collapsed && (
              <div className="min-w-0 text-xs">
                <p className="truncate font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-muted-foreground">{user.position}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              const help = "Поддержка: support@riskflow.example";
              alert(help);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/60",
              collapsed && "justify-center px-0"
            )}
          >
            <HeadphonesIcon className="h-4 w-4" />
            {!collapsed && "Служба поддержки"}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent/60",
              collapsed && "justify-center px-0"
            )}
          >
            <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Свернуть"}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/85 px-8 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              RiskFlow · Управление операционными рисками
            </p>
            <h1 className="truncate font-display text-2xl font-bold tracking-tight">
              <span className="text-muted-foreground">— </span>{title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SnackbarRouteBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Роли · {user.roles.length}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Демо: переключение ролей</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {ROLES.map((r) => (
                  <DropdownMenuCheckboxItem
                    key={r.id}
                    checked={user.roles.includes(r.id)}
                    onCheckedChange={(v) => {
                      const next = v
                        ? [...user.roles, r.id]
                        : user.roles.filter((x) => x !== r.id);
                      setUserRoles(next as typeof user.roles);
                    }}
                  >
                    {r.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
