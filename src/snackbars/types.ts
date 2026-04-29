export const ROLES = [
  { id: "risk_manager", label: "Риск-менеджер" },
  { id: "incident_officer", label: "Офицер по инцидентам" },
  { id: "analyst", label: "Аналитик" },
  { id: "content_manager", label: "Контент-менеджер" },
  { id: "viewer", label: "Наблюдатель" },
] as const;

export type RoleId = typeof ROLES[number]["id"];

export type SnackbarStatus = "draft" | "published" | "archived";

export interface Snackbar {
  id: string;
  title: string;
  message: string;
  /** Routes or url-masks. Mask supports `*` wildcard, e.g. `/risks/*` */
  urls: string[];
  /** CSS-selector of the highlighted element on the page (data-spot="..." preferred). */
  targetSelector?: string;
  /** Human-readable label for КМ list (button name, field, etc.) */
  targetLabel?: string;
  hasMore: boolean;
  moreUrl?: string;
  audience: RoleId[];
  startAt: string; // ISO
  endAt?: string;  // ISO
  /** Per spec: 3000–15000 ms; 0 = manual close only */
  autoHideMs: number;
  status: SnackbarStatus;
  tone: "info" | "success" | "warning";
  createdAt: string;
  authorName: string;
}

export interface CurrentUser {
  name: string;
  position: string;
  roles: RoleId[];
}
