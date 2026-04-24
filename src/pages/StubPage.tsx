import { PageSnackbarManager } from "@/snackbars/SnackbarManager";

export default function StubPage({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="space-y-5">
      <div className="surface-card p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">Раздел</p>
        <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">{lead}</p>
      </div>
      <PageSnackbarManager />
    </div>
  );
}
