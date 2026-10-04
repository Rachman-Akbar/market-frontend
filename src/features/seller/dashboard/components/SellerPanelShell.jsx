export function SellerPanelShell({ children, actions }) {
  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col">
      {actions ? <div className="mb-3 flex flex-wrap items-center justify-end gap-[5px]">{actions}</div> : null}
      {children}
    </section>
  );
}
