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

  const content = (
    <section className={`w-full ${modal ? size : ""} overflow-hidden rounded-lg border border-slate-200 bg-white`}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          aria-label="Tutup halaman"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
      {children}
    </section>
  );

  if (!modal) return content;

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6">{content}</div>
    </div>
  );
});
