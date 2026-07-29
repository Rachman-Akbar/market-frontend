export function SellerPanelShell({ children, actions }) {
  return (
    <section className="min-w-0">
      {actions ? <div className="mb-3 flex flex-wrap items-center justify-end gap-2">{actions}</div> : null}
      {children}
    </section>
  );
}
