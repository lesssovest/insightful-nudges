import { Snackbar, CurrentUser, RoleId } from "./types";

const SB_KEY = "rf.snackbars.v1";
const SEEN_KEY = "rf.snackbars.seen.v1";
const USER_KEY = "rf.user.v1";

export function loadSnackbars(): Snackbar[] {
  try {
    const raw = localStorage.getItem(SB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Snackbar[];
  } catch {
    return [];
  }
}

export function saveSnackbars(items: Snackbar[]) {
  localStorage.setItem(SB_KEY, JSON.stringify(items));
}

export function loadSeen(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSeen(map: Record<string, string[]>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(map));
}

export function loadUser(): CurrentUser {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultUser();
}

export function saveUser(u: CurrentUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(u));
}

export function defaultUser(): CurrentUser {
  return {
    name: "Алексей Воронов",
    position: "Риск-менеджер · РегионТраст",
    roles: ["risk_manager", "analyst", "content_manager"],
  };
}

/** Match a route pattern against pathname. `*` is a single-segment wildcard,
 *  `**` matches anything (including `/`). */
export function matchUrl(pattern: string, pathname: string): boolean {
  if (!pattern) return false;
  const norm = (s: string) => s.replace(/\/+$/, "") || "/";
  const p = norm(pattern.trim());
  const path = norm(pathname);
  if (p === path) return true;
  // build regex
  const escaped = p
    .split("/")
    .map((seg) => {
      if (seg === "**") return ".*";
      if (seg === "*") return "[^/]+";
      if (seg.includes("*")) {
        return seg
          .split("")
          .map((c) =>
            c === "*" ? "[^/]*" : c.replace(/[.+?^${}()|[\]\\]/g, "\\$&"),
          )
          .join("");
      }
      return seg.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  const re = new RegExp("^" + escaped + "/?$");
  return re.test(path);
}

export function isActiveByDate(sb: Snackbar, now = Date.now()): boolean {
  if (sb.status !== "published") return false;
  const start = new Date(sb.startAt).getTime();
  if (Number.isFinite(start) && now < start) return false;
  if (sb.endAt) {
    const end = new Date(sb.endAt).getTime();
    if (Number.isFinite(end) && now > end) return false;
  }
  return true;
}

export function visibleForUser(sb: Snackbar, roles: RoleId[]): boolean {
  return sb.audience.some((r) => roles.includes(r));
}

export function uid() {
  return "sb_" + Math.random().toString(36).slice(2, 10);
}
