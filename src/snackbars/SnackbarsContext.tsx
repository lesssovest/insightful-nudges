import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import {
  defaultUser,
  isActiveByDate,
  loadSeen,
  loadSnackbars,
  loadUser,
  matchUrl,
  saveSeen,
  saveSnackbars,
  saveUser,
  uid,
  visibleForUser,
} from "./storage";
import { seedSnackbars } from "./seed";
import { CurrentUser, RoleId, Snackbar } from "./types";

interface Ctx {
  user: CurrentUser;
  setUserRoles: (roles: RoleId[]) => void;
  snackbars: Snackbar[];
  upsert: (sb: Omit<Snackbar, "id" | "createdAt" | "authorName"> & { id?: string }) => Snackbar;
  remove: (id: string) => void;
  archive: (id: string) => void;
  /** Snackbars that match the current route AND are visible for the user. */
  matchingForRoute: Snackbar[];
  /** Subset that user hasn't seen yet — should auto-pop. */
  unseenForRoute: Snackbar[];
  markSeen: (id: string) => void;
  resetSeen: () => void;
}

const SnackbarsCtx = createContext<Ctx | null>(null);

export function SnackbarsProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(() => loadUser());
  const [snackbars, setSnackbars] = useState<Snackbar[]>(() => {
    const existing = loadSnackbars();
    if (existing.length === 0) {
      saveSnackbars(seedSnackbars);
      return seedSnackbars;
    }
    return existing;
  });
  const [seen, setSeen] = useState<Record<string, string[]>>(() => loadSeen());
  const location = useLocation();

  useEffect(() => saveSnackbars(snackbars), [snackbars]);
  useEffect(() => saveSeen(seen), [seen]);
  useEffect(() => saveUser(user), [user]);

  const setUserRoles = useCallback(
    (roles: RoleId[]) => setUser((u) => ({ ...u, roles })),
    [],
  );

  const upsert: Ctx["upsert"] = useCallback((data) => {
    let saved: Snackbar | null = null;
    setSnackbars((list) => {
      if (data.id) {
        const next = list.map((s) =>
          s.id === data.id ? { ...s, ...data, id: s.id } as Snackbar : s,
        );
        saved = next.find((s) => s.id === data.id) ?? null;
        return next;
      }
      const created: Snackbar = {
        ...data,
        id: uid(),
        createdAt: new Date().toISOString(),
        authorName: "Контент-менеджер",
      };
      saved = created;
      return [created, ...list];
    });
    return saved as unknown as Snackbar;
  }, []);

  const remove = useCallback((id: string) => {
    setSnackbars((l) => l.filter((s) => s.id !== id));
  }, []);

  const archive = useCallback((id: string) => {
    setSnackbars((l) =>
      l.map((s) => (s.id === id ? { ...s, status: "archived" } : s)),
    );
  }, []);

  const matchingForRoute = useMemo(() => {
    return snackbars.filter(
      (s) =>
        isActiveByDate(s) &&
        visibleForUser(s, user.roles) &&
        s.urls.some((u) => matchUrl(u, location.pathname)),
    );
  }, [snackbars, user.roles, location.pathname]);

  const userKey = user.roles.slice().sort().join(",");
  const seenForUser = seen[userKey] ?? [];

  const unseenForRoute = useMemo(
    () => matchingForRoute.filter((s) => !seenForUser.includes(s.id)),
    [matchingForRoute, seenForUser],
  );

  const markSeen = useCallback(
    (id: string) => {
      setSeen((prev) => {
        const list = prev[userKey] ?? [];
        if (list.includes(id)) return prev;
        return { ...prev, [userKey]: [...list, id] };
      });
    },
    [userKey],
  );

  const resetSeen = useCallback(() => {
    setSeen((prev) => ({ ...prev, [userKey]: [] }));
  }, [userKey]);

  const value: Ctx = {
    user,
    setUserRoles,
    snackbars,
    upsert,
    remove,
    archive,
    matchingForRoute,
    unseenForRoute,
    markSeen,
    resetSeen,
  };

  return <SnackbarsCtx.Provider value={value}>{children}</SnackbarsCtx.Provider>;
}

export function useSnackbars() {
  const ctx = useContext(SnackbarsCtx);
  if (!ctx) throw new Error("useSnackbars must be used inside SnackbarsProvider");
  return ctx;
}

export { defaultUser };
