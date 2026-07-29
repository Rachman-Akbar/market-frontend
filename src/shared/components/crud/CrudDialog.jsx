import { memo, useEffect } from "react";

export const CrudDialog = memo(function CrudDialog({
  open,
  title,
  subtitle,
  children,
  size = "max-w-5xl",
  onClose,
  presentation = "page",
}) {
  const modal = presentation === "modal";

  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    if (modal) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      if (modal) document.body.style.overflow = "";
    };
  }, [modal, onClose, open]);

  if (!open) return null;

  if (!modal) {
    return (
      <section className="w-full min-w-0 bg-white" aria-label={title}>
        {children}
      </section>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-sm">
      <section className={`mx-auto my-6 w-full ${size} overflow-hidden rounded-lg bg-white`}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center text-slate-500 hover:bg-slate-100" aria-label="Tutup">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        {children}
      </section>
    </div>
  );
});
