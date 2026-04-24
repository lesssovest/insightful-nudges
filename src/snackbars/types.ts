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
  hasMore: boolean;
  moreUrl?: string;
  audience: RoleId[];
  startAt: string; // ISO
  endAt?: string;  // ISO
  autoHideMs: number; // 0 = no auto-hide
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
