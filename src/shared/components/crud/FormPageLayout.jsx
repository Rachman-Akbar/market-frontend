export function FormPageActions({ title = "Aksi", children }) {
  return (
    <div aria-label={title} className="flex flex-col items-center gap-2">
      {children}
    </div>
  );
}

export function FormPageLayout({ title, subtitle, lead, actions, children }) {
  const header = title ? (
    <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-extrabold text-slate-950">{title}</h1>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {lead}
    </header>
  ) : null;

  const card = (
    <div className="w-full min-w-0 border border-slate-200 bg-white">
      {header}
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );

  return (
    <section className="w-full min-w-0">
      {actions ? (
        <div className="flex w-full min-w-0 items-start gap-4">
          <div className="min-w-0 flex-1">{card}</div>
          <aside className="min-w-0 shrink-0 lg:sticky lg:top-24">{actions}</aside>
        </div>
      ) : card}
    </section>
  );
}